---
name: sudo-access-1password
description: Run authorized administration commands as Nosa on Shitbook or Ewaste, using existing sudo access and retrieving a required sudo password from 1Password without exposing it.
---

# Linux sudo access

Use this skill for authorized work requiring sudo on `shitbook` or `ewaste`.
Both machines use the SSH account `nosa`. Newera is the fleet's main PC and the
working 1Password desktop access point. Use SSH as the user's account, then sudo
for the specific operation.

## Execute an operation

Use `scripts/sudo_access.py`, with the destination alias and the exact command
arguments after `--`:

```text
python scripts/sudo_access.py shitbook -- systemctl status ssh
python scripts/sudo_access.py ewaste -- id -un
```

On Linux, use `python3` if `python` is unavailable. Script paths above are relative
to this skill's directory. For a local Linux destination, the helper runs sudo
locally; otherwise it uses the configured SSH alias.

The helper probes `sudo -n -- true` before running the requested command. Both Linux
machines currently have `NOPASSWD` access. Preserve that existing policy. If a
password is required, the helper reads only the configured concealed password
field from 1Password. It authenticates and executes the command in one remote
shell, with the command's stdin disconnected from the password stream.

Do not use `sudo -n -v` as the passwordless probe: on these machines it requests
authentication even though `sudo -n -- true` and the allowed commands succeed.

Treat command failure as command failure. Never rerun a mutation just because
its exit code is nonzero. Diagnose transport, sudo-policy, and credential failures
before another attempt. Do not change passwords, grant privileges, or edit
sudoers merely to make an operation succeed.

The helper uses argv, not an implicit command shell. For operations that actually
need pipelines or redirection, pass an explicitly reviewed `sh -c` command.
Commands are noninteractive and have a default 120-second timeout; choose a longer
`--timeout` before starting genuinely long work.

## 1Password and headless Windows sessions

Credential references live in [references/hosts.json](references/hosts.json).
They point to the concealed `password` fields of the existing `shitbook sudo
passwd` and `ewaste sudo passwd` notes in the Private vault. Their note bodies are
empty. Read the field reference, not `notesPlain` or the entire vault item.

T3 can run in Windows session 0 while 1Password runs in desktop session 1.
An unlocked app alone does not make `op` available in that background session.
Use the supplied `scripts/Invoke-DesktopSudo.ps1` on **Newera** when a password is
needed and the current process cannot reach the app. It runs one exact operation
through a temporary task in the user's desktop session, allows the user to approve
the normal 1Password prompt, and removes the task and temporary job files.

The bridge accepts a Base64-encoded UTF-8 JSON array of command arguments, which
avoids quoting differences between SSH, PowerShell, and POSIX shells. For example,
`WyJpZCIsIi11biJd` represents `["id","-un"]`:

```text
ssh newera powershell.exe -NoProfile -File C:/Users/nomok.NEWERA/.codex/skills/sudo-access-1password/scripts/Invoke-DesktopSudo.ps1 -HostName ewaste -CommandBase64 WyJpZCIsIi11biJd
```

Use `-CheckVault` instead of `-CommandBase64` to verify that the configured password
field is accessible without displaying it or performing a privileged operation.
This verifies vault retrieval, not whether the stored password authenticates when
passwordless sudo is in effect.

If 1Password is locked, unavailable, or approval is declined, report that precise
blocker. Let the user unlock or approve the app. Never request the password in
chat, print it, place it in argv/environment variables, write it to a file, or
enable shell tracing around credential handling. Retrieve it only for the
authorized operation, and pass it through process memory and stdin.

This skill supplies access mechanics; the user's task determines which changes
are authorized. It does not require repeated confirmation for work the user has
already authorized.
