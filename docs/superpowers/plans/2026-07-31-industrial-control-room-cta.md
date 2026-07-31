# Industrial Control Room CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current full-width red lead strip with the approved 1440 px-contained Industrial Control Room panel while preserving the form, phone mask, validation, PHP protections, and responsive behavior.

**Architecture:** Keep the existing vanilla HTML/CSS/JavaScript/PHP stack and the existing `#consultation-form` contract. Restructure only the CTA markup, route all new visual values through semantic CSS tokens, and implement the full-bleed photograph as an absolutely positioned `picture` inside an isolated panel. Existing form JavaScript and PHP endpoints remain unchanged.

**Tech Stack:** Semantic HTML5, tokenized vanilla CSS, existing ES modules, Playwright, Node test runner, PHP 8.x tests.

## Global Constraints

- The CTA panel must be inside the existing centered `--container: 90rem` (`1440 px`) container.
- The desktop panel must use `min-block-size: 30rem` (`480 px`) and `border-radius: 12 px`.
- Use the existing `cta-operator` AVIF, WebP, and JPG files; add no new image or third-party dependency.
- Keep `#consultation-form`, all input `name` values, honeypot, CSRF flow, submit endpoint, phone-mask logic, and legal consent link intact.
- Exact left copy: `Расчёт проекта`, `Ускорьте производство с Jack`, `Опишите задачу. Специалист подберёт конфигурацию оборудования под ваши операции и материалы.`
- Exact trust points: `Бесплатная консультация`, `Подбор под задачу`.
- Exact form copy: `Получить консультацию`, `Оставьте контакты для связи со специалистом`, submit label `Обсудить задачу`.
- Use existing Roboto Condensed and Inter local fonts, existing 8/12 px radius language, one red accent, and current focus-ring tokens.
- Preserve keyboard support, visible labels, `aria-describedby`, `aria-live`, reduced-motion behavior, dark-theme contrast, and 320 px minimum layout width.
- Do not modify the specifications section, footer, navigation, cookie banner, legal pages, PHP architecture, or Google SMTP integration path.

---

## File Map

- `public/index.html`: semantic CTA panel, approved copy, visible labels, trust points, and unchanged form field contract.
- `public/assets/css/tokens.css`: CTA-specific semantic surface, overlay, sizing, and shadow tokens.
- `public/assets/css/layout.css`: contained panel, full-panel image, overlay/grid layers, 7/5 content grid, and form-card geometry.
- `public/assets/css/components.css`: visible field labels, form-card field states, consent styling, status colors, and button state integration.
- `public/assets/css/responsive.css`: 1024 px compression and 768/390 px single-column CTA behavior.
- `tests/e2e/landing.spec.mjs`: structural, copy, geometry, responsive, overflow, and form-card stability contracts.
- `tests/e2e/visual.spec.mjs-snapshots/*.png`: approved desktop, tablet, and mobile visual baselines.

---

### Task 1: Replace the CTA markup without changing the form contract

**Files:**
- Modify: `tests/e2e/landing.spec.mjs:341-356`
- Modify: `public/index.html:272-301`

**Interfaces:**
- Consumes: existing `#consultation-form`, `name`, `phone`, `consent`, `company_website`, error IDs, `/consent.html`, and `data-icon="check-circle"` icon contract.
- Produces: `.lead-panel`, `.lead-section__inner`, `.lead-section__eyebrow`, `.lead-section__points`, `.lead-form__header`, `.field__label`, and `.field__hint` selectors for Task 2.

- [ ] **Step 1: Add the failing semantic and copy contract test**

Append this test after the specifications test in `tests/e2e/landing.spec.mjs`:

```js
test('Industrial Control Room CTA exposes the approved copy and form contract', async ({ page }) => {
  await page.goto('/');

  const section = page.locator('.lead-section');
  const panel = section.locator('.lead-panel');
  const form = section.locator('#consultation-form');

  await expect(section.locator(':scope > .container')).toHaveCount(1);
  await expect(panel).toHaveCount(1);
  await expect(panel.locator('.lead-section__media')).toHaveCount(1);
  await expect(section.locator('.lead-section__eyebrow')).toHaveText('Расчёт проекта');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Ускорьте производство с Jack');
  await expect(section.locator('.lead-section__copy > p')).toHaveText(
    'Опишите задачу. Специалист подберёт конфигурацию оборудования под ваши операции и материалы.'
  );
  await expect(section.locator('.lead-section__point')).toHaveText([
    'Бесплатная консультация',
    'Подбор под задачу'
  ]);
  await expect(section.locator('.lead-section__point [data-icon="check-circle"]')).toHaveCount(2);

  await expect(form.locator('.lead-form__header h3')).toHaveText('Получить консультацию');
  await expect(form.locator('.lead-form__header p')).toHaveText('Оставьте контакты для связи со специалистом');
  await expect(form.locator('.field__label')).toHaveText(['Ваше имя', 'Телефон']);
  await expect(form.locator('[name="name"]')).toHaveAttribute('aria-describedby', 'name-error');
  await expect(form.locator('[name="phone"]')).toHaveAttribute('aria-describedby', 'phone-hint phone-error');
  await expect(form.locator('[name="consent"]')).toHaveAttribute('aria-describedby', 'consent-error');
  await expect(form.getByRole('button', { name: 'Обсудить задачу' })).toHaveCount(1);
  await expect(form.locator('[name="company_website"]')).toHaveCount(1);
  await expect(form.locator('.form-status')).toHaveAttribute('aria-live', 'polite');
});
```

- [ ] **Step 2: Run the contract test to verify RED**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "Industrial Control Room CTA exposes" --project=desktop
```

Expected: FAIL because `.lead-panel`, the approved copy, visible labels, and `Обсудить задачу` do not exist yet.

- [ ] **Step 3: Replace the current lead-section markup**

Replace `public/index.html:272-301` with this complete block:

```html
    <section class="lead-section" id="lead-form" aria-labelledby="lead-title">
      <div class="container">
        <div class="lead-panel">
          <picture class="lead-section__media" aria-hidden="true">
            <source srcset="/assets/images/cta-operator.avif" type="image/avif">
            <source srcset="/assets/images/cta-operator.webp" type="image/webp">
            <img src="/assets/images/cta-operator.jpg" width="1000" height="750" alt="" loading="lazy" decoding="async">
          </picture>

          <div class="lead-section__inner">
            <div class="lead-section__copy">
              <span class="lead-section__eyebrow">Расчёт проекта</span>
              <h2 id="lead-title">Ускорьте производство с Jack</h2>
              <p>Опишите задачу. Специалист подберёт конфигурацию оборудования под ваши операции и материалы.</p>
              <ul class="lead-section__points" aria-label="Преимущества консультации">
                <li class="lead-section__point"><span data-icon="check-circle" aria-hidden="true"></span>Бесплатная консультация</li>
                <li class="lead-section__point"><span data-icon="check-circle" aria-hidden="true"></span>Подбор под задачу</li>
              </ul>
            </div>

            <form class="lead-form" id="consultation-form" novalidate>
              <div class="lead-form__header">
                <h3>Получить консультацию</h3>
                <p>Оставьте контакты для связи со специалистом</p>
              </div>
              <label class="field">
                <span class="field__label">Ваше имя</span>
                <input name="name" autocomplete="name" maxlength="80" placeholder="Алексей" aria-describedby="name-error" required>
                <span class="field__error" id="name-error"></span>
              </label>
              <label class="field">
                <span class="field__label">Телефон</span>
                <input name="phone" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" aria-describedby="phone-hint phone-error" required>
                <span class="field__hint" id="phone-hint">Российский мобильный или городской номер</span>
                <span class="field__error" id="phone-error"></span>
              </label>
              <label class="consent-check">
                <input name="consent" type="checkbox" aria-describedby="consent-error" required>
                <span>Я даю <a href="/consent.html">согласие на обработку персональных данных</a></span>
              </label>
              <span class="field__error consent-check__error" id="consent-error"></span>
              <input class="honeypot" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">
              <button class="button button--primary" type="submit">Обсудить задачу</button>
              <p class="form-status" role="status" aria-live="polite"></p>
            </form>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Run the semantic test and existing form tests**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "Industrial Control Room CTA exposes|lead form masks|phone mask supports" --project=desktop
```

Expected: 3 selected tests PASS. The phone field still normalizes to `+79991234567`; empty form errors and successful mocked submit still work.

- [ ] **Step 5: Commit the semantic CTA structure**

```powershell
git add public/index.html tests/e2e/landing.spec.mjs
git commit -m "feat: restructure lead CTA panel"
```

---

### Task 2: Build the tokenized desktop and responsive Industrial Control Room panel

**Files:**
- Modify: `tests/e2e/landing.spec.mjs:341-430`
- Modify: `public/assets/css/tokens.css:125-160`
- Modify: `public/assets/css/layout.css:495-548`
- Modify: `public/assets/css/components.css:328-398`
- Modify: `public/assets/css/responsive.css:81-94, 271-373`

**Interfaces:**
- Consumes: Task 1 selectors, existing `--container`, `--page-gutter`, `--radius-md`, `--shadow-overlay`, `--duration-fast`, `--focus-ring`, and `check-circle.svg` mask.
- Produces: stable `--lead-*` tokens, 1440 px contained geometry, full-panel image layer, 7/5 desktop grid, light form card, and single-column mobile layout.

- [ ] **Step 1: Add the failing geometry and state-stability test**

Append this test to `tests/e2e/landing.spec.mjs`:

```js
test('Industrial Control Room CTA stays contained, layered, and responsive', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  const desktop = await page.evaluate(() => {
    const container = document.querySelector('.lead-section > .container').getBoundingClientRect();
    const panel = document.querySelector('.lead-panel').getBoundingClientRect();
    const media = document.querySelector('.lead-section__media').getBoundingClientRect();
    const inner = document.querySelector('.lead-section__inner');
    const form = document.querySelector('.lead-form').getBoundingClientRect();
    return {
      container: { left: Math.round(container.left), width: Math.round(container.width) },
      panel: { width: Math.round(panel.width), height: Math.round(panel.height) },
      media: { width: Math.round(media.width), height: Math.round(media.height) },
      mediaPosition: getComputedStyle(document.querySelector('.lead-section__media')).position,
      columns: getComputedStyle(inner).gridTemplateColumns.split(' ').length,
      radius: getComputedStyle(document.querySelector('.lead-panel')).borderRadius,
      formWidth: Math.round(form.width)
    };
  });

  expect(desktop.container).toEqual({ left: 230, width: 1440 });
  expect(desktop.panel.width).toBe(1440);
  expect(desktop.panel.height).toBeGreaterThanOrEqual(480);
  expect(desktop.media).toEqual(desktop.panel);
  expect(desktop.mediaPosition).toBe('absolute');
  expect(desktop.columns).toBe(2);
  expect(desktop.radius).toBe('12px');
  expect(desktop.formWidth).toBeLessThanOrEqual(430);

  for (const [width, expectedColumns] of [[1024, 2], [768, 1], [390, 1]]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.reload();
    const metrics = await page.evaluate(() => {
      const panel = document.querySelector('.lead-panel').getBoundingClientRect();
      const media = document.querySelector('.lead-section__media').getBoundingClientRect();
      return {
        columns: getComputedStyle(document.querySelector('.lead-section__inner')).gridTemplateColumns.split(' ').length,
        panelRight: Math.round(panel.right),
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        mediaWidth: Math.round(media.width),
        panelWidth: Math.round(panel.width)
      };
    });
    expect(metrics.columns).toBe(expectedColumns);
    expect(metrics.mediaWidth).toBe(metrics.panelWidth);
    expect(metrics.panelRight).toBeLessThanOrEqual(metrics.viewportWidth);
    expect(metrics.scrollWidth).toBe(metrics.viewportWidth);
  }

  await page.setViewportSize({ width: 390, height: 900 });
  await page.reload();
  const form = page.locator('#consultation-form');
  const widthBefore = await form.evaluate((node) => Math.round(node.getBoundingClientRect().width));
  await form.locator('button[type="submit"]').click();
  const widthAfter = await form.evaluate((node) => Math.round(node.getBoundingClientRect().width));
  expect(widthAfter).toBe(widthBefore);
  await expect(form.locator('#name-error')).toContainText('Укажите имя');
  await expect(form.locator('#phone-error')).toContainText('Введите телефон');
});
```

- [ ] **Step 2: Run the geometry test to verify RED**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "stays contained, layered, and responsive" --project=desktop
```

Expected: FAIL because the new markup has no panel geometry, media layering, desktop columns, or responsive rules.

- [ ] **Step 3: Add the CTA semantic tokens**

Add these tokens in `:root` in `public/assets/css/tokens.css`, immediately after the current specification tokens:

```css
  --lead-panel-min-height: 30rem;
  --lead-panel-padding: clamp(var(--space-12), 4vw, var(--space-16));
  --lead-form-width: 26.875rem;
  --lead-panel-columns: minmax(0, 1.4fr) minmax(21rem, 1fr);
  --lead-panel-overlay: linear-gradient(90deg, rgb(17 24 32 / 98%) 0%, rgb(17 24 32 / 88%) 40%, rgb(17 24 32 / 36%) 68%, rgb(17 24 32 / 78%) 100%);
  --lead-panel-overlay-mobile: linear-gradient(180deg, rgb(17 24 32 / 96%) 0%, rgb(17 24 32 / 82%) 48%, rgb(17 24 32 / 94%) 100%);
  --lead-grid-line: rgb(255 255 255 / 7%);
  --lead-grid-clip: inset(0 44% 0 0);
  --lead-form-surface: var(--primitive-white);
  --lead-form-text: var(--primitive-ink-950);
  --lead-form-muted: var(--primitive-gray-700);
  --lead-form-border: rgb(255 255 255 / 72%);
  --lead-form-control-border: var(--primitive-gray-300);
  --lead-form-shadow: 0 1.5rem 3.75rem rgb(0 0 0 / 28%);
```

These tokens intentionally remain constant in dark mode so the approved light form card does not invert.

- [ ] **Step 4: Replace the old lead layout selectors**

Replace `public/assets/css/layout.css:495-548` with:

```css
.lead-section {
  color: var(--color-text-inverse);
}

.lead-panel {
  position: relative;
  isolation: isolate;
  min-block-size: var(--lead-panel-min-height);
  overflow: hidden;
  border: var(--border-thin) solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-surface-inverse);
  box-shadow: var(--shadow-card);
}

.lead-panel::before,
.lead-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.lead-panel::before {
  z-index: 1;
  background: var(--lead-panel-overlay);
}

.lead-panel::after {
  z-index: 1;
  clip-path: var(--lead-grid-clip);
  background-image:
    linear-gradient(to right, var(--lead-grid-line) var(--border-thin), transparent var(--border-thin)),
    linear-gradient(to bottom, var(--lead-grid-line) var(--border-thin), transparent var(--border-thin));
  background-size: var(--space-10) var(--space-10);
}

.lead-section__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  inline-size: 100%;
  block-size: 100%;
}

.lead-section__media img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
  object-position: center;
}

.lead-section__inner {
  position: relative;
  z-index: 2;
  min-block-size: var(--lead-panel-min-height);
  display: grid;
  grid-template-columns: var(--lead-panel-columns);
  align-items: center;
  gap: var(--space-10);
  padding: var(--lead-panel-padding);
}

.lead-section__copy {
  max-inline-size: 42rem;
}

.lead-section__eyebrow {
  display: inline-block;
  margin-block-end: var(--space-4);
  color: var(--primitive-red-300);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.lead-section__copy h2 {
  max-inline-size: 12ch;
  margin-block-end: var(--space-5);
  color: var(--color-text-inverse);
  font-size: clamp(var(--font-size-4xl), 3.4vw, 3.5rem);
  line-height: 1;
  letter-spacing: -0.025em;
  text-transform: uppercase;
}

.lead-section__copy > p {
  max-inline-size: 54ch;
  margin: 0;
  color: var(--primitive-gray-300);
}

.lead-section__points {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-6);
  margin: var(--space-7) 0 0;
  padding: 0;
  list-style: none;
}

.lead-section__point {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.lead-section__point [data-icon] {
  inline-size: var(--space-5);
  block-size: var(--space-5);
  flex: 0 0 auto;
  background: var(--primitive-red-300);
}

.lead-form {
  inline-size: min(100%, var(--lead-form-width));
  justify-self: end;
  display: grid;
  gap: var(--space-3);
  padding: var(--space-8);
  border: var(--border-thin) solid var(--lead-form-border);
  border-radius: var(--radius-md);
  background: var(--lead-form-surface);
  color: var(--lead-form-text);
  box-shadow: var(--lead-form-shadow);
}
```

- [ ] **Step 5: Add form-card component states**

Update the form selectors in `public/assets/css/components.css:328-398` to include this exact behavior:

```css
.field {
  display: grid;
  gap: var(--space-2);
}

.field__label {
  color: var(--lead-form-text);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.field input {
  min-block-size: var(--control-height);
  inline-size: 100%;
  padding-inline: var(--space-4);
  border: var(--border-thin) solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background: var(--color-surface-page);
  color: var(--color-text-primary);
  transition: border-color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out);
}

.lead-form .field input {
  border-color: var(--lead-form-control-border);
  background: var(--lead-form-surface);
  color: var(--lead-form-text);
}

.lead-form .field input:hover {
  border-color: var(--color-border-control);
}

.field input[aria-invalid="true"] {
  border-color: var(--color-error);
}

.field__hint {
  color: var(--lead-form-muted);
  font-size: var(--font-size-2xs);
  line-height: 1.35;
}

.field__error {
  min-block-size: 0;
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
}

.lead-form .field__error {
  min-block-size: var(--space-4);
  color: var(--color-error);
}

.lead-form__header h3 {
  margin-block-end: var(--space-1);
  color: var(--lead-form-text);
  font-size: var(--font-size-2xl);
}

.lead-form__header p {
  margin: 0;
  color: var(--lead-form-muted);
  font-size: var(--font-size-sm);
}

.lead-form .consent-check {
  color: var(--lead-form-muted);
}

.lead-form .consent-check a {
  color: var(--color-action-primary);
  font-weight: 600;
}

.lead-form .consent-check a:hover {
  color: var(--color-action-primary-hover);
}

.lead-form .consent-check__error {
  min-block-size: 0;
}

.lead-form .button {
  inline-size: 100%;
}

.lead-form .form-status {
  min-block-size: var(--space-5);
  color: var(--lead-form-muted);
}

.lead-form .form-status[data-state="success"] {
  color: var(--color-success);
}

.lead-form .form-status[data-state="error"] {
  color: var(--color-error);
  font-weight: 600;
}
```

Keep the existing `.consent-check`, `.honeypot`, and global `.form-status` declarations that are not superseded by these lead-form overrides. Remove the obsolete special `.lead-form button[aria-busy="true"]` rule because the shared `.button[aria-busy="true"]` state already supplies waiting cursor and opacity.

- [ ] **Step 6: Replace the obsolete responsive lead rules**

At `max-width: 64rem`, replace the old `.lead-section` and `.lead-form` rules with:

```css
  .lead-section__inner {
    grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.95fr);
    gap: var(--space-8);
    padding: var(--space-10);
  }

  .lead-section__copy h2 {
    font-size: clamp(var(--font-size-3xl), 4vw, var(--font-size-4xl));
  }
```

At `max-width: 48rem`, remove `.lead-section` from the shared one-column selector and replace the old lead media/copy/form rules with:

```css
  .lead-panel::before {
    background: var(--lead-panel-overlay-mobile);
  }

  .lead-panel::after {
    clip-path: none;
    opacity: 0.5;
  }

  .lead-section__media {
    min-block-size: 0;
  }

  .lead-section__media img {
    object-position: 38% center;
  }

  .lead-section__inner {
    min-block-size: 0;
    grid-template-columns: 1fr;
    align-items: start;
    gap: var(--space-8);
    padding: var(--space-6);
  }

  .lead-section__copy {
    padding-block-start: var(--space-8);
  }

  .lead-section__copy h2 {
    max-inline-size: 13ch;
    font-size: clamp(var(--font-size-3xl), 8vw, var(--font-size-4xl));
  }

  .lead-form {
    inline-size: 100%;
    justify-self: stretch;
    padding: var(--space-6);
  }
```

Inside the existing `@media (max-width: 30rem)` query at `public/assets/css/responsive.css:412`, add:

```css
  .lead-section__inner {
    gap: var(--space-6);
    padding: var(--space-4);
  }

  .lead-section__copy {
    padding-block-start: var(--space-6);
  }

  .lead-form {
    padding: var(--space-5);
  }
```

- [ ] **Step 7: Run targeted CTA geometry, form, and overflow tests**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "Industrial Control Room CTA|lead form masks|phone mask supports|landing has no overflow|major sections use" --project=desktop
```

Expected: all selected tests PASS at desktop, 1024, 768, 390, and the existing overflow breakpoints. `specificationsToLead` remains `24` at the wide desktop test.

- [ ] **Step 8: Run the focused JavaScript and form-error suites**

```powershell
npm run test:js
npx playwright test tests/e2e/form-errors.spec.mjs --project=desktop
```

Expected: all Node tests PASS; all mocked `422`, `429`, and `500` form scenarios preserve entered values and show their existing messages inside the new card.

- [ ] **Step 9: Commit the finished responsive CTA design**

```powershell
git add public/assets/css tests/e2e/landing.spec.mjs
git commit -m "feat: build industrial control room CTA"
```

---

### Task 3: Approve visual baselines and run production verification

**Files:**
- Modify: `tests/e2e/visual.spec.mjs-snapshots/desktop-1440-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/tablet-768-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/mobile-390-desktop-win32.png`
- Verify: `public/index.html`
- Verify: `public/assets/css/tokens.css`
- Verify: `public/assets/css/layout.css`
- Verify: `public/assets/css/components.css`
- Verify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: completed semantic and responsive CTA from Tasks 1–2.
- Produces: stable approved screenshots and evidence that JS, PHP, accessibility, token, and visual contracts remain deployable.

- [ ] **Step 1: Run visual tests without updating snapshots**

```powershell
npx playwright test tests/e2e/visual.spec.mjs --project=desktop
```

Expected: three intentional screenshot diffs because the old red strip is replaced by the contained Industrial Control Room panel.

- [ ] **Step 2: Inspect the three generated actual screenshots**

Open each `*-actual.png` and confirm this exact checklist:

```text
desktop-1440: CTA sits inside the page gutter; photograph covers the full panel; copy is left; light form card is right
tablet-768: CTA is one column; copy stays above the form; operator image remains visible without reducing text contrast
mobile-390: panel and form fit the viewport; heading is at most three lines; all controls are full width; no horizontal scroll
all sizes: 12 px panel/card radii, real circular check icons, no clipped focus ring, no pure-red full-width strip
```

If a condition fails, add a geometry assertion to `tests/e2e/landing.spec.mjs`, verify it fails, then adjust only the owning token or responsive selector and rerun the targeted test.

- [ ] **Step 3: Update and stabilize visual baselines**

```powershell
npx playwright test tests/e2e/visual.spec.mjs --project=desktop --update-snapshots
npx playwright test tests/e2e/visual.spec.mjs --project=desktop --repeat-each=3
```

Expected: update run 3 PASS; stability run 9 PASS.

- [ ] **Step 4: Run the complete JavaScript and browser suite**

```powershell
npm test
```

Expected: all Node and Playwright tests PASS; only the existing three cross-project visual skips remain expected.

- [ ] **Step 5: Run PHP unit tests and lint every PHP file**

```powershell
Get-ChildItem tests/php/*.test.php | ForEach-Object { & 'C:\php\php.exe' -c tools/php.ini -d zend.assertions=1 -d assert.exception=1 $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
Get-ChildItem public,server -Recurse -Filter *.php | ForEach-Object { & 'C:\php\php.exe' -c tools/php.ini -l $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

Expected: four PHP test files PASS and every PHP file reports `No syntax errors detected`.

- [ ] **Step 6: Run the required design-system gates**

```powershell
$pythonExe='C:\Users\bahti\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$skillRoot='C:\Users\bahti\.codex\skills\ux-ui-agent-skills'
& $pythonExe "$skillRoot\scripts\lint_hardcodes.py" public/assets/css public/index.html
& $pythonExe "$skillRoot\scripts\validate_theme_refs.py" public/assets/css/tokens.css public/assets/css public/index.html

Copy-Item "$skillRoot\scripts\measure_render.mjs" '.ux-measure-render.mjs'
Copy-Item "$skillRoot\scripts\verify_states.mjs" '.ux-verify-states.mjs'
Copy-Item "$skillRoot\scripts\taste_audit.mjs" '.ux-taste-audit.mjs'
node .ux-measure-render.mjs public/index.html
node .ux-measure-render.mjs --dark public/index.html
node .ux-verify-states.mjs public/index.html
node .ux-verify-states.mjs --dark public/index.html
node .ux-taste-audit.mjs public/index.html
node .ux-taste-audit.mjs --dark public/index.html
Remove-Item -LiteralPath '.ux-measure-render.mjs','.ux-verify-states.mjs','.ux-taste-audit.mjs'
```

Expected: zero component hardcoded colors, every CSS variable resolves, both render runs report every visible text sample passing WCAG AA, both state runs report every checked default/hover/focus state passing, and the taste audit reports no new CTA-specific high-severity finding. The three temporary script copies are removed before the final status check.

- [ ] **Step 7: Run final HTTP and diff checks**

```powershell
git diff --check
Invoke-WebRequest http://127.0.0.1:8080/ -UseBasicParsing | Select-Object StatusCode
git status --short
```

Expected: no whitespace errors, HTTP `200`, and only the three visual snapshots plus any test-backed CTA correction from Step 2 remain modified.

- [ ] **Step 8: Commit the approved visual state**

```powershell
git add tests/e2e/visual.spec.mjs-snapshots tests/e2e/landing.spec.mjs public/index.html public/assets/css
git commit -m "test: approve industrial control room CTA"
```

Expected: clean worktree after the commit.
