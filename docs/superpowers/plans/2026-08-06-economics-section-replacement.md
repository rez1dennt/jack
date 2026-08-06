# Economics Section Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current detailed economics calculator-style section with the approved short dark section from the client document and update the organization address everywhere to include building 1.

**Architecture:** Keep `public/` as the canonical source and preserve the existing `#economics` section boundary. Add regression coverage that reads the canonical HTML directly, implement the new content with semantic HTML and section-scoped token-driven CSS, then regenerate the GitHub Pages root copy through the existing build script.

**Tech Stack:** Semantic HTML5, vanilla CSS custom properties, Node.js built-in test runner, existing GitHub Pages build script.

## Global Constraints

- Section background is `#0E2338` and numeric/CTA accent is `#F07419`; raw colors belong only in `tokens.css`.
- The section keeps `id="economics"` and the CTA targets the existing `#lead-form` anchor.
- Desktop shows three metrics in one row; mobile stacks them in one column without horizontal scrolling at 320 px.
- Keep the site's existing heading and body fonts; do not add, replace, or reload font files.
- Remove all old economics figures and explanatory copy from the section.
- Update every canonical `public/` address occurrence to `ул. Шоршелская, д. 2, к. 1`.
- Do not hand-edit the generated root GitHub Pages copy; rebuild it from `public/`.
- Do not change form submission, SMTP, analytics, or unrelated sections.

---

### Task 1: Add a failing content and address regression test

**Files:**
- Create: `tests/js/economics-section.test.mjs`
- Test: `tests/js/economics-section.test.mjs`

**Interfaces:**
- Consumes: canonical HTML files under `public/`.
- Produces: static contract tests for economics copy, semantics, working CTA, removed legacy figures, and the corrected address.

- [ ] **Step 1: Write the failing test**

```js
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

```

- [ ] **Step 2: Run the test to verify RED**

Run: `node --test tests/js/economics-section.test.mjs`

Expected: FAIL because the current section still contains `Результат в цифрах`, legacy figures, and the old address without `к. 1`.

- [ ] **Step 3: Commit the RED test**

```bash
git add tests/js/economics-section.test.mjs
git commit -m "test: define short economics section contract"
```

---

### Task 2: Replace the section and update all canonical addresses

**Files:**
- Modify: `public/index.html:341-381`
- Modify: `public/privacy.html:17`
- Modify: `public/consent.html:16`
- Modify: `public/requisites.html:17-18`
- Modify: `public/assets/css/tokens.css:55-95`
- Modify: `public/assets/css/layout.css:792-945`
- Modify: `public/assets/css/responsive.css:455-498`
- Test: `tests/js/economics-section.test.mjs`

**Interfaces:**
- Consumes: existing `.container`, `.section-eyebrow`, `.button`, global font and spacing tokens, and `#lead-form` anchor.
- Produces: `.economics__content`, `.economics__lead`, `.economics__metrics`, `.economics__action`, and `.button--economics` styles.

- [ ] **Step 1: Add section-specific semantic tokens**

Add primitive values and semantic mappings in `public/assets/css/tokens.css`:

```css
--primitive-navy-850: #0e2338;
--primitive-orange-500: #f07419;

--economics-surface: var(--primitive-navy-850);
--economics-accent: var(--primitive-orange-500);
--economics-accent-hover: color-mix(in srgb, var(--economics-accent) 88%, var(--primitive-ink-950));
--economics-text: var(--primitive-white);
--economics-muted: var(--primitive-gray-300);
--economics-rule: color-mix(in srgb, var(--economics-text) 22%, transparent);
```

- [ ] **Step 2: Replace the economics HTML with the approved content**

Replace the current `#economics` section in `public/index.html` with:

```html
<section class="economics" id="economics" aria-labelledby="economics-title">
  <div class="container">
    <div class="economics__content">
      <header class="economics__header">
        <p class="section-eyebrow">Экономика внедрения</p>
        <h2 id="economics-title">Автомат окупается за 7 месяцев</h2>
        <p class="economics__lead">Прорезной карман вручную делает швея 5–6 разряда — шесть минут на операцию. J6 делает его за 20 секунд, а за машиной стоит оператор-закладчик, которого обучают за три дня.</p>
      </header>

      <dl class="economics__metrics">
        <div>
          <dt><strong>30 000 ₽</strong><small>в месяц</small></dt>
          <dd>разница в оплате швеи 5–6 разряда и оператора-закладчика</dd>
        </div>
        <div>
          <dt><strong>×8</strong></dt>
          <dd>производительность операции: 640 карманов за смену вместо 80</dd>
        </div>
        <div>
          <dt><strong>7 месяцев</strong></dt>
          <dd>срок возврата вложений при 300 прорезных карманах в смену</dd>
        </div>
      </dl>

      <div class="economics__action">
        <a class="button button--economics" href="#lead-form">Посчитать по своему цеху</a>
        <p>Расчёт по вашей технологической карте — бесплатно. Приедем, снимем хронометраж операции и покажем цифры до покупки.</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Replace the old economics CSS with the new layout**

Use the following component rules in `public/assets/css/layout.css`:

```css
.economics {
  padding-block: var(--space-12);
  background: var(--economics-surface);
  color: var(--economics-text);
}

.economics__content {
  display: grid;
  gap: var(--space-10);
}

.economics__header {
  display: grid;
  gap: var(--space-4);
  max-inline-size: 70rem;
}

.economics .section-eyebrow {
  margin: 0;
  color: var(--economics-accent);
}

.economics__header h2 {
  max-inline-size: 18ch;
  margin: 0;
  color: var(--economics-text);
  font-size: var(--font-size-display);
  text-transform: uppercase;
}

.economics__lead {
  max-inline-size: 75ch;
  margin: 0;
  color: var(--economics-muted);
  font-size: var(--font-size-lg);
}

.economics__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border-block: var(--border-thin) solid var(--economics-rule);
}

.economics__metrics > div {
  padding-block: var(--space-7);
  padding-inline: var(--space-8);
}

.economics__metrics > div:first-child {
  padding-inline-start: 0;
}

.economics__metrics > div + div {
  border-inline-start: var(--border-thin) solid var(--economics-rule);
}

.economics__metrics dt {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  color: var(--economics-accent);
  font-family: var(--font-heading);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-transform: uppercase;
}

.economics__metrics dt strong {
  font-size: var(--font-size-4xl);
}

.economics__metrics dt small {
  font-family: var(--font-body);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: lowercase;
}

.economics__metrics dd {
  max-inline-size: 36ch;
  margin: var(--space-4) 0 0;
  color: var(--economics-muted);
}

.economics__action {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.button--economics {
  flex: 0 0 auto;
  border-color: var(--economics-accent);
  background: var(--economics-accent);
  color: var(--economics-surface);
}

.button--economics:hover,
.button--economics:focus-visible {
  border-color: var(--economics-accent-hover);
  background: var(--economics-accent-hover);
  color: var(--economics-surface);
}

.economics__action p {
  max-inline-size: 70ch;
  margin: 0;
  color: var(--economics-muted);
  font-size: var(--font-size-sm);
}
```

- [ ] **Step 4: Add the mobile layout**

Replace the old economics responsive rules in `public/assets/css/responsive.css` with:

```css
.economics {
  padding-block: var(--space-10);
}

.economics__content {
  gap: var(--space-8);
}

.economics__header h2 {
  font-size: var(--font-size-4xl);
}

.economics__lead {
  font-size: var(--font-size-base);
}

.economics__metrics {
  grid-template-columns: 1fr;
}

.economics__metrics > div,
.economics__metrics > div:first-child {
  padding-block: var(--space-6);
  padding-inline: 0;
}

.economics__metrics > div + div {
  border-block-start: var(--border-thin) solid var(--economics-rule);
  border-inline-start: 0;
}

.economics__action {
  align-items: stretch;
  flex-direction: column;
}

.button--economics {
  inline-size: 100%;
}
```

These declarations stay inside the existing `@media (max-width: 48rem)` block; do not add a nested media query.

- [ ] **Step 5: Update the address in all canonical pages**

In `public/index.html`, `public/privacy.html`, `public/consent.html`, and both address sections in `public/requisites.html`, replace every exact `ул. Шоршелская, д. 2` occurrence with `ул. Шоршелская, д. 2, к. 1`. This includes the JSON-LD `streetAddress` field and footer contact text.

- [ ] **Step 6: Run the targeted test to verify GREEN**

Run: `node --test tests/js/economics-section.test.mjs`

Expected: 2 tests PASS.

- [ ] **Step 7: Run all JavaScript tests**

Run: `npm run test:js`

Expected: all tests PASS with no failures.

- [ ] **Step 8: Commit the implementation**

```bash
git add public/index.html public/privacy.html public/consent.html public/requisites.html public/assets/css/tokens.css public/assets/css/layout.css public/assets/css/responsive.css tests/js/economics-section.test.mjs
git commit -m "feat: replace economics section and update address"
```

---

### Task 3: Build and verify the published artifact

**Files:**
- Modify (generated): `index.html`
- Modify (generated): `privacy.html`
- Modify (generated): `consent.html`
- Modify (generated): `requisites.html`
- Modify (generated): `assets/css/tokens.css`
- Modify (generated): `assets/css/layout.css`
- Modify (generated): `assets/css/responsive.css`
- Modify (generated): cache-versioned root assets and metadata emitted by `build:pages`

**Interfaces:**
- Consumes: validated `public/` source.
- Produces: cache-busted GitHub Pages root files ready for `main`.

- [ ] **Step 1: Run UX token and state checks**

Run from `C:\Users\bahti\.codex\skills\ux-ui-agent-skills` with the bundled Python/Node runtimes:

```powershell
python scripts/lint_hardcodes.py "C:\Users\bahti\Documents\Швейные дела заказ\.worktrees\jack-landing\public\assets\css\layout.css" "C:\Users\bahti\Documents\Швейные дела заказ\.worktrees\jack-landing\public\assets\css\responsive.css"
python scripts/validate_theme_refs.py "C:\Users\bahti\Documents\Швейные дела заказ\.worktrees\jack-landing\public\assets\css"
node scripts/verify_states.mjs "C:\Users\bahti\Documents\Швейные дела заказ\.worktrees\jack-landing\public\index.html"
node scripts/accuracy_report.mjs "C:\Users\bahti\Documents\Швейные дела заказ\.worktrees\jack-landing\public\index.html"
```

Expected: no new unresolved token, missing-state, or structural errors attributable to the changed section. Any pre-existing broad-file findings must be separated from new diff findings and the new section must be clean.

- [ ] **Step 2: Build the Pages artifact with a new cache key**

Run:

```powershell
npm run build:pages -- --asset-version economics-short-20260806-1
Get-ChildItem -LiteralPath .pages-dist -Force | Copy-Item -Destination . -Recurse -Force
```

Expected: `.pages-dist` is created successfully and root HTML/CSS reference `economics-short-20260806-1`.

- [ ] **Step 3: Run final static verification**

Run:

```powershell
npm run test:js
git diff --check
rg -n "Автомат окупается за 7 месяцев|30 000 ₽|×8|д\. 2, к\. 1|economics-short-20260806-1" public index.html privacy.html consent.html requisites.html assets
```

Expected: tests PASS, `git diff --check` prints nothing, and both canonical/generated files contain the approved copy, address, and cache version.

- [ ] **Step 4: Verify desktop and mobile in a real browser**

At desktop width and viewport widths 390 × 844 and 320 × 800, verify:

- no horizontal overflow;
- three metrics are in one desktop row and one mobile column;
- CTA is visible, full-width on mobile, and resolves to `#lead-form`;
- section heading fits without clipping;
- the next section begins normally and no old economics content remains.

- [ ] **Step 5: Commit the generated Pages build**

```bash
git add -u
git commit -m "build: publish short economics section"
```

- [ ] **Step 6: Push the verified branch to GitHub Pages main**

Run: `git push origin HEAD:main`

Expected: remote `main` advances to the final build commit.

- [ ] **Step 7: Verify the remote hash and live page**

Run: `git ls-remote origin refs/heads/main` and compare it with `git rev-parse HEAD`. Then load:

`https://rez1dennt.github.io/jack/?v=economics-short-20260806-1&t=final`

Expected: hashes match and the live page shows the new dark economics section and corrected address.
