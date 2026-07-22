# sshd builds SSH sessions from the machine environment only, dropping per-user
# PATH entries (codex, oh-my-posh, winget, bun, ...) — merge them back in.
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath) {
    $current = $env:Path -split ';'
    $missing = ($userPath -split ';') | Where-Object { $_ -and ($current -notcontains $_) }
    if ($missing) { $env:Path = $env:Path.TrimEnd(';') + ';' + ($missing -join ';') }
}

# Codex's bin directory sits behind user-owned junctions, which elevated
# sessions such as SSH may refuse to traverse. Resolve the junction chain and
# add the real directory to PATH when Codex is otherwise unavailable.
if (-not (Get-Command codex -ErrorAction SilentlyContinue)) {
    $resolved = Join-Path $env:LOCALAPPDATA 'Programs\OpenAI\Codex\bin'
    for ($pass = 0; $pass -lt 10; $pass++) {
        $parts = $resolved -split '\\'
        $substituted = $false
        for ($n = 1; $n -lt $parts.Count; $n++) {
            $prefix = $parts[0..$n] -join '\'
            $item = Get-Item -LiteralPath $prefix -Force -ErrorAction SilentlyContinue
            if ($item -and $item.LinkType -and $item.Target) {
                $rest = if ($n -lt $parts.Count - 1) { '\' + ($parts[($n + 1)..($parts.Count - 1)] -join '\') } else { '' }
                $resolved = [string]($item.Target | Select-Object -First 1) + $rest
                $substituted = $true
                break
            }
        }
        if (-not $substituted) { break }
    }
    if ([System.IO.File]::Exists("$resolved\codex.exe")) { $env:Path += ";$resolved" }
}

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
    $poshConfig = Join-Path $HOME '.config\terminal\terminal.omp.json'
    if (Test-Path -LiteralPath $poshConfig) {
        oh-my-posh init pwsh --config $poshConfig | Invoke-Expression
    }
}

# Optional per-machine settings. This file is intentionally not tracked.
$localProfile = Join-Path $HOME '.config\terminal\powershell\local.ps1'
if (Test-Path -LiteralPath $localProfile) {
    . $localProfile
}
