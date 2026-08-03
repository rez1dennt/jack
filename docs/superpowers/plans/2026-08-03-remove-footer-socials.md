# Remove Footer Socials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove non-existent social-network controls from the footer and present the legal links as a balanced documents column.

**Architecture:** Keep the existing three-column footer grid and replace only the social column's heading/content contract. Reuse the existing document icon and legal-link component; remove obsolete social-only CSS rules without changing tokens or other components.

**Tech Stack:** Static HTML, CSS custom properties, Playwright.

## Global Constraints

- Do not change contact data, legal copy, or domain handling.
- Preserve the 1440 px container and responsive behavior from 320 px.
- Use existing design tokens and icons.

---

### Task 1: Footer contract

**Files:**
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `public/index.html`
- Modify: `public/assets/css/layout.css`
- Modify: `public/assets/css/components.css`
- Modify: `public/assets/css/responsive.css`

**Interfaces:**
- Consumes: existing `.site-footer__grid`, `.footer-heading`, `.footer-legal` styles.
- Produces: `.footer-column--documents` containing the heading «Документы» and three legal links.

- [ ] **Step 1: Write the failing test**

Update the footer contract to expect three columns, zero `.social-link` elements, no «Мы в соцсетях» text, a visible «Документы» heading, and three legal links.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/landing.spec.mjs --grep "footer matches" --workers=1`

Expected: FAIL because the current footer still renders three social controls and the old heading.

- [ ] **Step 3: Write minimal implementation**

Replace `.footer-column--social` with `.footer-column--documents`, remove `.social-links`, add the document heading, and remove only social-specific layout/component/responsive rules that become unused.

- [ ] **Step 4: Run focused and full tests**

Run focused: `npx playwright test tests/e2e/landing.spec.mjs --grep "footer matches|service, video" --workers=1`

Run full: `npx playwright test --workers=1 --reporter=dot`

Expected: focused tests pass; full suite passes except intentional visual snapshot differences before snapshots are regenerated.

- [ ] **Step 5: Update visual snapshots and rebuild Pages**

Run: `npx playwright test tests/e2e/visual.spec.mjs --project=desktop --update-snapshots --workers=1`

Run: `npm run build:pages -- --asset-version no-socials-20260803-1`

Expected: three desktop-project snapshots regenerate and the Pages build completes with no placeholders.

- [ ] **Step 6: Commit and publish**

Commit the source/test change, commit generated Pages files, push `HEAD:main`, and verify the public footer contains no social controls.

