param(
    [Parameter(Mandatory = $true)][ValidateSet('shitbook', 'ewaste')][string]$HostName,
    [string]$CommandBase64,
    [switch]$CheckVault,
    [ValidateRange(1, 86400)][int]$TimeoutSeconds = 120
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
if (-not $CheckVault -and -not $CommandBase64) { throw 'Provide CommandBase64 or CheckVault.' }
if ($CheckVault -and $CommandBase64) { throw 'Choose CheckVault or a command, not both.' }
$argv = @()
if ($CommandBase64) {
    $decoded = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($CommandBase64))
    $parsed = ConvertFrom-Json -InputObject $decoded
    if (-not $decoded.TrimStart().StartsWith('[') -or @($parsed).Count -eq 0) { throw 'CommandBase64 must encode a nonempty JSON array.' }
    foreach ($argument in @($parsed)) { if ($argument -isnot [string] -or $argument.Contains([char]0)) { throw 'Command arguments must be strings without NUL characters.' }; $argv += $argument }
}

$python = (Get-Command python -ErrorAction Stop).Source
if ($python -like '*WindowsApps*') { throw 'Install Python or place the real Python executable on PATH.' }
$worker = Join-Path $PSScriptRoot 'sudo_access.py'
$taskName = 'Codex-Sudo-' + [guid]::NewGuid().ToString('N')
$work = Join-Path ([IO.Path]::GetTempPath()) $taskName
$exitCode = 1
$registered = $false
New-Item -ItemType Directory -Path $work | Out-Null
try {
    $sid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
    & icacls.exe $work /inheritance:r /grant:r "*$($sid):(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not restrict temporary job directory permissions.' }
    $jobPath = Join-Path $work 'job.json'
    $resultPath = Join-Path $work 'result.json'
    $runnerPath = Join-Path $work 'run.ps1'
    $job = @{ host = $HostName; argv = @($argv); check_vault = [bool]$CheckVault; timeout = $TimeoutSeconds }
    $utf8 = New-Object Text.UTF8Encoding($false)
    [IO.File]::WriteAllText($jobPath, ($job | ConvertTo-Json -Depth 4), $utf8)
    function Quote-Literal([string]$value) { return "'" + $value.Replace("'", "''") + "'" }
    $runner = '& ' + (Quote-Literal $python) + ' ' + (Quote-Literal $worker) + ' --job ' + (Quote-Literal $jobPath) + ' --result ' + (Quote-Literal $resultPath)
    [IO.File]::WriteAllText($runnerPath, $runner, $utf8)
    $action = New-ScheduledTaskAction -Execute 'C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe' -Argument ('-NoProfile -WindowStyle Hidden -File "' + $runnerPath + '"')
    $principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
    $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Seconds ($TimeoutSeconds + 180))
    Register-ScheduledTask -TaskName $taskName -Action $action -Principal $principal -Settings $settings | Out-Null
    $registered = $true
    Start-ScheduledTask -TaskName $taskName
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds + 150)
    while (-not (Test-Path -LiteralPath $resultPath)) {
        if ((Get-Date) -gt $deadline) { throw 'Desktop operation timed out. Inspect the destination before retrying.' }
        Start-Sleep -Milliseconds 500
    }
    $result = [IO.File]::ReadAllText($resultPath) | ConvertFrom-Json
    [Console]::Out.Write([string]$result.stdout)
    [Console]::Error.Write([string]$result.stderr)
    $exitCode = [int]$result.code
} finally {
    if ($registered) {
        $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        if ($task -and $task.State -eq 'Running') { Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue }
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    }
    # Delete only named job artifacts; never recursively delete a computed path.
    foreach ($name in @('job.json', 'result.json', 'result.partial', 'run.ps1')) {
        $file = Join-Path $work $name
        if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force }
    }
    Remove-Item -LiteralPath $work -Force
}
exit $exitCode
