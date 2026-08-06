import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = (relativePath) =>
  readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

test('economics section matches the approved short client version', async () => {
  const html = await readProjectFile('public/index.html');
  const section = html.match(/<section class="economics"[\s\S]*?<\/section>/)?.[0];

  assert.ok(section, 'economics section must exist');
  assert.match(section, /Автомат окупается за 7 месяцев/);
  assert.match(section, /30 000 ₽/);
  assert.match(section, /<small>в месяц<\/small>/);
  assert.match(section, /×8/);
  assert.match(section, /640 карманов за смену вместо 80/);
  assert.match(section, /срок возврата вложений при 300 прорезных карманах в смену/);
  assert.match(section, /href="#lead-form"[^>]*>Посчитать по своему цеху<\/a>/);
  assert.match(section, /Расчёт по вашей технологической карте — бесплатно/);

  for (const legacyCopy of ['до 1 440', '×9', 'до 160', '1,8 млн ₽', '100 000 ₽', '18 месяцев']) {
    assert.equal(section.includes(legacyCopy), false, `legacy copy remains: ${legacyCopy}`);
  }
});

test('all canonical pages use the building 1 address', async () => {
  const files = [
    'public/index.html',
    'public/privacy.html',
    'public/consent.html',
    'public/requisites.html',
  ];

  for (const file of files) {
    const html = await readProjectFile(file);
    assert.match(html, /ул\. Шоршелская, д\. 2, к\. 1/, `${file} lacks building 1`);
    assert.doesNotMatch(html, /ул\. Шоршелская, д\. 2(?!, к\. 1)/, `${file} keeps the old address`);
  }

  const index = await readProjectFile('public/index.html');
  assert.match(index, /"streetAddress": "ул\. Шоршелская, д\. 2, к\. 1"/);
});

test('economics CTA keeps its scoped dark-section colors over the base button rule', async () => {
  const css = await readProjectFile('public/assets/css/layout.css');

  assert.match(css, /\.economics \.button--economics\s*\{/);
  assert.match(css, /\.economics \.button--economics:hover/);
  assert.match(css, /\.economics \.button--economics:focus-visible/);
});
