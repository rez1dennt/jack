# JACK M9 Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Jack JK-T2210 with a source-verified JACK M9-SS-F13-X comparison and publish the responsive result to the existing GitHub Pages repository.

**Architecture:** Keep the current semantic HTML table and responsive CSS contract. Lock the new product identity and values with Playwright assertions before changing the page, then rebuild the static GitHub Pages output and verify the deployed page.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js, Playwright, GitHub Pages build script.

## Global Constraints

- The public model label is `JACK M9`.
- The reference configuration is `M9-SS-F13-X`.
- Only values supported by official JACK or JACK Europe sources may be published.
- The existing 1440 px container, design tokens, icons, product panel, and mobile table composition must remain unchanged.
- The page must not contain `JK-T2210` after implementation.
- Mobile widths down to 320 px must not introduce horizontal scrolling.

---

### Task 1: Lock the M9 comparison contract

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`

**Interfaces:**
- Consumes: the current `.specifications` table markup and `data-model` mobile labels.
- Produces: assertions for `JACK M9`, the verified M9 values, absence of `JK-T2210`, and no mobile overflow.

- [ ] **Step 1: Write the failing test**

Add assertions to the specifications test for the caption, M9 model header, 1400 × 950 mm sewing area, 3600 stitches/min speed, 0.6 MPa / 3 L/min air requirement, 610/690 kg weight, 2200 × 1220 × 1650 mm dimensions, and the configuration note. Update the mobile expected label and first-row value to `JACK M9` and `1400 × 950 мм`.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npx playwright test tests/e2e/landing.spec.mjs --grep "specifications"`

Expected: the tests fail because the page still renders Jack JK-T2210 and its old values.

- [ ] **Step 3: Commit the red test**

Run: `git add tests/e2e/landing.spec.mjs && git commit -m "test: define JACK M9 comparison"`

Expected: one commit containing only the failing comparison contract.

### Task 2: Publish the verified M9 data

**Files:**
- Modify: `public/index.html`

**Interfaces:**
- Consumes: the failing assertions from Task 1 and the verified values in `docs/superpowers/specs/2026-08-03-jack-m9-comparison-design.md`.
- Produces: a semantic comparison table whose second column is `JACK M9` and whose mobile `data-model` labels match that header.

- [ ] **Step 1: Replace the comparison column**

Update the caption, column header, all ten `data-model` attributes, row labels, M9 cell values, and the configuration note exactly as specified in the design document.

- [ ] **Step 2: Run the focused tests to verify they pass**

Run: `npx playwright test tests/e2e/landing.spec.mjs --grep "specifications"`

Expected: all matching tests pass at desktop and mobile widths.

- [ ] **Step 3: Commit the implementation**

Run: `git add public/index.html && git commit -m "feat: replace T2210 comparison with JACK M9"`

Expected: one implementation commit with no unrelated files.

### Task 3: Verify responsive rendering and regenerate Pages output

**Files:**
- Modify if Playwright reports intentional visual changes: `tests/e2e/landing.spec.mjs-snapshots/*`
- Modify generated output: repository-root GitHub Pages files created by `scripts/build-pages.mjs`

**Interfaces:**
- Consumes: the updated source page and existing build script.
- Produces: tested source, updated visual snapshots if required, and a static Pages build containing JACK M9.

- [ ] **Step 1: Run JavaScript and full Playwright tests**

Run: `npm run test:js`

Expected: all Node tests pass.

Run: `npm run test:e2e`

Expected: all functional tests pass; only the intentional specifications snapshots may require regeneration.

- [ ] **Step 2: Review and update intentional snapshots**

If the only snapshot differences are the new M9 copy and verified values, run: `npx playwright test --update-snapshots`.

Expected: updated desktop/mobile specification snapshots with no unrelated visual changes.

- [ ] **Step 3: Re-run the complete suite**

Run: `npm test`

Expected: all tests pass, with only the project's documented skips.

- [ ] **Step 4: Build GitHub Pages output**

Run: `$env:BUILD_VERSION='jack-m9-20260803-1'; npm run build:pages`

Expected: generated public files contain `jack-m9-20260803-1`, `JACK M9`, and no `JK-T2210` in the current page.

- [ ] **Step 5: Commit generated output**

Run: `git add . ':!.serena' ':!debug.log' && git commit -m "build: publish JACK M9 comparison"`

Expected: generated Pages output and any reviewed snapshots are committed without local tooling files.

### Task 4: Push and verify the public site

**Files:**
- No source files modified.

**Interfaces:**
- Consumes: the fully tested branch head.
- Produces: the same head on `origin/main` and a verified public GitHub Pages deployment.

- [ ] **Step 1: Push the current branch head to main**

Run: `git push origin HEAD:main`

Expected: the remote accepts the fast-forward update.

- [ ] **Step 2: Verify the deployment**

Open: `https://rez1dennt.github.io/jack/?v=jack-m9-20260803-1`

Expected: the public table shows `JACK M9`, verified values, no `JK-T2210`, no mobile horizontal overflow, and no browser console errors.

