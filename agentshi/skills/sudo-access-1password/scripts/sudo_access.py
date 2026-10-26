#!/usr/bin/env python3
"""Execute one authorized sudo operation; never emit or persist the password."""

import argparse
import json
import os
from pathlib import Path
import shlex
import shutil
import socket
import subprocess
import sys

CONFIG = Path(__file__).resolve().parents[1] / 'references' / 'hosts.json'


class AccessError(Exception):
    pass


def run_process(argv, *, data=None, timeout=120):
    return subprocess.run(
        argv, input=data, stdin=subprocess.DEVNULL if data is None else None,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout,
    )


def transport(host, user, shell_command):
    if socket.gethostname().lower().split('.')[0] == host and os.name != 'nt':
        import pwd
        if pwd.getpwuid(os.geteuid()).pw_name != user:
            raise AccessError('Run this helper as ' + user + ', rather than root or another user.')
        return ['sh', '-c', shell_command]
    return ['ssh', '-T', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10',
            '-o', 'ServerAliveInterval=10', '-o', 'ServerAliveCountMax=2',
            '-l', user, host, shell_command]


def read_password(reference):
    op = shutil.which('op')
    if not op:
        raise AccessError('1Password CLI is unavailable. Use the desktop bridge on Newera.')
    p = run_process([op, 'read', '--no-newline', reference], timeout=120)
    if p.returncode:
        raise AccessError('1Password could not read the password field. Unlock/approve the app; use the Newera desktop bridge from a headless session.')
    password = p.stdout.rstrip(b'\r\n')
    if not password or b'\n' in password or b'\r' in password or b'\0' in password:
        raise AccessError('The configured 1Password field must contain one nonempty password line.')
    return password


def execute(host, argv, *, check_vault=False, timeout=120):
    hosts = json.loads(CONFIG.read_text(encoding='utf-8'))['hosts']
    if host not in hosts:
        raise AccessError('Choose shitbook or ewaste.')
    entry = hosts[host]
    if check_vault:
        password = read_password(entry['password_reference'])
        del password
        return 0, ('1Password password field is available for ' + host + '.\n').encode(), b''
    if not argv or any(not isinstance(arg, str) or '\0' in arg for arg in argv):
        raise AccessError('Supply a command as a nonempty list of string arguments.')
    command = 'sudo -n -- ' + shlex.join(argv) + ' </dev/null'
    probe = run_process(transport(host, entry['ssh_user'], 'LC_ALL=C sudo -n -- true'), timeout=min(timeout, 30))
    if probe.returncode == 0:
        p = run_process(transport(host, entry['ssh_user'], command), timeout=timeout)
        return p.returncode, p.stdout, p.stderr
    needs_password = any(message in probe.stderr.lower() for message in
                         (b'a password is required', b'interactive authentication is required'))
    if not needs_password:
        # No privileged command ran. Policy and transport errors must not fetch a secret.
        return probe.returncode, probe.stdout, probe.stderr
    password = read_password(entry['password_reference'])
    # Keep a shell alive as both sudo processes' parent for non-TTY sudo timestamps.
    # The privileged command receives /dev/null, even if authentication was cached.
    shell_command = "LC_ALL=C sudo -S -p '' -v && " + command + '; result=$?; exit "$result"'
    try:
        p = run_process(transport(host, entry['ssh_user'], shell_command), data=password + b'\n', timeout=timeout)
        return p.returncode, p.stdout.replace(password, b'[REDACTED]'), p.stderr.replace(password, b'[REDACTED]')
    finally:
        del password


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--job', type=Path, help=argparse.SUPPRESS)
    parser.add_argument('--result', type=Path, help=argparse.SUPPRESS)
    parser.add_argument('--timeout', type=int, default=120)
    parser.add_argument('--check-vault', action='store_true')
    parser.add_argument('host', nargs='?')
    parser.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    result_path = args.result
    try:
        if args.job:
            job = json.loads(args.job.read_text(encoding='utf-8-sig'))
            host, argv = job['host'], job.get('argv', [])
            check_vault = job.get('check_vault', False)
            timeout = int(job.get('timeout', 120))
        else:
            host, argv, check_vault, timeout = args.host, args.command, args.check_vault, args.timeout
            if argv and argv[0] == '--':
                argv = argv[1:]
        if timeout <= 0:
            raise AccessError('Timeout must be positive.')
        code, stdout, stderr = execute(host, argv, check_vault=check_vault, timeout=timeout)
    except AccessError as exc:
        code, stdout, stderr = 1, b'', (str(exc) + '\n').encode()
    except subprocess.TimeoutExpired:
        code, stdout, stderr = 124, b'', b'Operation timed out. Inspect the destination before retrying; the command may still be running.\n'
    except (OSError, ValueError, KeyError):
        code, stdout, stderr = 1, b'', b'Could not execute the operation. Check the skill configuration and SSH/1Password availability.\n'
    if result_path:
        result = {'code': code, 'stdout': stdout.decode('utf-8', errors='replace'),
                  'stderr': stderr.decode('utf-8', errors='replace')}
        partial = result_path.with_suffix('.partial')
        partial.write_text(json.dumps(result), encoding='utf-8')
        partial.replace(result_path)
    else:
        sys.stdout.buffer.write(stdout)
        sys.stderr.buffer.write(stderr)
    return code


if __name__ == '__main__':
    raise SystemExit(main())
