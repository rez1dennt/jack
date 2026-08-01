# Hero Content Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all hero copy and actions with the shared container edge while retaining only responsive top padding.

**Architecture:** Change only the existing `.hero__content` padding declarations in the shared and mobile CSS rules. Protect the contract with one computed-geometry Playwright test across desktop, tablet, and mobile, then approve visual diffs and push the clean branch to `origin/main`.

**Tech Stack:** Vanilla CSS custom properties, Playwright end-to-end and visual regression tests, Git.

## Global Constraints

- Desktop top padding remains `var(--space-16)` (`64px`).
- Tablet/mobile top padding remains `var(--space-12)` (`48px`).
- Inline and bottom padding are `0` at every breakpoint.
- The shared `.container` remains responsible for page gutters.
- Hero typography, copy width, image crop, overlay, actions, section gap, and header remain unchanged.

---

### Task 1: Align hero content to the container

**Files:**
- Modify: `tests/e2e/landing.spec.mjs:311`
- Modify: `public/assets/css/layout.css:79-83`
- Modify: `public/assets/css/responsive.css:248-251`

**Interfaces:**
- Consumes: `.hero__inner`, `.hero__content`, `--space-16`, `--space-12`, and the existing `48rem` breakpoint.
- Produces: a responsive geometry contract where `.hero__content.left === .hero__inner.left` and only padding-block-start is non-zero.

- [ ] **Step 1: Write the failing responsive geometry test**

Add before the existing hero-media test in `tests/e2e/landing.spec.mjs`:

```js
test('hero copy aligns with the container and keeps only responsive top padding', async ({ page }) => {
  for (const [width, expectedTop] of [[1900, 64], [768, 48], [390, 48]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const geometry = await page.evaluate(() => {
      const inner = document.querySelector('.hero__inner').getBoundingClientRect();
      const content = document.querySelector('.hero__content');
      const contentRect = content.getBoundingClientRect();
      const style = getComputedStyle(content);
      return {
        innerLeft: Math.round(inner.left),
        contentLeft: Math.round(contentRect.left),
        paddingTop: Number.parseFloat(style.paddingTop),
        paddingRight: Number.parseFloat(style.paddingRight),
        paddingBottom: Number.parseFloat(style.paddingBottom),
        paddingLeft: Number.parseFloat(style.paddingLeft),
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      };
    });

    expect(geometry.contentLeft).toBe(geometry.innerLeft);
    expect(geometry.paddingTop).toBe(expectedTop);
    expect(geometry.paddingRight).toBe(0);
    expect(geometry.paddingBottom).toBe(0);
    expect(geometry.paddingLeft).toBe(0);
    expect(geometry.scrollWidth).toBe(geometry.viewportWidth);
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --project=desktop -g "hero copy aligns"
```

Expected: FAIL at 1900px because content is offset by the current 64px left padding; after that is corrected, the current mobile 32px bottom padding would also fail.

- [ ] **Step 3: Implement the minimal desktop rule**

Replace the `.hero__content` padding in `public/assets/css/layout.css` with:

```css
.hero__content {
  position: relative;
  inline-size: var(--hero-copy-width);
  padding: var(--space-16) 0 0;
}
```

- [ ] **Step 4: Implement the minimal tablet/mobile rule**

Replace the responsive `.hero__content` rule in `public/assets/css/responsive.css` with:

```css
.hero__content {
  inline-size: auto;
  padding: var(--space-12) 0 0;
}
```

- [ ] **Step 5: Run focused hero tests and verify GREEN**

Run:

```powershell
npx playwright test tests/e2e/landing.spec.mjs --project=desktop -g "hero copy aligns|hero media spans|hero transition"
```

Expected: 3 passed. The copy aligns at 1900/768/390px, media composition remains approved, and spacing after hero remains 48/32/24px.

- [ ] **Step 6: Commit the functional change**

```powershell
git add tests/e2e/landing.spec.mjs public/assets/css/layout.css public/assets/css/responsive.css
git commit -m "style: align hero copy with site container"
```

### Task 2: Approve responsive visuals, verify, and publish

**Files:**
- Modify: `tests/e2e/visual.spec.mjs-snapshots/desktop-1440-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/tablet-768-desktop-win32.png`
- Modify: `tests/e2e/visual.spec.mjs-snapshots/mobile-390-desktop-win32.png`

**Interfaces:**
- Consumes: Task 1 hero alignment contract.
- Produces: approved desktop/tablet/mobile baselines and a verified `origin/main` matching local `HEAD`.

- [ ] **Step 1: Update visual baselines**

```powershell
npx playwright test tests/e2e/visual.spec.mjs --project=desktop --update-snapshots
```

Expected: 3 passed with intentional hero alignment updates.

- [ ] **Step 2: Inspect all three baselines**

Verify the hero copy and buttons align to the container edge, only top breathing room remains, the image and overlay are unchanged, and no content clips at 1440/768/390px.

- [ ] **Step 3: Run the complete regression suite**

```powershell
npm test
```

Expected: all unit and Playwright tests pass; the three mobile-project visual tests remain intentionally skipped.

- [ ] **Step 4: Reload the live site and inspect desktop and mobile geometry**

Reload `http://127.0.0.1:8080/`, verify computed hero padding and left alignment, then leave the updated site open at the normal viewport.

- [ ] **Step 5: Commit visual baselines**

```powershell
git add tests/e2e/visual.spec.mjs-snapshots
git commit -m "test: approve aligned hero visuals"
```

- [ ] **Step 6: Push the final HEAD to main and verify the remote SHA**

```powershell
git push origin HEAD:main
git ls-remote origin refs/heads/main
git rev-parse HEAD
```

Expected: push succeeds and the remote `main` SHA exactly equals local `HEAD`.
