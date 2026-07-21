# Terminal configuration

Personal terminal configuration shared across Windows machines.

## Contents

- `terminal.omp.json` — Oh My Posh theme, based on Atomic.
- `powershell/profile.ps1` — shared PowerShell 7 profile.
- `powershell/local.ps1` — optional untracked machine-specific settings.
- `.tmux.conf` — shared tmux-compatible configuration used by psmux.

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

## psmux setup

Create `~/.config/psmux/psmux.conf` as a small loader:

```text
source-file "~/.config/terminal/.tmux.conf"
```

psmux discovers that loader automatically. Reload a running server after
editing the tracked configuration with:

```powershell
psmux source-file ~/.config/psmux/psmux.conf
```

### Key reference

- `\` — prefix key; press `\\` to send a literal backslash.
- `F12` — create a new window without a prefix.
- `\ c` — create a new window in the current directory.
- `\ |` / `\ -` — split side-by-side / top-and-bottom.
- `\ h/j/k/l` — move between panes.
- `\ H/J/K/L` — resize panes by five cells.
- `\ r` — reload the tracked configuration.
- `\ s` / `\ w` — open the session / window chooser.
- `\ d` — detach while leaving the session running.
