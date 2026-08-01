# Sticky Header and Gridless Lead Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the main header visible with a subtle shadow and remove the decorative grid from the consultation CTA panel.

**Architecture:** Implement both visual behaviors in the existing token and layout stylesheets, with no JavaScript or markup changes. Protect the behavior with focused Playwright tests, then update the three deterministic full-page visual baselines after functional verification.

**Tech Stack:** HTML5, vanilla CSS custom properties, Playwright end-to-end tests, PHP local development server.

## Global Constraints

- Remove only the grid-line overlay from `.lead-panel`.
- Preserve the CTA photograph, dark gradient overlay, copy, form, border, radius, shadow, and spacing.
- Use `position: sticky` with `inset-block-start: 0` on desktop, tablet, and mobile.
- Preserve the current responsive header heights, navigation layout, burger-menu stacking, and scroll-lock behavior.
- Add an always-present subtle header shadow without changing header dimensions.
- Keep the existing `scroll-padding-top: var(--header-height)` anchor compensation.
- Do not add JavaScript, dependencies, compact-on-scroll behavior, or hide-on-scroll behavior.

---

## File Structure

- `public/assets/css/tokens.css`: owns the semantic header-shadow token and removes obsolete lead-grid tokens.
- `public/assets/css/layout.css`: owns the cross-breakpoint sticky header and lead-panel overlay composition.
- `public/assets/css/responsive.css`: removes mobile-only rules made redundant by the cross-breakpoint implementation.
- `tests/e2e/landing.spec.mjs`: owns functional and computed-style regression tests for both changes.
- `tests/e2e/visual.spec.mjs-snapshots/*.png`: records approved desktop, tablet, and mobile visual output.

### Task 1: Keep the header visible on every viewport

**Files:**
- Modify: `tests/e2e/landing.spec.mjs:203`
- Modify: `public/assets/css/tokens.css:195-197`
- Modify: `public/assets/css/layout.css:1-7`
- Modify: `public/assets/css/responsive.css:117-120`

**Interfaces:**
- Consumes: existing `--header-height`, `.site-header`, mobile navigation z-index values, and document `scroll-padding-top`.
- Produces: `--shadow-header` CSS token and a cross-breakpoint `.site-header` contract with `position: sticky`, `inset-block-start: 0`, and a non-none `box-shadow`.

- [ ] **Step 1: Write the failing header behavior test**

Add this test before the existing mobile-menu test in `tests/e2e/landing.spec.mjs`:

```js
test('site header stays pinned with a subtle shadow on every viewport', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const header = page.locator('.site-header');
    const styles = await header.evaluate((node) => {
      const computed = getComputedStyle(node);
      return {
        position: computed.position,
        top: computed.top,
        shadow: computed.boxShadow
      };
    });

    expect(styles.position).toBe('sticky');
    expect(styles.top).toBe('0px');
    expect(styles.shadow).not.toBe('none');

    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(header).toBeInViewport();
    const box = await header.boundingBox();
    expect(Math.abs(box?.y ?? 999)).toBeLessThanOrEqual(1);
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --project=desktop -g "site header stays pinned"
```

Expected: FAIL on the 1440px case because `.site-header` computes to `position: relative` and `box-shadow: none`.

- [ ] **Step 3: Add the semantic shadow token**

Add beside the existing shadow tokens in `public/assets/css/tokens.css`:

```css
--shadow-header: 0 0.25rem 1rem rgb(17 24 32 / 8%);
```

- [ ] **Step 4: Implement the cross-breakpoint sticky header**

Replace the opening `.site-header` rule in `public/assets/css/layout.css` with:

```css
.site-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 40;
  min-block-size: var(--header-height);
  background: var(--color-surface-page);
  border-block-end: var(--border-thin) solid var(--color-border-subtle);
  box-shadow: var(--shadow-header);
}
```

Delete this now-redundant block from the `max-width: 48rem` query in `public/assets/css/responsive.css`:

```css
.site-header {
  position: sticky;
  inset-block-start: 0;
}
```

- [ ] **Step 5: Run header and mobile-menu tests and verify GREEN**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --project=desktop -g "site header stays pinned|mobile menu opens accessibly"
```

Expected: 2 passed. The header remains at viewport y=0 at 1440px and 390px, and the burger menu still opens without horizontal movement.

- [ ] **Step 6: Commit the header change**

```powershell
git add tests/e2e/landing.spec.mjs public/assets/css/tokens.css public/assets/css/layout.css public/assets/css/responsive.css
git commit -m "feat: keep site header visible while scrolling"
```

### Task 2: Remove the CTA grid without changing its overlay

**Files:**
- Modify: `tests/e2e/landing.spec.mjs:509-543`
- Modify: `public/assets/css/tokens.css:169-170`
- Modify: `public/assets/css/layout.css:635-655`
- Modify: `public/assets/css/responsive.css:383-386`

**Interfaces:**
- Consumes: `.lead-panel`, `--lead-panel-overlay`, `--lead-panel-overlay-mobile`, and `.lead-section__inner` stacking.
- Produces: one overlay layer on `.lead-panel::before`; `.lead-panel::after` has no generated content and no background image.

- [ ] **Step 1: Write the failing lead-panel layer test**

Add this test after the existing CTA copy-contract test in `tests/e2e/landing.spec.mjs`:

```js
test('consultation panel keeps its contrast overlay without a decorative grid', async ({ page }) => {
  await page.goto('/');

  const layers = await page.locator('.lead-panel').evaluate((node) => {
    const before = getComputedStyle(node, '::before');
    const after = getComputedStyle(node, '::after');
    return {
      beforeContent: before.content,
      beforeBackgroundImage: before.backgroundImage,
      afterContent: after.content,
      afterBackgroundImage: after.backgroundImage
    };
  });

  expect(layers.beforeContent).not.toBe('none');
  expect(layers.beforeBackgroundImage).not.toBe('none');
  expect(layers.afterContent).toBe('none');
  expect(layers.afterBackgroundImage).toBe('none');
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --project=desktop -g "without a decorative grid"
```

Expected: FAIL because `.lead-panel::after` currently has generated content and two linear-gradient background images.

- [ ] **Step 3: Remove the grid pseudo-element while preserving the contrast overlay**

Replace the grouped pseudo-element rules in `public/assets/css/layout.css` with:

```css
.lead-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--lead-panel-overlay);
  pointer-events: none;
}
```

Delete the complete `.lead-panel::after` rule. Delete these obsolete tokens from `public/assets/css/tokens.css`:

```css
--lead-grid-line: rgb(255 255 255 / 7%);
--lead-grid-clip: inset(0 44% 0 0);
```

Delete the obsolete mobile rule from `public/assets/css/responsive.css`:

```css
.lead-panel::after {
  clip-path: none;
  opacity: 0.5;
}
```

- [ ] **Step 4: Run the CTA functional and responsive tests and verify GREEN**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --project=desktop -g "Industrial Control Room CTA|consultation panel keeps"
```

Expected: 3 passed. The grid is absent, the contrast overlay remains, and the CTA container, media, columns, radius, and form width retain their approved geometry.

- [ ] **Step 5: Commit the grid removal**

```powershell
git add tests/e2e/landing.spec.mjs public/assets/css/tokens.css public/assets/css/layout.css public/assets/css/responsive.css
git commit -m "style: remove consultation panel grid"
```

### Task 3: Approve responsive visuals and run the complete regression suite

**Files:**
- Modify: `tests/e2e/visual.spec.mjs-snapshots/desktop-1440-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/tablet-768-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/mobile-390-desktop-win32.png`

**Interfaces:**
- Consumes: completed header and lead-panel CSS behavior from Tasks 1 and 2.
- Produces: approved visual baselines and verified responsive output at 1440px, 768px, and 390px.

- [ ] **Step 1: Run all non-visual functional tests**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --project=desktop
```

Expected: all landing tests pass with zero failures.

- [ ] **Step 2: Update the deterministic visual baselines**

Run:

```powershell
npx playwright test tests/e2e/visual.spec.mjs --project=desktop --update-snapshots
```

Expected: 3 passed and the desktop, tablet, and mobile PNG baselines are updated.

- [ ] **Step 3: Inspect the three updated images**

Open each PNG and verify all of the following:

- The CTA grid lines are absent at 1440px, 768px, and 390px.
- The CTA photograph, gradient, form, border, radius, and spacing are unchanged.
- The header keeps its current height and has only a subtle shadow.
- No content is clipped and no horizontal overflow appears.

Expected: all four checks pass for every baseline. If any check fails, correct the CSS and repeat Steps 1-3 before continuing.

- [ ] **Step 4: Run the complete project test suite**

Run:

```powershell
npm test
```

Expected: JavaScript unit tests and all Playwright projects pass; visual tests in the mobile project remain intentionally skipped by their existing guard.

- [ ] **Step 5: Reload and visually verify the live local site**

Open `http://127.0.0.1:8080/`, reload it, scroll from the hero to the consultation form, and open then close the mobile burger menu at 390px.

Expected: the header stays visible with no jump, the CTA has no grid, anchor targets remain below the header, and the burger overlay stays above page content.

- [ ] **Step 6: Commit the approved visual baselines**

```powershell
git add tests/e2e/visual.spec.mjs-snapshots
git commit -m "test: approve sticky header and gridless lead visuals"
```
