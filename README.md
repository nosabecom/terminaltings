# Terminal configuration

Personal terminal configuration shared across Windows machines.

## Contents

- `terminal.omp.json` — Oh My Posh theme, based on Atomic.
- `powershell/profile.ps1` — shared PowerShell 7 profile.
- `powershell/local.ps1` — optional untracked machine-specific settings.
- `.tmux.conf` — shared tmux-compatible configuration used by psmux.

The shared profile enables PSReadLine history/plugin predictions using its
interactive ListView, and psmux is configured to preserve those settings.

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

### Mouse and SSH

Mouse support stays enabled for pane focus, border resizing, clickable window
tabs, and VT mouse forwarding. PSMux client-side selection and automatic
wheel-to-copy-mode are disabled so SSH programs such as `nvim`, `htop`,
`lazygit`, and remote `tmux` receive clicks and scrolling directly.

- Click a pane to focus it, drag a pane border to resize it, or click a status
  bar window to switch to it.
- Hold `Shift` while dragging to force Windows Terminal text selection when a
  remote program owns the mouse.
- Use `Ctrl+Shift+C` / `Ctrl+Shift+V` to copy / paste through Windows Terminal.
- For keyboard-only copying, press `Ctrl+Shift+M` to enter Windows Terminal mark
  mode, move with the arrow keys, extend with `Shift+Arrow`, then press `Enter`
  or `Ctrl+Shift+C` to copy. Press `Escape` to cancel.
- Use `Ctrl+Shift+A` to select the entire terminal buffer.
- Press `Page Up` or `Home [` to enter PSMux copy mode for pane history.
- `pwsh-mouse-selection` remains enabled for convenient local PowerShell use.

### PSMux cheat sheet

`Prefix` below means press and release `Home`, then press the listed key.
Press `Home Home` to send a literal Home key to the active program.

#### Sessions

| Command or key | Action |
| --- | --- |
| `psmux` | Start or attach to the default session |
| `psmux new -s work` | Create a named session |
| `psmux ls` | List sessions |
| `psmux attach -t work` | Attach to a named session |
| `Prefix d` | Detach and leave the session running |
| `Prefix s` | Open the session chooser |
| `Prefix $` | Rename the current session |
| `Prefix X` | Confirm and close the current session |

#### Windows

| Key | Action |
| --- | --- |
| `F12` or `Prefix c` | Create a window in the current directory |
| `Prefix n` / `Prefix p` | Next / previous window |
| `Prefix l` | Return to the last window |
| `Prefix 1` through `Prefix 9` | Select a numbered window |
| `Prefix ,` | Rename the current window |
| `Prefix w` | Open the window and pane chooser |
| `Prefix &` | Kill the current window |

#### Panes and layouts

| Key | Action |
| --- | --- |
| `Prefix \|` or `Prefix %` | Split side-by-side |
| `Prefix -` or `Prefix \"` | Split top-and-bottom |
| `Prefix h/j/k/l` or `Prefix Arrow` | Move between panes |
| `Prefix H/J/K/L` | Resize by five cells; key is repeatable |
| `Prefix z` | Zoom or restore the current pane |
| `Prefix q`, then a number | Display pane numbers and jump |
| `Prefix x` | Kill the current pane |
| `Prefix Space` | Cycle layouts |

#### Copy and scroll mode

Enter with `Page Up` or `Prefix [`.

| Key | Action |
| --- | --- |
| `j/k` or arrows | Move through history |
| `Page Up` / `Page Down` | Move by page |
| `g` / `G` | Go to the beginning / end of history |
| `/` or `?` | Search forward / backward |
| `n` / `N` | Next / previous match |
| `Space` | Begin selection |
| `V` | Select whole lines |
| `v` | Toggle rectangular selection |
| `y` or `Enter` | Copy the selection |
| `q` or `Escape` | Exit copy mode |
| `Prefix ]` | Paste the PSMux buffer |

#### Configuration and help

| Key | Action |
| --- | --- |
| `Prefix r` | Reload the tracked configuration |
| `Prefix :` | Open the PSMux command prompt |
| `Prefix ?` | List all key bindings |
