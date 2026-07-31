# Desktop Visual Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Пересобрать desktop-композицию лендинга Jack по утверждённому эталону: контейнер 1440 px, рабочие локальные sans-serif шрифты, фоновый hero, компактные секции и единая SVG-иконография.

**Architecture:** Существующая семантическая HTML-структура и все JavaScript/PHP-сценарии сохраняются. Изменения выполняются в токенах и CSS-композиции; новый SVG-маркер и унифицированные линейные SVG заменяют неточные пиктограммы. Каждый визуальный контракт сначала фиксируется Playwright или Node-тестом, затем реализуется и проверяется снимками.

**Tech Stack:** HTML5, vanilla CSS, локальные WOFF2, SVG, JavaScript ES modules, Playwright, Node test runner, PHP 8.1+.

## Global Constraints

- Максимальная ширина `.container`: ровно 1440 px (`90rem`).
- Desktop hero: ровно 440 px; изображение визуально работает как фон внутри контейнера.
- Desktop hero h1: 46 px, line-height 1.08, максимум три строки; lead: 18 px.
- Основной текст: Inter Local 400/600; заголовки: Roboto Condensed Local 700.
- Desktop-секция «Что умеет»: 180 px; иконки 40 px; подписи 14 px, line-height 1.35.
- Desktop-колонки «Примеры применения»: 30% / 35% / 35%.
- Mobile hero: текст сверху, отдельное изображение ниже.
- Нельзя менять тексты, маршруты, API, форму, маску телефона, меню, cookie, SEO и юридические страницы.
- Нельзя извлекать изображения или иконки из скриншота.
- Контрольные ширины: 1440, 1024, 768, 390 и 320 px; горизонтальный overflow запрещён.

---

## File Map

- `public/assets/css/tokens.css` — шрифты, контейнер, размерные токены.
- `public/assets/css/base.css` — базовое наследование шрифта и общая типографика.
- `public/assets/css/layout.css` — desktop hero, capabilities и applications.
- `public/assets/css/components.css` — размеры иконок и SVG-маркер списка.
- `public/assets/css/responsive.css` — tablet/mobile reflow hero и секций.
- `public/assets/icons/check-circle.svg` — круглая галочка списка.
- `public/assets/icons/{time,warning,growth,monitor,templates,laser,thread,layers,shield,headset,training,custom}.svg` — единая линейная иконография.
- `tests/e2e/landing.spec.mjs` — вычисленные шрифты, геометрия контейнера/hero/секций, mobile stacking.
- `tests/js/icon-system.test.mjs` — единый SVG-контракт.
- `tests/e2e/visual.spec.mjs-snapshots/*.png` — утверждённые визуальные эталоны.

---

### Task 1: Исправить вычисленный шрифт и контейнер 1440 px

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/tokens.css`
- Modify: `public/assets/css/base.css`

**Interfaces:**
- Consumes: существующие CSS custom properties `--font-body`, `--font-heading`, `--container`.
- Produces: вычисленный `font-family` body с `Inter Local`; `.container` шириной 1440 px на viewport 1900 px.

- [ ] **Step 1: Добавить падающий Playwright-тест**

Добавить в `tests/e2e/landing.spec.mjs`:

```js
test('desktop uses the approved 1440px container and local sans-serif typography', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 900 });
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const heroInner = document.querySelector('.hero__inner').getBoundingClientRect();
    const nav = getComputedStyle(document.querySelector('.site-nav a'));
    return {
      bodyFamily: body.fontFamily,
      bodyLineHeight: body.lineHeight,
      navFamily: nav.fontFamily,
      containerWidth: Math.round(heroInner.width),
      containerLeft: Math.round(heroInner.left)
    };
  });

  expect(metrics.bodyFamily).toContain('Inter Local');
  expect(metrics.bodyFamily).not.toContain('Times New Roman');
  expect(metrics.navFamily).toContain('Inter Local');
  expect(metrics.bodyLineHeight).not.toBe('normal');
  expect(metrics.containerWidth).toBe(1440);
  expect(metrics.containerLeft).toBe(230);
});
```

- [ ] **Step 2: Запустить тест и подтвердить правильное падение**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "approved 1440px"
```

Expected: FAIL; фактический body содержит `Times New Roman`, ширина контейнера равна 1320.

- [ ] **Step 3: Исправить токен контейнера и наследование шрифта**

В `public/assets/css/tokens.css` заменить:

```css
--container: 90rem;
```

В `public/assets/css/base.css` заменить общий shorthand:

```css
button,
input {
  font: inherit;
}
```

Правило `body { font-family: var(--font-body); line-height: var(--line-height-body); }` оставить источником типографики страницы.

- [ ] **Step 4: Запустить тест и подтвердить прохождение**

Run: та же команда из Step 2.  
Expected: 2 PASS (desktop и mobile Playwright projects).

- [ ] **Step 5: Зафиксировать изменение**

```powershell
git add public/assets/css/tokens.css public/assets/css/base.css tests/e2e/landing.spec.mjs
git commit -m "fix: restore local typography and 1440px grid"
```

---

### Task 2: Пересобрать hero как фоновую композицию

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/layout.css`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: существующие `.hero__inner`, `.hero__content`, `.hero__media` и адаптивный `<picture>`.
- Produces: desktop background composition 1440×440; mobile document flow «content → image».

- [ ] **Step 1: Добавить падающий тест desktop/mobile geometry**

```js
test('hero uses a background composition on desktop and stacks media below copy on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 900 });
  await page.goto('/');

  const desktop = await page.evaluate(() => {
    const inner = document.querySelector('.hero__inner').getBoundingClientRect();
    const mediaElement = document.querySelector('.hero__media');
    const media = mediaElement.getBoundingClientRect();
    const title = getComputedStyle(document.querySelector('.hero h1'));
    return {
      inner: { width: Math.round(inner.width), height: Math.round(inner.height) },
      media: { width: Math.round(media.width), height: Math.round(media.height) },
      mediaPosition: getComputedStyle(mediaElement).position,
      titleSize: title.fontSize,
      titleLineHeight: Number.parseFloat(title.lineHeight)
    };
  });

  expect(desktop.inner).toEqual({ width: 1440, height: 440 });
  expect(desktop.media).toEqual({ width: 1440, height: 440 });
  expect(desktop.mediaPosition).toBe('absolute');
  expect(desktop.titleSize).toBe('46px');
  expect(desktop.titleLineHeight).toBeCloseTo(49.68, 1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const mobile = await page.evaluate(() => {
    const copy = document.querySelector('.hero__content').getBoundingClientRect();
    const mediaElement = document.querySelector('.hero__media');
    const media = mediaElement.getBoundingClientRect();
    return {
      mediaPosition: getComputedStyle(mediaElement).position,
      copyBottom: Math.round(copy.bottom),
      mediaTop: Math.round(media.top)
    };
  });

  expect(mobile.mediaPosition).toBe('relative');
  expect(mobile.mediaTop).toBeGreaterThanOrEqual(mobile.copyBottom);
});
```

- [ ] **Step 2: Запустить тест и подтвердить падение**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "background composition"
```

Expected: FAIL; `.hero__media` имеет `position: relative`, desktop inner не равен 1440×440.

- [ ] **Step 3: Реализовать desktop hero в `layout.css`**

Заменить текущие правила hero на:

```css
.hero {
  position: relative;
  min-block-size: 440px;
  background: var(--color-surface-page);
}

.hero::before {
  content: none;
}

.hero__inner {
  position: relative;
  min-block-size: 440px;
  display: block;
  overflow: hidden;
  isolation: isolate;
}

.hero__inner::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, rgb(255 255 255 / 98%) 0%, rgb(255 255 255 / 92%) 30%, rgb(255 255 255 / 58%) 48%, transparent 68%);
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: 2;
  inline-size: 680px;
  padding: 64px;
}

.hero h1 {
  max-inline-size: 620px;
  margin-block-end: 28px;
  font-size: 46px;
  line-height: 1.08;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.hero h1 span {
  display: inline-block;
  white-space: nowrap;
  color: var(--color-action-primary);
}

.hero__lead {
  max-inline-size: 620px;
  margin-block-end: 32px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.45;
}

.hero__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  inline-size: 100%;
  block-size: 100%;
  margin: 0;
}

.hero__media img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
  object-position: center right;
}
```

Удалить desktop-переопределения `.hero__inner { grid-template-columns: ... }` из media queries `74rem` и `64rem`.

- [ ] **Step 4: Реализовать mobile stacking в `responsive.css`**

В `@media (max-width: 48rem)` использовать:

```css
.hero {
  min-block-size: 0;
}

.hero__inner {
  min-block-size: 0;
  display: grid;
  overflow: visible;
}

.hero__inner::after {
  content: none;
}

.hero__content {
  inline-size: auto;
  padding: var(--space-12) 0 var(--space-8);
}

.hero h1 {
  max-inline-size: 18ch;
  font-size: clamp(2.2rem, 10.3vw, 3.3rem);
  line-height: 1.08;
}

.hero h1 span {
  white-space: normal;
}

.hero__media {
  position: relative;
  inset: auto;
  inline-size: calc(100% + (var(--page-gutter) * 2));
  block-size: 17rem;
  margin-inline: calc(var(--page-gutter) * -1);
}

.hero__media img {
  object-position: center right;
}
```

- [ ] **Step 5: Запустить geometry-тест и overflow-тесты**

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "background composition|no overflow"
```

Expected: geometry PASS и все 10 project/width overflow-проверок PASS.

- [ ] **Step 6: Зафиксировать изменение**

```powershell
git add public/assets/css/layout.css public/assets/css/responsive.css tests/e2e/landing.spec.mjs
git commit -m "feat: rebuild hero as responsive background composition"
```

---

### Task 3: Уплотнить capabilities/applications и заменить маркер галочкой

**Files:**
- Create: `public/assets/icons/check-circle.svg`
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/layout.css`
- Modify: `public/assets/css/components.css`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: `.capabilities`, `.capability`, `.applications__grid`, `.check-list li::before`.
- Produces: desktop capabilities 180 px; applications columns 30/35/35; SVG check marker.

- [ ] **Step 1: Добавить падающий layout-тест**

```js
test('compact desktop sections match the approved proportions and use check markers', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1000 });
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    const capabilities = document.querySelector('.capabilities').getBoundingClientRect();
    const appGrid = document.querySelector('.applications__grid');
    const columns = getComputedStyle(appGrid).gridTemplateColumns.split(' ').map(Number.parseFloat);
    const marker = getComputedStyle(document.querySelector('.check-list li'), '::before');
    return {
      capabilitiesHeight: Math.round(capabilities.height),
      appWidth: Math.round(appGrid.getBoundingClientRect().width),
      columnRatios: columns.map((value) => Number((value / columns.reduce((sum, item) => sum + item, 0)).toFixed(2))),
      markerMask: marker.maskImage || marker.webkitMaskImage,
      markerBackground: marker.backgroundImage
    };
  });

  expect(metrics.capabilitiesHeight).toBe(180);
  expect(metrics.appWidth).toBe(1440);
  expect(metrics.columnRatios).toEqual([0.3, 0.35, 0.35]);
  expect(metrics.markerMask).toContain('check-circle.svg');
  expect(metrics.markerBackground).toBe('none');
});
```

- [ ] **Step 2: Запустить тест и подтвердить падение**

Run:

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "compact desktop sections"
```

Expected: FAIL; capabilities выше 180 px, колонки не 30/35/35, marker использует radial-gradient.

- [ ] **Step 3: Создать точный SVG-маркер**

`public/assets/icons/check-circle.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="24" cy="24" r="19"/><path d="m15 24 6 6 13-14"/></g></svg>
```

В `components.css` заменить `.check-list li::before`:

```css
.check-list li::before {
  content: "";
  position: absolute;
  inset-block-start: 0.2em;
  inset-inline-start: 0;
  inline-size: 1rem;
  block-size: 1rem;
  background: var(--color-action-primary);
  mask: url("../icons/check-circle.svg") center / contain no-repeat;
  -webkit-mask: url("../icons/check-circle.svg") center / contain no-repeat;
}
```

- [ ] **Step 4: Уплотнить capabilities**

В `layout.css`:

```css
.capabilities {
  block-size: 180px;
  padding-block: 14px;
}

.capabilities .container {
  block-size: 100%;
}

.section-title {
  margin-block-end: 8px;
  font-size: 24px;
}

.capabilities__grid {
  block-size: 115px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.capability {
  min-block-size: 0;
  gap: 10px;
  padding: 8px 24px;
}

.feature-icon {
  inline-size: 40px;
  block-size: 40px;
}

.capability p {
  font-size: 14px;
  line-height: 1.35;
}
```

- [ ] **Step 5: Исправить proportions applications**

В `layout.css`:

```css
.applications {
  padding-block: 16px;
}

.applications__grid {
  grid-template-columns: 30% 35% 35%;
}

.applications__list,
.case-card {
  padding: 24px 32px;
}

.applications h2,
.case-card h2 {
  margin-block-end: 18px;
  font-size: 24px;
}

.case-card h3 {
  font-family: var(--font-body);
  font-size: 18px;
  line-height: 1.25;
}
```

Существующий mobile breakpoint продолжает переводить `.applications__grid` в одну колонку; tablet 1024 использует существующую двухколоночную схему.

- [ ] **Step 6: Запустить targeted и responsive-тесты**

```powershell
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "compact desktop sections|no overflow"
```

Expected: PASS на desktop/mobile projects и всех ширинах.

- [ ] **Step 7: Зафиксировать изменение**

```powershell
git add public/assets/icons/check-circle.svg public/assets/css/layout.css public/assets/css/components.css public/assets/css/responsive.css tests/e2e/landing.spec.mjs
git commit -m "feat: compact reference sections and add check markers"
```

---

### Task 4: Унифицировать 12 SVG-иконок

**Files:**
- Create: `tests/js/icon-system.test.mjs`
- Modify: `public/assets/icons/time.svg`
- Modify: `public/assets/icons/warning.svg`
- Modify: `public/assets/icons/growth.svg`
- Modify: `public/assets/icons/monitor.svg`
- Modify: `public/assets/icons/templates.svg`
- Modify: `public/assets/icons/laser.svg`
- Modify: `public/assets/icons/thread.svg`
- Modify: `public/assets/icons/layers.svg`
- Modify: `public/assets/icons/shield.svg`
- Modify: `public/assets/icons/headset.svg`
- Modify: `public/assets/icons/training.svg`
- Modify: `public/assets/icons/custom.svg`

**Interfaces:**
- Consumes: CSS mask contract `[data-icon]`.
- Produces: 12 SVG с `viewBox="0 0 48 48"`, `fill="none"`, stroke width 2, round linecap/linejoin.

- [ ] **Step 1: Добавить падающий Node-тест SVG-контракта**

`tests/js/icon-system.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const iconNames = ['time', 'warning', 'growth', 'monitor', 'templates', 'laser', 'thread', 'layers', 'shield', 'headset', 'training', 'custom'];

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
```

- [ ] **Step 2: Запустить тест и подтвердить падение**

Run:

```powershell
npm run test:js
```

Expected: FAIL на текущих иконках со stroke width 2.2 и неодинаковыми атрибутами.

- [ ] **Step 3: Заменить SVG следующими полными файлами**

```svg
<!-- time.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="22" cy="25" r="16"/><path d="M22 16v10l7 4M34 8v8h8M42 8l-7 7"/><path d="M9 39 5 43"/></g></svg>

<!-- warning.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M24 5 45 42H3L24 5Z"/><path d="M24 17v13M24 36h.01"/></g></svg>

<!-- growth.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M6 42h36M9 42V29h7v13M21 42V20h7v22M33 42V8h7v34"/><path d="m8 22 10-9 8 5L40 5M34 5h6v6"/></g></svg>

<!-- monitor.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect x="5" y="7" width="38" height="28" rx="1"/><path d="M5 31h38M18 41h12M24 35v6M13 38h22"/></g></svg>

<!-- templates.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5 15h14l4 5h20v19a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V15Z"/><path d="M10 15V9a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4v6"/></g></svg>

<!-- laser.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="24" cy="24" r="3"/><path d="M24 3v14M24 31v14M3 24h14M31 24h14M9 9l10 10M29 29l10 10M39 9 29 19M19 29 9 39"/></g></svg>

<!-- thread.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><ellipse cx="22" cy="9" rx="8" ry="4"/><path d="M14 9v23c0 2 4 4 8 4s8-2 8-4V9M14 17c4 3 12 3 16 0M14 25c4 3 12 3 16 0M10 36h24v7H10zM30 13h7c4 0 5 5 1 6l-8 2"/></g></svg>

<!-- layers.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m24 4 19 10-19 10L5 14 24 4Z"/><path d="m7 23 17 9 17-9M7 32l17 9 17-9"/></g></svg>

<!-- shield.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M24 4c6 5 12 6 18 6v13c0 10-7 17-18 21C13 40 6 33 6 23V10c6 0 12-1 18-6Z"/><path d="m16 24 5 5 11-12"/></g></svg>

<!-- headset.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M7 27v-4a17 17 0 0 1 34 0v4M7 27h6v13H9a2 2 0 0 1-2-2V27ZM41 27h-6v13h4a2 2 0 0 0 2-2V27ZM35 39c-2 4-6 5-11 5"/><circle cx="21" cy="44" r="2"/></g></svg>

<!-- training.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m24 5 21 11-21 11L3 16 24 5Z"/><path d="M11 21v13c7 6 19 6 26 0V21M44 17v16"/><circle cx="44" cy="36" r="2"/></g></svg>

<!-- custom.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19 4h10v9a5 5 0 1 0 10 0h5v10h-6a5 5 0 1 0 0 10h6v10H29v-6a5 5 0 1 0-10 0v6H4V29h7a5 5 0 1 0 0-10H4V9h15V4Z"/></g></svg>
```

- [ ] **Step 4: Запустить Node и asset-тесты**

```powershell
npm run test:js
npm run test:e2e -- tests/e2e/landing.spec.mjs --grep "optimized imagery"
```

Expected: все JS-тесты PASS, отсутствующие SVG-ресурсы не зафиксированы.

- [ ] **Step 5: Зафиксировать изменение**

```powershell
git add public/assets/icons tests/js/icon-system.test.mjs
git commit -m "feat: unify reference line icon system"
```

---

### Task 5: Визуальная сверка и полный регресс

**Files:**
- Modify: `tests/e2e/visual.spec.mjs-snapshots/desktop-1440-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/tablet-768-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/mobile-390-desktop-win32.png`

**Interfaces:**
- Consumes: завершённые CSS и SVG из Tasks 1–4.
- Produces: стабильные визуальные эталоны и подтверждённый regression status.

- [ ] **Step 1: Сгенерировать actual screenshots без обновления эталонов**

```powershell
npm run test:e2e -- tests/e2e/visual.spec.mjs
```

Expected: три desktop-project visual tests FAIL и создают `*-actual.png`; mobile-project variants SKIP по дизайну теста.

- [ ] **Step 2: Сравнить actual с пользовательскими эталонами**

Проверить вручную:

- desktop container равен 1440 px и центрирован;
- hero использует одно фоновое изображение без отдельной правой колонки;
- заголовок занимает максимум три строки;
- capabilities имеет высоту 180 px;
- applications остаётся плотной трёхколоночной секцией;
- в списке видна галочка, а не точка/квадрат;
- mobile hero выводит изображение ниже текста.

Если любой пункт не выполнен, не обновлять snapshots: вернуться к соответствующей задаче и исправить CSS под существующий failing contract.

- [ ] **Step 3: Обновить подтверждённые snapshots**

```powershell
npm run test:e2e -- tests/e2e/visual.spec.mjs --update-snapshots
```

Expected: 3 PASS, 3 SKIP.

- [ ] **Step 4: Проверить стабильность visual tests**

```powershell
npm run test:e2e -- tests/e2e/visual.spec.mjs --repeat-each=3
```

Expected: 9 PASS, 9 SKIP; расхождений по lazy-loaded изображениям нет.

- [ ] **Step 5: Запустить полный frontend regression**

```powershell
npm test
```

Expected: все JS и активные Playwright-тесты PASS; только три mobile-project visual cases SKIP.

- [ ] **Step 6: Запустить PHP regression и lint**

```powershell
$phpExe = 'C:\php\php.exe'
Get-ChildItem tests/php/*.test.php | ForEach-Object { & $phpExe -c tools/php.ini -d zend.assertions=1 -d assert.exception=1 $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
Get-ChildItem public,server -Recurse -Filter *.php | ForEach-Object { & $phpExe -c tools/php.ini -l $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

Expected: 4 PHP test scripts PASS; 8 PHP files report `No syntax errors detected`.

- [ ] **Step 7: Проверить чистоту diff и зафиксировать visual release**

```powershell
git diff --check
git status --short
git add tests/e2e/visual.spec.mjs-snapshots
git commit -m "test: approve rebuilt responsive visual baselines"
```

Expected: `git diff --check` без вывода; после коммита рабочее дерево чистое.
