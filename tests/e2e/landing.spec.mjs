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

  const footer = page.locator('.site-footer');
  await expect(footer.getByRole('link', { name: 'Политика конфиденциальности', exact: true })).toHaveAttribute('href', '/privacy.html');
  await expect(footer.getByRole('link', { name: 'Согласие на обработку персональных данных', exact: true })).toHaveAttribute('href', '/consent.html');
});

test('footer matches the approved contact navigation help and legal contract', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.site-footer');

  await expect(footer.locator('.footer-column')).toHaveCount(3);
  await expect(footer.locator('.footer-contact')).toHaveCount(4);
  await expect(footer.getByRole('link', { name: /Нужна помощь/i })).toHaveAttribute('href', '#consultation-form');
  await expect(footer.locator('.footer-nav li')).toHaveCount(5);
  await expect(footer.locator('.social-link')).toHaveCount(3);
  await expect(footer.locator('.footer-legal a')).toHaveCount(2);
  await expect(footer.locator('.site-footer__year')).toHaveText('2026');
  await expect(footer.getByRole('link', { name: 'Политика конфиденциальности' })).toHaveAttribute('href', '/privacy.html');
  await expect(footer.getByRole('link', { name: 'Согласие на обработку персональных данных' })).toHaveAttribute('href', '/consent.html');
});

test('footer accent text keeps WCAG AA contrast on the industrial background', async ({ page }) => {
  await page.goto('/');

  const contrast = await page.evaluate(() => {
    const parseRgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = (rgb) => rgb
      .map((channel) => channel / 255)
      .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const year = document.querySelector('.site-footer__year');
    const footer = document.querySelector('.site-footer');
    const foreground = luminance(parseRgb(getComputedStyle(year).color));
    const background = luminance(parseRgb(getComputedStyle(footer).backgroundColor));
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });

  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test('solution action keeps WCAG AA contrast when dark tokens are active', async ({ page }) => {
  await page.goto('/');

  const contrast = await page.evaluate(() => {
    const action = document.querySelector('.button--solution');
    action.style.transition = 'none';
    document.documentElement.dataset.theme = 'dark';
    const parseRgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = (rgb) => rgb
      .map((channel) => channel / 255)
      .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const foreground = luminance(parseRgb(getComputedStyle(action).color));
    const background = luminance(parseRgb(getComputedStyle(document.querySelector('.solution-panel')).backgroundColor));
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });

  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test('problem panel exposes a solid red fallback behind its gradient', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.problem-panel')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('footer spans the viewport while its content stays on the 1440px grid', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  const geometry = await page.evaluate(() => {
    const footer = document.querySelector('.site-footer').getBoundingClientRect();
    const grid = document.querySelector('.site-footer__grid').getBoundingClientRect();
    const help = document.querySelector('.footer-help').getBoundingClientRect();
    return {
      footer: { left: Math.round(footer.left), width: Math.round(footer.width) },
      grid: { left: Math.round(grid.left), width: Math.round(grid.width) },
      helpHeight: Math.round(help.height)
    };
  });

  expect(geometry.footer).toEqual({ left: 0, width: 1900 });
  expect(geometry.grid).toEqual({ left: 230, width: 1440 });
  expect(geometry.helpHeight).toBeGreaterThanOrEqual(88);

  await page.getByRole('link', { name: /Нужна помощь/i }).click();
  await expect(page.locator('#consultation-form')).toBeInViewport();
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

test('site header stays pinned with a subtle shadow on every viewport', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const header = page.locator('.site-header');
    const styles = await header.evaluate((node) => {
      const computed = getComputedStyle(node);
      return {
        position: computed.position,
        top: computed.top,
        shadow: computed.boxShadow
      };
    });

    expect(styles.position).toBe('sticky');
    expect(styles.top).toBe('0px');
    expect(styles.shadow).not.toBe('none');

    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(header).toBeInViewport();
    const box = await header.boundingBox();
    expect(Math.abs(box?.y ?? 999)).toBeLessThanOrEqual(1);
  }
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

test('hero copy aligns with the container and keeps only responsive top padding', async ({ page }) => {
  for (const [width, expectedTop] of [[1900, 64], [768, 48], [390, 48]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const geometry = await page.evaluate(() => {
      const inner = document.querySelector('.hero__inner').getBoundingClientRect();
      const content = document.querySelector('.hero__content');
      const contentRect = content.getBoundingClientRect();
      const title = document.querySelector('.hero h1').getBoundingClientRect();
      const style = getComputedStyle(content);
      return {
        innerLeft: Math.round(inner.left),
        contentLeft: Math.round(contentRect.left),
        titleLeft: Math.round(title.left),
        paddingTop: Number.parseFloat(style.paddingTop),
        paddingRight: Number.parseFloat(style.paddingRight),
        paddingBottom: Number.parseFloat(style.paddingBottom),
        paddingLeft: Number.parseFloat(style.paddingLeft),
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      };
    });

    expect(geometry.contentLeft).toBe(geometry.innerLeft);
    expect(geometry.titleLeft).toBe(geometry.innerLeft);
    expect(geometry.paddingTop).toBe(expectedTop);
    expect(geometry.paddingRight).toBe(0);
    expect(geometry.paddingBottom).toBe(0);
    expect(geometry.paddingLeft).toBe(0);
    expect(geometry.scrollWidth).toBe(geometry.viewportWidth);
  }
});

test('mobile hero actions form one equal-width CTA stack', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto('/');

  const geometry = await page.locator('.hero__actions .button').evaluateAll((buttons) => {
    const rects = buttons.map((button) => button.getBoundingClientRect());
    return {
      widths: rects.map(({ width }) => Math.round(width)),
      lefts: rects.map(({ left }) => Math.round(left)),
      heights: rects.map(({ height }) => Math.round(height)),
      verticalGap: Math.round(rects[1].top - rects[0].bottom)
    };
  });

  expect(geometry.widths[0]).toBe(geometry.widths[1]);
  expect(geometry.lefts[0]).toBe(geometry.lefts[1]);
  expect(geometry.heights.every((height) => height >= 48)).toBe(true);
  expect(geometry.verticalGap).toBe(12);
});

test('mobile hero lead keeps a word boundary when its line break is hidden', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('.hero__lead')).toHaveText(
    'Точное пришивание деталей по контуру: карманы, молнии, этикетки без ручного труда'
  );
});

test('hero media spans the viewport while copy stays on the 1440px grid', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 900 });
  await page.goto('/');

  const desktop = await page.evaluate(() => {
    const hero = document.querySelector('.hero').getBoundingClientRect();
    const inner = document.querySelector('.hero__inner').getBoundingClientRect();
    const mediaElement = document.querySelector('.hero__media');
    const media = mediaElement.getBoundingClientRect();
    const title = getComputedStyle(document.querySelector('.hero h1'));
    return {
      hero: {
        left: Math.round(hero.left),
        right: Math.round(hero.right),
        width: Math.round(hero.width),
        height: Math.round(hero.height)
      },
      inner: {
        left: Math.round(inner.left),
        width: Math.round(inner.width),
        height: Math.round(inner.height)
      },
      media: {
        left: Math.round(media.left),
        right: Math.round(media.right),
        width: Math.round(media.width),
        height: Math.round(media.height)
      },
      mediaPosition: getComputedStyle(mediaElement).position,
      titleSize: title.fontSize,
      titleLineHeight: Number.parseFloat(title.lineHeight)
    };
  });

  expect(desktop.hero).toEqual({ left: 0, right: 1900, width: 1900, height: 440 });
  expect(desktop.inner).toEqual({ left: 230, width: 1440, height: 440 });
  expect(desktop.media).toEqual({ left: 0, right: 1900, width: 1900, height: 440 });
  expect(desktop.mediaPosition).toBe('absolute');
  expect(desktop.titleSize).toBe('46px');
  expect(desktop.titleLineHeight).toBeCloseTo(49.68, 1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const mobile = await page.evaluate(() => {
    const inner = document.querySelector('.hero__inner').getBoundingClientRect();
    const mediaElement = document.querySelector('.hero__media');
    const media = mediaElement.getBoundingClientRect();
    return {
      mediaPosition: getComputedStyle(mediaElement).position,
      innerBottom: Math.round(inner.bottom),
      mediaTop: Math.round(media.top),
      mediaWidth: Math.round(media.width)
    };
  });

  expect(mobile.mediaPosition).toBe('relative');
  expect(mobile.mediaTop).toBeGreaterThanOrEqual(mobile.innerBottom);
  expect(mobile.mediaWidth).toBe(390);
});

test('desktop uses the reference grid composition', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  await expect(page.locator('.hero__inner')).toHaveCSS('position', 'relative');
  await expect(page.locator('.problem-solution')).toHaveCSS('display', 'grid');
  await expect(page.locator('.capabilities__grid')).toHaveCSS('display', 'grid');
});

test('problem and solution card exposes the approved copy and benefit structure', async ({ page }) => {
  await page.goto('/');

  const card = page.locator('.problem-solution');
  await expect(card.getByRole('heading', { name: 'Проблема', exact: true })).toBeVisible();
  await expect(card.locator('.problem-item')).toHaveCount(3);
  await expect(card.locator('.problem-item__description')).toHaveText([
    'Снижает производительность и увеличивает сроки',
    'Из-за человеческого фактора страдает качество изделий',
    'Ручной труд ограничивает объёмы и увеличивает затраты'
  ]);
  await expect(card.locator('.solution-panel__eyebrow')).toHaveText('Наше решение');
  await expect(card.locator('.solution-benefit')).toHaveCount(4);
  await expect(card.locator('.solution-benefit__title')).toHaveText([
    'Точность до 0,1 мм',
    'Стабильное качество',
    'Высокая скорость',
    'Лёгкое масштабирование'
  ]);
  await expect(card.getByRole('link', { name: 'Узнать больше о решении' })).toHaveAttribute('href', '#equipment');
});

test('hero transition uses the approved responsive spacing', async ({ page }) => {
  for (const [width, expectedGap] of [[1440, 48], [768, 32], [390, 24]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const gap = await page.evaluate(() => {
      const hero = document.querySelector('.hero').getBoundingClientRect();
      const card = document.querySelector('.problem-solution').getBoundingClientRect();
      return Math.round(card.top - hero.bottom);
    });

    expect(gap).toBe(expectedGap);
  }
});

test('problem and solution card matches the approved desktop composition', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  const geometry = await page.locator('.problem-solution').evaluate((card) => {
    const problem = card.querySelector('.problem-panel').getBoundingClientRect();
    const media = card.querySelector('.problem-solution__media').getBoundingClientRect();
    const solution = card.querySelector('.solution-panel').getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    return {
      card: { width: Math.round(rect.width), height: Math.round(rect.height) },
      columns: [problem, media, solution].map((column) => Math.round(column.width)),
      aligned: [problem, media, solution].every((column) => Math.abs(column.height - rect.height) <= 2),
      radius: getComputedStyle(card).borderRadius,
      benefits: getComputedStyle(card.querySelector('.solution-benefits')).gridTemplateColumns
    };
  });

  expect(geometry.card.width).toBe(1440);
  expect(geometry.card.height).toBeGreaterThanOrEqual(560);
  expect(geometry.aligned).toBe(true);
  expect(geometry.columns.every((width) => width >= 400)).toBe(true);
  expect(geometry.radius).not.toBe('0px');
  expect(geometry.benefits.split(' ').length).toBe(2);
});

test('redesigned problem solution and footer stack safely across breakpoints', async ({ page }) => {
  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');

    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      problemColumns: getComputedStyle(document.querySelector('.problem-solution')).gridTemplateColumns.split(' ').length,
      footerColumns: getComputedStyle(document.querySelector('.site-footer__grid')).gridTemplateColumns.split(' ').length,
      benefitsColumns: getComputedStyle(document.querySelector('.solution-benefits')).gridTemplateColumns.split(' ').length
    }));

    expect(metrics.overflow).toBe(false);
    if (width >= 1024) expect(metrics.problemColumns).toBe(2);
    if (width <= 768) expect(metrics.problemColumns).toBe(1);
    if (width <= 390) {
      expect(metrics.footerColumns).toBe(1);
      expect(metrics.benefitsColumns).toBe(1);
    }
  }
});

test('capabilities reproduce the five-card reference composition', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  await expect(page.locator('.capability')).toHaveCount(5);
  expect(await page.locator('.capability__number').evaluateAll(
    (nodes) => nodes.map((node) => node.dataset.number)
  )).toEqual(['01', '02', '03', '04', '05']);
  await expect(page.locator('.capability__description')).toHaveCount(5);
  await expect(page.locator('.capabilities__heading-accent')).toHaveText(/умеет/i);

  const desktop = await page.evaluate(() => {
    const section = document.querySelector('.capabilities .container').getBoundingClientRect();
    const grid = document.querySelector('.capabilities__grid');
    const card = document.querySelector('.capability');
    return {
      left: Math.round(section.left),
      width: Math.round(section.width),
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      radius: getComputedStyle(card).borderRadius,
      minHeight: Math.round(card.getBoundingClientRect().height)
    };
  });

  expect(desktop).toMatchObject({ left: 230, width: 1440, columns: 5, radius: '12px' });
  expect(desktop.minHeight).toBeGreaterThanOrEqual(400);

  for (const [width, columns] of [[1024, 3], [768, 2], [390, 1]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    expect(await page.locator('.capabilities__grid').evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns.split(' ').length
    )).toBe(columns);
  }
});

test('specifications reproduce the table, product benefits, and download panel', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  await expect(page.locator('.spec-parameter')).toHaveCount(10);
  await expect(page.locator('.spec-parameter [data-icon]')).toHaveCount(10);
  await expect(page.locator('.product-benefit')).toHaveCount(4);
  await expect(page.locator('.product-benefit h3')).toHaveText([
    'Высокая точность',
    'Скорость и стабильность',
    'Надёжность',
    'Простое управление'
  ]);
  await expect(page.locator('.specifications__download-copy small')).toHaveText('Подробные характеристики и руководство');

  const geometry = await page.evaluate(() => {
    const container = document.querySelector('.specifications > .container').getBoundingClientRect();
    const panel = document.querySelector('.specifications__panel').getBoundingClientRect();
    return {
      container: { left: Math.round(container.left), width: Math.round(container.width) },
      panelWidth: Math.round(panel.width),
      radius: getComputedStyle(document.querySelector('.specifications__panel')).borderRadius,
      columns: getComputedStyle(document.querySelector('.specifications__grid')).gridTemplateColumns.split(' ').length
    };
  });

  expect(geometry).toEqual({
    container: { left: 230, width: 1440 },
    panelWidth: 1440,
    radius: '12px',
    columns: 2
  });
});

test('mobile specifications show both models without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const firstRow = page.locator('.specifications tbody tr').first();
  await expect(firstRow.locator('td')).toHaveText(['220 × 100 мм', '300 × 200 мм']);

  const geometry = await page.evaluate(() => {
    const wrapper = document.querySelector('.specifications .table-scroll');
    const row = document.querySelector('.specifications tbody tr');
    const cells = [...row.children].map((cell) => getComputedStyle(cell));
    return {
      overflows: wrapper.scrollWidth > wrapper.clientWidth + 1,
      rowColumns: getComputedStyle(row).gridTemplateColumns.split(' ').length,
      parameterColumn: cells[0].gridColumn,
      labels: [...row.querySelectorAll('td')].map((cell) => cell.dataset.model)
    };
  });

  expect(geometry).toEqual({
    overflows: false,
    rowColumns: 2,
    parameterColumn: '1 / -1',
    labels: ['Jack MS-100A', 'Jack JK-T2210']
  });
});

test('Industrial Control Room CTA exposes the approved copy and form contract', async ({ page }) => {
  await page.goto('/');

  const section = page.locator('.lead-section');
  const panel = section.locator('.lead-panel');
  const form = section.locator('#consultation-form');

  await expect(section.locator(':scope > .container')).toHaveCount(1);
  await expect(panel).toHaveCount(1);
  await expect(panel.locator('.lead-section__media')).toHaveCount(1);
  await expect(section.locator('.lead-section__eyebrow')).toHaveText('Расчёт проекта');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Ускорьте производство с Jack');
  await expect(section.locator('.lead-section__copy > p')).toHaveText(
    'Опишите задачу. Специалист подберёт конфигурацию оборудования под ваши операции и материалы.'
  );
  await expect(section.locator('.lead-section__point')).toHaveText([
    'Бесплатная консультация',
    'Подбор под задачу'
  ]);
  await expect(section.locator('.lead-section__point [data-icon="check-circle"]')).toHaveCount(2);
  expect(await section.locator('.lead-section__point [data-icon="check-circle"]').first().evaluate((node) => {
    const style = getComputedStyle(node);
    return style.maskImage || style.webkitMaskImage;
  })).toContain('check-circle.svg');

  await expect(form.locator('.lead-form__header h3')).toHaveText('Получить консультацию');
  await expect(form.locator('.lead-form__header p')).toHaveText('Оставьте контакты для связи со специалистом');
  await expect(form.locator('.field__label')).toHaveText(['Ваше имя', 'Телефон']);
  await expect(form.locator('[name="name"]')).toHaveAttribute('aria-describedby', 'name-error');
  await expect(form.locator('[name="phone"]')).toHaveAttribute('aria-describedby', 'phone-hint phone-error');
  await expect(form.locator('[name="consent"]')).toHaveAttribute('aria-describedby', 'consent-error');
  await expect(form.getByRole('button', { name: 'Обсудить задачу' })).toHaveCount(1);
  await expect(form.locator('[name="company_website"]')).toHaveCount(1);
  await expect(form.locator('.form-status')).toHaveAttribute('aria-live', 'polite');
});

test('consultation panel keeps its contrast overlay without a decorative grid', async ({ page }) => {
  await page.goto('/');

  const layers = await page.locator('.lead-panel').evaluate((node) => {
    const before = getComputedStyle(node, '::before');
    const after = getComputedStyle(node, '::after');
    return {
      beforeContent: before.content,
      beforeBackgroundImage: before.backgroundImage,
      afterContent: after.content,
      afterBackgroundImage: after.backgroundImage
    };
  });

  expect(layers.beforeContent).not.toBe('none');
  expect(layers.beforeBackgroundImage).not.toBe('none');
  expect(layers.afterContent).toBe('none');
  expect(layers.afterBackgroundImage).toBe('none');
});

test('Industrial Control Room CTA stays contained, layered, and responsive', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  const desktop = await page.evaluate(() => {
    const container = document.querySelector('.lead-section > .container').getBoundingClientRect();
    const panel = document.querySelector('.lead-panel').getBoundingClientRect();
    const media = document.querySelector('.lead-section__media').getBoundingClientRect();
    const inner = document.querySelector('.lead-section__inner');
    const form = document.querySelector('.lead-form').getBoundingClientRect();
    return {
      container: { left: Math.round(container.left), width: Math.round(container.width) },
      panel: { width: Math.round(panel.width), height: Math.round(panel.height) },
      media: { width: Math.round(media.width), height: Math.round(media.height) },
      mediaPosition: getComputedStyle(document.querySelector('.lead-section__media')).position,
      columns: getComputedStyle(inner).gridTemplateColumns.split(' ').length,
      radius: getComputedStyle(document.querySelector('.lead-panel')).borderRadius,
      formWidth: Math.round(form.width)
    };
  });

  expect(desktop.container).toEqual({ left: 230, width: 1440 });
  expect(desktop.panel.width).toBe(1440);
  expect(desktop.panel.height).toBeGreaterThanOrEqual(480);
  expect(desktop.media).toEqual(desktop.panel);
  expect(desktop.mediaPosition).toBe('absolute');
  expect(desktop.columns).toBe(2);
  expect(desktop.radius).toBe('12px');
  expect(desktop.formWidth).toBeLessThanOrEqual(430);

  for (const [width, expectedColumns] of [[1024, 2], [768, 1], [390, 1]]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.reload();
    const metrics = await page.evaluate(() => {
      const panel = document.querySelector('.lead-panel').getBoundingClientRect();
      const media = document.querySelector('.lead-section__media').getBoundingClientRect();
      return {
        columns: getComputedStyle(document.querySelector('.lead-section__inner')).gridTemplateColumns.split(' ').length,
        panelRight: Math.round(panel.right),
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        mediaWidth: Math.round(media.width),
        panelWidth: Math.round(panel.width)
      };
    });
    expect(metrics.columns).toBe(expectedColumns);
    expect(metrics.mediaWidth).toBe(metrics.panelWidth);
    expect(metrics.panelRight).toBeLessThanOrEqual(metrics.viewportWidth);
    expect(metrics.scrollWidth).toBe(metrics.viewportWidth);
  }

  await page.setViewportSize({ width: 390, height: 900 });
  await page.reload();
  const form = page.locator('#consultation-form');
  const widthBefore = await form.evaluate((node) => Math.round(node.getBoundingClientRect().width));
  await form.locator('button[type="submit"]').click();
  const widthAfter = await form.evaluate((node) => Math.round(node.getBoundingClientRect().width));
  expect(widthAfter).toBe(widthBefore);
  await expect(form.locator('#name-error')).toContainText('Укажите имя');
  await expect(form.locator('#phone-error')).toContainText('Введите телефон');
});

test('controls and redesigned panels share the approved soft geometry', async ({ page }) => {
  await page.goto('/');
  const geometry = await page.evaluate(() => ({
    button: getComputedStyle(document.querySelector('.button')).borderRadius,
    input: getComputedStyle(document.querySelector('.field input')).borderRadius,
    capability: getComputedStyle(document.querySelector('.capability')).borderRadius,
    specifications: getComputedStyle(document.querySelector('.specifications__panel')).borderRadius
  }));

  expect(geometry).toEqual({
    button: '8px',
    input: '8px',
    capability: '12px',
    specifications: '12px'
  });
});

test('applications keep the approved proportions and use check markers', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1000 });
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    const applications = document.querySelector('.applications__grid').getBoundingClientRect();
    const applicationStyle = getComputedStyle(document.querySelector('.applications__grid'));
    const markerStyle = getComputedStyle(document.querySelector('.check-list li'), '::before');
    const columns = applicationStyle.gridTemplateColumns
      .split(' ')
      .map((value) => Number.parseFloat(value));

    return {
      applicationsWidth: Math.round(applications.width),
      columnRatios: columns.map((value) => value / applications.width),
      markerMask: markerStyle.maskImage || markerStyle.webkitMaskImage,
      markerBackgroundImage: markerStyle.backgroundImage
    };
  });

  expect(metrics.applicationsWidth).toBe(1440);
  expect(metrics.columnRatios[0]).toBeCloseTo(0.3, 2);
  expect(metrics.columnRatios[1]).toBeCloseTo(0.35, 2);
  expect(metrics.columnRatios[2]).toBeCloseTo(0.35, 2);
  expect(metrics.markerMask).toContain('check-circle.svg');
  expect(metrics.markerBackgroundImage).toBe('none');
});

test('major sections use the approved 1440px grid and responsive desktop spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1100 });
  await page.goto('/');

  await expect(page.locator('.problem-solution-section')).toHaveCount(1);

  const geometry = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
    const hero = rect('.hero');
    const problemOuter = rect('.problem-solution-section');
    const problem = rect('.problem-solution');
    const capabilities = rect('.capabilities');
    const applications = rect('.applications');
    const reasons = rect('.reasons');
    const specifications = rect('.specifications');
    const lead = rect('.lead-section');
    const footer = rect('.site-footer');
    const gap = (before, after) => Math.round(after.top - before.bottom);

    return {
      problem: { left: Math.round(problem.left), width: Math.round(problem.width) },
      applications: {
        left: Math.round(rect('.applications__grid').left),
        width: Math.round(rect('.applications__grid').width)
      },
      gaps: {
        heroToProblem: gap(hero, problemOuter),
        problemToCapabilities: gap(problemOuter, capabilities),
        capabilitiesToApplications: gap(capabilities, applications),
        applicationsToReasons: gap(applications, reasons),
        reasonsToSpecifications: gap(reasons, specifications),
        specificationsToLead: gap(specifications, lead),
        leadToFooter: gap(lead, footer)
      }
    };
  });

  expect(geometry.problem).toEqual({ left: 230, width: 1440 });
  expect(geometry.applications).toEqual({ left: 230, width: 1440 });
  expect(geometry.gaps).toEqual({
    heroToProblem: 0,
    problemToCapabilities: 24,
    capabilitiesToApplications: 24,
    applicationsToReasons: 24,
    reasonsToSpecifications: 24,
    specificationsToLead: 24,
    leadToFooter: 24
  });
});

test('applications result panel replaces the case CTA with three measurable outcomes', async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1000 });
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Читать кейс' })).toHaveCount(0);
  await expect(page.locator('.case-card h2')).toHaveText('Результат внедрения');
  await expect(page.locator('.case-metric dt')).toHaveText(['+35%', '×2', '3']);
  await expect(page.locator('.case-metric dd')).toHaveText([
    'к производительности',
    'быстрее операция',
    'оператора высвобождено'
  ]);

  const desktop = await page.evaluate(() => {
    const grid = document.querySelector('.applications__grid').getBoundingClientRect();
    const card = document.querySelector('.case-card').getBoundingClientRect();
    return {
      gridWidth: Math.round(grid.width),
      cardRight: Math.round(card.right),
      gridRight: Math.round(grid.right)
    };
  });

  expect(desktop.gridWidth).toBe(1440);
  expect(desktop.cardRight).toBe(desktop.gridRight);

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.reload();

  const tablet = await page.evaluate(() => {
    const media = document.querySelector('.applications__media').getBoundingClientRect();
    const card = document.querySelector('.case-card').getBoundingClientRect();
    const grid = document.querySelector('.applications__grid').getBoundingClientRect();
    return {
      cardTop: Math.round(card.top),
      mediaBottom: Math.round(media.bottom),
      cardWidth: Math.round(card.width),
      gridWidth: Math.round(grid.width)
    };
  });

  expect(tablet.cardTop).toBeGreaterThanOrEqual(tablet.mediaBottom);
  expect(tablet.cardWidth).toBe(tablet.gridWidth);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const mobileOrder = await page.evaluate(() => {
    const list = document.querySelector('.applications__list').getBoundingClientRect();
    const media = document.querySelector('.applications__media').getBoundingClientRect();
    const card = document.querySelector('.case-card').getBoundingClientRect();
    return [Math.round(list.top), Math.round(media.top), Math.round(card.top)];
  });

  expect(mobileOrder[0]).toBeLessThan(mobileOrder[1]);
  expect(mobileOrder[1]).toBeLessThan(mobileOrder[2]);
});

for (const width of [1440, 1024, 768, 390, 320, 280]) {
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
