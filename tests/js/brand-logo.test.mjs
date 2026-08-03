import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const logoPath = new URL('../../public/assets/images/textileopttorg-logo.webp', import.meta.url);

test('textileopttorg logo is a compact local WebP asset', async () => {
  const [bytes, metadata] = await Promise.all([readFile(logoPath), stat(logoPath)]);
  assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
  assert.ok(metadata.size < 180_000, `logo is ${metadata.size} bytes`);
});
