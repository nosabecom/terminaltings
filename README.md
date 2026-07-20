# Terminal configuration

Personal terminal configuration shared across Windows machines.

## Contents

- `terminal.omp.json` — Oh My Posh theme, based on Atomic.
- `powershell/profile.ps1` — shared PowerShell 7 profile.
- `powershell/local.ps1` — optional untracked machine-specific settings.

## PowerShell setup

Clone this repository to `~/.config/terminal`, then make the active PowerShell
profile load the tracked profile:

```powershell
$sharedProfile = Join-Path $HOME '.config\terminal\powershell\profile.ps1'
if (Test-Path -LiteralPath $sharedProfile) {
    . $sharedProfile
}
```

The active profile path can be displayed with `$PROFILE`.

No psmux configuration is included yet.
