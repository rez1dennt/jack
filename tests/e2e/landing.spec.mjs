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
