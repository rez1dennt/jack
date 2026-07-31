import { test, expect } from '@playwright/test';

test('landing renders the primary heading and has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Автоматизируйте');

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );

  expect(hasOverflow).toBe(false);
});

test('all reference sections and legal links exist', async ({ page }) => {
  await page.goto('/');

  for (const text of [
    'Проблема',
    'Решение Jack',
    'Что умеет',
    'Примеры применения',
    'Почему именно Jack?',
    'Технические характеристики'
  ]) {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }

  const footer = page.locator('.site-footer__bottom');
  await expect(footer.getByRole('link', { name: 'Политика конфиденциальности', exact: true })).toHaveAttribute('href', '/privacy.html');
  await expect(footer.getByRole('link', { name: 'Согласие на обработку персональных данных', exact: true })).toHaveAttribute('href', '/consent.html');
});

test('optimized imagery and vector icons are served without missing assets', async ({ page }) => {
  const failedAssets = [];

  page.on('response', (response) => {
    const url = response.url();
    if ((url.includes('/assets/images/') || url.includes('/assets/icons/')) && response.status() >= 400) {
      failedAssets.push(`${response.status()} ${url}`);
    }
  });

  await page.goto('/');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.hero__media img')).toHaveJSProperty('naturalWidth', 1600);
  expect(failedAssets).toEqual([]);
});

test('technical sheet is a real downloadable PDF', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Скачать технический лист (PDF)' })).toHaveAttribute('download', '');

  const response = await request.get('/assets/docs/jack-ms-100a.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
});

test('lead form masks input, validates errors, and submits a normalized phone', async ({ page }) => {
  let submittedBody;

  await page.route('**/api/csrf.php', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'test-csrf' }) });
  });
  await page.route('**/api/submit.php', async (route) => {
    submittedBody = JSON.parse(route.request().postData() ?? '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.goto('/');
  const form = page.locator('#consultation-form');
  const phone = form.locator('[name="phone"]');

  await phone.fill('89991234567');
  await expect(phone).toHaveValue('+7 (999) 123-45-67');
  for (let index = 0; index < 11; index += 1) await phone.press('Backspace');
  await expect(phone).toHaveValue('');

  await form.locator('button[type="submit"]').click();
  await expect(form.locator('#name-error')).toContainText('Укажите имя');
  await expect(form.locator('#phone-error')).toContainText('Введите телефон');

  await form.locator('[name="name"]').fill('Анна');
  await phone.fill('9991234567');
  await form.locator('[name="consent"]').check();
  await form.locator('button[type="submit"]').click();

  await expect(form.locator('.form-status')).toContainText('Спасибо');
  expect(submittedBody.phone).toBe('+79991234567');
  expect(submittedBody.csrf_token).toBe('test-csrf');
});

test('phone mask supports middle deletion, selection replacement, clearing, and re-entry', async ({ page }) => {
  await page.goto('/');
  const phone = page.locator('#consultation-form [name="phone"]');

  await phone.fill('89991234567');
  await phone.evaluate((input) => input.setSelectionRange(11, 11));
  await phone.press('Backspace');
  await expect(phone).toHaveValue('+7 (999) 134-56-7');

  await phone.fill('89991234567');
  await phone.evaluate((input) => input.setSelectionRange(10, 10));
  await phone.press('Delete');
  await expect(phone).toHaveValue('+7 (999) 134-56-7');

  await phone.fill('89991234567');
  await phone.evaluate((input) => input.setSelectionRange(9, 12));
  await phone.type('555');
  await expect(phone).toHaveValue('+7 (999) 555-45-67');

  await phone.fill('');
  await expect(phone).toHaveValue('');
  await phone.fill('+7 921 555 01 02');
  await expect(phone).toHaveValue('+7 (921) 555-01-02');
});

test('mobile menu opens accessibly without shifting the page and closes by Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const button = page.locator('[data-menu-button]');
  const panel = page.locator('[data-menu-panel]');
  const anchorBefore = await page.locator('.header-cta').boundingBox();

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveAttribute('data-open', 'true');
  await expect(page.locator('[data-menu-overlay]')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(panel.locator('a').first()).toBeFocused();
  await expect(page.locator('main')).toHaveJSProperty('inert', true);

  await page.keyboard.press('Shift+Tab');
  await expect(button).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(panel.locator('a').first()).toBeFocused();

  const anchorAfter = await page.locator('.header-cta').boundingBox();
  expect(Math.abs((anchorBefore?.x ?? 0) - (anchorAfter?.x ?? 0))).toBeLessThanOrEqual(1);

  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).not.toHaveAttribute('data-open', 'true');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
  await expect(button).toBeFocused();
});

test('service, video, and social controls have meaningful behavior', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#service')).toHaveCount(1);

  await page.getByRole('button', { name: 'Смотреть видео' }).click();
  const dialog = page.getByRole('dialog', { name: 'Обзор шаблонного автомата Jack' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Закрыть обзор' }).click();
  await expect(dialog).toBeHidden();

  await expect(page.locator('.social-link--disabled')).toHaveCount(3);
});

test('cookie choice is stored and suppresses the banner on return', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('[data-cookie-banner]');
  await expect(banner).toBeVisible();
  await page.locator('[data-cookie-necessary]').click();
  await expect(banner).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('jack_cookie_preference_v1'))).toBe('necessary');

  await page.reload();
  await expect(banner).toBeHidden();
});

test('desktop uses the approved 1440px container and local sans-serif typography', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 900 });
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const heroInner = document.querySelector('.hero__inner').getBoundingClientRect();
    const nav = getComputedStyle(document.querySelector('.site-nav a'));
    return {
      bodyFamily: body.fontFamily,
      bodyLineHeight: body.lineHeight,
      navFamily: nav.fontFamily,
      containerWidth: Math.round(heroInner.width),
      containerLeft: Math.round(heroInner.left)
    };
  });

  expect(metrics.bodyFamily).toContain('Inter Local');
  expect(metrics.bodyFamily).not.toContain('Times New Roman');
  expect(metrics.navFamily).toContain('Inter Local');
  expect(metrics.bodyLineHeight).not.toBe('normal');
  expect(metrics.containerWidth).toBe(1440);
  expect(metrics.containerLeft).toBe(230);
});

test('desktop uses the reference grid composition', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  await expect(page.locator('.hero__inner')).toHaveCSS('display', 'grid');
  await expect(page.locator('.problem-solution')).toHaveCSS('display', 'grid');
  await expect(page.locator('.capabilities__grid')).toHaveCSS('display', 'grid');
});

for (const width of [1440, 1024, 768, 390, 320]) {
  test(`landing has no overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const diagnostics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll('body *')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.right > document.documentElement.clientWidth + 1;
        })
        .slice(0, 12)
        .map((element) => ({
          selector: `${element.tagName.toLowerCase()}.${element.className}`,
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
          width: Math.round(element.getBoundingClientRect().width)
        }))
    }));

    expect(diagnostics.scrollWidth, JSON.stringify(diagnostics.offenders)).toBeLessThanOrEqual(width);
  });
}
