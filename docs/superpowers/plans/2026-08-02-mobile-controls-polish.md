# Mobile Controls Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add breathing room below the mobile hero CTAs, make the technical-sheet button readable without squashed SVGs, and thicken the mobile burger strokes.

**Architecture:** Keep the current semantic HTML and interaction code. Add three token-driven overrides to the existing responsive stylesheet, scoped to the current phone/tablet breakpoints, and protect the geometry with Playwright tests.

**Tech Stack:** Static HTML, vanilla token-driven CSS, Playwright, existing GitHub Pages build script.

## Global Constraints

- Do not change visible copy, icon assets, button actions, menu behavior, animation timing, or desktop geometry.
- Up to `30rem`, create a `16px` hero-to-image gap through `var(--space-4)`.
- Up to `30rem`, the technical-sheet button keeps both icons at `24 × 24px` and displays its title on one line at `390px`.
- Up to `48rem`, all three burger strokes are `2px` thick through `calc(var(--border-thin) * 2)`.
- Use existing design tokens only; add no JavaScript or dependency.

---

### Task 1: Hero CTA breathing room

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: `.hero__actions` and `.hero__media` geometry.
- Produces: a tokenized `16px` gap after the mobile CTA stack.

- [ ] **Step 1: Write the failing test**

```js
test('mobile hero leaves breathing room after the CTA stack', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const gap = await page.evaluate(() => {
    const lastAction = document.querySelector('.hero__actions .button:last-child').getBoundingClientRect();
    const media = document.querySelector('.hero__media').getBoundingClientRect();
    return Math.round(media.top - lastAction.bottom);
  });

  expect(gap).toBe(16);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npx playwright test tests/e2e/landing.spec.mjs -g "breathing room" --reporter=line`

Expected: FAIL because the current gap is `0px`.

- [ ] **Step 3: Add the minimal phone override**

Inside `@media (max-width: 30rem)`:

```css
.hero__actions {
  margin-block-end: var(--space-4);
}
```

- [ ] **Step 4: Re-run and verify GREEN**

Run the same command. Expected: 2 Playwright projects pass.

---

### Task 2: Technical-sheet button layout

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: `.button--download`, its two `[data-icon]` children, and `.specifications__download-copy`.
- Produces: a stable `24px / fluid text / 24px` grid with controlled mobile typography.

- [ ] **Step 1: Write the failing test**

```js
test('mobile technical-sheet button keeps copy readable and icons full size', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const geometry = await page.locator('.button--download').evaluate((button) => {
    const lineCount = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    };
    const icons = [...button.querySelectorAll(':scope > [data-icon]')].map((icon) => {
      const rect = icon.getBoundingClientRect();
      return [Math.round(rect.width), Math.round(rect.height)];
    });
    return {
      icons,
      titleLines: lineCount(button.querySelector('strong')),
      detailLines: lineCount(button.querySelector('small'))
    };
  });

  expect(geometry.icons).toEqual([[24, 24], [24, 24]]);
  expect(geometry.titleLines).toBe(1);
  expect(geometry.detailLines).toBeLessThanOrEqual(2);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npx playwright test tests/e2e/landing.spec.mjs -g "technical-sheet button" --reporter=line`

Expected: FAIL because the title/supporting text wrap too deeply and the auto grid can compress the trailing SVG.

- [ ] **Step 3: Add the minimal phone layout**

Inside `@media (max-width: 30rem)`:

```css
.button--download {
  grid-template-columns: var(--space-6) minmax(0, 1fr) var(--space-6);
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.button--download > [data-icon] {
  min-inline-size: var(--space-6);
  inline-size: var(--space-6);
  block-size: var(--space-6);
}

.specifications__download-copy {
  min-inline-size: 0;
}

.specifications__download-copy strong {
  font-size: var(--font-size-xs);
  line-height: 1.25;
}

.specifications__download-copy small {
  font-size: var(--font-size-2xs);
  line-height: 1.3;
}
```

- [ ] **Step 4: Re-run and verify GREEN**

Run the same command. Expected: 2 Playwright projects pass.

---

### Task 3: Burger stroke weight

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: `.menu-button__lines` and its `::before`/`::after` strokes.
- Produces: three consistent `2px` rounded strokes without changing the menu animation.

- [ ] **Step 1: Write the failing test**

```js
test('mobile burger uses three confident two-pixel strokes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const strokes = await page.locator('.menu-button__lines').evaluate((lines) => [
    getComputedStyle(lines).blockSize,
    getComputedStyle(lines, '::before').blockSize,
    getComputedStyle(lines, '::after').blockSize
  ]);

  expect(strokes).toEqual(['2px', '2px', '2px']);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npx playwright test tests/e2e/landing.spec.mjs -g "two-pixel strokes" --reporter=line`

Expected: FAIL with three current `1px` values.

- [ ] **Step 3: Update the shared mobile stroke rule**

```css
.menu-button__lines,
.menu-button__lines::before,
.menu-button__lines::after {
  block-size: calc(var(--border-thin) * 2);
  border-radius: var(--radius-xs);
}
```

- [ ] **Step 4: Re-run and verify GREEN**

Run the same command. Expected: 2 Playwright projects pass.

---

### Task 4: Regression, Pages build, and publication

**Files:**
- Regenerate: root `index.html`, legal pages, manifest, and `assets/` through `scripts/build-pages.mjs`.

**Interfaces:**
- Consumes: verified `public/` source.
- Produces: cache-versioned GitHub Pages output.

- [ ] **Step 1: Run regressions**

Run: `npm run test:js`

Run: `npx playwright test tests/e2e/landing.spec.mjs tests/e2e/visual.spec.mjs tests/e2e/quality.spec.mjs --reporter=line`

Expected: zero failures; update only intentionally changed mobile/tablet snapshots.

- [ ] **Step 2: Build and validate Pages**

Run: `npm run build:pages -- --asset-version controls-20260802-1`

Expected: generated HTML references `controls-20260802-1`; all icon SVGs remain well-formed; no malformed `/jack/>` URL exists.

- [ ] **Step 3: Copy generated output to the repository root**

Resolve and verify the root `assets/` path, replace it with `.pages-dist/assets/`, and copy generated root files.

- [ ] **Step 4: Commit and push**

```bash
git add -u
git commit -m "fix: polish mobile controls"
git push origin HEAD:main
```

- [ ] **Step 5: Verify live**

Open `https://rez1dennt.github.io/jack/`, confirm the `controls-20260802-1` stylesheet is active, the mobile selectors exist, and remote `main` equals local `HEAD`.
