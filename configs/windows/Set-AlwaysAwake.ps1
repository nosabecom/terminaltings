# Run elevated on the Windows machine that should stay awake with its lid shut.
[CmdletBinding()]
param(
    [string]$BackupDirectory = (Join-Path $env:ProgramData 'TerminalThings\PowerBackups')
)

$ErrorActionPreference = 'Stop'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this script from an elevated PowerShell session on the intended host.'
}

function Invoke-PowerCfg {
    param([string[]]$Arguments)
    & powercfg.exe @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "powercfg failed ($LASTEXITCODE): $($Arguments -join ' ')"
    }
}

$active = & powercfg.exe /getactivescheme
if ($LASTEXITCODE -ne 0) { throw 'Could not read the active power plan.' }
$scheme = [regex]::Match(($active -join ' '), '[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}').Value
if (-not $scheme) { throw 'Could not identify the active power plan GUID.' }

New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null
$backup = Join-Path $BackupDirectory ("$env:COMPUTERNAME-" + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '.pow')
Invoke-PowerCfg -Arguments @('/export', $backup, $scheme)

foreach ($scope in '/setacvalueindex', '/setdcvalueindex') {
    foreach ($setting in 'STANDBYIDLE', 'HIBERNATEIDLE', 'UNATTENDSLEEP', 'HYBRIDSLEEP') {
        Invoke-PowerCfg -Arguments @($scope, $scheme, 'SUB_SLEEP', $setting, '0')
    }
    Invoke-PowerCfg -Arguments @($scope, $scheme, 'SUB_BUTTONS', 'LIDACTION', '0')
}
Invoke-PowerCfg -Arguments @('/setactive', $scheme)

Write-Output "Configured active plan $scheme to stay awake with the lid closed on AC and battery."
Write-Output "Previous power plan saved to: $backup"
Write-Output 'Display timeout and critical-battery protection were not changed. Keep vents clear and use mains power for unattended operation.'
