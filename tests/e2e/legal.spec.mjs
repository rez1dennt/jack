import { test, expect } from '@playwright/test';

for (const pagePath of ['/privacy.html', '/consent.html']) {
  test(`${pagePath} identifies the operator and links back to the landing`, async ({ page }) => {
    await page.goto(pagePath);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('[[LEGAL_NAME]]', { exact: true })).toBeVisible();
    await expect(page.getByText('[[INN]]', { exact: true })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: /вернуться/i })).toHaveAttribute('href', '/');
  });
}
