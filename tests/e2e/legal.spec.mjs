import { test, expect } from '@playwright/test';

for (const pagePath of ['/privacy.html', '/consent.html', '/requisites.html']) {
  test(`${pagePath} identifies the operator and links back to the landing`, async ({ page }) => {
    await page.goto(pagePath);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('ООО «Текстиль Опт Торг»', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('2130136574', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: /вернуться/i })).toHaveAttribute('href', '/');
    const logo = page.locator('.brand-logo--legal');
    await expect(logo).toHaveAttribute('aria-label', 'Текстильоптторг — главная');
    await expect(logo.locator('img')).toHaveAttribute('src', '/assets/images/textileopttorg-logo.webp');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      'href',
      '/assets/icons/favicon.svg'
    );

    await page.setViewportSize({ width: 320, height: 700 });
    await page.reload();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });
}

test('requisites page exposes complete organization details', async ({ page }) => {
  await page.goto('/requisites.html');

  for (const value of [
    '211601001',
    '1142130005731',
    '042202803',
    '30101810700000000803',
    '40702810203000184072',
    'Федотов Андрей Николаевич'
  ]) {
    await expect(page.getByText(value, { exact: false }).first()).toBeVisible();
  }

  await expect(page.getByRole('link', { name: 'tekstilopttorg@mail.ru' })).toHaveAttribute(
    'href',
    'mailto:tekstilopttorg@mail.ru'
  );
  await expect(page.getByRole('link', { name: '8 (927) 667-73-07' })).toHaveAttribute(
    'href',
    'tel:+79276677307'
  );
});

test('public legal documents contain no unresolved operator placeholders', async ({ request }) => {
  for (const pagePath of ['/privacy.html', '/consent.html', '/requisites.html']) {
    const response = await request.get(pagePath);
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toMatch(
      /\[\[(LEGAL_NAME|INN|ADDRESS|EMAIL|PHONE|RETENTION_PERIOD)\]\]/
    );
  }
});
