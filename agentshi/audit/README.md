# Global AGENTS.md audit sources

Collected on October 21, 2026. These are unchanged source snapshots for the audit.
The intended merged file is `../AGENTS.md`, which is currently empty.
Git attributes preserve the three source snapshots' original bytes and line endings.

## Godseye (this PC)

- Snapshot: [godseye.md](godseye.md)
- Source: `C:/Users/nomok/.codex/AGENTS.md`
- SHA-256: `bcc186bb95d6ebe07a384ecd557947b316733dfdae69664d51adba7e94d4d19d`
- Topics: in-app browser preference, Blip downloads for schoolwork, teach-first schoolwork help, and Windows shell quoting.

## Shitbook

- Snapshot: [shitbook.md](shitbook.md)
- Source: `/home/nosa/.codex/AGENTS.md` (retrieved over SSH as `nosa@shitbook`)
- SHA-256: `544ed9dec9fe7ef2e60f628d21bf3cd0a811cc7a7f8e7a21869b7a32d1990b9f`
- Topics: pnpm preference, Windows shell quoting, GitHub's native PR revert flow, PR templates, and embedded before/after screenshots.

The Windows shell quoting section appears in all three snapshots. Godseye and
Newera also overlap on teaching preferences; Newera explicitly asks to wait for
an attempt after the first hint. Review those together when merging.

## Newera

- Snapshot: [newera.md](newera.md)
- Source: `C:/Users/nomok.NEWERA/.codex/AGENTS.md` (retrieved over SSH as `nomok@newera`, using the existing `surface_diagnostics` key)
- SHA-256: `d17762d57ceac6c944693857e560944d82a0cb4b7b7af78552e583082265dc02`
- Topics: school email signature and student ID preferences, hint-first math tutoring, and Windows shell quoting.

The downloaded snapshot's SHA-256 matches the source on Newera.

## Merge status

All three originals are collected. No instructions have been merged or installed.
Review the original snapshots before choosing the final contents of `../AGENTS.md`.
