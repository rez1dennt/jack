# Client Sales Remediation Implementation Plan

> **For agentic workers:** Execute inline with test-driven development; each task below has its own red/green gate.

**Goal:** Implement all six client corrections plus the supplied company photograph and publish the verified Pages build.

**Architecture:** Keep `public/` canonical. Add content and layout in semantic HTML/CSS, extend the existing form pipeline end-to-end, then regenerate the root Pages copy. No new dependency or route is introduced.

**Tech Stack:** Vanilla HTML/CSS/ES modules, PHP 8.1, PHPMailer, Node test, Playwright.

## Global constraints

- Keep the 1,440px container and existing red/white industrial design.
- Do not turn the illustrative calculation into a price offer or guarantee.
- Do not replace the demonstration photo in the applications section.
- Edit `public/` first; root files are generated.

### Task 1: Regression contract

**Files:** Modify `tests/e2e/client-remediation.spec.mjs`, `tests/php/InputValidator.test.php`, and `tests/php/MailerTransport.test.php`.

- [ ] Add Playwright assertions for model-specific speed copy, factual precision copy, visible M9 table/image on click and keyboard, optional task field, price/finance wording, economics values/disclaimer, and `/assets/images/company-team.webp` only in the about section.
- [ ] Add PHP assertions that `task` is normalized, capped, and rendered escaped in HTML/plain SMTP bodies.
- [ ] Run targeted tests and confirm they fail because the new content/data is absent.

```js
await expect(page.locator('.economics')).toContainText('1 440');
await expect(page.locator('.about-company__media img')).toHaveAttribute('src', '/assets/images/company-team.webp');
```

### Task 2: Asset and landing content

**Files:** Create `public/assets/images/company-team.webp`; modify `public/index.html`, `public/assets/css/layout.css`, `public/assets/css/components.css`, and `public/assets/css/responsive.css`.

- [ ] Convert the supplied 750×630 JPEG with auto-orient, metadata stripping, WebP quality 88, and no upscaling.
- [ ] Replace only the about image and update intrinsic dimensions/alt text.
- [ ] Replace the unsupported precision claim and qualify the 3,600 speed with M9.
- [ ] Add the individual-price/leasing wording and the economics block with exact assumptions/results/disclaimer.
- [ ] Add the optional task textarea with a visible label and 1,000-character cap.
- [ ] Run the targeted Playwright test and confirm green.

```html
<section class="economics" aria-labelledby="economics-title">
  <h2 id="economics-title">Результат в цифрах</h2>
  <p class="economics__disclaimer">Пример расчёта, не является коммерческим предложением.</p>
</section>
```

### Task 3: Secure form delivery

**Files:** Modify `public/assets/js/form.js`, `server/src/InputValidator.php`, and `server/src/MailerTransport.php`.

- [ ] Include trimmed `task` in the JSON payload.
- [ ] Normalize whitespace, accept empty values, reject values over 1,000 Unicode characters, and return sanitized data.
- [ ] Escape task text in HTML email and include the original normalized text in plain email.
- [ ] Run PHP and form tests until green.

```php
$task = self::normalizeTask($input['task'] ?? '');
if (self::unicodeLength($task) > 1000) {
    $errors['task'] = 'Описание задачи не должно превышать 1000 символов.';
}
```

### Task 4: Full verification and release

**Files:** Regenerate root Pages output with `scripts/build-pages.mjs`.

- [ ] Run JS, PHP, targeted E2E, full E2E, diff check, and production Pages build.
- [ ] Inspect 1440px and 390px screenshots for clipping, hierarchy, mobile reflow, tab state, and image crop.
- [ ] Copy `.pages-dist` into the root, verify asset URLs, commit only intended files, push `HEAD:main`, and verify the live URL.

```powershell
npm run build:pages -- --asset-version client-sales-remediation-20260805-1
```
