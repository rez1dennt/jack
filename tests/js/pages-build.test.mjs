import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildPages } from '../../scripts/build-pages.mjs';

test('builds a GitHub Pages preview under the repository base path', async () => {
  const root = await mkdtemp(join(tmpdir(), 'jack-pages-'));
  const sourceDir = join(root, 'public');
  const outputDir = join(root, 'dist');

  await mkdir(join(sourceDir, 'assets'), { recursive: true });
  await writeFile(
    join(sourceDir, 'index.html'),
    '<html lang="ru"><link href="/assets/site.css"><a href="/privacy.html">Политика</a></html>'
  );
  await writeFile(join(sourceDir, 'privacy.html'), '<a href="/">На главную</a>');

  await buildPages({
    sourceDir,
    outputDir,
    basePath: '/jack',
    siteUrl: 'https://rez1dennt.github.io/jack'
  });

  const index = await readFile(join(outputDir, 'index.html'), 'utf8');
  const privacy = await readFile(join(outputDir, 'privacy.html'), 'utf8');

  assert.match(index, /href="\/jack\/assets\/site\.css"/);
  assert.match(index, /href="\/jack\/privacy\.html"/);
  assert.match(index, /data-static-preview="true"/);
  assert.match(privacy, /href="\/jack\/"/);
});

test('does not publish PHP endpoints or Apache configuration', async () => {
  const root = await mkdtemp(join(tmpdir(), 'jack-pages-'));
  const sourceDir = join(root, 'public');
  const outputDir = join(root, 'dist');

  await mkdir(join(sourceDir, 'api'), { recursive: true });
  await writeFile(join(sourceDir, 'index.html'), '<html lang="ru"></html>');
  await writeFile(join(sourceDir, 'api', 'submit.php'), '<?php echo "secret";');
  await writeFile(join(sourceDir, '.htaccess'), 'Header set X-Test true');

  await buildPages({ sourceDir, outputDir, basePath: '/jack' });

  await assert.rejects(access(join(outputDir, 'api', 'submit.php')));
  await assert.rejects(access(join(outputDir, '.htaccess')));
});

test('preserves JavaScript regular expressions while rewriting URL strings', async () => {
  const root = await mkdtemp(join(tmpdir(), 'jack-pages-'));
  const sourceDir = join(root, 'public');
  const outputDir = join(root, 'dist');

  await mkdir(join(sourceDir, 'assets', 'js'), { recursive: true });
  await writeFile(join(sourceDir, 'index.html'), '<html lang="ru"></html>');
  await writeFile(
    join(sourceDir, 'assets', 'js', 'app.js'),
    "const digits = value.replace(/\\D/g, ''); fetch('/api/submit.php');"
  );

  await buildPages({ sourceDir, outputDir, basePath: '/jack' });

  const script = await readFile(join(outputDir, 'assets', 'js', 'app.js'), 'utf8');
  assert.match(script, /replace\(\/\\D\/g/);
  assert.match(script, /fetch\('\/jack\/api\/submit\.php'\)/);
});
