import { test, expect } from '@playwright/test';

test('navigation targets the company service and about sections', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('.site-header');
  await expect(header.locator('a[href="#service"]')).toHaveText('Сервис');
  await expect(header.locator('a[href="#about"]')).toHaveText('О компании');
  await expect(page.locator('#service')).toContainText('Почему выбирают Текстиль Опт Торг');
  await expect(page.locator('#about')).toContainText('О компании');
});

test('client supplied company facts replace unsupported case claims', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#about')).toContainText('с 2003 года');
  await expect(page.locator('#about')).toContainText('1 800');
  await expect(page.locator('#about')).toContainText('30 регион');
  await expect(page.locator('#about')).toContainText('60 брендов');
  await expect(page.getByText(/Фабрика в Иваново/i)).toHaveCount(0);
  await expect(page.getByText('+35%', { exact: true })).toHaveCount(0);
  await expect(page.getByText('×2', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/оператора высвобождено/i)).toHaveCount(0);
  await expect(page.getByText(/до 70%/i)).toHaveCount(0);
});

test('machine specifications are model-specific and keyboard accessible', async ({ page }) => {
  await page.goto('/');

  const j6Tab = page.getByRole('tab', { name: 'JACK J6', exact: true });
  const m9Tab = page.getByRole('tab', { name: 'JACK M9', exact: true });
  await expect(j6Tab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'JACK J6' })).toContainText('До 210 мм');
  await expect(page.getByRole('tabpanel', { name: 'JACK J6' })).toContainText('120 Вт');
  await expect(page.getByRole('tabpanel', { name: 'JACK J6' })).toContainText('До 3 000 ст/мин');

  await j6Tab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(m9Tab).toBeFocused();
  await expect(m9Tab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'JACK M9' })).toContainText('1400 × 950 мм');
  await expect(page.getByRole('tabpanel', { name: 'JACK M9' })).toContainText('До 3 600 ст/мин');
  await expect(page.getByRole('tabpanel', { name: 'JACK M9' })).toContainText('610 / 690 кг');
  await expect(page.locator('.specifications')).not.toContainText('MS-100A');
});

test('watch video opens the supplied local recording and resets it on close', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Смотреть видео' }).click();

  const dialog = page.getByRole('dialog', { name: 'Демонстрация оборудования JACK' });
  const video = dialog.locator('video');
  await expect(dialog).toBeVisible();
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).toHaveAttribute('playsinline', '');
  await expect(video).toHaveAttribute('preload', 'metadata');
  await expect(video.locator('source')).toHaveAttribute('src', '/assets/video/jack-demonstration.mp4');

  await video.evaluate((node) => { node.currentTime = 0.5; });
  await dialog.getByRole('button', { name: 'Закрыть видео' }).click();
  await expect(dialog).toBeHidden();
  expect(await page.locator('.video-dialog video').evaluate((node) => ({ paused: node.paused, currentTime: node.currentTime })))
    .toEqual({ paused: true, currentTime: 0 });
});

test('combined technical sheet is linked and local media load successfully', async ({ page, request }) => {
  const failures = [];
  page.on('response', (response) => {
    if (response.url().includes('/assets/') && response.status() >= 400) failures.push(response.url());
  });

  await page.goto('/');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');

  const download = page.locator('.button--download');
  await expect(download).toHaveAttribute('href', '/assets/docs/jack-j6-m9.pdf');
  const pdfResponse = await request.get('/assets/docs/jack-j6-m9.pdf');
  expect(pdfResponse.ok()).toBe(true);
  expect((await pdfResponse.body()).byteLength).toBeGreaterThan(10_000);
  expect(failures).toEqual([]);
});

test('capability copy does not use hard-coded line breaks', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.capability br')).toHaveCount(0);
});
