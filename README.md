# Terminal configuration

Personal terminal configuration shared across Windows and Linux machines.

## Contents

- `terminal.omp.json` — Oh My Posh theme, based on Atomic.
- `powershell/profile.ps1` — shared PowerShell 7 profile.
- `powershell/local.ps1` — optional untracked machine-specific settings.
- `.blerc` — shared ble.sh configuration for Bash.
- `.tmux.conf` — upstream-compatible tmux configuration for Linux.
- `.psmux.conf` — Windows-specific PSMux configuration.

The shared profile enables PSReadLine history/plugin predictions using its
interactive ListView, and psmux is configured to preserve those settings.

## Bash setup

Install `ble.sh`, then link the tracked configuration to its default location:

```sh
# Ubuntu 26.04 or newer
sudo apt install ble.sh
ln -s ~/.config/terminal/.blerc ~/.blerc
```

Load `ble.sh` near the top of the interactive section in `~/.bashrc`, before
prompt and completion setup:

```sh
source -- /usr/share/blesh/ble.sh --noattach
```

Attach it at the end of `~/.bashrc`, after prompt and completion setup:

```sh
[[ ${BLE_VERSION-} ]] && ble-attach
```

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

## Linux tmux setup

Install tmux 3.2 or newer using the Linux distribution's package manager:

```sh
# Ubuntu or Debian
sudo apt update && sudo apt install tmux

# Fedora
sudo dnf install tmux

# Arch Linux
sudo pacman -S tmux
```

Clone this repository to `~/.config/terminal`, then link the tracked Linux
config to the location tmux reads by default:

```sh
mkdir -p ~/.config
git clone https://github.com/nosabecom/terminaltings.git ~/.config/terminal
ln -s ~/.config/terminal/.tmux.conf ~/.tmux.conf
```

If `~/.tmux.conf` already exists, move it aside before creating the link rather
than overwriting it. Start or attach to a named session with:

```sh
tmux new-session -A -s work
```

Reload after an edit with `Home r` from inside tmux, or from a shell with:

```sh
tmux source-file ~/.tmux.conf
```

The Linux config uses `tmux-256color`, truecolor, mouse support, vi copy mode,
and OSC 52 clipboard forwarding. The SSH client terminal must permit OSC 52 for
copied text to reach its local clipboard. Hold `Shift` while dragging when the
outside terminal supports it to bypass tmux mouse handling and select directly.

## Windows PSMux setup

Create `~/.config/psmux/psmux.conf` as a small loader:

```text
source-file "~/.config/terminal/.psmux.conf"
```

psmux discovers that loader automatically. Reload a running server after
editing the tracked configuration with:

```powershell
psmux source-file ~/.config/psmux/psmux.conf
```

### btop4win setup

Use Scoop's `btop` package as the single installation. The PowerShell profile
also aliases `btop4win` to the same executable. Scoop persists the active
configuration at `~/scoop/persist/btop/btop.conf` across upgrades.

The stable PSMux configuration uses a 2000 ms update interval, disables
unsupported LibreHardwareMonitor/GPU/temperature probes in the standard build,
uses a single CPU graph, shows processes rather than services, and pauses
background redraw while menus are open. Keep `show_io_stat = True` with
btop4win 1.0.5: the released build has a known crash when that option is false.

Run `btop` normally. If a particularly limited SSH client renders Unicode
incorrectly, use `btop --tty_on` as a compatibility fallback.

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

### Shared tmux/PSMux cheat sheet

`Prefix` below means press and release `Home`, then press the listed key.
Press `Home Home` to send a literal Home key to the active program.

#### Sessions

| Command or key | Action |
| --- | --- |
| `tmux` / `psmux` | Start or attach to the default session |
| `tmux new -s work` / `psmux new -s work` | Create a named session |
| `tmux ls` / `psmux ls` | List sessions |
| `tmux attach -t work` / `psmux attach -t work` | Attach to a named session |
| `Prefix d` | Detach and leave the session running |
| `Prefix s` | Open the session chooser |
| `Prefix $` | Rename the current session |
| `Prefix X` | Confirm and close the current session |

#### Windows

| Key | Action |
| --- | --- |
| `F12` or `Prefix c` | Create a window in the current directory |
| `Ctrl+0` through `Ctrl+9` | Select the corresponding numbered window without the prefix |
| `Prefix n` / `Prefix p` | Next / previous window |
| `Prefix l` | Return to the last window |
| `Prefix 1` through `Prefix 9` | Select a numbered window |
| `Prefix ,` | Rename the current window |
| `Prefix w` | Open the window and pane chooser |
| `Prefix &` | Kill the current window immediately, without confirmation |

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
| `Prefix :` | Open the tmux/PSMux command prompt |
| `Prefix ?` | List all key bindings |
