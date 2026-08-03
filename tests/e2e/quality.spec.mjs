import { test, expect } from '@playwright/test';

test('landing remains functional under the production CSP without unsafe inline scripts', async ({ page }) => {
  const cspErrors = [];
  page.on('console', (message) => {
    if (/content security policy/i.test(message.text())) cspErrors.push(message.text());
  });
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') {
      await route.continue();
      return;
    }

    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'content-security-policy': "default-src 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
      }
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(cspErrors).toEqual([]);
  await expect(page.locator('[data-cookie-banner]')).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
});

test('SEO metadata and semantic essentials are present', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page).toHaveTitle(/Jack/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /швейн/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

  const diagnostics = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    return {
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      imagesWithoutAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
      unlabeledControls: [...document.querySelectorAll('input:not([type="hidden"]):not([aria-hidden="true"])')].filter(
        (input) => input.labels.length === 0 && !input.getAttribute('aria-label')
      ).length
    };
  });

  expect(diagnostics).toEqual({ duplicateIds: [], imagesWithoutAlt: 0, unlabeledControls: 0 });
});

test('organization details are published in structured data', async ({ page }) => {
  await page.goto('/');

  const organization = JSON.parse(
    await page.locator('script[type="application/ld+json"]').first().textContent()
  );

  expect(organization).toMatchObject({
    '@type': 'Organization',
    name: 'ООО «Текстиль Опт Торг»',
    legalName: 'ООО «Текстиль Опт Торг»',
    taxID: '2130136574',
    identifier: 'ОГРН 1142130005731',
    telephone: '+79276677307',
    email: 'tekstilopttorg@mail.ru',
    address: {
      '@type': 'PostalAddress',
      postalCode: '429500',
      addressRegion: 'Чувашская Республика',
      addressLocality: 'пос. Кугеси',
      streetAddress: 'ул. Шоршелская, д. 2',
      addressCountry: 'RU'
    }
  });
});

test('keyboard skip link reaches main content and focus is visible', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const skipLink = page.getByRole('link', { name: 'Перейти к содержимому' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('reduced-motion preference disables meaningful transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const duration = await page.locator('.header-cta').evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration)
  );
  expect(duration).toBeLessThanOrEqual(0.001);
});

test('layout remains usable at a 200 percent desktop-equivalent width', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 700 });
  await page.goto('/');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
  await expect(page.locator('.table-scroll')).toHaveCSS('overflow-x', 'auto');
});
