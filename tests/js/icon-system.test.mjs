import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const iconNames = [
  'time',
  'warning',
  'growth',
  'monitor',
  'templates',
  'laser',
  'thread',
  'layers',
  'shield',
  'headset',
  'training',
  'custom'
];

test('reference interface icons share one 48px line-icon contract', async () => {
  for (const name of iconNames) {
    const svg = await readFile(new URL(`../../public/assets/icons/${name}.svg`, import.meta.url), 'utf8');
    assert.match(svg, /viewBox="0 0 48 48"/, name);
    assert.match(svg, /fill="none"/, name);
    assert.match(svg, /stroke="#000"/, name);
    assert.match(svg, /stroke-width="2"/, name);
    assert.match(svg, /stroke-linecap="round"/, name);
    assert.match(svg, /stroke-linejoin="round"/, name);
    assert.doesNotMatch(svg, /stroke-width="2\.2"/, name);
  }
});
