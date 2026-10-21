import importlib.util
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('sudo_access', Path(__file__).with_name('sudo_access.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def completed(code=0, stdout=b'', stderr=b''):
    return subprocess.CompletedProcess([], code, stdout, stderr)


class AccessTests(unittest.TestCase):
    def setUp(self):
        self.transport = patch.object(module, 'transport', side_effect=lambda host, user, command: ['ssh', host, command])
        self.transport.start()
        self.addCleanup(self.transport.stop)

    def test_failed_command_is_not_retried_and_does_not_read_vault(self):
        with patch.object(module, 'run_process', side_effect=[completed(), completed(7, b'partial change')]) as run, \
             patch.object(module, 'read_password') as read:
            self.assertEqual(module.execute('shitbook', ['false'])[0], 7)
            self.assertEqual(run.call_count, 2)
            read.assert_not_called()

    def test_transport_failure_does_not_fetch_password(self):
        with patch.object(module, 'run_process', return_value=completed(255, stderr=b'Permission denied (publickey).')), \
             patch.object(module, 'read_password') as read:
            self.assertEqual(module.execute('ewaste', ['id'])[0], 255)
            read.assert_not_called()

    def test_password_only_enters_stdin_and_command_cannot_read_it(self):
        secret = b'unit-test-secret'
        with patch.object(module, 'run_process', side_effect=[
            completed(1, stderr=b'sudo: a password is required'),
            completed(0, stdout=secret, stderr=secret),
        ]) as run, patch.object(module, 'read_password', return_value=secret) as read:
            code, stdout, stderr = module.execute('ewaste', ['printf', '%s', 'literal; text'])
            self.assertEqual(code, 0)
            self.assertNotIn(secret, stdout + stderr)
            call = run.call_args
            self.assertEqual(call.kwargs['data'], secret + b'\n')
            self.assertNotIn(secret.decode(), str(call.args))
            self.assertIn("sudo -S -p '' -v && sudo -n -- printf %s 'literal; text' </dev/null", call.args[0][-1])
            self.assertIn('ewaste sudo passwd/add more/password', read.call_args.args[0])

    def test_vault_check_never_runs_a_privileged_command(self):
        with patch.object(module, 'read_password', return_value=b'unit-test-secret'), \
             patch.object(module, 'run_process') as run:
            result = module.execute('shitbook', [], check_vault=True)
            self.assertEqual(result[0], 0)
            self.assertNotIn(b'unit-test-secret', result[1])
            run.assert_not_called()

    def test_multiline_field_is_rejected(self):
        with patch.object(module.shutil, 'which', return_value='op'), \
             patch.object(module, 'run_process', return_value=completed(stdout=b'not\na password')):
            with self.assertRaises(module.AccessError):
                module.read_password('op://vault/item/password')


if __name__ == '__main__':
    unittest.main()
