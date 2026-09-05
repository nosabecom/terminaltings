[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$UserHome,
    [Parameter(Mandatory)][string]$NpxPath,
    [string]$Package = 't3@nightly',
    [int]$Port = 3773
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$env:USERPROFILE = $UserHome
$env:T3CODE_HOME = Join-Path $UserHome '.t3'
$env:APPDATA = Join-Path $UserHome 'AppData\Roaming'
$env:LOCALAPPDATA = Join-Path $UserHome 'AppData\Local'
$env:Path = (Split-Path -Parent $NpxPath) + ';' +
    [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
    [Environment]::GetEnvironmentVariable('Path', 'User')
$logDir = Join-Path $env:T3CODE_HOME 'startup'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$log = Join-Path $logDir ('server-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')
Set-Location -LiteralPath $UserHome

try {
    # Boot can precede networking. Retry at the task level if it remains offline.
    $tailscale = Join-Path $env:ProgramFiles 'Tailscale\tailscale.exe'
    $online = $false
    for ($attempt = 0; $attempt -lt 36; $attempt++) {
        $status = & $tailscale status --json 2>$null | ConvertFrom-Json
        if ($status.BackendState -eq 'Running' -and $status.Self.Online) {
            $online = $true
            break
        }
        Start-Sleep -Seconds 5
    }
    if (-not $online) { throw 'Tailscale is not online yet.' }

    # `connect` is interactive provisioning, not a daemon. Reuse the link made
    # by `npx --yes t3@nightly connect`; serve reconnects it automatically.
    $linkFile = Join-Path $env:T3CODE_HOME 'userdata\secrets\cloud-cli-desired-link.bin'
    if (-not (Test-Path -LiteralPath $linkFile)) {
        throw 'T3 Connect is not linked. Run npx --yes t3@nightly connect as this user first.'
    }
    & $NpxPath --yes --prefer-offline $Package connect status *>> $log
    if ($LASTEXITCODE -ne 0) { throw 'T3 Connect status failed; see the private startup log.' }

    # Keep the backend private. The persistent Tailscale Serve route provides
    # HTTPS on 8443; Sunshine owns 443 and must not be overwritten by this app.
    & $NpxPath --yes --prefer-offline $Package serve --host 127.0.0.1 --port $Port *>> $log
    # Any exit should be recovered by Task Scheduler, including a clean exit.
    "T3 exited with code $LASTEXITCODE at $(Get-Date -Format o)." | Add-Content -LiteralPath $log
    exit 1
} catch {
    $_.Exception.Message | Add-Content -LiteralPath $log
    exit 1
}
