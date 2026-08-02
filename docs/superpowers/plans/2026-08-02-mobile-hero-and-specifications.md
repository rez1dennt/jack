# Mobile Hero and Specifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make hero actions visually consistent on phones and expose both machine models in every specifications row without horizontal scrolling.

**Architecture:** Preserve the current HTML table and desktop CSS, adding only model metadata to value cells. At the `30rem` breakpoint, CSS converts the hero action row into a full-width grid and the specifications table into two-column comparison cards while retaining table semantics and source order.

**Tech Stack:** Static HTML5, project design-token CSS, Playwright end-to-end tests, existing GitHub Pages build script.

## Global Constraints

- Mobile behavior applies at widths up to `30rem`; tablet and desktop geometry must remain unchanged.
- Both hero controls retain their existing link/button behavior, focus styles, and minimum `2.75rem` touch target.
- Each specifications card shows one parameter and both Jack MS-100A and Jack JK-T2210 values without horizontal scrolling.
- No JavaScript or new dependency is introduced.
- Existing typography, copy, product data, imagery, section ordering, product benefits, and download panel remain unchanged.

---

### Task 1: Mobile hero CTA stack

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: existing `.hero__actions` and `.button` elements.
- Produces: a one-column, equal-width CTA group at phone widths.

- [ ] **Step 1: Write the failing geometry test**

Add a Playwright test that uses a `430 × 932` viewport and reads both action rectangles:

```js
test('mobile hero actions form one equal-width CTA stack', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto('/');

  const geometry = await page.locator('.hero__actions .button').evaluateAll((buttons) => {
    const rects = buttons.map((button) => button.getBoundingClientRect());
    return {
      widths: rects.map(({ width }) => Math.round(width)),
      lefts: rects.map(({ left }) => Math.round(left)),
      heights: rects.map(({ height }) => Math.round(height)),
      verticalGap: Math.round(rects[1].top - rects[0].bottom)
    };
  });

  expect(geometry.widths[0]).toBe(geometry.widths[1]);
  expect(geometry.lefts[0]).toBe(geometry.lefts[1]);
  expect(geometry.heights.every((height) => height >= 48)).toBe(true);
  expect(geometry.verticalGap).toBe(12);
});
```

- [ ] **Step 2: Run the test and verify the current layout fails**

Run: `npx playwright test tests/e2e/landing.spec.mjs -g "mobile hero actions" --reporter=line`

Expected: FAIL because the current `24.375rem` rule does not normalize the controls at a `430px` phone width.

- [ ] **Step 3: Implement the mobile CTA grid**

Inside the existing `@media (max-width: 30rem)` block, add:

```css
.hero__actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
  inline-size: 100%;
}

.hero__actions .button {
  inline-size: 100%;
  min-block-size: var(--control-height);
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npx playwright test tests/e2e/landing.spec.mjs -g "mobile hero actions" --reporter=line`

Expected: PASS with two equal-width controls separated by `12px`.

---

### Task 2: Mobile specifications comparison cards

**Files:**
- Modify: `public/index.html`
- Modify: `public/assets/css/responsive.css`
- Modify: `tests/e2e/landing.spec.mjs`

**Interfaces:**
- Consumes: the existing three-column semantic specifications table.
- Produces: `data-model` labels on value cells and a two-value mobile card layout without overflow.

- [ ] **Step 1: Write the failing mobile comparison test**

```js
test('mobile specifications show both models without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const firstRow = page.locator('.specifications tbody tr').first();
  await expect(firstRow.locator('td')).toHaveText(['220 × 100 мм', '300 × 200 мм']);

  const geometry = await page.evaluate(() => {
    const wrapper = document.querySelector('.specifications .table-scroll');
    const row = document.querySelector('.specifications tbody tr');
    const cells = [...row.children].map((cell) => getComputedStyle(cell));
    return {
      overflows: wrapper.scrollWidth > wrapper.clientWidth + 1,
      rowColumns: getComputedStyle(row).gridTemplateColumns.split(' ').length,
      parameterColumn: cells[0].gridColumn,
      labels: [...row.querySelectorAll('td')].map((cell) => cell.dataset.model)
    };
  });

  expect(geometry).toEqual({
    overflows: false,
    rowColumns: 2,
    parameterColumn: '1 / -1',
    labels: ['Jack MS-100A', 'Jack JK-T2210']
  });
});
```

- [ ] **Step 2: Run the test and verify the current table fails**

Run: `npx playwright test tests/e2e/landing.spec.mjs -g "mobile specifications" --reporter=line`

Expected: FAIL because the table has `min-inline-size: 38rem`, horizontal overflow, and no mobile model metadata.

- [ ] **Step 3: Add explicit model metadata to all value cells**

For every specifications body row, keep the text unchanged and mark the values:

```html
<td data-model="Jack MS-100A">220 × 100 мм</td>
<td data-model="Jack JK-T2210">300 × 200 мм</td>
```

- [ ] **Step 4: Implement the mobile card transformation**

Inside `@media (max-width: 30rem)`, make the wrapper non-scrolling, hide only the visual table header, and turn each row into a two-column card:

```css
.specifications .table-scroll {
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.specifications table,
.specifications thead,
.specifications tbody {
  display: block;
  min-inline-size: 0;
}

.specifications thead {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.specifications tbody {
  display: grid;
  gap: var(--space-3);
}

.specifications tbody tr {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  overflow: hidden;
  border: var(--border-thin) solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-whisper);
}

.specifications tbody th {
  grid-column: 1 / -1;
  padding: var(--space-3);
  border-inline-end: 0;
  background: var(--color-surface-subtle);
}

.specifications tbody td {
  min-inline-size: 0;
  padding: var(--space-3);
  white-space: normal;
  overflow-wrap: anywhere;
}

.specifications tbody td::before {
  content: attr(data-model);
  display: block;
  margin-block-end: var(--space-2);
  color: var(--color-accent-foreground);
  font-size: var(--font-size-2xs);
  font-weight: 600;
}
```

- [ ] **Step 5: Run both focused mobile tests**

Run: `npx playwright test tests/e2e/landing.spec.mjs -g "mobile hero actions|mobile specifications" --reporter=line`

Expected: 2 tests pass.

---

### Task 3: Regression, build, and publication

**Files:**
- Modify through build: root `index.html`, `assets/css/responsive.css`, and versioned root assets generated by `scripts/build-pages.mjs`.

**Interfaces:**
- Consumes: verified files in `public/`.
- Produces: static GitHub Pages output at the repository root.

- [ ] **Step 1: Run JavaScript and landing-page regression tests**

Run: `npm run test:js`

Expected: all JavaScript tests pass.

Run: `npx playwright test tests/e2e/landing.spec.mjs --reporter=line`

Expected: all landing-page tests pass, including the unchanged desktop specifications geometry test.

- [ ] **Step 2: Build the versioned Pages output**

Run: `npm run build:pages -- --asset-version mobile-20260802-1`

Expected: `.pages-dist/index.html` and versioned assets are created with repository-relative `/jack/` paths.

- [ ] **Step 3: Copy the verified build to the repository root**

Replace the root `assets/` directory with `.pages-dist/assets/` only after resolving and validating the absolute target path, then copy the generated root HTML and support files.

- [ ] **Step 4: Validate generated paths and run focused tests against the copied root**

Run the existing static build validations and search generated SVG/CSS/HTML for malformed `/jack/>` references.

Expected: zero malformed references and all local asset URLs resolve.

- [ ] **Step 5: Commit and push**

```bash
git add public/index.html public/assets/css/responsive.css tests/e2e/landing.spec.mjs index.html assets docs/superpowers/plans/2026-08-02-mobile-hero-and-specifications.md
git commit -m "fix: improve mobile hero and specifications"
git push origin HEAD:main
```

- [ ] **Step 6: Verify the published page**

Open `https://rez1dennt.github.io/jack/` at `390 × 844` and `430 × 932`, inspect the hero and specifications, confirm both model columns remain visible, verify there is no horizontal page overflow, and confirm no browser console errors.
