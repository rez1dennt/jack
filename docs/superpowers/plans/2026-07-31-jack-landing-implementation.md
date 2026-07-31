# Jack Industrial Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, responsive HTML/CSS/JavaScript landing page that closely reproduces the supplied Jack sewing-machine reference, with a protected PHP/PHPMailer contact flow, Russian-law-oriented legal pages, cookie preferences, SEO, and verified mobile behavior.

**Architecture:** The public document root lives in `public/`; server-only PHP code and rate-limit storage live in `server/`, outside the web root. Browser behavior is split into small ES modules with pure functions where possible, while PHP validation and transport are separated so tests can exercise request handling without sending mail.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, Node.js built-in test runner, Playwright, PHP 8.1+, Composer, PHPMailer 7, SVG, AVIF/WebP/JPEG.

## Global Constraints

- No frontend framework, CMS, or runtime build step is required for production.
- Preserve all visible reference copy and section order; use explicit replaceable legal/operator markers until the user supplies real data.
- Support desktop, tablet, and mobile from 320 px upward without horizontal overflow.
- Keep SMTP credentials outside `public/` and outside Git.
- Use local WOFF2 fonts and local image assets; do not load Google Fonts or remote trackers.
- Do not extract raster fragments from the reference screenshot.
- Do not send a real SMTP message from automated tests.
- Every form submission requires a separate, initially unchecked personal-data consent.
- Google SMTP is the initial transport, but transport configuration must be replaceable.
- Follow the accepted specification at `docs/superpowers/specs/2026-07-31-jack-landing-design.md`.

---

## File Map

```text
.
├── .gitignore
├── README.md
├── composer.json
├── package.json
├── playwright.config.mjs
├── public/
│   ├── .htaccess
│   ├── index.html
│   ├── privacy.html
│   ├── consent.html
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── site.webmanifest
│   ├── api/
│   │   ├── csrf.php
│   │   └── submit.php
│   └── assets/
│       ├── css/{tokens,base,layout,components,responsive}.css
│       ├── fonts/{roboto-condensed-700,inter-400,inter-600}.woff2
│       ├── icons/*.svg
│       ├── images/*.{avif,webp,jpg,png}
│       └── js/{phone-mask,menu,cookies,form,main}.js
├── server/
│   ├── bootstrap.php
│   ├── config.example.php
│   ├── src/{InputValidator,RequestGuard,RateLimiter,MailerTransport}.php
│   └── storage/.gitkeep
└── tests/
    ├── js/{phone-mask,cookies}.test.mjs
    ├── php/{InputValidator,RequestGuard,RateLimiter}.test.php
    └── e2e/{landing,form}.spec.mjs
```

---

### Task 1: Establish the deployable skeleton and test harness

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `composer.json`
- Create: `playwright.config.mjs`
- Create: `README.md`
- Create: `public/.htaccess`
- Create: `public/assets/js/main.js`
- Create: `tests/e2e/landing.spec.mjs`

**Interfaces:**
- Produces: npm scripts `test:js`, `test:e2e`, `test`; Composer autoloader at `vendor/autoload.php`; local site URL `http://127.0.0.1:8080`.
- Consumes: PHP executable available on PATH for the Playwright web server.

- [ ] **Step 1: Write the failing landing smoke test**

```js
// tests/e2e/landing.spec.mjs
import { test, expect } from '@playwright/test';

test('landing renders the primary heading and has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Автоматизируйте');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
```

- [ ] **Step 2: Add deterministic tool configuration**

```json
{
  "name": "jack-industrial-landing",
  "private": true,
  "type": "module",
  "scripts": {
    "test:js": "node --test tests/js/*.test.mjs",
    "test:e2e": "playwright test",
    "test": "npm run test:js && npm run test:e2e"
  },
  "devDependencies": {
    "@playwright/test": "^1.55.0"
  }
}
```

```json
{
  "require": {
    "php": ">=8.1",
    "phpmailer/phpmailer": "^7.0"
  },
  "autoload": {
    "psr-4": {
      "JackLanding\\": "server/src/"
    }
  }
}
```

```js
// playwright.config.mjs
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:8080', trace: 'retain-on-failure' },
  webServer: {
    command: 'php -S 127.0.0.1:8080 -t public',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: true
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } }
  ]
});
```

- [ ] **Step 3: Add ignore and server hardening defaults**

```gitignore
/node_modules/
/vendor/
/server/config.php
/server/storage/rate-*.json
/test-results/
/playwright-report/
/.env
```

```apache
# public/.htaccess
Options -Indexes
DirectoryIndex index.html
AddDefaultCharset UTF-8

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set X-Frame-Options "SAMEORIGIN"
</IfModule>
```

- [ ] **Step 4: Install dependencies and confirm the smoke test fails for the expected reason**

Run: `npm install && npx playwright install chromium && composer install`

Run: `npm run test:e2e -- --project=desktop`

Expected: FAIL because `public/index.html` and its `h1` do not exist yet.

- [ ] **Step 5: Add deployment instructions to README**

Document PHP 8.1+, Composer install, `public/` as document root, `server/config.example.php` copied to `server/config.php`, Google App Password setup, and replacement of all `[[...]]` operator/domain markers before launch.

- [ ] **Step 6: Commit**

Run: `git add .gitignore package.json composer.json playwright.config.mjs README.md public/.htaccess tests/e2e/landing.spec.mjs`

Run: `git commit -m "chore: establish landing project skeleton"`

---

### Task 2: Build semantic page content, SEO files, and legal documents

**Files:**
- Create: `public/index.html`
- Create: `public/privacy.html`
- Create: `public/consent.html`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Create: `public/site.webmanifest`
- Create: `tests/e2e/legal.spec.mjs`

**Interfaces:**
- Produces: section IDs `equipment`, `solutions`, `service`, `about`, `contacts`, `lead-form`; form ID `consultation-form`; links `/privacy.html` and `/consent.html`.
- Consumes: style entry points under `/assets/css/` and `/assets/js/main.js` created in later tasks.

- [ ] **Step 1: Extend the failing smoke test with the required page outline**

```js
test('all reference sections and legal links exist', async ({ page }) => {
  await page.goto('/');
  for (const text of ['Проблема', 'Решение Jack', 'Что умеет', 'Примеры применения', 'Почему именно Jack?', 'Технические характеристики']) {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }
  await expect(page.getByRole('link', { name: /политик/i })).toHaveAttribute('href', '/privacy.html');
  await expect(page.getByRole('link', { name: /согласи/i })).toHaveAttribute('href', '/consent.html');
});
```

- [ ] **Step 2: Implement the full semantic landing markup**

Use one `h1`, section-specific `h2`, the exact visible reference copy, real `button` elements for actions, `table` with `caption`, `thead`, row headers and cells, and a `form` containing:

```html
<form class="lead-form" id="consultation-form" novalidate>
  <label class="field">
    <span class="sr-only">Ваше имя</span>
    <input name="name" autocomplete="name" maxlength="80" placeholder="Ваше имя" required>
    <span class="field__error" id="name-error"></span>
  </label>
  <label class="field">
    <span class="sr-only">Телефон</span>
    <input name="phone" inputmode="tel" autocomplete="tel" placeholder="Телефон" aria-describedby="phone-error" required>
    <span class="field__error" id="phone-error"></span>
  </label>
  <label class="consent-check">
    <input name="consent" type="checkbox" required>
    <span>Я даю <a href="/consent.html">согласие на обработку персональных данных</a></span>
  </label>
  <input class="honeypot" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button class="button button--dark" type="submit">Получить консультацию</button>
  <p class="form-status" role="status" aria-live="polite"></p>
</form>
```

- [ ] **Step 3: Add exact SEO primitives**

Include a unique title and description, `canonical` containing `https://[[DOMAIN]]/`, Open Graph tags, icons, and JSON-LD containing `[[LEGAL_NAME]]`, `[[PHONE]]`, `[[EMAIL]]`, `[[ADDRESS]]`, and the Jack MS-100A product name. Add `robots.txt` and `sitemap.xml` with the same domain marker so replacement is mechanical.

- [ ] **Step 4: Write separate privacy and consent pages**

Both documents must visibly identify `[[LEGAL_NAME]]`, `[[INN]]`, `[[ADDRESS]]`, `[[EMAIL]]`, and `[[PHONE]]`. The consent document separately lists the submitted name and phone, purpose “обработка заявки и обратная связь”, actions, storage period, withdrawal method, and no advertising consent. The privacy page must describe cookies, security, access/rectification/deletion requests, SMTP recipients, and the need to update the cross-border section before Google SMTP goes live.

- [ ] **Step 5: Run the page tests**

Run: `npm run test:e2e -- --project=desktop`

Expected: the section and legal-link assertions pass; styling-dependent assertions remain absent until Task 3.

- [ ] **Step 6: Commit**

Run: `git add public/index.html public/privacy.html public/consent.html public/robots.txt public/sitemap.xml public/site.webmanifest tests/e2e`

Run: `git commit -m "feat: add semantic landing and legal content"`

---

### Task 3: Reproduce the visual system and responsive layout

**Files:**
- Create: `public/assets/css/tokens.css`
- Create: `public/assets/css/base.css`
- Create: `public/assets/css/layout.css`
- Create: `public/assets/css/components.css`
- Create: `public/assets/css/responsive.css`
- Create: `public/assets/fonts/roboto-condensed-700.woff2`
- Create: `public/assets/fonts/inter-400.woff2`
- Create: `public/assets/fonts/inter-600.woff2`
- Modify: `public/index.html`
- Modify: `public/privacy.html`
- Modify: `public/consent.html`
- Modify: `tests/e2e/landing.spec.mjs`

**Interfaces:**
- Produces: CSS custom properties `--color-accent`, `--color-ink`, `--color-night`, `--container`, `--section-space`; utility classes `.container`, `.button`, `.section-title`, `.sr-only`.
- Consumes: semantic classes on all three HTML pages.

- [ ] **Step 1: Add responsive assertions before styling**

```js
for (const width of [1440, 1024, 768, 390, 320]) {
  test(`landing has no overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
```

- [ ] **Step 2: Define tokens and typography**

```css
:root {
  --color-accent: #c80712;
  --color-accent-dark: #a9060f;
  --color-ink: #111820;
  --color-night: #111b24;
  --color-muted: #5e6670;
  --color-line: #dfe2e5;
  --color-surface: #f6f7f8;
  --container: 1180px;
  --section-space: clamp(2.75rem, 5vw, 5.5rem);
  --radius: 4px;
  --focus-ring: 0 0 0 3px rgba(200, 7, 18, .24);
}
```

Add local `@font-face` declarations with `font-display: swap`; use Roboto Condensed for headings and Inter for body copy.

- [ ] **Step 3: Implement desktop composition section-by-section**

Create the reference-shaped header, hero split, red problem panel, white solution panel, five-column feature strip, three-column case block, four-column reasons strip, specs grid, red CTA and dark footer. Keep the common content width aligned and use `clamp()` for type/spacing.

- [ ] **Step 4: Implement tablet and mobile breakpoints**

At 1024 px reduce gutters and convert three-column groups to two columns. At 767 px switch all complex layouts to one column, show the menu trigger, make form controls full width, wrap the specs table in `.table-scroll`, and keep every interactive target at least 44 px high. At 390 px reduce heading scale without reducing body text below 16 px.

- [ ] **Step 5: Add focus, motion, and print-safe states**

Use `:focus-visible` with `--focus-ring`, do not remove outlines, and disable transitions under `@media (prefers-reduced-motion: reduce)`. Ensure legal pages have a readable max-width and print without navigation/cookie UI.

- [ ] **Step 6: Verify and commit**

Run: `npm run test:e2e -- --project=desktop`

Run: `npm run test:e2e -- --project=mobile`

Expected: all five overflow tests pass in both configured projects.

Run: `git add public/assets/css public/assets/fonts public/*.html tests/e2e/landing.spec.mjs`

Run: `git commit -m "feat: reproduce responsive Jack layout"`

---

### Task 4: Produce project-owned imagery and the SVG icon system

**Files:**
- Create: `public/assets/images/hero-machine.{avif,webp,jpg}`
- Create: `public/assets/images/solution-denim.{avif,webp,jpg}`
- Create: `public/assets/images/case-machine.{avif,webp,jpg}`
- Create: `public/assets/images/spec-machine.{avif,webp,png}`
- Create: `public/assets/images/cta-operator.{avif,webp,jpg}`
- Create: `public/assets/images/footer-stitch.{avif,webp,jpg}`
- Create: `public/assets/icons/*.svg`
- Modify: `public/index.html`
- Modify: `public/assets/css/layout.css`

**Interfaces:**
- Produces: local image files with 1x/2x candidates and SVG symbols matching the red line-art style.
- Consumes: the supplied full-page screenshot strictly as a composition/style reference, never as a crop source.

- [ ] **Step 1: Generate independent raster assets with the image generation tool**

Use the supplied screenshot as a reference image and issue one generation call per asset. Core prompt for the hero:

```text
Use case: product-mockup
Asset type: responsive industrial landing-page hero
Primary request: create an independent photorealistic image of a modern computerized industrial pattern sewing automaton inspired by the machine category in the reference; this is a new image, not a crop or edit
Scene/backdrop: bright clean white sewing-production workshop with soft depth of field
Composition/framing: very wide landscape, machine and touchscreen concentrated on the right 58%, generous clean negative space on the left for Russian headline copy
Lighting/mood: high-key commercial product photography, crisp metal detail, restrained blue machine accents
Constraints: no people, no added headline, no watermark, realistic geometry, no clipped machine parts
Avoid: unreadable labels, malformed needles, duplicated controls, dramatic shadows
```

Create targeted variants for denim close-up, case machine, clean white product view, operator workstation, and dark footer stitching detail. Inspect each output before saving it to the project.

- [ ] **Step 2: Convert each approved source deterministically**

Use ImageMagick to auto-orient, strip metadata, crop to the planned aspect ratio, and produce AVIF/WebP/JPEG fallbacks. Preserve the source in a non-public working directory only until conversions are approved.

- [ ] **Step 3: Draw SVG icons as code-native assets**

Create individual 24/48 viewBox SVGs for time, warning, growth, monitor, templates, laser, thread sensor, layers, checklist, shield, headset, training, customization, download, phone, email, globe, location and social channels. Every icon uses `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, and a consistent stroke width.

- [ ] **Step 4: Wire responsive images**

Use `picture` with AVIF then WebP then fallback, explicit `width` and `height`, `fetchpriority="high"` only on hero, and `loading="lazy" decoding="async"` below the fold.

- [ ] **Step 5: Visual inspection and commit**

Open the page at 1440 and 390 px. Confirm subject placement does not collide with hero text, no image is stretched, all icons share stroke weight, and no screenshot crop appears in the project.

Run: `git add public/assets/images public/assets/icons public/index.html public/assets/css/layout.css`

Run: `git commit -m "feat: add industrial imagery and icon system"`

---

### Task 5: Implement the phone mask and client-side form controller with TDD

**Files:**
- Create: `public/assets/js/phone-mask.js`
- Create: `public/assets/js/form.js`
- Create: `tests/js/phone-mask.test.mjs`
- Create: `tests/e2e/form.spec.mjs`
- Modify: `public/assets/js/main.js`

**Interfaces:**
- Produces: `normalizeRuPhone(value): string`, `formatRuPhone(value): string`, `isCompleteRuPhone(value): boolean`, `initPhoneMask(input): () => void`, `initLeadForm(form): () => void`.
- Consumes: `GET /api/csrf.php -> { token: string }`; `POST /api/submit.php -> { ok: boolean, message: string, errors?: Record<string,string> }`.

- [ ] **Step 1: Write pure phone behavior tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRuPhone, formatRuPhone, isCompleteRuPhone } from '../../public/assets/js/phone-mask.js';

test('normalizes Russian 8 prefix and pasted formatting', () => {
  assert.equal(normalizeRuPhone('8 (999) 123-45-67'), '+79991234567');
});

test('formats partial input and allows complete clearing', () => {
  assert.equal(formatRuPhone('99912'), '+7 (999) 12');
  assert.equal(formatRuPhone(''), '');
});

test('rejects incomplete numbers', () => {
  assert.equal(isCompleteRuPhone('+7 (999) 123-45'), false);
  assert.equal(isCompleteRuPhone('+7 (999) 123-45-67'), true);
});
```

- [ ] **Step 2: Run the unit test and verify the import fails**

Run: `npm run test:js`

Expected: FAIL with module-not-found for `phone-mask.js`.

- [ ] **Step 3: Implement the pure functions and input controller**

Normalize all non-digits, convert an initial `8` to country code `7`, cap to 11 digits, build the partial format incrementally, and preserve an empty string. The input controller must handle `input`, `paste`, selection replacement and Backspace/Delete without trapping the caret.

- [ ] **Step 4: Write E2E tests for editing and validation states**

```js
test('phone supports paste, correction, clearing, and re-entry', async ({ page }) => {
  await page.goto('/');
  const phone = page.locator('input[name="phone"]');
  await phone.fill('89991234567');
  await expect(phone).toHaveValue('+7 (999) 123-45-67');
  await phone.press('Control+A');
  await phone.press('Backspace');
  await expect(phone).toHaveValue('');
  await phone.fill('9990001122');
  await expect(phone).toHaveValue('+7 (999) 000-11-22');
});
```

- [ ] **Step 5: Implement the form controller**

Fetch a CSRF token on initialization; validate trimmed name length 2–80, complete phone, and checked consent; expose errors with `aria-invalid`; submit JSON; retain values on failure; clear values only when `{ ok: true }`; prevent duplicate submits; always restore the button state in `finally`.

- [ ] **Step 6: Verify and commit**

Run: `npm run test:js`

Expected: all phone tests PASS.

Run: `npm run test:e2e -- --grep "phone supports"`

Expected: PASS in desktop and mobile projects.

Run: `git add public/assets/js tests/js tests/e2e/form.spec.mjs`

Run: `git commit -m "feat: add resilient phone mask and form UX"`

---

### Task 6: Implement accessible navigation and cookie preferences

**Files:**
- Create: `public/assets/js/menu.js`
- Create: `public/assets/js/cookies.js`
- Create: `tests/js/cookies.test.mjs`
- Modify: `public/assets/js/main.js`
- Modify: `public/index.html`
- Modify: `public/assets/css/components.css`
- Modify: `tests/e2e/landing.spec.mjs`

**Interfaces:**
- Produces: `initMenu(root): () => void`, `readCookiePreference(storage): 'all'|'necessary'|null`, `saveCookiePreference(storage, value): void`, `initCookieBanner(root, storage): () => void`.
- Consumes: `[data-menu-button]`, `[data-menu-panel]`, `[data-menu-overlay]`, `[data-cookie-banner]`, `[data-cookie-accept]`, `[data-cookie-necessary]`.

- [ ] **Step 1: Write preference tests**

```js
test('cookie preference round-trips without enabling analytics', () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  saveCookiePreference(storage, 'necessary');
  assert.equal(readCookiePreference(storage), 'necessary');
});
```

- [ ] **Step 2: Implement the cookie module**

Use the storage key `jack_cookie_preference_v1`. Hide the banner only for valid stored values, dispatch `jack:consent` with `{ detail: { value } }`, and never inject an analytics script in version 1.

- [ ] **Step 3: Add menu E2E behavior before implementing it**

```js
test('mobile menu locks scroll without page-width jump and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const before = await page.evaluate(() => document.documentElement.clientWidth);
  await page.locator('[data-menu-button]').click();
  await expect(page.locator('[data-menu-button]')).toHaveAttribute('aria-expanded', 'true');
  expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(before);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-menu-button]')).toHaveAttribute('aria-expanded', 'false');
});
```

- [ ] **Step 4: Implement scroll compensation and focus management**

On open, calculate `window.innerWidth - document.documentElement.clientWidth`, save the current inline padding and overflow, add the compensation to the body, set `overflow: hidden`, move focus to the first link, and trap Tab inside the panel. On close, restore previous inline values and return focus to the trigger. Support trigger, overlay, Escape and menu-link closure.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:js && npm run test:e2e -- --grep "mobile menu"`

Expected: all cookie and menu tests PASS.

Run: `git add public/assets/js public/index.html public/assets/css/components.css tests`

Run: `git commit -m "feat: add accessible menu and cookie controls"`

---

### Task 7: Implement server validation, request guards, and rate limiting with TDD

**Files:**
- Create: `server/src/InputValidator.php`
- Create: `server/src/RequestGuard.php`
- Create: `server/src/RateLimiter.php`
- Create: `server/bootstrap.php`
- Create: `server/storage/.gitkeep`
- Create: `tests/php/InputValidator.test.php`
- Create: `tests/php/RequestGuard.test.php`
- Create: `tests/php/RateLimiter.test.php`

**Interfaces:**
- Produces: `InputValidator::validate(array $input): array`, `RequestGuard::validate(array $server, array $payload, string $csrf): array`, `RateLimiter::consume(string $key, int $limit, int $windowSeconds): bool`.
- Consumes: PHP session token and a writable `server/storage` directory.

- [ ] **Step 1: Write failing validator tests**

```php
<?php
require dirname(__DIR__, 2) . '/vendor/autoload.php';
use JackLanding\InputValidator;

$valid = InputValidator::validate(['name' => 'Анна', 'phone' => '+79991234567', 'consent' => true]);
assert($valid['ok'] === true);
assert($valid['data']['phone'] === '+79991234567');

$invalid = InputValidator::validate(['name' => 'A', 'phone' => '123', 'consent' => false]);
assert($invalid['ok'] === false);
assert(isset($invalid['errors']['name'], $invalid['errors']['phone'], $invalid['errors']['consent']));
```

- [ ] **Step 2: Run and confirm failure**

Run: `php -d zend.assertions=1 -d assert.exception=1 tests/php/InputValidator.test.php`

Expected: FAIL because `JackLanding\InputValidator` does not exist.

- [ ] **Step 3: Implement deterministic validation**

Accept Unicode letters, spaces, apostrophes and hyphens in names; trim and collapse whitespace; enforce 2–80 characters; normalize `8XXXXXXXXXX` and `7XXXXXXXXXX` to `+7XXXXXXXXXX`; require explicit boolean consent; discard honeypot and unknown keys from returned data.

- [ ] **Step 4: Implement guards and file-backed limiter**

Reject non-POST, bodies over 16 KiB, wrong JSON content type, a missing/mismatched CSRF token, untrusted Origin/Referer, a non-empty honeypot, and elapsed form time below 1200 ms. RateLimiter hashes the caller key with the configured secret, locks a small JSON file with `flock`, prunes expired timestamps, and allows at most 5 attempts per 10 minutes.

- [ ] **Step 5: Test every rejection class**

Add assertions for method, content type, CSRF, origin, honeypot, too-fast submission, and the sixth attempt inside one rate-limit window. Use a temporary storage path supplied to the limiter constructor so tests never touch production state.

- [ ] **Step 6: Run all PHP tests and commit**

Run: `Get-ChildItem tests/php/*.test.php | ForEach-Object { php -d zend.assertions=1 -d assert.exception=1 $_.FullName }`

Expected: each script exits 0 with no assertion exception.

Run: `git add server/src server/bootstrap.php server/storage/.gitkeep tests/php`

Run: `git commit -m "feat: validate and guard lead submissions"`

---

### Task 8: Add PHPMailer transport and API endpoints

**Files:**
- Create: `server/config.example.php`
- Create: `server/src/MailerTransport.php`
- Create: `public/api/csrf.php`
- Create: `public/api/submit.php`
- Modify: `server/bootstrap.php`
- Modify: `tests/e2e/form.spec.mjs`

**Interfaces:**
- Produces: `MailerTransport::sendLead(array $lead): void`; JSON endpoints documented in Task 5.
- Consumes: configuration keys `smtp.host`, `smtp.port`, `smtp.username`, `smtp.password`, `smtp.encryption`, `mail.from`, `mail.to`, `security.allowed_origin`, `security.rate_secret`.

- [ ] **Step 1: Define a safe example configuration**

```php
<?php
return [
    'smtp' => [
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'username' => '[[SMTP_USERNAME]]',
        'password' => '[[GOOGLE_APP_PASSWORD]]',
        'encryption' => 'tls',
    ],
    'mail' => [
        'from' => '[[SMTP_USERNAME]]',
        'from_name' => 'Заявки с сайта Jack',
        'to' => '[[LEAD_RECIPIENT]]',
    ],
    'security' => [
        'allowed_origin' => 'https://[[DOMAIN]]',
        'rate_secret' => '[[RANDOM_32_BYTE_SECRET]]',
    ],
];
```

- [ ] **Step 2: Implement PHPMailer behind one transport class**

Construct PHPMailer through Composer autoloading, enable SMTP, STARTTLS for port 587, authentication, UTF-8, and no debug output. Use the configured account as `From`; never use visitor input as the From address. Escape visitor data for the HTML body and include a plain-text AltBody.

- [ ] **Step 3: Implement the CSRF endpoint**

Start a secure SameSite=Lax session, create a 32-byte random token when absent, store the form-start timestamp, return `{ "token": "..." }`, and set `Cache-Control: no-store`.

- [ ] **Step 4: Implement the submission endpoint**

Parse JSON safely, run RequestGuard and RateLimiter before InputValidator, call MailerTransport only for accepted data, and return status 200 for success, 422 for field errors, 403 for guard failures, 429 for rate limiting, and 500 with a generic message for transport errors. Do not return exception messages or SMTP diagnostics.

- [ ] **Step 5: Mock the API in Playwright and test UI states**

```js
await page.route('**/api/submit.php', route => route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ ok: true, message: 'Спасибо! Мы свяжемся с вами.' })
}));
```

Add separate tests for success, 422 field errors, 429 throttling and 500 retry messaging. Confirm values remain after every failure and clear only after success.

- [ ] **Step 6: Verify without real SMTP and commit**

Run: `npm run test:js && npm run test:e2e`

Run: `Get-ChildItem tests/php/*.test.php | ForEach-Object { php -d zend.assertions=1 -d assert.exception=1 $_.FullName }`

Expected: all tests PASS and no network mail is sent.

Run: `git add server public/api tests/e2e/form.spec.mjs composer.json composer.lock`

Run: `git commit -m "feat: connect protected PHP lead endpoint"`

---

### Task 9: Final visual, accessibility, SEO, and deployment verification

**Files:**
- Modify: any `public/` or `server/` file only when a failing check identifies a concrete issue
- Create: `tests/e2e/visual.spec.mjs`
- Modify: `README.md`

**Interfaces:**
- Produces: verified release candidate and exact pre-launch replacement checklist.
- Consumes: all prior tasks.

- [ ] **Step 1: Add stable viewport screenshots**

```js
import { test, expect } from '@playwright/test';

for (const viewport of [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 }
]) {
  test(`visual ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('jack_cookie_preference_v1', 'necessary'));
    await page.reload();
    await expect(page).toHaveScreenshot(`${viewport.name}.png`, { fullPage: true, animations: 'disabled' });
  });
}
```

- [ ] **Step 2: Generate and inspect screenshot baselines**

Run: `npm run test:e2e -- --grep "visual" --update-snapshots`

Expected: three stable baseline screenshots are written. Compare them side-by-side with the supplied reference; fix material differences in section heights, alignment, typography, red tone, image crops and CTA/footer proportions before accepting baselines.

- [ ] **Step 3: Run functional and static checks**

Run: `npm test`

Run: `Get-ChildItem tests/php/*.test.php | ForEach-Object { php -d zend.assertions=1 -d assert.exception=1 $_.FullName }`

Run: `php -l public/api/csrf.php; php -l public/api/submit.php; Get-ChildItem server/src/*.php | ForEach-Object { php -l $_.FullName }`

Expected: all tests PASS and every PHP file reports “No syntax errors detected”.

- [ ] **Step 4: Perform manual accessibility and interaction checks**

Use keyboard-only navigation at 1440 and 390 px. Verify visible focus, logical order, menu focus trap and Escape, error announcements, reduced motion, 200% zoom, table access, cookie actions, and that the body width does not shift when the menu opens.

- [ ] **Step 5: Perform release safety checks**

Run: `rg -n "\[\[(DOMAIN|LEGAL_NAME|INN|ADDRESS|EMAIL|PHONE|SMTP_USERNAME|GOOGLE_APP_PASSWORD|LEAD_RECIPIENT|RANDOM_32_BYTE_SECRET)\]\]" public server README.md`

Expected before development handoff: markers are listed in README as required launch replacements. Expected before production deployment: zero matches in deployed public files and the private `server/config.php` contains real values without entering Git.

Run: `git grep -n -E "(smtp_password|GOOGLE_APP_PASSWORD|[A-Za-z0-9]{16})" -- ':!docs/**' ':!server/config.example.php'`

Expected: no real secret appears in tracked application files.

- [ ] **Step 6: Complete deployment documentation**

Document deployment directories, HTTPS requirement, Google App Password creation, PHP extensions `openssl`, `mbstring`, and `json`, writable `server/storage`, domain-marker replacement, real PDF placement, Roskomnadzor/operator review, Gmail cross-border review, and a post-deploy test with one controlled recipient.

- [ ] **Step 7: Final commit**

Run: `git add public server tests README.md`

Run: `git commit -m "test: verify responsive landing release"`

---

## Plan Self-Review Result

- Spec coverage: all twelve specification sections map to Tasks 1–9.
- Interface consistency: browser API response shapes, PHP class names, DOM selectors and storage keys are defined once and reused unchanged.
- Safety: automated tests mock transport; SMTP secrets remain private; legal launch markers are mechanically discoverable.
- Scope: no CMS, analytics, CRM, database, or live deployment was added.
- Documentation sources checked: official PHPMailer installation/SMTP examples and official Playwright visual comparison documentation.

