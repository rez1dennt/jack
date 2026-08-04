import { test, expect } from '@playwright/test';

test('navigation follows the real landing section order', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('.site-header');
  const navigation = await header.locator('.site-nav__list a').evaluateAll((links) => links.map((link) => ({
    text: link.textContent.trim(),
    href: link.getAttribute('href')
  })));
  expect(navigation).toEqual([
    { text: 'Решения', href: '#solutions' },
    { text: 'Возможности', href: '#capabilities' },
    { text: 'Сервис', href: '#service' },
    { text: 'Оборудование', href: '#equipment' },
    { text: 'О компании', href: '#about' },
    { text: 'Контакты', href: '#contacts' }
  ]);

  const sectionOrder = await page.locator('main > section').evaluateAll((sections) => sections.map((section) => section.id).filter(Boolean));
  expect(sectionOrder.indexOf('solutions')).toBeLessThan(sectionOrder.indexOf('capabilities'));
  expect(sectionOrder.indexOf('capabilities')).toBeLessThan(sectionOrder.indexOf('service'));
  expect(sectionOrder.indexOf('service')).toBeLessThan(sectionOrder.indexOf('equipment'));
  expect(sectionOrder.indexOf('equipment')).toBeLessThan(sectionOrder.indexOf('about'));
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
  const modelImage = page.locator('[data-model-image]');
  await expect(j6Tab).toHaveAttribute('aria-selected', 'true');
  await expect(modelImage).toHaveAttribute('src', '/assets/images/jack-j6.webp');
  await expect(modelImage).toHaveAttribute('alt', /JACK J6/);
  await expect(page.getByRole('tabpanel', { name: 'JACK J6' })).toContainText('До 210 мм');
  await expect(page.getByRole('tabpanel', { name: 'JACK J6' })).toContainText('120 Вт');
  await expect(page.getByRole('tabpanel', { name: 'JACK J6' })).toContainText('До 3 000 ст/мин');

  await j6Tab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(m9Tab).toBeFocused();
  await expect(m9Tab).toHaveAttribute('aria-selected', 'true');
  await expect(modelImage).toHaveAttribute('src', '/assets/images/jack-m9.webp');
  await expect(modelImage).toHaveAttribute('alt', /JACK M9/);
  await expect.poll(() => modelImage.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
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

test('company reasons keep the open divider row and use the enlarged scale', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1000 });
  await page.goto('/');

  await expect(page.locator('#reasons-title')).toHaveText('Почему выбирают Текстиль Опт Торг');

  const metrics = await page.locator('.reasons').evaluate((section) => {
    const grid = section.querySelector('.reasons__grid');
    const reason = section.querySelector('.reason');
    const icon = reason.querySelector(':scope > span');
    const title = reason.querySelector('strong');
    const copy = reason.querySelector('p');
    const gridStyle = getComputedStyle(grid);
    const reasonStyle = getComputedStyle(reason);

    return {
      sectionHeight: Math.round(section.getBoundingClientRect().height),
      reasonHeight: Math.round(reason.getBoundingClientRect().height),
      columns: gridStyle.gridTemplateColumns.split(' ').length,
      iconWidth: Math.round(icon.getBoundingClientRect().width),
      titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
      copySize: Number.parseFloat(getComputedStyle(copy).fontSize),
      background: reasonStyle.backgroundColor,
      radius: reasonStyle.borderRadius,
      divider: reasonStyle.borderInlineEndWidth
    };
  });

  expect(metrics.sectionHeight).toBeGreaterThanOrEqual(220);
  expect(metrics.reasonHeight).toBeGreaterThanOrEqual(112);
  expect(metrics.columns).toBe(4);
  expect(metrics.iconWidth).toBeGreaterThanOrEqual(56);
  expect(metrics.titleSize).toBeGreaterThanOrEqual(18);
  expect(metrics.copySize).toBeGreaterThanOrEqual(14);
  expect(metrics.background).toBe('rgba(0, 0, 0, 0)');
  expect(metrics.radius).toBe('0px');
  expect(metrics.divider).toBe('1px');
});
