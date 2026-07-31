# Reference Capabilities and Specifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перестроить секции «Что умеет» и «Технические характеристики» по двум утверждённым референсам, сохранив контейнер 1440 px, адаптив, доступность и рабочую загрузку PDF.

**Architecture:** Разметка остаётся сервер-независимой и семантической в `public/index.html`; стили продолжают разделяться на токены, базовые компоненты, раскладку и медиазапросы. Контурные иконки реализуются локальными SVG-масками в существующей системе `data-icon`, без JavaScript и внешних зависимостей.

**Tech Stack:** HTML5, token-driven vanilla CSS, local SVG assets, Playwright 1.55, Node test runner, PHP CLI checks.

## Global Constraints

- Все основные блоки находятся внутри центрированного контейнера `1440 px`.
- На desktop «Что умеет» содержит пять вертикальных карточек в один ряд.
- «Технические характеристики» содержит таблицу слева и продуктовую зону справа.
- Кнопки используют скругление около `8 px`, крупные карточки и панели — около `12 px`.
- Сохраняются локальные Roboto Condensed и Inter, существующий PDF и текущая форма/SMTP/cookie-логика.
- Новые значения вводятся через `public/assets/css/tokens.css`; новые иконки — только локальные SVG.
- Светлая и тёмная темы должны проходить WCAG AA; на ширинах `1440`, `1024`, `768`, `390`, `320 px` не должно быть горизонтального переполнения.

## File Structure

- Modify: `public/index.html` — новая семантическая разметка двух секций.
- Modify: `public/assets/css/tokens.css` — мягкие радиусы, тень карточек и размеры новых композиций.
- Modify: `public/assets/css/layout.css` — крупная сетка и вертикальный ритм секций.
- Modify: `public/assets/css/components.css` — карточки, иконки, таблица, панель преимуществ и PDF-кнопка.
- Modify: `public/assets/css/responsive.css` — раскладки `5 → 3 → 2 → 1` и `2 колонки → стек`.
- Create: `public/assets/icons/{frame,speed,motor,stitch,plug,air,weight,dimensions,target,settings,pdf}.svg` — недостающие контурные иконки.
- Modify: `tests/e2e/landing.spec.mjs` — структурные, геометрические и responsive-контракты.
- Modify: `tests/e2e/visual.spec.mjs-snapshots/*.png` — утверждённые visual baselines после ручной проверки.

---

### Task 1: Reference-style capability cards

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/index.html:125-135`
- Modify: `public/assets/css/tokens.css:124-144`
- Modify: `public/assets/css/layout.css:194-245`
- Modify: `public/assets/css/components.css:142-164`
- Modify: `public/assets/css/responsive.css:49-78,303-324`
- Create: `public/assets/icons/settings.svg`

**Interfaces:**
- Consumes: existing `data-icon="monitor|templates|laser|thread|layers"` SVG-mask interface.
- Produces: `data-icon="settings"`, `.capabilities__heading`, `.capabilities__ornament`, `.capability__icon-shell`, `.capability__title`, `.capability__description`, `.capability__number` for later visual checks.

- [ ] **Step 1: Replace the obsolete compact-section assertion with a failing card-composition test**

Add this test to `tests/e2e/landing.spec.mjs` and remove the old `capabilitiesHeight === 180` assertion:

```js
test('capabilities reproduce the five-card reference composition', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  await expect(page.locator('.capability')).toHaveCount(5);
  await expect(page.locator('.capability__number')).toHaveText(['01', '02', '03', '04', '05']);
  await expect(page.locator('.capability__description')).toHaveCount(5);
  await expect(page.locator('.capabilities__heading-accent')).toHaveText('Умеет');

  const desktop = await page.evaluate(() => {
    const section = document.querySelector('.capabilities .container').getBoundingClientRect();
    const grid = document.querySelector('.capabilities__grid');
    const card = document.querySelector('.capability');
    return {
      left: Math.round(section.left),
      width: Math.round(section.width),
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      radius: getComputedStyle(card).borderRadius,
      minHeight: Math.round(card.getBoundingClientRect().height)
    };
  });

  expect(desktop).toMatchObject({ left: 230, width: 1440, columns: 5, radius: '12px' });
  expect(desktop.minHeight).toBeGreaterThanOrEqual(400);

  for (const [width, columns] of [[1024, 3], [768, 2], [390, 1]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    expect(await page.locator('.capabilities__grid').evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns.split(' ').length
    )).toBe(columns);
  }
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "five-card reference composition" --project=desktop
```

Expected: FAIL because `.capability__number`, `.capability__description`, and `.capabilities__heading-accent` do not exist.

- [ ] **Step 3: Add the title ornament gear icon**

Create `public/assets/icons/settings.svg` with this complete content:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="24" cy="24" r="6"/><path d="M20 4h8l2 6 5 2 6-2 4 7-4 5v5l4 5-4 7-6-2-5 3-2 6h-8l-2-6-5-3-6 2-4-7 4-5v-5l-4-5 4-7 6 2 5-2z"/></g></svg>
```

Register it in `components.css`:

```css
[data-icon="settings"] { mask-image: url("../icons/settings.svg"); -webkit-mask-image: url("../icons/settings.svg"); }
```

- [ ] **Step 4: Implement the approved semantic card markup**

Replace the current capabilities content with this exact structure and the five approved copy sets:

```html
<div class="container">
  <header class="capabilities__header">
    <h2 class="capabilities__heading" id="capabilities-title">Что <span class="capabilities__heading-accent">умеет</span></h2>
    <div class="capabilities__ornament" aria-hidden="true"><span data-icon="settings"></span></div>
  </header>
  <div class="capabilities__grid">
    <article class="capability">
      <span class="capability__icon-shell"><span class="feature-icon" data-icon="monitor" aria-hidden="true"></span></span>
      <span class="capability__rule" aria-hidden="true"></span>
      <h3 class="capability__title">Программирование<br>с ПК или через<br>сенсорную панель</h3>
      <p class="capability__description">Удобное управление<br>и гибкая настройка<br>под любые задачи</p>
      <span class="capability__number" aria-hidden="true">01</span>
    </article>
    <article class="capability">
      <span class="capability__icon-shell"><span class="feature-icon" data-icon="templates" aria-hidden="true"></span></span>
      <span class="capability__rule" aria-hidden="true"></span>
      <h3 class="capability__title">Память до 999<br>шаблонов</h3>
      <p class="capability__description">Большая память<br>для хранения программ<br>и быстрый доступ к ним</p>
      <span class="capability__number" aria-hidden="true">02</span>
    </article>
    <article class="capability">
      <span class="capability__icon-shell"><span class="feature-icon" data-icon="laser" aria-hidden="true"></span></span>
      <span class="capability__rule" aria-hidden="true"></span>
      <h3 class="capability__title">Лазерная резка,<br>автоматическая закрепка<br>и обрезка нити</h3>
      <p class="capability__description">Точная обработка,<br>чистый край и надёжная<br>фиксация без лишних операций</p>
      <span class="capability__number" aria-hidden="true">03</span>
    </article>
    <article class="capability">
      <span class="capability__icon-shell"><span class="feature-icon" data-icon="thread" aria-hidden="true"></span></span>
      <span class="capability__rule" aria-hidden="true"></span>
      <h3 class="capability__title">Датчик нижней нити —<br>контроль качества шва</h3>
      <p class="capability__description">Автоматический контроль<br>обрыва нижней нити<br>для стабильного качества<br>и снижения брака</p>
      <span class="capability__number" aria-hidden="true">04</span>
    </article>
    <article class="capability">
      <span class="capability__icon-shell"><span class="feature-icon" data-icon="layers" aria-hidden="true"></span></span>
      <span class="capability__rule" aria-hidden="true"></span>
      <h3 class="capability__title">Работа с различными<br>материалами: средние<br>и тяжёлые ткани</h3>
      <p class="capability__description">Надёжная работа<br>с широким спектром<br>материалов без потери<br>качества строчки</p>
      <span class="capability__number" aria-hidden="true">05</span>
    </article>
  </div>
</div>
```

For cards `02–05`, insert exactly these title/description pairs:

```text
02: Память до 999 шаблонов | Большая память для хранения программ и быстрый доступ к ним
03: Лазерная резка, автоматическая закрепка и обрезка нити | Точная обработка, чистый край и надёжная фиксация без лишних операций
04: Датчик нижней нити — контроль качества шва | Автоматический контроль обрыва нижней нити для стабильного качества и снижения брака
05: Работа с различными материалами: средние и тяжёлые ткани | Надёжная работа с широким спектром материалов без потери качества строчки
```

- [ ] **Step 5: Add token-driven desktop styling**

Add/adjust these tokens in `tokens.css`:

```css
--radius-card: 0.75rem;
--shadow-card: 0 0.5rem 1.75rem rgb(17 24 32 / 7%);
--capability-card-min-height: 25rem;
--capability-icon-shell-size: 5.5rem;
```

Implement the desktop layout in `layout.css`/`components.css`:

```css
.capabilities { block-size: auto; padding-block: var(--space-16); }
.capabilities__header { margin-block-end: var(--space-12); text-align: center; }
.capabilities__heading { margin-block-end: var(--space-5); font-size: var(--font-size-4xl); text-transform: uppercase; }
.capabilities__heading-accent { color: var(--color-accent-foreground); }
.capabilities__ornament { display: flex; align-items: center; justify-content: center; gap: var(--space-5); color: var(--color-accent-foreground); }
.capabilities__ornament::before,
.capabilities__ornament::after { content: ""; inline-size: var(--space-16); block-size: var(--border-thin); background: currentColor; }
.capabilities__ornament span { inline-size: var(--space-6); block-size: var(--space-6); }
.capabilities__grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-4); }
.capability { position: relative; min-block-size: var(--capability-card-min-height); display: flex; flex-direction: column; align-items: center; padding: var(--space-7) var(--space-5); overflow: hidden; border: var(--border-thin) solid var(--color-border-subtle); border-radius: var(--radius-card); background: var(--color-surface-elevated); box-shadow: var(--shadow-card); text-align: center; }
.capability__icon-shell { inline-size: var(--capability-icon-shell-size); block-size: var(--capability-icon-shell-size); display: grid; place-items: center; margin-block-end: var(--space-6); border-radius: 50%; background: var(--color-action-primary-soft); box-shadow: var(--shadow-whisper); }
.capability__rule { inline-size: var(--space-7); block-size: var(--border-thin); margin-block-end: var(--space-6); background: var(--color-action-primary); }
.capability__title { margin-block-end: var(--space-6); font-family: var(--font-body); font-size: var(--font-size-base); line-height: 1.45; }
.capability__description { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.55; }
.capability__number { position: absolute; inset-inline-end: var(--space-4); inset-block-end: var(--space-3); color: var(--color-border-subtle); font-family: var(--font-heading); font-size: var(--font-size-4xl); font-weight: 700; line-height: 1; }
```

- [ ] **Step 6: Add the `3 → 2 → 1` responsive grid**

Use exact breakpoints already present in `responsive.css`:

```css
@media (max-width: 64rem) { .capabilities__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 48rem) { .capabilities__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 30rem) {
  .capabilities { padding-block: var(--space-10); }
  .capabilities__grid { grid-template-columns: 1fr; }
  .capability { min-block-size: 20rem; }
}
```

- [ ] **Step 7: Verify GREEN and commit**

Run the targeted test plus overflow tests. Expected: all selected tests PASS.

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "five-card reference composition|landing has no overflow" --project=desktop
git add public/index.html public/assets/css tests/e2e/landing.spec.mjs
git commit -m "feat: rebuild capability section as reference cards"
```

---

### Task 2: Reference-style technical specifications panel

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/index.html:190-223`
- Modify: `public/assets/css/layout.css:354-392`
- Modify: `public/assets/css/components.css:118-138,195-235`
- Modify: `public/assets/css/responsive.css:93-96,340-348`
- Create: `public/assets/icons/frame.svg`
- Create: `public/assets/icons/speed.svg`
- Create: `public/assets/icons/motor.svg`
- Create: `public/assets/icons/stitch.svg`
- Create: `public/assets/icons/plug.svg`
- Create: `public/assets/icons/air.svg`
- Create: `public/assets/icons/weight.svg`
- Create: `public/assets/icons/dimensions.svg`
- Create: `public/assets/icons/target.svg`
- Create: `public/assets/icons/pdf.svg`

**Interfaces:**
- Consumes: existing responsive `.table-scroll`, `data-icon="settings"`, `spec-machine` picture sources, and `/assets/docs/jack-ms-100a.pdf`.
- Produces: `.specifications__panel`, `.spec-parameter`, `.product-benefits`, `.product-benefit`, `.specifications__download-copy`.

- [ ] **Step 1: Write the failing specifications composition test**

```js
test('specifications reproduce the table, product benefits, and download panel', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  await expect(page.locator('.spec-parameter')).toHaveCount(10);
  await expect(page.locator('.spec-parameter [data-icon]')).toHaveCount(10);
  await expect(page.locator('.product-benefit')).toHaveCount(4);
  await expect(page.locator('.product-benefit h3')).toHaveText([
    'Высокая точность', 'Скорость и стабильность', 'Надёжность', 'Простое управление'
  ]);
  await expect(page.locator('.specifications__download-copy small')).toHaveText('Подробные характеристики и руководство');

  const geometry = await page.evaluate(() => {
    const container = document.querySelector('.specifications > .container').getBoundingClientRect();
    const panel = document.querySelector('.specifications__panel').getBoundingClientRect();
    return {
      container: { left: Math.round(container.left), width: Math.round(container.width) },
      panelWidth: Math.round(panel.width),
      radius: getComputedStyle(document.querySelector('.specifications__panel')).borderRadius,
      columns: getComputedStyle(document.querySelector('.specifications__grid')).gridTemplateColumns.split(' ').length
    };
  });

  expect(geometry).toEqual({
    container: { left: 230, width: 1440 }, panelWidth: 1440, radius: '12px', columns: 2
  });
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "table, product benefits" --project=desktop
```

Expected: FAIL because `.spec-parameter`, `.product-benefit`, and `.specifications__panel` do not exist.

- [ ] **Step 3: Add the local SVG icon set**

Every file uses the same accessible-decorative mask wrapper; `frame.svg` is the complete example:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect x="8" y="10" width="32" height="28" rx="2"/><path d="M4 16h8M4 32h8M36 16h8M36 32h8M16 6v8M32 6v8M16 34v8M32 34v8"/></g></svg>
```

Use these exact shapes inside the `<g>` for each file:

```xml
<!-- frame.svg --> <rect x="8" y="10" width="32" height="28" rx="2"/><path d="M4 16h8M4 32h8M36 16h8M36 32h8M16 6v8M32 6v8M16 34v8M32 34v8"/>
<!-- speed.svg --> <path d="M8 34a18 18 0 1 1 32 0"/><path d="m24 24 10-7M12 32h24M24 10v4M11 19l4 2M37 19l-4 2"/><circle cx="24" cy="24" r="2"/>
<!-- motor.svg --> <rect x="10" y="14" width="25" height="20" rx="2"/><path d="M35 20h5v8h-5M6 19h4v10H6M16 10v4M29 10v4M17 20h11v8H17z"/>
<!-- stitch.svg --> <path d="M7 10v28M41 10v28M12 14h8l4 7 4-7h8M12 28h8l4 7 4-7h8"/><path d="M7 14h3M7 28h3M38 14h3M38 28h3"/>
<!-- plug.svg --> <path d="M17 6v11M31 6v11M13 17h22v5a11 11 0 0 1-22 0zM24 33v9"/>
<!-- air.svg --> <path d="M6 16h22c5 0 5-8 0-8-3 0-5 2-5 4M6 24h32c6 0 6-9 0-9-3 0-5 2-5 5M6 32h20c5 0 5 8 0 8-3 0-5-2-5-4"/>
<!-- weight.svg --> <path d="M14 16h20l6 26H8z"/><circle cx="24" cy="11" r="6"/><path d="M21 11h6"/>
<!-- dimensions.svg --> <path d="M8 16V8h8M32 8h8v8M40 32v8h-8M16 40H8v-8M13 13l22 22M35 13 13 35"/>
<!-- target.svg --> <circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="3"/><path d="M24 2v7M24 39v7M2 24h7M39 24h7"/>
<!-- pdf.svg --> <path d="M12 4h16l8 8v32H12zM28 4v10h10"/><path d="M17 32v-9h4a3 3 0 0 1 0 6h-4M25 32v-9h3c4 0 6 2 6 4.5S32 32 28 32zM37 32v-9h6M37 27h5"/>
```

Register all names in `components.css` with the existing mask selector pattern, for example:

```css
[data-icon="frame"] { mask-image: url("../icons/frame.svg"); -webkit-mask-image: url("../icons/frame.svg"); }
```

- [ ] **Step 4: Implement the approved specifications markup**

Wrap the section contents in `.specifications__panel` and `.specifications__grid`. Use:

```html
<h2 id="specifications-title">Технические <span>характеристики</span></h2>
```

For each of the ten table row headers, use:

```html
<th scope="row"><span class="spec-parameter"><span data-icon="frame" aria-hidden="true"></span><span>Поле шитья</span></span></th>
```

Map rows to icons in order:

```text
frame, speed, motor, layers, stitch, templates, plug, air, weight, dimensions
```

Add the note directly below the scroll container:

```html
<p class="specifications__note">*Характеристики могут отличаться в зависимости от модификации и комплектации.</p>
```

Under the existing product picture, add these four complete `.product-benefit` articles:

```html
<div class="product-benefits" aria-label="Преимущества Jack MS-100A">
  <article class="product-benefit"><span data-icon="target" aria-hidden="true"></span><h3>Высокая точность</h3><p>Идеальная строчка даже на сложных материалах</p></article>
  <article class="product-benefit"><span data-icon="speed" aria-hidden="true"></span><h3>Скорость и стабильность</h3><p>До 2 700 ст/мин без потери качества</p></article>
  <article class="product-benefit"><span data-icon="shield" aria-hidden="true"></span><h3>Надёжность</h3><p>Проверенные компоненты и долгий срок службы</p></article>
  <article class="product-benefit"><span data-icon="settings" aria-hidden="true"></span><h3>Простое управление</h3><p>Интуитивный интерфейс и удобная настройка</p></article>
</div>
```

Then replace the download link contents with:

```html
<span data-icon="download" aria-hidden="true"></span>
<span class="specifications__download-copy">
  <strong>Скачать технический лист (PDF)</strong>
  <small>Подробные характеристики и руководство</small>
</span>
<span data-icon="pdf" aria-hidden="true"></span>
```

- [ ] **Step 5: Implement the reference panel styling**

Use the following structural contract:

```css
.specifications { padding-block: var(--space-8); }
.specifications__panel { padding: var(--space-8); border: var(--border-thin) solid var(--color-border-subtle); border-radius: var(--radius-card); background: var(--color-surface-subtle); box-shadow: var(--shadow-card); }
.specifications__grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); gap: var(--space-8); align-items: stretch; }
.specifications h2 { margin-block-end: var(--space-7); text-align: start; text-transform: uppercase; }
.specifications h2 span { color: var(--color-accent-foreground); }
.table-scroll { overflow: hidden auto; border-radius: var(--radius-md); background: var(--color-surface-elevated); }
.spec-parameter { display: inline-flex; align-items: center; gap: var(--space-3); }
.spec-parameter [data-icon] { flex: 0 0 auto; inline-size: var(--space-5); block-size: var(--space-5); color: var(--color-accent-foreground); }
.specifications__note { margin: var(--space-8) 0 0; color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.specifications__product { position: relative; display: grid; grid-template-rows: minmax(22rem, 1fr) auto auto; gap: var(--space-4); padding: var(--space-4); overflow: hidden; border-radius: var(--radius-card); background: radial-gradient(circle at 50% 38%, var(--color-surface-page) 0 34%, transparent 35%), var(--color-surface-elevated); }
.product-benefits { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-radius: var(--radius-card); background: var(--color-surface-page); box-shadow: var(--shadow-card); }
.product-benefit { padding: var(--space-5) var(--space-3); text-align: center; border-inline-end: var(--border-thin) solid var(--color-border-subtle); }
.product-benefit:last-child { border-inline-end: 0; }
.product-benefit [data-icon] { inline-size: var(--space-8); block-size: var(--space-8); margin: 0 auto var(--space-3); color: var(--color-accent-foreground); }
.product-benefit h3 { margin-block-end: var(--space-2); font-family: var(--font-body); font-size: var(--font-size-xs); }
.product-benefit p { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-2xs); line-height: 1.45; }
.button--download { inline-size: 82%; min-block-size: 3.75rem; display: grid; grid-template-columns: auto 1fr auto; justify-self: center; padding-inline: var(--space-6); }
.specifications__download-copy { display: grid; text-align: start; }
.specifications__download-copy small { color: var(--color-action-primary-soft); font-size: var(--font-size-xs); font-weight: 400; }
```

Add `--font-size-2xs: 0.6875rem` to `tokens.css` before applying this component rule.

- [ ] **Step 6: Add responsive stacking**

```css
@media (max-width: 64rem) {
  .specifications__grid { grid-template-columns: 1fr; }
  .specifications__product { grid-template-rows: minmax(20rem, auto) auto auto; }
}
@media (max-width: 48rem) {
  .specifications__panel { padding: var(--space-4); }
  .product-benefits { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .product-benefit:nth-child(2) { border-inline-end: 0; }
  .product-benefit:nth-child(-n + 2) { border-block-end: var(--border-thin) solid var(--color-border-subtle); }
  .button--download { inline-size: 100%; }
}
@media (max-width: 24.375rem) {
  .product-benefits { grid-template-columns: 1fr; }
  .product-benefit { border-inline-end: 0; border-block-end: var(--border-thin) solid var(--color-border-subtle); }
  .product-benefit:last-child { border-block-end: 0; }
}
```

- [ ] **Step 7: Verify GREEN and commit**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "table, product benefits|technical sheet|optimized imagery" --project=desktop
git add public/index.html public/assets/css public/assets/icons tests/e2e/landing.spec.mjs
git commit -m "feat: rebuild technical specifications panel"
```

Expected: all selected tests PASS; all eleven new SVG responses are `200`.

---

### Task 3: Shared soft geometry and responsive integration

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/tokens.css`
- Modify: `public/assets/css/components.css`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: `--radius-sm`, `--radius-md`, `.button`, `.field input`, `.cookie-banner`, `.video-dialog__surface`, `.specifications__panel`, `.capability`.
- Produces: one consistent radius contract for controls and cards across the site.

- [ ] **Step 1: Write the failing shared-radius test**

```js
test('controls and redesigned panels share the approved soft geometry', async ({ page }) => {
  await page.goto('/');
  const geometry = await page.evaluate(() => ({
    button: getComputedStyle(document.querySelector('.button')).borderRadius,
    input: getComputedStyle(document.querySelector('.field input')).borderRadius,
    capability: getComputedStyle(document.querySelector('.capability')).borderRadius,
    specifications: getComputedStyle(document.querySelector('.specifications__panel')).borderRadius
  }));
  expect(geometry).toEqual({ button: '8px', input: '8px', capability: '12px', specifications: '12px' });
});
```

- [ ] **Step 2: Verify RED before the shared token update**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "approved soft geometry" --project=desktop
```

Expected: FAIL if any control still computes to the old `4px` or `6px` radius.

- [ ] **Step 3: Route all in-scope controls to the shared radius tokens**

First update the shared tokens and retire the temporary card-only token:

```css
--radius-sm: 0.5rem;
--radius-md: 0.75rem;
```

Ensure these selectors use `var(--radius-sm)`:

```css
.button,
.field input,
.menu-button,
.legal-card { border-radius: var(--radius-sm); }
```

Ensure these selectors use `var(--radius-md)`:

```css
.capability,
.specifications__panel,
.specifications__product,
.product-benefits,
.cookie-banner,
.video-dialog__surface { border-radius: var(--radius-md); }
```

Do not make icon circles, social icons, or the round play glyph less than `50%` radius.

- [ ] **Step 4: Verify radius and all five overflow breakpoints**

```powershell
npx playwright test tests/e2e/landing.spec.mjs --grep "approved soft geometry|landing has no overflow" --project=desktop
```

Expected: 6 selected tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add public/assets/css tests/e2e/landing.spec.mjs
git commit -m "style: soften shared controls and panels"
```

---

### Task 4: Visual approval and full regression

**Files:**
- Modify: `tests/e2e/visual.spec.mjs-snapshots/desktop-1440-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/tablet-768-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/mobile-390-desktop-win32.png`

**Interfaces:**
- Consumes: completed HTML/CSS/SVG implementation from Tasks 1–3.
- Produces: stable visual baselines and verified deployable project state.

- [ ] **Step 1: Run visual tests without updating snapshots**

```powershell
npx playwright test tests/e2e/visual.spec.mjs --project=desktop
```

Expected: three intentional visual diffs against the old design.

- [ ] **Step 2: Inspect all three actual screenshots**

Open the generated `*-actual.png` files and compare them to the supplied references. Confirm:

```text
desktop: five cards in one row; specifications in two columns; both within 1440 px
tablet: two capability columns; specifications stacked; four benefits in two columns
mobile: one capability column; scrollable table; no clipped PDF content
all sizes: soft 8/12 px corners, no cutoff machine, no horizontal scrollbar
```

If any condition fails, return to the owning task and add a failing regression assertion before changing CSS.

- [ ] **Step 3: Update and stabilize visual baselines**

```powershell
npx playwright test tests/e2e/visual.spec.mjs --project=desktop --update-snapshots
npx playwright test tests/e2e/visual.spec.mjs --project=desktop --repeat-each=3
```

Expected: update run 3 PASS; stability run 9 PASS.

- [ ] **Step 4: Run the complete application suite**

```powershell
npm test
```

Expected: all Node and Playwright tests PASS; only the three existing cross-project visual skips remain expected.

- [ ] **Step 5: Run PHP tests and lint**

```powershell
Get-ChildItem tests/php/*.test.php | ForEach-Object { & 'C:\php\php.exe' -c tools/php.ini $_.FullName }
Get-ChildItem public,server -Recurse -Filter *.php | ForEach-Object { & 'C:\php\php.exe' -c tools/php.ini -l $_.FullName }
```

Expected: four PHP test files PASS and every PHP file reports `No syntax errors detected`.

- [ ] **Step 6: Run required design-system gates**

```powershell
& 'C:\Users\bahti\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' 'C:\Users\bahti\.codex\skills\ux-ui-agent-skills\scripts\lint_hardcodes.py' public/assets/css public/index.html
& 'C:\Users\bahti\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' 'C:\Users\bahti\.codex\skills\ux-ui-agent-skills\scripts\validate_theme_refs.py' public/assets/css/tokens.css public/assets/css public/index.html
```

Expected: no hardcoded values and every CSS variable resolves. Then run `taste_audit.mjs` and `verify_states.mjs` through the project Playwright loader for light and `--dark`; both state audits must be WCAG AA.

- [ ] **Step 7: Final diff and local HTTP verification**

```powershell
git diff --check
Invoke-WebRequest http://127.0.0.1:8080/ -UseBasicParsing | Select-Object StatusCode
git status --short
```

Expected: no whitespace errors, HTTP `200`, and only intended files modified.

- [ ] **Step 8: Commit visual baselines and final verification changes**

```powershell
git add tests/e2e/visual.spec.mjs-snapshots public/index.html public/assets/css public/assets/icons tests/e2e/landing.spec.mjs
git commit -m "test: approve reference-led product sections"
```

Expected: clean worktree after the commit.
