import { test, expect } from '@playwright/test';

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
