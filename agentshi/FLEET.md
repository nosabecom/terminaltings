# Nosa's machine fleet

**Newera is the main PC.** Godseye, Shitbook, and Ewaste are the other fleet
machines. All four can SSH to each other over Tailscale as Nosa's own account.

From any of them, use `ssh newera`, `ssh godseye`, `ssh shitbook`, or `ssh ewaste`.
The aliases select these destination accounts:

- Newera: `nomok`, with profile `C:/Users/nomok.NEWERA`.
- Godseye: `nosa`, with profile `C:/Users/nomok`.
- Shitbook and Ewaste: `nosa`, with home `/home/nosa`.

## SSH configuration and keys

[configs/ssh](../configs/ssh) contains the public fleet inventory, client config
blocks for each source machine, authorized public keys, pinned host keys, and the
record of all 12 successful source-to-destination login checks on October 21, 2026.

The runtime client config is in each user's `.ssh/config`. The managed block is
marked `BEGIN NOSA SSH MESH` / `END NOSA SSH MESH`. Existing unrelated settings
were retained. It uses explicit identities, disables agent forwarding and password
authentication for these aliases, and checks the pinned server host keys.

Each machine holds its own private identity; copies are backed up in the 1Password
Private vault:

- Godseye: `~/.ssh/mainting`, item **Main Ting**.
- Newera: `~/.ssh/Sideting`, item **Side ting**.
- Shitbook: `~/.ssh/github_devbox`, item **Shitbook**.
- Ewaste: `~/.ssh/mesh_ed25519`, item **Ewaste**. This identity was generated in
  1Password and installed on Ewaste; the installed public key was verified.

No private keys or passwords are stored in this repository. The inventory records
public keys and vault item IDs. Normal SSH does not depend on unlocking 1Password.
Newera's existing encrypted identity uses its running Windows SSH agent.

Newera's SSH server listens on its Tailscale IP and permits `nomok` from the other
three fleet IPs. Godseye continues to permit `nosa`. Both Windows machines use
`C:/ProgramData/ssh/administrators_authorized_keys` for the user's administrator
account, with permissions limited to SYSTEM and Administrators. Linux uses
`~/.ssh/authorized_keys` with mode 600 and a mode-700 `.ssh` directory.

## Sudo skill

The maintained source is
[skills/sudo-access-1password](skills/sudo-access-1password/SKILL.md). Matching copies
are installed in each machine's `~/.codex/skills/sudo-access-1password` directory.
After editing the repo copy, update the installed copies too.

Both Linux accounts already allow passwordless sudo. The skill preserves that
policy and uses 1Password only when a password is needed. Its references point to
the concealed password fields in **shitbook sudo passwd** and **ewaste sudo
passwd**, rather than the empty note bodies.

Newera is the verified 1Password desktop access point. The skill includes a
temporary-task bridge for headless Windows/T3 sessions. Each operation still uses
1Password's normal approval prompt when needed; the bridge removes its task and
job files afterward. Godseye's background CLI integration was unavailable during
setup, so credential retrieval should use Newera.

Validation completed: the skill format validator and five behavior tests passed;
all four installed copies matched the source hashes; live sudo commands returned
`root` on both Linux hosts; and the Newera desktop bridge retrieved both configured
password fields without displaying them. Because passwordless sudo is enabled,
the field checks do not establish whether those passwords authenticate.

## Recovery and reuse

The setup saved `.pre-mesh-<timestamp>` backups beside the changed client configs,
known-host files, authorized-key files, and Newera's SSH server config. Restore an
appropriate original if rolling back; validate a changed server config with
`sshd -t` before restarting the server. Retain a working connection while testing.

When using the public files in `configs/ssh` to reinstall, merge their entries
into the destination files. Preserve unrelated host aliases and authorized keys.
Set the destination-specific private identity path from `fleet.json`; retrieve
the actual private key from 1Password outside the repo if it is missing.

The three global `AGENTS.md` audit snapshots remain in [audit](audit/README.md).
The merge target `agentshi/AGENTS.md` is still empty; this SSH work did not merge
or install those instruction files.
