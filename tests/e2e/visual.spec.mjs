import { test, expect } from '@playwright/test';

for (const viewport of [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 }
]) {
  test(`visual ${viewport.name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'One deterministic Chromium baseline is sufficient.');
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('jack_cookie_preference_v1', 'necessary'));
    await page.reload();
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));

    await expect(page).toHaveScreenshot(`${viewport.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide'
    });
  });
}
