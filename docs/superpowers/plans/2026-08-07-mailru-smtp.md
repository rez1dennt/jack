# Mail.ru SMTP Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send validated website leads from `tekstilopttorg@mail.ru` to the same mailbox through authenticated Mail.ru SMTP without committing the SMTP password.

**Architecture:** Keep the existing browser, CSRF, request-guard, validation, rate-limit and PHPMailer pipeline unchanged. Change the checked-in example configuration and documentation from Google SMTP to Mail.ru SMTP, then create an ignored private configuration for the real credential and perform a live connection test only when the environment permits outbound SMTP.

**Tech Stack:** PHP 8.1+, PHPMailer 7, Composer 2, Node.js test runner, Mail.ru SMTP.

## Global Constraints

- Use `smtp.mail.ru`, port `465`, SMTP authentication and SSL/TLS (`PHPMailer::ENCRYPTION_SMTPS`).
- Use `tekstilopttorg@mail.ru` for SMTP username, `From` and recipient.
- Never put the SMTP password in Git, documentation, HTML, JavaScript, test fixtures or command output.
- Keep `server/config.php` outside `public/` and ignored by Git.
- Keep all current form protections and neutral visitor-facing error messages.
- Do not change the site's fonts, layout or visible copy outside form delivery status already implemented.

---

### Task 1: Lock Mail.ru transport settings with a failing configuration test

**Files:**
- Create: `tests/php/MailruConfig.test.php`
- Modify: `server/config.example.php`
- Modify: `tests/php/MailerTransport.test.php`

**Interfaces:**
- Consumes: `server/config.example.php -> array{security: array, smtp: array}` and `JackLanding\MailerTransport::__construct(array $config, ?callable $sender = null)`.
- Produces: checked-in Mail.ru defaults with secret placeholder `[[MAILRU_APP_PASSWORD]]` and transport coverage for SMTPS port 465.

- [ ] **Step 1: Write the failing example-configuration test**

```php
<?php
declare(strict_types=1);

$config = require dirname(__DIR__, 2) . '/server/config.example.php';
$smtp = $config['smtp'] ?? [];

assert($smtp['host'] === 'smtp.mail.ru');
assert($smtp['port'] === 465);
assert($smtp['username'] === 'tekstilopttorg@mail.ru');
assert($smtp['password'] === '[[MAILRU_APP_PASSWORD]]');
assert($smtp['encryption'] === 'ssl');
assert($smtp['from_email'] === 'tekstilopttorg@mail.ru');
assert($smtp['to_email'] === 'tekstilopttorg@mail.ru');
```

- [ ] **Step 2: Run the new test and verify the expected RED state**

Run:

```powershell
php -d zend.assertions=1 -d assert.exception=1 tests/php/MailruConfig.test.php
```

Expected: FAIL because the current example still contains `smtp.gmail.com`, port `587`, `tls` and Google placeholders.

- [ ] **Step 3: Update the example configuration with Mail.ru defaults**

Set the SMTP block in `server/config.example.php` to:

```php
'smtp' => [
    'host' => 'smtp.mail.ru',
    'port' => 465,
    'username' => 'tekstilopttorg@mail.ru',
    // Пароль для внешнего приложения Mail.ru хранится только в server/config.php.
    'password' => '[[MAILRU_APP_PASSWORD]]',
    'encryption' => 'ssl',
    'from_email' => 'tekstilopttorg@mail.ru',
    'from_name' => 'Текстиль Опт Торг',
    'to_email' => 'tekstilopttorg@mail.ru',
    'to_name' => 'Отдел продаж',
],
```

- [ ] **Step 4: Align the transport unit test with Mail.ru SMTPS**

Use a synthetic password in `tests/php/MailerTransport.test.php`, then assert:

```php
assert($captured->Host === 'smtp.mail.ru');
assert($captured->Port === 465);
assert($captured->SMTPAuth === true);
assert($captured->SMTPSecure === PHPMailer::ENCRYPTION_SMTPS);
assert($captured->Username === 'tekstilopttorg@mail.ru');
assert($captured->From === 'tekstilopttorg@mail.ru');
assert($captured->getToAddresses()[0][0] === 'tekstilopttorg@mail.ru');
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```powershell
php -d zend.assertions=1 -d assert.exception=1 tests/php/MailruConfig.test.php
php -d zend.assertions=1 -d assert.exception=1 tests/php/MailerTransport.test.php
```

Expected: both commands exit `0` with no assertion errors.

- [ ] **Step 6: Commit the tested public configuration change**

```powershell
git add server/config.example.php tests/php/MailruConfig.test.php tests/php/MailerTransport.test.php
git commit -m "feat: configure Mail.ru SMTP transport"
```

---

### Task 2: Create the ignored private configuration and validate it safely

**Files:**
- Create, but never stage: `server/config.php`
- Existing ignore rule: `.gitignore`

**Interfaces:**
- Consumes: `jack_load_config(): array` from `server/bootstrap.php`.
- Produces: a runtime configuration containing the supplied Mail.ru external-application password without printing or committing it.

- [ ] **Step 1: Generate the rate-limit secret without printing it**

Generate 32 random bytes directly for the `security.rate_limit_secret` value. Do not echo either this secret or the SMTP password to the terminal.

- [ ] **Step 2: Create `server/config.php` from the checked-in example**

Use these exact public values. In the two secret fields, assign the freshly generated rate-limit secret and the SMTP password already supplied by the owner directly while creating the ignored file; never echo either value:

```php
'security' => [
    'allowed_origin' => 'http://127.0.0.1:8080',
    'rate_limit_secret' => $freshRateLimitSecret,
    'rate_limit_count' => 5,
    'rate_limit_window_seconds' => 600,
],
'smtp' => [
    'host' => 'smtp.mail.ru',
    'port' => 465,
    'username' => 'tekstilopttorg@mail.ru',
    'password' => $suppliedMailruAppPassword,
    'encryption' => 'ssl',
    'from_email' => 'tekstilopttorg@mail.ru',
    'from_name' => 'Текстиль Опт Торг',
    'to_email' => 'tekstilopttorg@mail.ru',
    'to_name' => 'Отдел продаж',
],
```

Before production deployment, change `allowed_origin` to the final HTTPS origin.

- [ ] **Step 3: Verify the private file is ignored and syntactically valid**

Run:

```powershell
git check-ignore -q server/config.php
php -l server/config.php
git ls-files --error-unmatch server/config.php
```

Expected: ignore check exits `0`, PHP lint exits `0`, and `git ls-files` exits nonzero because the file is not tracked.

- [ ] **Step 4: Validate non-secret runtime fields without displaying the password**

Run a PHP assertion script that loads `server/config.php` and checks only host, port, username, encryption, From and recipient. Expected: exit `0` and no output.

---

### Task 3: Replace Google deployment instructions with Mail.ru instructions

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: the runtime settings fixed in Task 1.
- Produces: deployment instructions that name the exact Mail.ru server, port, encryption, mailbox and private placeholder.

- [ ] **Step 1: Add a failing documentation regression test**

Extend `tests/php/MailruConfig.test.php` with assertions that `README.md` contains `smtp.mail.ru`, `465`, `SSL/TLS`, `[[MAILRU_APP_PASSWORD]]`, and does not contain `smtp.gmail.com`, `[[GOOGLE_APP_PASSWORD]]` or the heading `Настройка Google SMTP`.

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
php -d zend.assertions=1 -d assert.exception=1 tests/php/MailruConfig.test.php
```

Expected: FAIL because README still documents Google SMTP.

- [ ] **Step 3: Update README with exact Mail.ru deployment steps**

Document:

- external-app password creation in Mail.ru security settings;
- `smtp.mail.ru`, port `465`, SSL/TLS and authentication;
- `tekstilopttorg@mail.ru` as username, From and recipient;
- `server/config.php` as the only secret location;
- the final-domain replacement for `allowed_origin`;
- a single controlled submission plus Inbox/Spam verification after deployment.

- [ ] **Step 4: Run the documentation test and verify GREEN**

Run:

```powershell
php -d zend.assertions=1 -d assert.exception=1 tests/php/MailruConfig.test.php
```

Expected: exit `0` with no assertion errors.

- [ ] **Step 5: Commit the documentation update**

```powershell
git add README.md tests/php/MailruConfig.test.php
git commit -m "docs: document Mail.ru SMTP deployment"
```

---

### Task 4: Run the complete safety and regression verification

**Files:**
- Verify only: `public/api/csrf.php`
- Verify only: `public/api/submit.php`
- Verify only: `server/bootstrap.php`
- Verify only: `server/src/*.php`
- Verify only: `tests/php/*.test.php`
- Verify only: tracked repository files

**Interfaces:**
- Consumes: all deliverables from Tasks 1–3.
- Produces: evidence that form behavior remains valid and no secret is tracked.

- [ ] **Step 1: Run every PHP test**

```powershell
Get-ChildItem tests/php/*.test.php | ForEach-Object { php -d zend.assertions=1 -d assert.exception=1 $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

Expected: exit `0` and no assertion errors.

- [ ] **Step 2: Run JavaScript and form browser tests**

```powershell
npm run test:js
npx playwright test tests/e2e/api.spec.mjs tests/e2e/form-errors.spec.mjs
```

Expected: all tests pass.

- [ ] **Step 3: Lint all PHP entrypoints and classes**

```powershell
$phpFiles = @('public/api/csrf.php', 'public/api/submit.php', 'server/bootstrap.php') + (Get-ChildItem server/src/*.php | Select-Object -ExpandProperty FullName)
$phpFiles | ForEach-Object { php -l $_; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

Expected: every file reports `No syntax errors detected`.

- [ ] **Step 4: Prove the secret and private config are not tracked**

```powershell
git check-ignore -q server/config.php
git ls-files --error-unmatch server/config.php
git grep -n -F '[[GOOGLE_APP_PASSWORD]]' -- ':!docs/**'
git diff --check
git status --short
```

Expected: private config is ignored and untracked; obsolete Google placeholder is absent from runtime files; diff check is clean. Inspect status to ensure no secret-bearing file is staged.

- [ ] **Step 5: Attempt one controlled live SMTP delivery when network access is available**

Invoke `MailerTransport` with a synthetic lead and the private runtime configuration. Suppress SMTP debug output. Expected: the command exits `0` and one message appears in `tekstilopttorg@mail.ru`. If the local sandbox blocks outbound port 465, record that exact limitation and repeat only this step on the PHP host.

- [ ] **Step 6: Commit any final test-only corrections, excluding `server/config.php`**

```powershell
git status --short
git add README.md server/config.example.php tests/php
git commit -m "test: verify Mail.ru lead delivery configuration"
```

Skip the commit when there are no remaining tracked changes.
