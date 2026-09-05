# Run elevated on the Windows host as the user who already ran `t3 connect`.
[CmdletBinding()]
param(
    [string]$UserHome = $env:USERPROFILE,
    [string]$NpxPath = 'C:\nvm4w\nodejs\npx.cmd',
    [string]$Package = 't3@nightly'
)

$ErrorActionPreference = 'Stop'
$taskName = 'T3 Code Headless'
$account = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$sid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$startupDir = Join-Path $UserHome '.t3\startup'
$pwsh = Join-Path $PSHOME 'pwsh.exe'
foreach ($path in @($NpxPath, $pwsh, (Join-Path $PSScriptRoot 'Start-T3Code.ps1'))) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Missing required file: $path" }
}
New-Item -ItemType Directory -Path $startupDir -Force | Out-Null
# Server output includes pairing details; restrict scripts and logs to this
# account, SYSTEM and administrators, without copying any credentials.
& icacls.exe $startupDir /inheritance:r /grant:r "*${sid}:(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not secure the startup directory.' }
$launcher = Join-Path $startupDir 'Start-T3Code.ps1'
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Start-T3Code.ps1') -Destination $launcher -Force

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Export-ScheduledTask -TaskName $taskName | Set-Content -LiteralPath (Join-Path $startupDir ('task-before-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.xml'))
}
$arguments = '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -File "{0}" -UserHome "{1}" -NpxPath "{2}" -Package "{3}"' -f $launcher, $UserHome, $NpxPath, $Package
$action = New-ScheduledTaskAction -Execute $pwsh -Argument $arguments -WorkingDirectory $UserHome
$boot = New-ScheduledTaskTrigger -AtStartup
$boot.Delay = 'PT30S'
$login = New-ScheduledTaskTrigger -AtLogOn -User $account
# S4U runs without an interactive desktop or a stored Windows password.
# HTTP/token-based T3 Connect uses the existing files in this user's profile.
$principal = New-ScheduledTaskPrincipal -UserId $account -LogonType S4U -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($boot, $login) -Principal $principal -Settings $settings -Description 'Start NPX T3 Code headlessly at boot, reuse T3 Connect, and recover on exit. Tailscale HTTPS uses port 8443.' -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
"Started $taskName as $account; launcher and private logs: $startupDir"
