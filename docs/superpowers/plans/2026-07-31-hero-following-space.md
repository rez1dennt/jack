# Hero Following Space Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an adaptive visual gap of 48 px, 32 px, and 24 px between the hero and the following problem/solution card.

**Architecture:** The gap belongs to `.problem-solution-section`, so hero height and background composition stay unchanged. A semantic root token provides the desktop value and existing responsive breakpoints override it for tablet and mobile widths.

**Tech Stack:** HTML5, tokenized CSS, Playwright end-to-end and visual regression tests.

## Global Constraints

- Keep the hero height, image positioning, and internal padding unchanged.
- Keep the problem/solution card inside the existing 1440 px container.
- Use exactly 48 px on desktop, 32 px on tablet, and 24 px on mobile.
- Preserve zero horizontal overflow down to 280 px.
- Do not introduce new dependencies.

---

### Task 1: Implement and verify the adaptive hero transition

**Files:**
- Modify: `tests/e2e/landing.spec.mjs:376`
- Modify: `public/assets/css/tokens.css:132-138`
- Modify: `public/assets/css/layout.css:128-134`
- Modify: `public/assets/css/responsive.css:20-24,467-471`

**Interfaces:**
- Consumes: `.hero`, `.problem-solution`, the existing spacing scale, and the 64 rem / 30 rem responsive breakpoints.
- Produces: `--hero-following-space`, used by `.problem-solution-section` as its logical block-start padding.

- [ ] **Step 1: Write the failing geometry test**

Add this test near the existing problem/solution geometry tests:

```js
test('hero transition uses the approved responsive spacing', async ({ page }) => {
  for (const [width, expectedGap] of [[1440, 48], [768, 32], [390, 24]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const gap = await page.evaluate(() => {
      const hero = document.querySelector('.hero').getBoundingClientRect();
      const card = document.querySelector('.problem-solution').getBoundingClientRect();
      return Math.round(card.top - hero.bottom);
    });

    expect(gap).toBe(expectedGap);
  }
});
```

- [ ] **Step 2: Run the test and verify RED**

Run in PowerShell:

```powershell
$env:TEMP='C:\Users\bahti\.codex\visualizations\2026\07\31\019fb840-fd3a-7373-b5d4-b60536acd26e\playwright-cache'
$env:TMP=$env:TEMP
npx playwright test tests/e2e/landing.spec.mjs --grep 'hero transition uses'
```

Expected: FAIL because the measured gaps are `0` before the spacing token is implemented.

- [ ] **Step 3: Add the semantic token and desktop spacing**

In `public/assets/css/tokens.css`, next to the container and section spacing tokens, add:

```css
--hero-following-space: var(--space-12);
```

In `public/assets/css/layout.css`, add:

```css
.problem-solution-section {
  padding-block-start: var(--hero-following-space);
}
```

- [ ] **Step 4: Add tablet and mobile overrides**

Inside `@media (max-width: 64rem)` in `public/assets/css/responsive.css`, extend `:root` with:

```css
--hero-following-space: var(--space-8);
```

Inside `@media (max-width: 30rem)`, add:

```css
:root {
  --hero-following-space: var(--space-6);
}
```

- [ ] **Step 5: Run focused geometry and overflow tests and verify GREEN**

```powershell
$env:TEMP='C:\Users\bahti\.codex\visualizations\2026\07\31\019fb840-fd3a-7373-b5d4-b60536acd26e\playwright-cache'
$env:TMP=$env:TEMP
npx playwright test tests/e2e/landing.spec.mjs --grep 'hero transition uses|no overflow'
```

Expected: all spacing and overflow tests pass in desktop and mobile Playwright projects.

- [ ] **Step 6: Commit the behavior change**

```bash
git add public/assets/css/tokens.css public/assets/css/layout.css public/assets/css/responsive.css tests/e2e/landing.spec.mjs
git commit -m "feat: add spacing after hero"
```

### Task 2: Approve visual baselines and run the full regression suite

**Files:**
- Modify: `tests/e2e/visual.spec.mjs-snapshots/desktop-1440-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/tablet-768-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/mobile-390-desktop-win32.png`

**Interfaces:**
- Consumes: the implemented adaptive spacing and existing full-page visual test.
- Produces: updated approved screenshots for 1440, 768, and 390 px.

- [ ] **Step 1: Regenerate deterministic visual baselines**

```powershell
$env:TEMP='C:\Users\bahti\.codex\visualizations\2026\07\31\019fb840-fd3a-7373-b5d4-b60536acd26e\playwright-cache'
$env:TMP=$env:TEMP
npx playwright test tests/e2e/visual.spec.mjs --update-snapshots
```

Expected: 3 visual tests pass and 3 duplicate mobile-project snapshots are skipped.

- [ ] **Step 2: Inspect all three regenerated screenshots**

Confirm that only the intended white separation after hero changes, while the hero image, problem/solution card, and all later sections retain their proportions.

- [ ] **Step 3: Run the full regression suite**

```powershell
$env:TEMP='C:\Users\bahti\.codex\visualizations\2026\07\31\019fb840-fd3a-7373-b5d4-b60536acd26e\playwright-cache'
$env:TMP=$env:TEMP
npm test
```

Expected: 6 JavaScript tests pass; 97 Playwright tests pass, 3 expected visual-project tests skip, and no tests fail.

- [ ] **Step 4: Verify repository hygiene**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and only the three approved visual snapshots remain uncommitted.

- [ ] **Step 5: Commit visual approval**

```bash
git add tests/e2e/visual.spec.mjs-snapshots/desktop-1440-desktop-win32.png tests/e2e/visual.spec.mjs-snapshots/tablet-768-desktop-win32.png tests/e2e/visual.spec.mjs-snapshots/mobile-390-desktop-win32.png
git commit -m "test: approve spacing after hero"
```
