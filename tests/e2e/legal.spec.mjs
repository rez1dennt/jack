import { test, expect } from '@playwright/test';

for (const pagePath of ['/privacy.html', '/consent.html']) {
  test(`${pagePath} identifies the operator and links back to the landing`, async ({ page }) => {
    await page.goto(pagePath);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('[[LEGAL_NAME]]', { exact: true })).toBeVisible();
    await expect(page.getByText('[[INN]]', { exact: true })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: /вернуться/i })).toHaveAttribute('href', '/');
    const logo = page.locator('.brand-logo--legal');
    await expect(logo).toHaveAttribute('aria-label', 'Текстильоптторг — главная');
    await expect(logo.locator('img')).toHaveAttribute('src', '/assets/images/textileopttorg-logo.webp');

    await page.setViewportSize({ width: 280, height: 700 });
    await page.reload();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });
}
