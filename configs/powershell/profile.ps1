# Long-running SSH and PSMux servers can retain an old PATH. Re-read both
# registered scopes so every new pane sees current machine and user tools.
$registeredPaths = @(
    [Environment]::GetEnvironmentVariable('Path', 'Machine')
    [Environment]::GetEnvironmentVariable('Path', 'User')
)
$current = @($env:Path -split ';' | Where-Object { $_ })
$missing = @(
    $registeredPaths -split ';' |
        Where-Object { $_ -and ($current -notcontains $_) } |
        Select-Object -Unique
)
if ($missing) { $env:Path = $env:Path.TrimEnd(';') + ';' + ($missing -join ';') }

# PowerToys Command Not Found integration.
if (Get-Module -ListAvailable -Name Microsoft.WinGet.CommandNotFound) {
    Import-Module -Name Microsoft.WinGet.CommandNotFound
}

# Scoop is the canonical btop4win installation. Keep the upstream executable
# name working without reintroducing WinGet's broken config/theme path handling.
if (Get-Command btop.exe -CommandType Application -ErrorAction SilentlyContinue) {
    Set-Alias -Name btop4win -Value btop.exe -Scope Global
}

# Enable PSReadLine history and plugin predictions in interactive shells.
if (-not [Console]::IsInputRedirected -and (Get-Module -ListAvailable -Name PSReadLine)) {
    Import-Module -Name PSReadLine
    Set-PSReadLineOption -PredictionSource HistoryAndPlugin
    Set-PSReadLineOption -PredictionViewStyle ListView
}

# Load the Oh My Posh theme tracked alongside this profile.
if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
    $poshConfig = Join-Path $HOME '.config\terminal\configs\terminal.omp.json'
    if (Test-Path -LiteralPath $poshConfig) {
        oh-my-posh init pwsh --config $poshConfig | Invoke-Expression
    }
}

# Optional per-machine settings. This file is intentionally not tracked.
$localProfile = Join-Path $HOME '.config\terminal\powershell\local.ps1'
if (Test-Path -LiteralPath $localProfile) {
    . $localProfile
}
