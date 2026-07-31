# Containerized Sections and Case Metrics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero image span the complete viewport, constrain the problem/solution and applications compositions to 1440 px, add controlled section spacing, and replace the case button with three measurable results.

**Architecture:** Keep the current semantic HTML/CSS/JS architecture and move only ownership boundaries: `.hero` owns the full-width media and overlay, while `.hero__inner` owns the 1440 px copy grid. Introduce a lightweight outer `.problem-solution-section` around the existing grid, use a shared responsive `--section-gap` token, and render the chosen case results as a semantic `<dl>` inside the existing third applications column.

**Tech Stack:** Static HTML5, CSS custom properties and responsive grid, vanilla JavaScript, PHP 8 hosting, Node.js test runner, Playwright visual and functional tests.

## Global Constraints

- Maximum content width is exactly 1440 px (`90rem`).
- Hero media and its readability overlay span the complete viewport on desktop; hero copy remains inside the 1440 px container.
- Hero height remains 440 px on desktop.
- Problem/solution and applications grids are centered and never exceed 1440 px.
- Desktop section gap is 24 px, tablet gap is 20 px, mobile gap is 16 px.
- Hero and problem/solution remain adjacent with a zero-pixel gap.
- Lead section and footer remain adjacent with a zero-pixel gap.
- Applications desktop columns remain `30% 35% 35%`.
- Remove «Читать кейс» completely; do not create a separate case page or replacement CTA.
- Keep the current mobile order: hero copy then hero image; applications list then image then result panel.
- Do not change SMTP, form validation, cookies, legal pages, image files, or the existing SVG icon set.

---

## File Map

- `public/index.html` — owns semantic ordering and wrappers for hero, problem/solution, and the case result content.
- `public/assets/css/tokens.css` — owns the shared responsive section-gap token.
- `public/assets/css/layout.css` — owns desktop hero positioning, containerized grids, section spacing, and case metrics styling.
- `public/assets/css/responsive.css` — owns tablet/mobile section gaps, hero media flow, and responsive case metrics.
- `tests/e2e/landing.spec.mjs` — owns geometry, DOM-content, responsive order, and overflow contracts.
- `tests/e2e/visual.spec.mjs-snapshots/*.png` — owns approved desktop/tablet/mobile appearance.

---

### Task 1: Make Hero Media Full-Bleed While Copy Stays in the 1440 px Grid

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/index.html`
- Modify: `public/assets/css/layout.css`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: `.hero`, `.hero__inner`, `.hero__content`, `.hero__media`, `--hero-height`, `--hero-overlay`.
- Produces: a viewport-wide `.hero__media` and `.hero::after` overlay with a centered 1440 px `.hero__inner`.

- [ ] **Step 1: Replace the existing hero geometry test with the full-bleed contract**

In `tests/e2e/landing.spec.mjs`, replace `hero uses a background composition on desktop and stacks media below copy on mobile` with:

```js
test('hero media spans the viewport while copy stays on the 1440px grid', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 900 });
  await page.goto('/');

  const desktop = await page.evaluate(() => {
    const hero = document.querySelector('.hero').getBoundingClientRect();
    const inner = document.querySelector('.hero__inner').getBoundingClientRect();
    const mediaElement = document.querySelector('.hero__media');
    const media = mediaElement.getBoundingClientRect();
    const title = getComputedStyle(document.querySelector('.hero h1'));
    return {
      hero: {
        left: Math.round(hero.left),
        right: Math.round(hero.right),
        width: Math.round(hero.width),
        height: Math.round(hero.height)
      },
      inner: {
        left: Math.round(inner.left),
        width: Math.round(inner.width),
        height: Math.round(inner.height)
      },
      media: {
        left: Math.round(media.left),
        right: Math.round(media.right),
        width: Math.round(media.width),
        height: Math.round(media.height)
      },
      mediaPosition: getComputedStyle(mediaElement).position,
      titleSize: title.fontSize,
      titleLineHeight: Number.parseFloat(title.lineHeight)
    };
  });

  expect(desktop.hero).toEqual({ left: 0, right: 1900, width: 1900, height: 440 });
  expect(desktop.inner).toEqual({ left: 230, width: 1440, height: 440 });
  expect(desktop.media).toEqual({ left: 0, right: 1900, width: 1900, height: 440 });
  expect(desktop.mediaPosition).toBe('absolute');
  expect(desktop.titleSize).toBe('46px');
  expect(desktop.titleLineHeight).toBeCloseTo(49.68, 1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const mobile = await page.evaluate(() => {
    const inner = document.querySelector('.hero__inner').getBoundingClientRect();
    const mediaElement = document.querySelector('.hero__media');
    const media = mediaElement.getBoundingClientRect();
    return {
      mediaPosition: getComputedStyle(mediaElement).position,
      innerBottom: Math.round(inner.bottom),
      mediaTop: Math.round(media.top),
      mediaWidth: Math.round(media.width)
    };
  });

  expect(mobile.mediaPosition).toBe('relative');
  expect(mobile.mediaTop).toBeGreaterThanOrEqual(mobile.innerBottom);
  expect(mobile.mediaWidth).toBe(390);
});
```

- [ ] **Step 2: Run the targeted test and verify the old implementation fails**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "hero media spans"
```

Expected: FAIL because the current `.hero__media` width is 1440 px and its right edge is 1670 px at a 1900 px viewport.

- [ ] **Step 3: Move the hero picture outside the container but keep it after the copy in DOM order**

In `public/index.html`, replace the hero section with:

```html
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="container hero__inner">
    <div class="hero__content">
      <h1 id="hero-title">Автоматизируйте<br>швейное производство<br><span>с шаблонными автоматами Jack</span></h1>
      <p class="hero__lead">Точное пришивание деталей по контуру:<br>карманы, молнии, этикетки без ручного труда</p>
      <div class="hero__actions">
        <a class="button button--primary" href="#lead-form">Запросить расчёт</a>
        <button class="button button--outline" type="button" data-video-button>
          <span class="button__play" aria-hidden="true"></span>
          Смотреть видео
        </button>
      </div>
    </div>
  </div>
  <picture class="hero__media">
    <source srcset="/assets/images/hero-machine.avif" type="image/avif">
    <source srcset="/assets/images/hero-machine.webp" type="image/webp">
    <img src="/assets/images/hero-machine.jpg" width="1600" height="900" alt="Шаблонный автомат Jack с сенсорной панелью" fetchpriority="high">
  </picture>
</section>
```

The picture remains after `.hero__inner`, so mobile source order remains copy then image without CSS `order`.

- [ ] **Step 4: Move overlay and clipping ownership from the inner container to `.hero`**

In `public/assets/css/layout.css`, replace the current `.hero`, `.hero::before`, `.hero__inner`, and `.hero__inner::after` blocks with:

```css
.hero {
  position: relative;
  min-block-size: var(--hero-height);
  overflow: hidden;
  isolation: isolate;
  background: var(--color-surface-page);
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--hero-overlay);
  pointer-events: none;
}

.hero__inner {
  position: relative;
  z-index: 2;
  min-block-size: var(--hero-height);
  display: block;
}
```

Keep the existing `.hero__content`, `.hero h1`, `.hero__lead`, `.hero__actions`, `.hero__media`, and `.hero__media img` rules. `.hero__media` now fills `.hero` because its containing block is the section rather than `.hero__inner`.

- [ ] **Step 5: Update mobile rules for the new DOM boundary**

In `public/assets/css/responsive.css` inside `@media (max-width: 48rem)`, replace the hero overlay/media rules with:

```css
.hero {
  min-block-size: 0;
  overflow: visible;
}

.hero::after {
  content: none;
}

.hero__inner {
  min-block-size: 0;
  display: grid;
  overflow: visible;
}

.hero__content {
  inline-size: auto;
  padding: var(--space-12) 0 var(--space-8);
}

.hero__media {
  position: relative;
  inset: auto;
  inline-size: 100%;
  block-size: 17rem;
  margin-inline: 0;
}
```

Keep the existing mobile title, lead, and image `object-position` rules. Remove the obsolete `.hero__inner::after { content: none; }` rule.

- [ ] **Step 6: Run hero and overflow tests**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "hero media spans|no overflow"
```

Expected: 12 PASS across both Playwright projects: two hero contract passes plus ten width/project overflow passes.

- [ ] **Step 7: Commit the hero boundary change**

```powershell
git add public/index.html public/assets/css/layout.css public/assets/css/responsive.css tests/e2e/landing.spec.mjs
git commit -m "fix: extend hero media across viewport"
```

---

### Task 2: Contain Problem/Solution and Add Responsive Section Gaps

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/index.html`
- Modify: `public/assets/css/tokens.css`
- Modify: `public/assets/css/layout.css`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: global `.container`, existing `.problem-solution` grid and responsive breakpoints.
- Produces: `.problem-solution-section` outer section, centered 1440 px `.problem-solution`, and responsive `--section-gap`.

- [ ] **Step 1: Add a failing geometry and spacing test**

Add to `tests/e2e/landing.spec.mjs` before the overflow loop:

```js
test('major sections use the approved 1440px grid and responsive desktop spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  const geometry = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
    const hero = rect('.hero');
    const problemOuter = rect('.problem-solution-section');
    const problem = rect('.problem-solution');
    const capabilities = rect('.capabilities');
    const applications = rect('.applications');
    const reasons = rect('.reasons');
    const specifications = rect('.specifications');
    const lead = rect('.lead-section');
    const gap = (before, after) => Math.round(after.top - before.bottom);

    return {
      problem: { left: Math.round(problem.left), width: Math.round(problem.width) },
      applications: {
        left: Math.round(rect('.applications__grid').left),
        width: Math.round(rect('.applications__grid').width)
      },
      gaps: {
        heroToProblem: gap(hero, problemOuter),
        problemToCapabilities: gap(problemOuter, capabilities),
        capabilitiesToApplications: gap(capabilities, applications),
        applicationsToReasons: gap(applications, reasons),
        reasonsToSpecifications: gap(reasons, specifications),
        specificationsToLead: gap(specifications, lead)
      }
    };
  });

  expect(geometry.problem).toEqual({ left: 230, width: 1440 });
  expect(geometry.applications).toEqual({ left: 230, width: 1440 });
  expect(geometry.gaps).toEqual({
    heroToProblem: 0,
    problemToCapabilities: 24,
    capabilitiesToApplications: 24,
    applicationsToReasons: 24,
    reasonsToSpecifications: 24,
    specificationsToLead: 24
  });
});
```

- [ ] **Step 2: Run the test and verify current full-width problem grid and zero gaps fail**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "major sections use"
```

Expected: FAIL because `.problem-solution-section` does not exist and the current `.problem-solution` spans the viewport.

- [ ] **Step 3: Wrap the problem/solution grid in a semantic outer section**

In `public/index.html`, change the start of the current section from:

```html
<section class="problem-solution" id="solutions" aria-label="Проблема и решение Jack">
```

to:

```html
<section class="problem-solution-section" id="solutions" aria-label="Проблема и решение Jack">
  <div class="container problem-solution">
```

Immediately before the current closing `</section>`, add the inner closing tag:

```html
  </div>
</section>
```

Do not change the three existing children or their order.

- [ ] **Step 4: Add the shared desktop gap token**

In `public/assets/css/tokens.css` beside the container and section tokens, add:

```css
--section-gap: 1.5rem;
```

- [ ] **Step 5: Apply the gap only after independent main sections**

In `public/assets/css/layout.css`, add before the `.problem-solution` rule:

```css
.problem-solution-section,
.capabilities,
.applications,
.reasons,
.specifications {
  margin-block-end: var(--section-gap);
}
```

Do not apply this rule to `.hero`, `.lead-section`, or `.site-footer`. Keep `.problem-solution` as the grid and keep its border on the inner 1440 px element.

- [ ] **Step 6: Add tablet and mobile token overrides**

In `public/assets/css/responsive.css`:

Inside `@media (max-width: 64rem)` add to its existing `:root` block, or create one at the top of that media query:

```css
:root {
  --section-gap: 1.25rem;
}
```

Inside the existing `@media (max-width: 48rem)` `:root` block add:

```css
--section-gap: 1rem;
```

- [ ] **Step 7: Run geometry, responsive layout, and overflow tests**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "major sections use|reference grid composition|no overflow"
```

Expected: all selected tests PASS in both projects and all five overflow widths remain clean.

- [ ] **Step 8: Commit the container and spacing change**

```powershell
git add public/index.html public/assets/css/tokens.css public/assets/css/layout.css public/assets/css/responsive.css tests/e2e/landing.spec.mjs
git commit -m "fix: contain primary sections on 1440px grid"
```

---

### Task 3: Replace the Case CTA With Semantic Result Metrics

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/index.html`
- Modify: `public/assets/css/layout.css`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: `.applications__grid`, `.case-card`, existing tablet full-row rule, existing mobile one-column rule.
- Produces: `.case-metrics`, three `.case-metric` entries, and no «Читать кейс» link.

- [ ] **Step 1: Add a failing content and responsive-order test**

Add to `tests/e2e/landing.spec.mjs` before the overflow loop:

```js
test('applications result panel replaces the case CTA with three measurable outcomes', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1000 });
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Читать кейс' })).toHaveCount(0);
  await expect(page.locator('.case-card h2')).toHaveText('Результат внедрения');
  await expect(page.locator('.case-metric dt')).toHaveText(['+35%', '×2', '3']);
  await expect(page.locator('.case-metric dd')).toHaveText([
    'к производительности',
    'быстрее операция',
    'оператора высвобождено'
  ]);

  const desktop = await page.evaluate(() => {
    const grid = document.querySelector('.applications__grid').getBoundingClientRect();
    const card = document.querySelector('.case-card').getBoundingClientRect();
    return {
      gridWidth: Math.round(grid.width),
      cardRight: Math.round(card.right),
      gridRight: Math.round(grid.right)
    };
  });

  expect(desktop.gridWidth).toBe(1440);
  expect(desktop.cardRight).toBe(desktop.gridRight);

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.reload();

  const tablet = await page.evaluate(() => {
    const media = document.querySelector('.applications__media').getBoundingClientRect();
    const card = document.querySelector('.case-card').getBoundingClientRect();
    const grid = document.querySelector('.applications__grid').getBoundingClientRect();
    return {
      cardTop: Math.round(card.top),
      mediaBottom: Math.round(media.bottom),
      cardWidth: Math.round(card.width),
      gridWidth: Math.round(grid.width)
    };
  });

  expect(tablet.cardTop).toBeGreaterThanOrEqual(tablet.mediaBottom);
  expect(tablet.cardWidth).toBe(tablet.gridWidth);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const mobileOrder = await page.evaluate(() => {
    const list = document.querySelector('.applications__list').getBoundingClientRect();
    const media = document.querySelector('.applications__media').getBoundingClientRect();
    const card = document.querySelector('.case-card').getBoundingClientRect();
    return [Math.round(list.top), Math.round(media.top), Math.round(card.top)];
  });

  expect(mobileOrder[0]).toBeLessThan(mobileOrder[1]);
  expect(mobileOrder[1]).toBeLessThan(mobileOrder[2]);
});
```

- [ ] **Step 2: Run the test and verify the old CTA fails the contract**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "result panel replaces"
```

Expected: FAIL because «Читать кейс» exists and `.case-metric` elements do not.

- [ ] **Step 3: Replace the case-card markup**

In `public/index.html`, replace the existing `<article class="case-card">` with:

```html
<article class="case-card">
  <h2>Результат внедрения</h2>
  <h3>Фабрика в Иваново ускорила выпуск после установки Jack MS-100A</h3>
  <p>После внедрения автомат ускорил пришивание карманов, стабилизировал качество и освободил сотрудников для других операций.</p>
  <dl class="case-metrics" aria-label="Результаты внедрения Jack MS-100A">
    <div class="case-metric">
      <dt>+35%</dt>
      <dd>к производительности</dd>
    </div>
    <div class="case-metric">
      <dt>×2</dt>
      <dd>быстрее операция</dd>
    </div>
    <div class="case-metric">
      <dt>3</dt>
      <dd>оператора высвобождено</dd>
    </div>
  </dl>
</article>
```

- [ ] **Step 4: Add the light metric treatment without nested cards**

In `public/assets/css/layout.css`, replace the current `.case-card p` rule and append metric rules:

```css
.case-card p {
  margin-block-end: var(--space-5);
}

.case-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
  margin: 0;
}

.case-metric {
  min-inline-size: 0;
  padding-block-start: var(--space-3);
  border-block-start: calc(var(--border-thin) * 2) solid var(--color-action-primary);
}

.case-metric dt {
  color: var(--color-action-primary);
  font-family: var(--font-heading);
  font-size: var(--font-size-2xl);
  font-weight: 700;
  line-height: 1;
}

.case-metric dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1.35;
}
```

- [ ] **Step 5: Protect the three metrics at the narrowest supported width**

Inside `@media (max-width: 24.375rem)` in `public/assets/css/responsive.css`, add:

```css
.case-metrics {
  gap: var(--space-2);
}

.case-metric dd {
  overflow-wrap: anywhere;
}
```

Do not stack the metrics unless the 320 px overflow test proves it necessary; wrapping the labels preserves the chosen compact composition.

- [ ] **Step 6: Run the case, spacing, and overflow contracts**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "result panel replaces|major sections use|no overflow"
```

Expected: all selected tests PASS in desktop/mobile projects, including 320 px overflow coverage.

- [ ] **Step 7: Commit the case metrics redesign**

```powershell
git add public/index.html public/assets/css/layout.css public/assets/css/responsive.css tests/e2e/landing.spec.mjs
git commit -m "feat: replace case CTA with result metrics"
```

---

### Task 4: Visual Approval and Full Regression

**Files:**
- Modify: `tests/e2e/visual.spec.mjs-snapshots/desktop-1440-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/tablet-768-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/mobile-390-desktop-win32.png`

**Interfaces:**
- Consumes: completed HTML/CSS contracts from Tasks 1–3.
- Produces: stable visual baselines and fresh evidence for frontend, PHP, and token-quality gates.

- [ ] **Step 1: Generate actual visual screenshots without approving them**

Run:

```powershell
npm run test:e2e -- tests/e2e/visual.spec.mjs
```

Expected: three desktop-project visual failures and three mobile-project skips. Inspect the generated `*-actual.png` files before updating snapshots.

- [ ] **Step 2: Inspect all three actual screenshots**

Use the image viewer on:

```text
test-results/visual-visual-desktop-1440-desktop/desktop-1440-actual.png
test-results/visual-visual-tablet-768-desktop/tablet-768-actual.png
test-results/visual-visual-mobile-390-desktop/mobile-390-actual.png
```

Approve only when all of these are visible:

- desktop hero photograph reaches both viewport edges;
- desktop hero text remains aligned to the same container as the header;
- problem/solution has centered white gutters outside its 1440 px grid;
- independent sections have visible but restrained whitespace;
- applications still uses list/photo/result in one desktop row;
- result panel has no CTA and shows all three metrics;
- tablet result panel spans the full second row;
- mobile order is copy/photo and list/photo/results with no clipping.

- [ ] **Step 3: Update approved snapshots**

Run:

```powershell
npm run test:e2e -- tests/e2e/visual.spec.mjs --update-snapshots
```

Expected: 3 PASS and 3 SKIP.

- [ ] **Step 4: Verify visual stability three times**

Run:

```powershell
npm run test:e2e -- tests/e2e/visual.spec.mjs --repeat-each=3
```

Expected: 9 PASS and 9 SKIP with no lazy-image drift.

- [ ] **Step 5: Run the complete frontend regression**

Run:

```powershell
npm test
```

Expected: all Node and active Playwright tests PASS; only the three intentionally duplicated mobile-project visual cases SKIP.

- [ ] **Step 6: Run PHP tests and syntax checks**

Run:

```powershell
$phpExe = 'C:\php\php.exe'
Get-ChildItem tests/php/*.test.php | ForEach-Object {
  & $phpExe -c tools/php.ini -d zend.assertions=1 -d assert.exception=1 $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
Get-ChildItem public,server -Recurse -Filter *.php | ForEach-Object {
  & $phpExe -c tools/php.ini -l $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: four PHP test scripts exit 0 and eight PHP files report `No syntax errors detected`.

- [ ] **Step 7: Run project-specific UX token gates**

Run:

```powershell
$skillRoot = 'C:\Users\bahti\.codex\skills\ux-ui-agent-skills'
$pythonExe = 'C:\Users\bahti\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
& $pythonExe "$skillRoot\scripts\lint_hardcodes.py" public/assets/css public/index.html
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $pythonExe "$skillRoot\scripts\validate_theme_refs.py" public/assets/css/tokens.css public/assets/css public/index.html
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
```

Expected: zero unjustified hardcoded values and every `var(--…)` reference resolves to one of the shared theme tokens.

- [ ] **Step 8: Check the final diff and commit visual baselines**

Run:

```powershell
git diff --check
git status --short
git add tests/e2e/visual.spec.mjs-snapshots
git commit -m "test: approve contained section visual baselines"
```

Expected: `git diff --check` prints nothing; after the commit the worktree is clean.

---

## Final Acceptance Checklist

- [ ] At 1900 px, hero media width is 1900 px and hero copy container width is 1440 px.
- [ ] At 1900 px, problem/solution and applications grids are both 1440 px and centered at x = 230 px.
- [ ] Hero and problem/solution are adjacent; all following independent desktop sections use 24 px gaps.
- [ ] «Читать кейс» is absent from the DOM.
- [ ] `+35%`, `×2`, and `3` are present with meaningful text labels.
- [ ] Tablet and mobile layouts follow the approved content order.
- [ ] No horizontal overflow exists at 1440, 1024, 768, 390, or 320 px.
- [ ] Visual snapshots pass three consecutive repetitions.
- [ ] Full frontend, PHP, and UX token checks exit 0.
