# Logo Alpha Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the opaque white lower-corner artifacts from the shared Textileopttorg WebP logo without changing its layout or artwork.

**Architecture:** Keep the existing HTML and CSS untouched. Add a browser-level regression test that decodes the real asset, correct only the asset alpha channel with ImageMagick, then rebuild and publish the static GitHub Pages output.

**Tech Stack:** ImageMagick 7, WebP, Node test runner, Playwright, vanilla HTML/CSS.

## Global Constraints

- Keep `public/assets/images/textileopttorg-logo.webp` at exactly `800 × 434`.
- Preserve the logo's opaque white interior and red outline.
- All four outer canvas corners must have alpha `0`.
- Keep the asset below `180000` bytes.
- Do not modify HTML or layout CSS.

---

### Task 1: Add the alpha-channel regression test

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Test: `tests/e2e/landing.spec.mjs`

**Interfaces:**
- Consumes: `/assets/images/textileopttorg-logo.webp`
- Produces: a Playwright assertion over decoded corner and interior alpha values

- [ ] **Step 1: Write the failing test**

Add a test that creates an `Image`, draws it to a same-size canvas, reads alpha at `(0,0)`, `(799,0)`, `(0,433)`, `(799,433)`, and `(400,390)`, then expects the four corners to equal `0` and the interior to be at least `250`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/landing.spec.mjs --grep "transparent outside" --workers=1`

Expected: FAIL because the two lower corner alpha values are opaque.

- [ ] **Step 3: Commit the failing regression test together with the fix after green**

Do not commit the test alone; keep the repository buildable and commit it with Task 2.

### Task 2: Correct the WebP alpha channel

**Files:**
- Modify: `public/assets/images/textileopttorg-logo.webp`
- Test: `tests/e2e/landing.spec.mjs`

**Interfaces:**
- Consumes: the current decoded logo pixels
- Produces: the same `800 × 434` logo with transparent exterior lower corners

- [ ] **Step 1: Make the minimal image change**

Decode the existing WebP, enable alpha, flood-fill transparent pixels from `(0,433)` and `(799,433)` with conservative white tolerance, strip metadata, and encode lossless WebP to a temporary file before replacing the public asset.

- [ ] **Step 2: Verify image invariants**

Run `magick identify` and pixel inspection to confirm `800 × 434`, TrueColorAlpha, transparent corners, opaque interior, and a file size below `180000` bytes.

- [ ] **Step 3: Run the focused test to verify it passes**

Run: `npx playwright test tests/e2e/landing.spec.mjs --grep "transparent outside" --workers=1`

Expected: 1 passed, 0 failed.

- [ ] **Step 4: Commit the asset and regression test**

Commit message: `fix: clean logo lower corners`

### Task 3: Rebuild, verify, and publish

**Files:**
- Modify: generated root GitHub Pages output containing the corrected asset and asset version references

**Interfaces:**
- Consumes: corrected `public` asset
- Produces: deployable static GitHub Pages root

- [ ] **Step 1: Run fresh verification**

Run `npm run test:js`, the focused browser test, and the relevant full browser suite with one worker.

- [ ] **Step 2: Build the Pages output**

Run `npm run build:pages -- --asset-version logo-alpha-20260803-1`, then copy the generated `.pages-dist` output to the repository root using the existing deployment workflow.

- [ ] **Step 3: Visually inspect the footer**

Open the local site at desktop and 320 px, scroll the footer into view, and confirm no white wedges remain outside the red frame.

- [ ] **Step 4: Commit and push**

Commit message: `fix: publish corrected logo transparency`, then push `HEAD` to `origin/main`.

- [ ] **Step 5: Verify GitHub Pages**

Open `https://rez1dennt.github.io/jack/?v=logo-alpha-20260803-1`, confirm the new asset version is loaded, and visually inspect the dark footer.

