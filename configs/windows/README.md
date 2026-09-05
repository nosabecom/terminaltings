# Godseye startup configuration

Configured on 2026-09-04 for `godseye` (Windows 11), account
`godseye\nosa`, profile `C:\Users\nomok`.

The aim is to leave the laptop plugged in with its lid closed while its remote
services remain available. Store it with the vents clear and airflow around it.

## Files

- `Set-AlwaysAwake.ps1`: elevated, reusable power-plan configuration. Exports a
  backup before applying the no-sleep and lid-close settings below.
- `Start-T3Code.ps1`: the headless NPX launcher used by the scheduled task.
- `Install-T3CodeStartup.ps1`: installs that launcher and its boot/sign-in task
  under the already-linked user's account.
- `GodseyeWebProxy.go`: Go source for the Godseye-specific Sunshine proxy and
  lowercase web entry links. Its executable runs in the existing dashboard task.
- `README.md`: this inventory, operating instructions, and verification record.

The T3 installer installs only T3's task; it does not install Tailscale, Sunshine,
RustDesk, or the web gateway. Those components already exist on Godseye.

## Startup inventory

| Component | When it starts | State |
| --- | --- | --- |
| Tailscale | System boot, before sign-in | Automatic service; unattended mode enabled; existing recovery policy retained |
| Sunshine | System boot | Automatic service; added restart recovery after 5, 15, then 60 seconds |
| Sunshine web gateway | System boot | Existing `Godseye Sunshine Tailnet Proxy` task now runs `GodseyeWebProxy.exe`; retries after failure and starts when available |
| T3 Code CLI + T3 Connect relay | System boot, with sign-in as a fallback trigger | `T3 Code Headless` task, 30-second boot delay, runs as `nosa` using S4U; no stored Windows password or desktop session required |
| OpenSSH server | System boot | Already automatic, with restart recovery; login shell is PowerShell 7 |
| RustDesk | System boot | Existing automatic service provides another remote-access option |
| OneDrive, Google Drive, Steam, Raycast | User sign-in | Existing user startup entries retained; these do not provide pre-login services |

PSMux session restoration remains useful when opening terminal sessions. Do not
automatically launch every development server or desktop app: configure an
explicit startup entry for each project that actually needs to run unattended.

## Web entry addresses

- `https://godseye.tail3123d8.ts.net/sunshine` serves Sunshine's home page.
- `https://godseye.tail3123d8.ts.net/t3` redirects to
  `https://godseye.tail3123d8.ts.net:8443/`.
- `/Sunshine` and `/T3` redirect to the lowercase entry addresses.

The `/t3` address is an entry link, not a full subpath installation: the current
T3 UI expects root-relative routes, assets, and API/WebSocket endpoints. A separate
HTTPS origin avoids collisions with Sunshine, which also uses root-relative
URLs. Sunshine navigation may use its existing root URLs, such as `/apps`.

Both listeners remain loopback-only, behind persistent **tailnet-only** Tailscale
Serve routes. No public Funnel was enabled:

```text
HTTPS 443  -> http://127.0.0.1:47991 -> https://127.0.0.1:47990 (Sunshine)
HTTPS 8443 -> http://127.0.0.1:3773  (T3 Code)
```

## T3 startup

The saved setup uses `npx --yes t3@nightly connect` to authorize and link the
environment. This is an interactive setup command, not a background daemon.
`Start-T3Code.ps1` verifies the saved link with `connect status`, then runs:

```powershell
npx --yes --prefer-offline t3@nightly serve --host 127.0.0.1 --port 3773
```

The existing T3 Connect relay reconnects automatically. `--prefer-offline` lets
NPX reuse its cached nightly when available; rebooting is not an update check.
To deliberately fetch the current nightly, run these commands as the linked
user on Godseye. This briefly interrupts T3 connections:

```powershell
Stop-ScheduledTask -TaskName 'T3 Code Headless'
try {
    npx --yes --prefer-online t3@nightly --version
    if ($LASTEXITCODE -ne 0) { throw 'T3 update failed; inspect the NPX output.' }
} finally {
    Start-ScheduledTask -TaskName 'T3 Code Headless'
}
```

The restart is attempted even if the download fails, so the wrapper can try its
cached build. There is no scheduled updater. Existing `.t3` data and Connect
authorization remain in place.

The wrapper restores the registered machine/user PATH (including Node, Git and
provider CLIs), waits for Tailscale, and exits with failure if T3 stops. Task
Scheduler retries after one minute, with no execution time limit or duplicate
task instances. It runs without elevation as the existing user so it retains
the same `.t3` environment and account identity.

To install, copy both PowerShell files together to the host and run
`Install-T3CodeStartup.ps1` elevated as the already-linked user. The default Node
installation is `C:\nvm4w\nodejs`; override `-NpxPath` for another machine.

The installed launcher and private logs are under
`C:\Users\nomok\.t3\startup`. This directory's ACL permits only the user,
SYSTEM, and administrators, because server logs can contain pairing details.

```powershell
Get-ScheduledTask -TaskName 'T3 Code Headless'
Get-ScheduledTaskInfo -TaskName 'T3 Code Headless'
Start-ScheduledTask -TaskName 'T3 Code Headless'
# To deliberately stop it and prevent a later boot/sign-in from starting it:
Disable-ScheduledTask -TaskName 'T3 Code Headless'
Stop-ScheduledTask -TaskName 'T3 Code Headless'
```

T3's built-in `service install` supports Linux/macOS in the installed nightly,
so Windows uses this scheduled task. S4U does not supply Windows network-login
credentials; token-based T3 relay access was verified from the background task.

## Power and monitor behavior

To reapply the configuration, run `Set-AlwaysAwake.ps1` elevated on the intended
host. It configures the active power plan and saves a `.pow` backup under
`C:\ProgramData\TerminalThings\PowerBackups`. Switching to a different power
plan later requires applying the settings to that plan too.

The active High performance plan now has these settings on both AC and DC:

- Automatic sleep: never.
- Automatic hibernation: never.
- Hidden unattended sleep timeout: never (previously two minutes).
- Hybrid sleep: off.
- Closing the lid: do nothing.

Display power settings and critical-power protection were retained. These
settings prevent automatic sleep, not explicit shutdown or loss of power.

Sunshine's service/dashboard can remain running with the physical monitor off.
Streaming also needs a display that Windows continues to expose. Godseye has
Intel UHD + NVIDIA RTX 4060 Laptop graphics and only an integrated physical
monitor; no virtual display was found. A virtual display driver or HDMI dummy
plug is the next option for reliable screen-off streaming. No display driver
was installed and monitor-off streaming was not tested during this change.

References: [Sunshine capture requirements](https://docs.lizardbyte.dev/projects/sunshine/latest/md_docs_2getting__started.html),
[Windows virtual display driver](https://github.com/VirtualDrivers/Virtual-Display-Driver),
[Tailscale unattended mode](https://tailscale.com/docs/how-to/run-unattended),
[persistent Tailscale Serve](https://tailscale.com/docs/reference/tailscale-cli/serve),
[T3 remote access](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md).

## Verification and rollback

Verified the T3 process runs as `nosa` in Windows session 0, listens only on
loopback, establishes T3 Connect relay tunnels, and survives the SSH command
ending. The HTTPS T3 page and its application JavaScript return HTTP 200.
`/sunshine` returns Sunshine's HTTP 401 Basic-auth challenge when unauthenticated,
instead of the previous HTTP 404. Actual authenticated UI navigation and a full
machine reboot were not performed.

The old power scheme, dashboard task XML, and Tailscale Serve configuration are
saved remotely in `C:\ProgramData\Godseye\StartupBackup-20260904-182917`.
The original `C:\ProgramData\Godseye\SunshineTailnetProxy.exe` was retained.
The replacement gateway is installed under `C:\ProgramData\Godseye\Startup`.
