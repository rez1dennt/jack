import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Apache config defines a restrictive content security policy', async () => {
  const htaccess = await readFile(new URL('../../public/.htaccess', import.meta.url), 'utf8');

  for (const directive of [
    "default-src 'self'",
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self'",
    "img-src 'self'",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ]) {
    assert.match(htaccess, new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.doesNotMatch(htaccess, /'unsafe-inline'/);
});
