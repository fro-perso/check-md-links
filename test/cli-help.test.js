import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

test('affiche l’aide avec --help', async () => {
  const { stdout, stderr } = await execFileAsync(process.execPath, ['index.js', '--help']);

  assert.match(stdout, /Usage: check-md-links \[fichier\.md\]/);
  assert.equal(stderr, '');
});
