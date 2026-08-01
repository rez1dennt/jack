import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('web manifest provides installable PNG icons', async () => {
  const manifest = JSON.parse(await readFile('public/site.webmanifest', 'utf8'));
  const pngIcons = manifest.icons.filter((icon) => icon.type === 'image/png');

  assert.deepEqual(
    pngIcons.map((icon) => icon.sizes).sort(),
    ['192x192', '512x512']
  );

  for (const icon of pngIcons) {
    await access(`public${icon.src}`);
  }
});
