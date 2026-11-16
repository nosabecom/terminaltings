"""Install the shared user configuration without replacing machine credentials."""

import ctypes
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
from datetime import datetime, timezone


ROOT = Path(__file__).resolve().parents[1]
HOME = Path.home()
BACKUP = HOME / '.terminaltings-backups' / datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
INSTALLED = {}


def backup(path):
    target = BACKUP / path.relative_to(HOME)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)


def write(path, content):
    """Retain existing provider links, backing up their resolved content."""
    if path.exists() and path.read_bytes() == content:
        return
    if path.exists():
        backup(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)


def install(source, target):
    content = source.read_bytes().replace(b'\r\n', b'\n')
    write(target, content)
    if target.read_bytes() != content:
        raise RuntimeError(f'Installed file differs: {target}')
    INSTALLED[str(target)] = hashlib.sha256(content).hexdigest()


def git(*args):
    return subprocess.run(['git', *args], check=True, capture_output=True, text=True).stdout.strip()


def main():
    # Never initialize or place a checkout inside a cloud-sync directory.
    if any(name in str(ROOT).lower() for name in ('onedrive', 'google drive', 'dropbox')):
        raise RuntimeError('Move the checkout outside cloud-sync folders before installing.')

    for name in ('AGENTS.md', 'CLAUDE.md'):
        source = ROOT / 'agentshi' / name
        install(source, HOME / '.agents' / name)
    for provider, name in (('.codex', 'AGENTS.md'), ('.claude', 'AGENTS.md'), ('.claude', 'CLAUDE.md')):
        install(ROOT / 'agentshi' / name, HOME / provider / name)

    for source in sorted((ROOT / 'agentshi' / 'skills').rglob('*')):
        if not source.is_file() or '__pycache__' in source.parts or source.suffix == '.pyc':
            continue
        relative = source.relative_to(ROOT / 'agentshi' / 'skills')
        for directory in ('.agents', '.codex', '.claude'):
            install(source, HOME / directory / 'skills' / relative)

    # Include the repository defaults before local settings so local credentials
    # and signing configuration keep their existing precedence.
    config = HOME / '.gitconfig'
    include = '[include]\n\tpath = "' + (ROOT / '.gitconfig').as_posix() + '"\n'
    existing = config.read_text(encoding='utf-8-sig') if config.exists() else ''
    if include not in existing:
        write(config, (include + existing).encode('utf-8'))

    if os.name == 'nt':
        install(ROOT / 'configs' / '.psmux.conf', HOME / '.psmux.conf')
        # Ask Windows for Documents; it may be redirected into OneDrive. Only
        # these small loader files go there, never the repository itself.
        buffer = ctypes.create_unicode_buffer(32768)
        result = ctypes.windll.shell32.SHGetFolderPathW(None, 5, None, 0, buffer)
        if result != 0:
            raise RuntimeError(f'Cannot locate Windows Documents: {result}')
        # Documents can sync between PCs, so the loader must locate the checkout
        # under the current user's home instead of embedding this machine's path.
        loader = """# Shared configuration maintained in terminaltings.
$sharedProfile = $null
foreach ($relativeRoot in @('source\\terminaltings', 'codenshit\\terminaltings', '.config\\terminaltings', '.config\\terminal')) {
    $candidate = Join-Path (Join-Path $HOME $relativeRoot) 'configs\\powershell\\profile.ps1'
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
        $sharedProfile = $candidate
        break
    }
}
if ($sharedProfile) {
    . $sharedProfile
} else {
    Write-Warning 'Shared PowerShell profile was not found in the terminaltings checkout locations.'
}
"""
        for directory in ('PowerShell', 'WindowsPowerShell'):
            path = Path(buffer.value) / directory / 'Microsoft.PowerShell_profile.ps1'
            existing = path.read_text(encoding='utf-8-sig') if path.exists() else ''
            if existing == loader:
                continue
            # Retain custom profiles, replacing only the known shared loader.
            if (existing and '$sharedProfile' not in existing
                    and not existing.startswith('# Shared configuration maintained in terminaltings.')):
                if loader not in existing:
                    write(path, (existing.rstrip() + '\n\n' + loader).encode('utf-8'))
            else:
                write(path, loader.encode('utf-8'))
    else:
        for name in ('.blerc', '.tmux.conf'):
            source = ROOT / 'configs' / name
            target = HOME / name
            # Retarget old layout links, keeping their content in the backup.
            if target.is_symlink() and target.resolve() != source:
                if target.exists():
                    backup(target)
                target.unlink()
            if not target.exists():
                target.symlink_to(source)
            install(source, target)
        bashrc = HOME / '.bashrc'
        if bashrc.exists():
            existing = bashrc.read_text()
            updated = existing.replace('.config/terminaltings/terminal.omp.json',
                                       '.config/terminaltings/configs/terminal.omp.json')
            if updated != existing:
                write(bashrc, updated.encode('utf-8'))

    if git('config', '--global', '--includes', 'init.defaultBranch') != 'main':
        raise RuntimeError('Shared Git defaults were not loaded')
    report = {'source_commit': git('-C', str(ROOT), 'rev-parse', 'HEAD'),
              'checkout': str(ROOT), 'backup_root': str(BACKUP), 'sha256': INSTALLED}
    destination = HOME / '.agents' / 'deployments' / 'terminaltings.json'
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
