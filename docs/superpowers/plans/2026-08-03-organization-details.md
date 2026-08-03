# Organization Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fictional contacts and legal placeholders with the supplied ООО «Текстиль Опт Торг» data and add a complete, responsive requisites page.

**Architecture:** Keep the existing vanilla HTML/CSS structure and shared legal-page styles. Update the landing contact surfaces and JSON-LD, populate the two personal-data documents, add one static requisites document, then publish the standard GitHub Pages build with a new asset version.

**Tech Stack:** Vanilla HTML/CSS, JSON-LD, Node test runner, Playwright, PHP configuration example, GitHub Pages build script.

## Global Constraints

- Primary public phone: `8 (927) 667-73-07`, link target `tel:+79276677307`.
- Email: `tekstilopttorg@mail.ru`.
- Operator: ООО «Текстиль Опт Торг», INN `2130136574`, OGRN `1142130005731`.
- Address text must match the supplied legal details and wrap without horizontal overflow at 320 px.
- Full banking details belong on `requisites.html`, not inside the privacy policy.
- Keep `[[DOMAIN]]` in source canonical/sitemap values until the production domain is supplied; the Pages build replaces it for preview deployment.
- Do not change form, SMTP transport, cookie behavior, or visual tokens.

---

### Task 1: Add failing organization-data tests

**Files:**
- Modify: `tests/e2e/legal.spec.mjs`
- Modify: `tests/e2e/landing.spec.mjs`
- Modify: `tests/e2e/quality.spec.mjs`

**Interfaces:**
- Consumes: landing, privacy, consent, and requisites HTML documents
- Produces: regression coverage for operator identity, contact links, structured data, and removed placeholders

- [ ] **Step 1: Update legal page expectations**

Extend the legal-page loop to `['/privacy.html', '/consent.html', '/requisites.html']`. Assert visible `ООО «Текстиль Опт Торг»`, `2130136574`, a working back link, legal logo, and no horizontal overflow at 320 px. On the requisites page additionally assert `211601001`, `1142130005731`, `042202803`, `30101810700000000803`, `40702810203000184072`, and `Федотов Андрей Николаевич`.

- [ ] **Step 2: Add landing contact expectations**

Assert the header/footer expose `tel:+79276677307`, `mailto:tekstilopttorg@mail.ru`, the supplied Кугеси address, and a link to `/requisites.html`; assert the old `8 (800) 555-57-18`, `info@jack-sewing.ru`, and Moscow address are absent.

- [ ] **Step 3: Add public placeholder and JSON-LD expectations**

Assert the rendered Organization JSON-LD contains the legal name, INN, OGRN, email, phone, and structured address. Read the public HTML sources and assert no `[[LEGAL_NAME]]`, `[[INN]]`, `[[ADDRESS]]`, `[[EMAIL]]`, `[[PHONE]]`, or `[[RETENTION_PERIOD]]` markers remain.

- [ ] **Step 4: Run RED tests**

Run: `npx playwright test tests/e2e/legal.spec.mjs tests/e2e/landing.spec.mjs tests/e2e/quality.spec.mjs --grep "operator|contacts|organization details" --workers=1`

Expected: FAIL because the current pages still contain fictional contacts and operator placeholders.

### Task 2: Populate legal pages and public contacts

**Files:**
- Modify: `public/index.html`
- Modify: `public/privacy.html`
- Modify: `public/consent.html`
- Create: `public/requisites.html`
- Modify: `public/sitemap.xml`
- Modify: `server/config.example.php`
- Modify: `README.md`

**Interfaces:**
- Consumes: the supplied registration, banking, contact, and director details
- Produces: complete public operator identity and a dedicated requisites document

- [ ] **Step 1: Update landing contacts and structured data**

Replace the header caption with `Консультация по оборудованию`; replace footer phone/email/address; include office phones in helper text; remove the fictional external website row; add a requisites link. Replace Organization JSON-LD placeholder fields with the real legal identity and `PostalAddress` object.

- [ ] **Step 2: Populate privacy and consent documents**

Remove both pre-publication notices. Insert legal name, INN, OGRN, address, email, and primary phone. Replace the unresolved retention period with purpose-bound wording and set the effective date to `3 августа 2026 года`.

- [ ] **Step 3: Create the requisites document**

Use the existing legal header/footer pattern. Include registration codes, legal/actual addresses, a notice that banking details changed from `01.04.2025`, bank name, BIK, correspondent and settlement accounts, director, phones, and email. Make phone/email values real links.

- [ ] **Step 4: Update navigation and deployment documentation**

Add `/requisites.html` to the sitemap and legal footer navigation. Set the example recipient to `tekstilopttorg@mail.ru` and sender name to `Текстиль Опт Торг`; keep SMTP credentials and domain secret/deferred markers unchanged. Remove obsolete operator-marker instructions from README.

- [ ] **Step 5: Run GREEN tests**

Run the same focused Playwright command from Task 1.

Expected: all focused cases pass.

- [ ] **Step 6: Commit source changes**

Commit message: `feat: publish organization details`

### Task 3: Verify visual output and publish

**Files:**
- Modify: approved visual snapshots if the longer real contact copy changes them
- Modify: generated root GitHub Pages files

**Interfaces:**
- Consumes: completed `public/` documents
- Produces: deployable Pages preview with organization-details cache busting

- [ ] **Step 1: Run copy and placeholder checks**

Run `rg` over `public/` to verify the six operator placeholders and all fictional contacts are absent. Run the UX copy checklist over new labels and headings.

- [ ] **Step 2: Run the full test suite**

Run `npm run test:js` and `npx playwright test --workers=1`. Review any visual diff and update snapshots only when differences are limited to the approved contact/requisites content.

- [ ] **Step 3: Inspect desktop and mobile pages**

Use the browser at 1440 px and 320 px to inspect the header, footer, privacy, consent, and requisites pages. Confirm long account numbers and addresses wrap without overflow.

- [ ] **Step 4: Build and copy Pages output**

Run `npm run build:pages -- --asset-version organization-details-20260803-1`, copy all `.pages-dist` files to the repository root, and verify every copied hash matches.

- [ ] **Step 5: Commit and push**

Commit message: `feat: publish organization details preview`, then push `HEAD` to `origin/main`.

- [ ] **Step 6: Verify GitHub Pages**

Open `https://rez1dennt.github.io/jack/?v=organization-details-20260803-1`, verify the new asset version, real header/footer contacts, operator details, and `/jack/requisites.html`.
