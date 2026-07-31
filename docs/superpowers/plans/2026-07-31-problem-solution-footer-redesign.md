# Problem/Solution and Footer Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the problem/solution section and footer to match the approved industrial Jack references while preserving the 1440 px layout system, legal links, form behavior, and responsive stability.

**Architecture:** Keep the existing static HTML/CSS/JS architecture. Replace only the two relevant semantic markup trees, extend the existing mask-based SVG icon system, and isolate new presentation through `problem-*`, `solution-*`, and `footer-*` classes. Use Playwright contract and geometry tests as the TDD boundary, then update visual snapshots only after the structural checks pass.

**Tech Stack:** HTML5, CSS custom properties and Grid, SVG mask icons, vanilla JavaScript anchors, Playwright E2E tests, Node test runner, PHP lint/tests.

## Global Constraints

- The problem/solution card is entirely inside the existing 1440 px `.container`.
- The footer background spans the viewport; all footer content stays inside the 1440 px `.container`.
- Reuse `solution-denim` and `footer-stitch` AVIF/WebP/JPG assets; do not rasterize UI from screenshots.
- Keep current contact values and `/privacy.html` and `/consent.html` links.
- Keep social items non-clickable placeholders until real URLs are provided.
- The help card links to `#consultation-form`.
- Copyright text is `© 2026 Все права защищены.` with `2026` visually accented.
- At 320 px there must be no horizontal overflow.
- Interactive controls must have visible `focus-visible` states and respect `prefers-reduced-motion`.

## File Map

- Modify `public/index.html`: semantic markup and approved copy for both blocks.
- Modify `public/assets/css/tokens.css`: component-scoped colors, shadows, radii, overlay, and geometry tokens.
- Modify `public/assets/css/layout.css`: desktop layout for the three-part card and full-width footer.
- Modify `public/assets/css/components.css`: icon mappings and interactive element styling.
- Modify `public/assets/css/responsive.css`: tablet and mobile stacking rules.
- Create `public/assets/icons/phone.svg`, `mail.svg`, `globe.svg`, `pin.svg`, `menu.svg`, `share.svg`, `document.svg`, `arrow-right.svg`: new line icons used by the footer.
- Modify `tests/e2e/landing.spec.mjs`: content, geometry, accessibility-contract, and navigation assertions.
- Update `tests/e2e/landing.visual.spec.mjs-snapshots/*.png`: approved desktop/tablet/mobile screenshots after review.

---

### Task 1: Lock the approved problem/solution content contract

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/index.html`
- Modify: `public/assets/css/components.css`
- Create: `public/assets/icons/arrow-right.svg`

**Interfaces:**
- Consumes: existing `.problem-solution-section`, `.problem-solution`, `data-icon`, and `#equipment` anchors.
- Produces: `.problem-item`, `.solution-panel__eyebrow`, `.solution-panel__title-accent`, and four `.solution-benefit` elements for the CSS tasks.

- [ ] **Step 1: Write the failing semantic contract test**

Add this Playwright test near the existing problem/solution checks:

```js
test('problem and solution card exposes the approved copy and benefit structure', async ({ page }) => {
  await page.goto('/');

  const card = page.locator('.problem-solution');
  await expect(card.getByRole('heading', { name: 'Проблема', exact: true })).toBeVisible();
  await expect(card.locator('.problem-item')).toHaveCount(3);
  await expect(card.locator('.problem-item__description')).toHaveText([
    'Снижает производительность и увеличивает сроки',
    'Из-за человеческого фактора страдает качество изделий',
    'Ручной труд ограничивает объёмы и увеличивает затраты'
  ]);
  await expect(card.locator('.solution-panel__eyebrow')).toHaveText('Наше решение');
  await expect(card.locator('.solution-benefit')).toHaveCount(4);
  await expect(card.locator('.solution-benefit__title')).toHaveText([
    'Точность до 0,1 мм',
    'Стабильное качество',
    'Высокая скорость',
    'Лёгкое масштабирование'
  ]);
  await expect(card.getByRole('link', { name: 'Узнать больше о решении' })).toHaveAttribute('href', '#equipment');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "approved copy and benefit structure" --project=desktop
```

Expected: FAIL because `.problem-item` and `.solution-benefit` do not exist.

- [ ] **Step 3: Add the arrow icon required by the section button**

Create `public/assets/icons/arrow-right.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M14 7l5 5-5 5"/></svg>
```

Register it in `components.css`:

```css
[data-icon="arrow-right"] { mask-image: url("../icons/arrow-right.svg"); -webkit-mask-image: url("../icons/arrow-right.svg"); }
```

- [ ] **Step 4: Replace the section markup with the approved semantic structure**

Use this exact list inside `.problem-panel__content`:

```html
<h2>Проблема</h2>
<ul class="problem-list">
  <li class="problem-item"><span class="problem-item__icon"><span data-icon="time" aria-hidden="true"></span></span><div><strong>Ручная пришивка деталей отнимает много времени</strong><p class="problem-item__description">Снижает производительность и увеличивает сроки</p></div></li>
  <li class="problem-item"><span class="problem-item__icon"><span data-icon="warning" aria-hidden="true"></span></span><div><strong>Высокий риск брака и отклонений</strong><p class="problem-item__description">Из-за человеческого фактора страдает качество изделий</p></div></li>
  <li class="problem-item"><span class="problem-item__icon"><span data-icon="growth" aria-hidden="true"></span></span><div><strong>Сложно масштабировать производство</strong><p class="problem-item__description">Ручной труд ограничивает объёмы и увеличивает затраты</p></div></li>
</ul>
```

Keep the existing responsive `picture`, and build the right side as:

```html
<div class="solution-panel">
  <div class="solution-panel__content">
    <p class="solution-panel__eyebrow">Наше решение</p>
    <h2>Решение <span class="solution-panel__title-accent">Jack</span></h2>
    <span class="solution-panel__rule" aria-hidden="true"></span>
    <p class="solution-panel__summary">Шаблонный автомат Jack выполняет операцию строго по заданному контуру — цифровому или физическому шаблону. Машина повторяет движения без отклонений, обеспечивая высокую точность, скорость и стабильное качество.</p>
    <div class="solution-benefits">
      <article class="solution-benefit"><span class="solution-benefit__icon"><span data-icon="target" aria-hidden="true"></span></span><div><h3 class="solution-benefit__title">Точность до 0,1 мм</h3><p>Идеальный результат каждый раз</p></div></article>
      <article class="solution-benefit"><span class="solution-benefit__icon"><span data-icon="shield" aria-hidden="true"></span></span><div><h3 class="solution-benefit__title">Стабильное качество</h3><p>Минимум брака и переделок</p></div></article>
      <article class="solution-benefit"><span class="solution-benefit__icon"><span data-icon="speed" aria-hidden="true"></span></span><div><h3 class="solution-benefit__title">Высокая скорость</h3><p>Сокращение времени на операцию до 70%</p></div></article>
      <article class="solution-benefit"><span class="solution-benefit__icon"><span data-icon="growth" aria-hidden="true"></span></span><div><h3 class="solution-benefit__title">Лёгкое масштабирование</h3><p>Рост объёмов без увеличения штата и издержек</p></div></article>
    </div>
    <a class="button button--solution" href="#equipment">Узнать больше о решении <span data-icon="arrow-right" aria-hidden="true"></span></a>
  </div>
</div>
```

- [ ] **Step 5: Run the targeted test and verify GREEN**

Run the command from Step 2. Expected: 1 passed.

- [ ] **Step 6: Commit the semantic change**

```powershell
git add tests/e2e/landing.spec.mjs public/index.html public/assets/css/components.css public/assets/icons/arrow-right.svg
git commit -m "feat: restructure problem solution card"
```

---

### Task 2: Build and verify the three-part desktop composition

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/tokens.css`
- Modify: `public/assets/css/layout.css`
- Modify: `public/assets/css/components.css`

**Interfaces:**
- Consumes: the markup produced by Task 1 and existing mask icons.
- Produces: a 1440 px, three-column `.problem-solution` card with clipped red panel, full-height media, and 2 × 2 benefits.

- [ ] **Step 1: Write the failing desktop geometry test**

```js
test('problem and solution card matches the approved desktop composition', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  const geometry = await page.locator('.problem-solution').evaluate((card) => {
    const problem = card.querySelector('.problem-panel').getBoundingClientRect();
    const media = card.querySelector('.problem-solution__media').getBoundingClientRect();
    const solution = card.querySelector('.solution-panel').getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    return {
      card: { width: Math.round(rect.width), height: Math.round(rect.height) },
      columns: [problem, media, solution].map((column) => Math.round(column.width)),
      aligned: [problem, media, solution].every((column) => Math.abs(column.height - rect.height) <= 2),
      radius: getComputedStyle(card).borderRadius,
      benefits: getComputedStyle(card.querySelector('.solution-benefits')).gridTemplateColumns
    };
  });

  expect(geometry.card.width).toBe(1440);
  expect(geometry.card.height).toBeGreaterThanOrEqual(560);
  expect(geometry.aligned).toBe(true);
  expect(geometry.columns.every((width) => width >= 400)).toBe(true);
  expect(geometry.radius).not.toBe('0px');
  expect(geometry.benefits.split(' ').length).toBe(2);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "approved desktop composition" --project=desktop
```

Expected: FAIL because the old card is shorter, square, and lacks the benefits grid.

- [ ] **Step 3: Add semantic component tokens**

Add component-scoped values to `tokens.css`:

```css
:root {
  --problem-card-radius: 1rem;
  --problem-card-shadow: 0 1rem 3rem rgb(15 23 42 / 0.12);
  --problem-panel-start: #b0000d;
  --problem-panel-end: #d00212;
  --problem-panel-divider: rgb(255 255 255 / 0.18);
  --problem-icon-surface: rgb(116 0 9 / 0.28);
  --solution-icon-surface: #fff0f1;
  --footer-surface: #101b28;
  --footer-panel: rgb(255 255 255 / 0.05);
  --footer-border: rgb(255 255 255 / 0.13);
}
```

- [ ] **Step 4: Implement the desktop grid and visual hierarchy**

In `layout.css`, set `.problem-solution` to `grid-template-columns: minmax(0, 0.98fr) minmax(0, 0.94fr) minmax(0, 1.18fr)`, `min-block-size: 36rem`, `overflow: hidden`, the approved radius/shadow, and no gaps. Use `clip-path: polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)` on a red panel pseudo-element that extends over the media without clipping panel text. Set the media image to `object-fit: cover; object-position: 50% 50%`. Build `.solution-benefits` as a two-column grid and style the icon shells, typography, rule, and outline button from the approved reference.

In `components.css`, ensure every nested `[data-icon]` uses the shared mask contract and the button arrow is 1.25rem with current color.

- [ ] **Step 5: Run both section tests and verify GREEN**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "problem and solution" --project=desktop
```

Expected: all matching tests pass.

- [ ] **Step 6: Commit the desktop composition**

```powershell
git add tests/e2e/landing.spec.mjs public/assets/css/tokens.css public/assets/css/layout.css public/assets/css/components.css
git commit -m "feat: build reference problem solution panel"
```

---

### Task 3: Rebuild the semantic footer and complete the icon set

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/index.html`
- Create: `public/assets/icons/phone.svg`
- Create: `public/assets/icons/mail.svg`
- Create: `public/assets/icons/globe.svg`
- Create: `public/assets/icons/pin.svg`
- Create: `public/assets/icons/menu.svg`
- Create: `public/assets/icons/share.svg`
- Create: `public/assets/icons/document.svg`
- Modify: `public/assets/css/components.css`

**Interfaces:**
- Consumes: current contact data, `#consultation-form`, legal pages, and disabled social placeholders.
- Produces: `.footer-column`, `.footer-heading`, `.footer-contact`, `.footer-help`, `.footer-nav`, `.footer-legal`, and mask names for Task 4.

- [ ] **Step 1: Write the failing footer contract test**

```js
test('footer matches the approved contact navigation help and legal contract', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.site-footer');

  await expect(footer.locator('.footer-column')).toHaveCount(3);
  await expect(footer.locator('.footer-contact')).toHaveCount(4);
  await expect(footer.getByRole('link', { name: /Нужна помощь/i })).toHaveAttribute('href', '#consultation-form');
  await expect(footer.locator('.footer-nav li')).toHaveCount(5);
  await expect(footer.locator('.social-link')).toHaveCount(3);
  await expect(footer.locator('.footer-legal a')).toHaveCount(2);
  await expect(footer.locator('.site-footer__year')).toHaveText('2026');
  await expect(footer.getByRole('link', { name: 'Политика конфиденциальности' })).toHaveAttribute('href', '/privacy.html');
  await expect(footer.getByRole('link', { name: 'Согласие на обработку персональных данных' })).toHaveAttribute('href', '/consent.html');
});
```

- [ ] **Step 2: Run the test and verify RED**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "approved contact navigation help" --project=desktop
```

Expected: FAIL because the new column, help, and legal classes are absent.

- [ ] **Step 3: Add the seven footer line icons**

Create each SVG with `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.8"`, `stroke-linecap="round"`, and `stroke-linejoin="round"`. Use these exact path contracts:

```xml
<!-- phone.svg --><path d="M8.7 3.5 10.4 7 8.2 8.6c1.2 2.5 2.8 4.1 5.3 5.3l1.6-2.2 3.5 1.7v3.1c0 1.1-.9 2-2 2C10.5 18.5 5.5 13.5 5.5 7.4c0-1.1.9-2 2-2h1.2Z"/>
<!-- mail.svg --><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>
<!-- globe.svg --><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z"/>
<!-- pin.svg --><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>
<!-- menu.svg --><path d="M5 7h14M5 12h14M5 17h14"/>
<!-- share.svg --><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/>
<!-- document.svg --><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>
```

- [ ] **Step 4: Register all new mask names**

Add explicit mappings such as:

```css
[data-icon="phone"] { mask-image: url("../icons/phone.svg"); -webkit-mask-image: url("../icons/phone.svg"); }
[data-icon="mail"] { mask-image: url("../icons/mail.svg"); -webkit-mask-image: url("../icons/mail.svg"); }
[data-icon="globe"] { mask-image: url("../icons/globe.svg"); -webkit-mask-image: url("../icons/globe.svg"); }
[data-icon="pin"] { mask-image: url("../icons/pin.svg"); -webkit-mask-image: url("../icons/pin.svg"); }
[data-icon="menu"] { mask-image: url("../icons/menu.svg"); -webkit-mask-image: url("../icons/menu.svg"); }
[data-icon="share"] { mask-image: url("../icons/share.svg"); -webkit-mask-image: url("../icons/share.svg"); }
[data-icon="document"] { mask-image: url("../icons/document.svg"); -webkit-mask-image: url("../icons/document.svg"); }
```

- [ ] **Step 5: Replace the footer markup**

Build three `.footer-column` sections inside `.site-footer__grid`. Keep the responsive `footer-stitch` picture. Render contact rows as icon plus text, render the help card as one link to `#consultation-form`, keep the five navigation anchors, preserve three disabled social placeholders, move both legal links into `.footer-legal`, and render the bottom copy as `© <span class="site-footer__year">2026</span> Все права защищены.`.

- [ ] **Step 6: Run the footer contract test and verify GREEN**

Run the command from Step 2. Expected: 1 passed.

- [ ] **Step 7: Commit the footer structure and icons**

```powershell
git add tests/e2e/landing.spec.mjs public/index.html public/assets/css/components.css public/assets/icons
git commit -m "feat: restructure industrial footer"
```

---

### Task 4: Build the full-width industrial footer layout

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/layout.css`
- Modify: `public/assets/css/components.css`

**Interfaces:**
- Consumes: Task 3 footer markup and icons plus `--footer-*` tokens from Task 2.
- Produces: full-viewport footer surface, 1440 px inner grid, interactive help/legal/nav components, and readable background overlay.

- [ ] **Step 1: Write the failing footer geometry and navigation test**

```js
test('footer spans the viewport while its content stays on the 1440px grid', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  const geometry = await page.evaluate(() => {
    const footer = document.querySelector('.site-footer').getBoundingClientRect();
    const grid = document.querySelector('.site-footer__grid').getBoundingClientRect();
    const help = document.querySelector('.footer-help').getBoundingClientRect();
    return {
      footer: { left: Math.round(footer.left), width: Math.round(footer.width) },
      grid: { left: Math.round(grid.left), width: Math.round(grid.width) },
      helpHeight: Math.round(help.height)
    };
  });

  expect(geometry.footer).toEqual({ left: 0, width: 1900 });
  expect(geometry.grid).toEqual({ left: 230, width: 1440 });
  expect(geometry.helpHeight).toBeGreaterThanOrEqual(88);

  await page.getByRole('link', { name: /Нужна помощь/i }).click();
  await expect(page.locator('#consultation-form')).toBeInViewport();
});
```

- [ ] **Step 2: Run the test and verify RED**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "footer spans the viewport" --project=desktop
```

Expected: FAIL because the new footer layout is not styled.

- [ ] **Step 3: Implement the desktop footer**

Set the footer to a minimum height close to the reference, position `footer-stitch` over the right 56%, and add a left-to-right dark overlay plus a subtle lower dot/radial texture made with CSS gradients. Use a `1fr 0.78fr 1.45fr` inner grid with generous vertical padding. Style heading icon shells, contact icon boxes, menu separators/arrows, 3rem circular social controls, the help card, and two full-width legal rows. All borders use `--footer-border`; all red states use existing action tokens.

- [ ] **Step 4: Add keyboard and interaction states**

Give `.footer-help`, `.footer-nav a`, `.footer-legal a`, and enabled social links clear hover and `focus-visible` states. Changes are limited to border, background, color, and a maximum 2 px translate; wrap translations in the existing reduced-motion rule.

- [ ] **Step 5: Run both footer tests and verify GREEN**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "footer" --project=desktop
```

Expected: all footer tests pass.

- [ ] **Step 6: Commit the footer presentation**

```powershell
git add tests/e2e/landing.spec.mjs public/assets/css/layout.css public/assets/css/components.css
git commit -m "feat: build full width industrial footer"
```

---

### Task 5: Make both redesigned blocks responsive

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: Tasks 1–4 desktop layouts.
- Produces: two-column tablet and one-column mobile problem/solution layouts, two-column tablet and one-column mobile footer layouts.

- [ ] **Step 1: Write the failing responsive geometry test**

```js
test('redesigned problem solution and footer stack safely across breakpoints', async ({ page }) => {
  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');

    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      problemColumns: getComputedStyle(document.querySelector('.problem-solution')).gridTemplateColumns.split(' ').length,
      footerColumns: getComputedStyle(document.querySelector('.site-footer__grid')).gridTemplateColumns.split(' ').length,
      benefitsColumns: getComputedStyle(document.querySelector('.solution-benefits')).gridTemplateColumns.split(' ').length
    }));

    expect(metrics.overflow).toBe(false);
    if (width >= 1024) expect(metrics.problemColumns).toBe(2);
    if (width <= 768) expect(metrics.problemColumns).toBe(1);
    if (width <= 390) {
      expect(metrics.footerColumns).toBe(1);
      expect(metrics.benefitsColumns).toBe(1);
    }
  }
});
```

- [ ] **Step 2: Run the test and verify RED**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "stack safely across breakpoints" --project=mobile
```

Expected: FAIL because the new desktop geometry has no breakpoint rules.

- [ ] **Step 3: Implement tablet rules**

At `max-width: 64rem`, make `.problem-solution` a two-column grid, place `.solution-panel` across both columns, switch its content to the full available width, use `object-position: 52% 50%`, and make `.site-footer__grid` two columns with the social/legal column spanning both columns.

- [ ] **Step 4: Implement mobile rules**

At `max-width: 48rem`, stack the three problem/solution parts, disable the diagonal clip, give the media a bounded 20rem height, switch benefits to one column, stack the footer, reduce background-image opacity, and keep help/legal links full width. At the narrowest breakpoint, reduce panel padding without reducing control hit areas below 44 px.

- [ ] **Step 5: Run responsive and existing overflow tests**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "stack safely|no overflow"
```

Expected: all matching tests pass at 1024, 768, 390, and 320 px.

- [ ] **Step 6: Commit responsive behavior**

```powershell
git add tests/e2e/landing.spec.mjs public/assets/css/responsive.css
git commit -m "feat: adapt redesigned product blocks"
```

---

### Task 6: Visual, accessibility, and full regression approval

**Files:**
- Modify: `tests/e2e/landing.visual.spec.mjs-snapshots/*.png`

**Interfaces:**
- Consumes: completed redesigned blocks.
- Produces: approved stable visual snapshots and fresh verification evidence.

- [ ] **Step 1: Run focused UI tests**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "problem and solution|footer|stack safely"
```

Expected: all focused tests pass.

- [ ] **Step 2: Run the UX/UI design QA tools**

Use the installed `ux-ui-agent-skills` routes `design-code`, `design-qa`, and `a11y-audit`. Run the project-safe hardcode/theme checks from the skill root against the worktree, then inspect desktop, tablet, and mobile screenshots. Accept no high-severity contrast, overflow, missing-state, or broken-asset findings.

- [ ] **Step 3: Update visual snapshots**

```powershell
npx playwright test tests/e2e/landing.visual.spec.mjs --update-snapshots
```

Expected: desktop, tablet, and mobile snapshots are updated.

- [ ] **Step 4: Re-run visual snapshots without update mode**

```powershell
npx playwright test tests/e2e/landing.visual.spec.mjs
```

Expected: all visual tests pass without diffs.

- [ ] **Step 5: Run full JavaScript and E2E regression**

```powershell
npm test
```

Expected: exit code 0 with no failed tests.

- [ ] **Step 6: Run PHP tests and lint**

```powershell
Get-ChildItem tests/php -Filter *.php | ForEach-Object { php $_.FullName }
Get-ChildItem public -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
```

Expected: every test exits 0 and every PHP file reports no syntax errors.

- [ ] **Step 7: Verify repository state and commit approval assets**

```powershell
git diff --check
git status --short
git add tests/e2e/landing.visual.spec.mjs-snapshots
git commit -m "test: approve problem solution and footer redesign"
```

Expected: only intended snapshot changes are staged, the commit succeeds, and the worktree is clean afterward.
