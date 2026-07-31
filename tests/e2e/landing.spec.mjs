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
        specificationsToLead: gap(specifications, lead)
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
    specificationsToLead: 24
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
