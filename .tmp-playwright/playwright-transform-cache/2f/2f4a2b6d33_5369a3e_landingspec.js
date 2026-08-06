// 81ae6b0dc2f342b44aa4ef5b8db60b1fca958ce0
import { test, expect } from '@playwright/test';
test('landing renders the primary heading and has no horizontal overflow', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {
    level: 1
  })).toContainText('Автоматизируйте');
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasOverflow).toBe(false);
});
test('all reference sections and legal links exist', async ({
  page
}) => {
  await page.goto('/');
  for (const text of ['Проблема', 'Решение Jack', 'Что умеет', 'Примеры применения', 'Почему выбирают Текстиль Опт Торг', 'Оборудование и сопровождение для швейного производства', 'Технические характеристики']) {
    await expect(page.getByText(text, {
      exact: false
    }).first()).toBeVisible();
  }
  const footer = page.locator('.site-footer');
  await expect(footer.getByRole('link', {
    name: 'Политика конфиденциальности',
    exact: true
  })).toHaveAttribute('href', '/privacy.html');
  await expect(footer.getByRole('link', {
    name: 'Согласие на обработку персональных данных',
    exact: true
  })).toHaveAttribute('href', '/consent.html');
  await expect(footer.getByRole('link', {
    name: 'Реквизиты организации',
    exact: true
  })).toHaveAttribute('href', '/requisites.html');
});
test('footer matches the approved contact navigation help and legal contract', async ({
  page
}) => {
  await page.goto('/');
  const footer = page.locator('.site-footer');
  await expect(footer.locator('.footer-column')).toHaveCount(3);
  await expect(footer.locator('.footer-contact')).toHaveCount(3);
  await expect(footer.getByRole('link', {
    name: /Нужна помощь/i
  })).toHaveAttribute('href', '#lead-form');
  await expect(footer.locator('.footer-nav li')).toHaveCount(6);
  await expect(footer.locator('.social-link')).toHaveCount(0);
  await expect(footer.getByText('Мы в соцсетях', {
    exact: true
  })).toHaveCount(0);
  await expect(footer.getByRole('heading', {
    name: 'Документы',
    exact: true
  })).toBeVisible();
  await expect(footer.locator('.footer-legal a')).toHaveCount(3);
  await expect(footer.locator('.site-footer__year')).toHaveText('2026');
  await expect(footer.getByRole('link', {
    name: 'Политика конфиденциальности'
  })).toHaveAttribute('href', '/privacy.html');
  await expect(footer.getByRole('link', {
    name: 'Согласие на обработку персональных данных'
  })).toHaveAttribute('href', '/consent.html');
  await expect(footer.getByRole('link', {
    name: 'Реквизиты организации'
  })).toHaveAttribute('href', '/requisites.html');
});
test('landing exposes the supplied organization contacts', async ({
  page
}) => {
  await page.goto('/');
  const header = page.locator('.site-header');
  const footer = page.locator('.site-footer');
  await expect(header.locator('.header-phone')).toHaveAttribute('href', 'tel:+79276677307');
  await expect(header.locator('.header-phone')).toHaveText('8 (927) 667-73-07');
  await expect(header.locator('.site-header__contact span')).toHaveText('Консультация по оборудованию');
  await expect(footer.getByRole('link', {
    name: '8 (927) 667-73-07'
  })).toHaveAttribute('href', 'tel:+79276677307');
  await expect(footer.getByRole('link', {
    name: 'tekstilopttorg@mail.ru'
  })).toHaveAttribute('href', 'mailto:tekstilopttorg@mail.ru');
  await expect(footer.getByText(/пос\. Кугеси, ул\. Шоршелская, д\. 2/)).toBeVisible();
  await expect(page.getByText('8 (800) 555-57-18', {
    exact: true
  })).toHaveCount(0);
  await expect(page.getByText('info@jack-sewing.ru', {
    exact: true
  })).toHaveCount(0);
  await expect(page.getByText(/Промышленная, 11/)).toHaveCount(0);
});
test('footer accent text keeps WCAG AA contrast on the industrial background', async ({
  page
}) => {
  await page.goto('/');
  const contrast = await page.evaluate(() => {
    const parseRgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = rgb => rgb.map(channel => channel / 255).map(channel => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const year = document.querySelector('.site-footer__year');
    const footer = document.querySelector('.site-footer');
    const foreground = luminance(parseRgb(getComputedStyle(year).color));
    const background = luminance(parseRgb(getComputedStyle(footer).backgroundColor));
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});
test('solution action keeps WCAG AA contrast when dark tokens are active', async ({
  page
}) => {
  await page.goto('/');
  const contrast = await page.evaluate(() => {
    const action = document.querySelector('.button--solution');
    action.style.transition = 'none';
    document.documentElement.dataset.theme = 'dark';
    const parseRgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = rgb => rgb.map(channel => channel / 255).map(channel => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const foreground = luminance(parseRgb(getComputedStyle(action).color));
    const background = luminance(parseRgb(getComputedStyle(document.querySelector('.solution-panel')).backgroundColor));
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});
test('problem panel exposes a solid red fallback behind its gradient', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.locator('.problem-panel')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});
test('footer spans the viewport while its content stays on the 1440px grid', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 1100
  });
  await page.goto('/');
  const geometry = await page.evaluate(() => {
    const footer = document.querySelector('.site-footer').getBoundingClientRect();
    const grid = document.querySelector('.site-footer__grid').getBoundingClientRect();
    const help = document.querySelector('.footer-help').getBoundingClientRect();
    return {
      footer: {
        left: Math.round(footer.left),
        width: Math.round(footer.width)
      },
      grid: {
        left: Math.round(grid.left),
        width: Math.round(grid.width)
      },
      helpHeight: Math.round(help.height)
    };
  });
  expect(geometry.footer).toEqual({
    left: 0,
    width: 1900
  });
  expect(geometry.grid).toEqual({
    left: 230,
    width: 1440
  });
  expect(geometry.helpHeight).toBeGreaterThanOrEqual(88);
  await page.getByRole('link', {
    name: /Нужна помощь/i
  }).click();
  await expect(page.locator('#consultation-form')).toBeInViewport();
});
test('optimized imagery and vector icons are served without missing assets', async ({
  page
}) => {
  const failedAssets = [];
  page.on('response', response => {
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
test('textileopttorg logo brands the header and footer with one optimized asset', async ({
  page
}) => {
  await page.goto('/');
  const headerLogo = page.locator('.brand-logo--header');
  const footerLogo = page.locator('.brand-logo--footer');
  await expect(headerLogo).toHaveAttribute('aria-label', 'Текстильоптторг — главная');
  await expect(footerLogo).toHaveAttribute('aria-label', 'Текстильоптторг — главная');
  await expect(headerLogo.locator('img')).toHaveAttribute('src', '/assets/images/textileopttorg-logo.webp');
  await expect(footerLogo.locator('img')).toHaveAttribute('src', '/assets/images/textileopttorg-logo.webp');
  await expect(headerLogo.locator('img')).toHaveJSProperty('naturalWidth', 800);
  await footerLogo.scrollIntoViewIfNeeded();
  await expect(footerLogo.locator('img')).toHaveJSProperty('naturalWidth', 800);
});
test('textileopttorg logo is transparent outside its rounded frame', async ({
  page
}) => {
  await page.goto('/');
  const alpha = await page.evaluate(async () => {
    const image = new Image();
    image.src = '/assets/images/textileopttorg-logo.webp';
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', {
      willReadFrequently: true
    });
    context.drawImage(image, 0, 0);
    const at = (x, y) => context.getImageData(x, y, 1, 1).data[3];
    return {
      corners: [at(0, 0), at(799, 0), at(0, 433), at(799, 433)],
      lowerInterior: at(400, 390)
    };
  });
  expect(alpha.corners).toEqual([0, 0, 0, 0]);
  expect(alpha.lowerInterior).toBeGreaterThanOrEqual(250);
});
test('brand logos preserve their ratio without overflowing site chrome', async ({
  page
}) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({
      width,
      height: 900
    });
    await page.goto('/');
    const geometry = await page.evaluate(() => {
      const header = document.querySelector('.site-header').getBoundingClientRect();
      const headerLogo = document.querySelector('.brand-logo--header img').getBoundingClientRect();
      const footerLogo = document.querySelector('.brand-logo--footer img').getBoundingClientRect();
      return {
        headerHeight: Math.round(header.height),
        headerLogoWidth: Math.round(headerLogo.width),
        headerLogoRatio: headerLogo.width / headerLogo.height,
        footerLogoWidth: Math.round(footerLogo.width),
        footerLogoRatio: footerLogo.width / footerLogo.height,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    expect(geometry.overflow).toBe(false);
    expect(geometry.headerLogoRatio).toBeCloseTo(800 / 434, 2);
    expect(geometry.footerLogoRatio).toBeCloseTo(800 / 434, 2);
    if (width <= 768) expect(geometry.headerHeight).toBe(72);
    expect(geometry.headerLogoWidth).toBeLessThanOrEqual(width <= 768 ? 88 : 112);
    expect(geometry.footerLogoWidth).toBeLessThanOrEqual(width <= 480 ? 148 : 176);
  }
});
test('technical sheet is a real downloadable PDF', async ({
  page,
  request
}) => {
  await page.goto('/');
  await expect(page.getByRole('link', {
    name: 'Скачать характеристики JACK J6 и JACK M9 в PDF'
  })).toHaveAttribute('download', '');
  const response = await request.get('/assets/docs/jack-j6-m9.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
});
test('lead form masks input, validates errors, and submits a normalized phone', async ({
  page
}) => {
  let submittedBody;
  await page.route('**/api/csrf.php', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'test-csrf'
      })
    });
  });
  await page.route('**/api/submit.php', async route => {
    submittedBody = JSON.parse(route.request().postData() ?? '{}');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true
      })
    });
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
test('phone mask supports middle deletion, selection replacement, clearing, and re-entry', async ({
  page
}) => {
  await page.goto('/');
  const phone = page.locator('#consultation-form [name="phone"]');
  await phone.fill('89991234567');
  await phone.evaluate(input => input.setSelectionRange(11, 11));
  await phone.press('Backspace');
  await expect(phone).toHaveValue('+7 (999) 134-56-7');
  await phone.fill('89991234567');
  await phone.evaluate(input => input.setSelectionRange(10, 10));
  await phone.press('Delete');
  await expect(phone).toHaveValue('+7 (999) 134-56-7');
  await phone.fill('89991234567');
  await phone.evaluate(input => input.setSelectionRange(9, 12));
  await phone.type('555');
  await expect(phone).toHaveValue('+7 (999) 555-45-67');
  await phone.fill('');
  await expect(phone).toHaveValue('');
  await phone.fill('+7 921 555 01 02');
  await expect(phone).toHaveValue('+7 (921) 555-01-02');
});
test('site header stays pinned with a subtle shadow on every viewport', async ({
  page
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({
      width,
      height: 900
    });
    await page.goto('/');
    const header = page.locator('.site-header');
    const styles = await header.evaluate(node => {
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
test('mobile menu opens accessibly without shifting the page and closes by Escape', async ({
  page
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });
  await page.goto('/');
  const button = page.locator('[data-menu-button]');
  const panel = page.locator('[data-menu-panel]');
  await page.evaluate(() => window.scrollTo(0, 1200));
  const before = await page.evaluate(() => ({
    scrollY: window.scrollY,
    scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
    htmlOverflow: document.documentElement.style.getPropertyValue('overflow'),
    bodyPaddingRight: document.body.style.getPropertyValue('padding-right'),
    computedBodyPadding: Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0,
    ctaX: document.querySelector('.header-cta').getBoundingClientRect().x
  }));

  // Dispatch the click at the sticky button's current position. Playwright's
  // actionability scroll would otherwise move a sticky element before the
  // page's own menu handler runs, which cannot happen during a real tap.
  await button.evaluate(element => element.click());
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveAttribute('data-open', 'true');
  await expect(page.locator('[data-menu-overlay]')).toBeVisible();
  await expect(panel.locator('a').first()).toBeFocused();
  await expect(page.locator('main')).toHaveJSProperty('inert', true);
  const locked = await page.evaluate(() => ({
    scrollY: window.scrollY,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    computedBodyPadding: Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0,
    ctaX: document.querySelector('.header-cta').getBoundingClientRect().x
  }));
  expect(locked.htmlOverflow).toBe('hidden');
  expect(locked.scrollY).toBe(before.scrollY);
  expect(Math.round(locked.computedBodyPadding - before.computedBodyPadding)).toBe(before.scrollbarWidth);
  expect(Math.abs(locked.ctaX - before.ctaX)).toBeLessThanOrEqual(1);
  await page.keyboard.press('Shift+Tab');
  await expect(button).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(panel.locator('a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).not.toHaveAttribute('data-open', 'true');
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
  await expect(button).toBeFocused();
  const restored = await page.evaluate(() => ({
    scrollY: window.scrollY,
    htmlOverflow: document.documentElement.style.getPropertyValue('overflow'),
    bodyPaddingRight: document.body.style.getPropertyValue('padding-right')
  }));
  expect(restored).toEqual({
    scrollY: before.scrollY,
    htmlOverflow: before.htmlOverflow,
    bodyPaddingRight: before.bodyPaddingRight
  });
});
test('mobile menu drawer enters from the same right edge as the burger button', async ({
  page
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });
  await page.goto('/');
  const button = page.locator('[data-menu-button]');
  const panel = page.locator('[data-menu-panel]');
  const closed = await panel.evaluate(element => {
    const styles = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return {
      insetInlineEnd: styles.insetInlineEnd,
      translate: styles.translate,
      left: Math.round(bounds.left)
    };
  });
  expect(closed.insetInlineEnd).toBe('0px');
  expect(closed.translate.startsWith('104%')).toBe(true);
  expect(closed.left).toBeGreaterThanOrEqual(390);
  await button.evaluate(element => element.click());
  await expect(panel).toHaveAttribute('data-open', 'true');
  await page.waitForTimeout(250);
  const open = await panel.boundingBox();
  const openButton = await button.evaluate(element => {
    const styles = getComputedStyle(element);
    return {
      position: styles.position,
      insetInlineEnd: styles.insetInlineEnd
    };
  });
  expect(Math.abs((open?.x ?? 0) + (open?.width ?? 0) - 390)).toBeLessThanOrEqual(1);
  expect(open?.x ?? 0).toBeGreaterThan(0);
  expect(openButton.position).toBe('fixed');
  expect(openButton.insetInlineEnd).toBe('16px');
});
test('open mobile menu stays above the cookie banner on a first visit', async ({
  page
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });
  await page.goto('/');
  const button = page.locator('[data-menu-button]');
  const panel = page.locator('[data-menu-panel]');
  const overlay = page.locator('[data-menu-overlay]');
  const cookieBanner = page.locator('[data-cookie-banner]');
  await expect(cookieBanner).toBeVisible();
  await button.evaluate(element => element.click());
  await expect(panel).toHaveAttribute('data-open', 'true');
  const layers = await page.evaluate(() => ({
    header: Number.parseInt(getComputedStyle(document.querySelector('.site-header')).zIndex, 10),
    panel: Number.parseInt(getComputedStyle(document.querySelector('[data-menu-panel]')).zIndex, 10),
    overlay: Number.parseInt(getComputedStyle(document.querySelector('[data-menu-overlay]')).zIndex, 10),
    cookie: Number.parseInt(getComputedStyle(document.querySelector('[data-cookie-banner]')).zIndex, 10)
  }));
  expect(layers.header).toBeGreaterThan(layers.cookie);
  expect(layers.panel).toBeGreaterThan(layers.cookie);
  expect(layers.overlay).toBeGreaterThan(layers.cookie);
  await expect(cookieBanner).toHaveJSProperty('inert', true);
  await expect(overlay).toBeVisible();
});
test('mobile burger uses three confident two-pixel strokes', async ({
  page
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });
  await page.goto('/');
  const strokeHeights = await page.locator('.menu-button__lines').evaluate(lines => [getComputedStyle(lines).height, getComputedStyle(lines, '::before').height, getComputedStyle(lines, '::after').height]);
  expect(strokeHeights).toEqual(['2px', '2px', '2px']);
});
test('service and video controls have meaningful behavior without social placeholders', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.locator('#service')).toHaveCount(1);
  await page.getByRole('button', {
    name: 'Смотреть видео'
  }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Демонстрация оборудования JACK'
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', {
    name: 'Закрыть видео'
  }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('.social-link--disabled')).toHaveCount(0);
});
test('video dialog locks page scrolling without a layout jump and restores it on Escape', async ({
  page
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });
  await page.goto('/');
  const trigger = page.getByRole('button', {
    name: 'Смотреть видео'
  });
  const dialog = page.getByRole('dialog', {
    name: 'Демонстрация оборудования JACK'
  });
  await page.evaluate(() => window.scrollTo(0, 1200));
  const before = await page.evaluate(() => ({
    scrollY: window.scrollY,
    scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
    htmlOverflow: document.documentElement.style.getPropertyValue('overflow'),
    bodyPaddingRight: document.body.style.getPropertyValue('padding-right'),
    computedBodyPadding: Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0,
    containerX: document.querySelector('.hero__inner').getBoundingClientRect().x
  }));

  // A real tap does not run Playwright's actionability scroll before the
  // site's handler, so dispatch the click at the page's current position.
  await trigger.evaluate(element => element.click());
  await expect(dialog).toBeVisible();
  const locked = await page.evaluate(() => ({
    scrollY: window.scrollY,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    computedBodyPadding: Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0,
    containerX: document.querySelector('.hero__inner').getBoundingClientRect().x
  }));
  expect(locked.htmlOverflow).toBe('hidden');
  expect(locked.scrollY).toBe(before.scrollY);
  expect(Math.round(locked.computedBodyPadding - before.computedBodyPadding)).toBe(before.scrollbarWidth);
  expect(Math.abs(locked.containerX - before.containerX)).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  const restored = await page.evaluate(() => ({
    scrollY: window.scrollY,
    htmlOverflow: document.documentElement.style.getPropertyValue('overflow'),
    bodyPaddingRight: document.body.style.getPropertyValue('padding-right')
  }));
  expect(restored).toEqual({
    scrollY: before.scrollY,
    htmlOverflow: before.htmlOverflow,
    bodyPaddingRight: before.bodyPaddingRight
  });
});
test('mobile video dialog stays compact at narrow viewports', async ({
  page
}) => {
  for (const viewport of [{
    width: 390,
    height: 844,
    maxTitleLines: 2
  }, {
    width: 320,
    height: 700,
    maxTitleLines: 3
  }, {
    width: 280,
    height: 650,
    maxTitleLines: 3
  }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.getByRole('button', {
      name: 'Смотреть видео'
    }).click();
    const dialog = page.getByRole('dialog', {
      name: 'Демонстрация оборудования JACK'
    });
    await expect(dialog).toBeVisible();
    const geometry = await dialog.evaluate(element => {
      const lineCount = node => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size;
      };
      const media = element.querySelector('.video-dialog__media');
      const content = element.querySelector('.video-dialog__content');
      const title = content.querySelector('h2');
      const copy = content.querySelector('p');
      const button = content.querySelector('.button');
      return {
        dialogHeight: Math.round(element.getBoundingClientRect().height),
        mediaHeight: Math.round(media.getBoundingClientRect().height),
        contentPadding: Number.parseFloat(getComputedStyle(content).paddingTop),
        titleFont: Number.parseFloat(getComputedStyle(title).fontSize),
        copyFont: Number.parseFloat(getComputedStyle(copy).fontSize),
        buttonFont: Number.parseFloat(getComputedStyle(button).fontSize),
        titleLines: lineCount(title),
        copyLines: lineCount(copy),
        buttonLines: lineCount(button.firstChild),
        buttonHeight: Math.round(button.getBoundingClientRect().height)
      };
    });
    expect(geometry.dialogHeight).toBeLessThanOrEqual(viewport.height - 32);
    expect(geometry.mediaHeight).toBeLessThanOrEqual(160);
    expect(geometry.contentPadding).toBe(20);
    expect(geometry.titleFont).toBe(24);
    expect(geometry.copyFont).toBe(14);
    expect(geometry.buttonFont).toBe(12);
    expect(geometry.titleLines).toBeLessThanOrEqual(viewport.maxTitleLines);
    expect(geometry.copyLines).toBeLessThanOrEqual(5);
    expect(geometry.buttonLines).toBe(1);
    expect(geometry.buttonHeight).toBeGreaterThanOrEqual(44);
    await dialog.getByRole('button', {
      name: 'Закрыть видео'
    }).click();
  }
});
test('cookie choice is stored and suppresses the banner on return', async ({
  page
}) => {
  await page.goto('/');
  const banner = page.locator('[data-cookie-banner]');
  await expect(banner).toBeVisible();
  await page.locator('[data-cookie-necessary]').click();
  await expect(banner).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('jack_cookie_preference_v1'))).toBe('necessary');
  await page.reload();
  await expect(banner).toBeHidden();
});
test('desktop uses the approved 1440px container and local sans-serif typography', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 900
  });
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
test('hero copy aligns with the container and keeps only responsive top padding', async ({
  page
}) => {
  for (const [width, expectedTop] of [[1900, 64], [768, 48], [390, 48]]) {
    await page.setViewportSize({
      width,
      height: 900
    });
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
test('mobile hero actions form one equal-width CTA stack', async ({
  page
}) => {
  await page.setViewportSize({
    width: 430,
    height: 932
  });
  await page.goto('/');
  const geometry = await page.locator('.hero__actions .button').evaluateAll(buttons => {
    const rects = buttons.map(button => button.getBoundingClientRect());
    return {
      widths: rects.map(({
        width
      }) => Math.round(width)),
      lefts: rects.map(({
        left
      }) => Math.round(left)),
      heights: rects.map(({
        height
      }) => Math.round(height)),
      verticalGap: Math.round(rects[1].top - rects[0].bottom)
    };
  });
  expect(geometry.widths[0]).toBe(geometry.widths[1]);
  expect(geometry.lefts[0]).toBe(geometry.lefts[1]);
  expect(geometry.heights.every(height => height >= 48)).toBe(true);
  expect(geometry.verticalGap).toBe(12);
});
test('mobile hero leaves breathing room after the CTA stack', async ({
  page
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });
  await page.goto('/');
  const gap = await page.evaluate(() => {
    const lastAction = document.querySelector('.hero__actions .button:last-child').getBoundingClientRect();
    const media = document.querySelector('.hero__media').getBoundingClientRect();
    return Math.round(media.top - lastAction.bottom);
  });
  expect(gap).toBe(16);
});
test('mobile hero lead keeps a word boundary when its line break is hidden', async ({
  page
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });
  await page.goto('/');
  await expect(page.locator('.hero__lead')).toHaveText('Точное пришивание деталей по контуру: карманы, молнии, этикетки без ручного труда');
});
test('hero media spans the viewport while copy stays on the 1440px grid', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 900
  });
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
  expect(desktop.hero).toEqual({
    left: 0,
    right: 1900,
    width: 1900,
    height: 440
  });
  expect(desktop.inner).toEqual({
    left: 230,
    width: 1440,
    height: 440
  });
  expect(desktop.media).toEqual({
    left: 0,
    right: 1900,
    width: 1900,
    height: 440
  });
  expect(desktop.mediaPosition).toBe('absolute');
  expect(desktop.titleSize).toBe('46px');
  expect(desktop.titleLineHeight).toBeCloseTo(49.68, 1);
  await page.setViewportSize({
    width: 390,
    height: 844
  });
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
test('desktop uses the reference grid composition', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 1000
  });
  await page.goto('/');
  await expect(page.locator('.hero__inner')).toHaveCSS('position', 'relative');
  await expect(page.locator('.problem-solution')).toHaveCSS('display', 'grid');
  await expect(page.locator('.capabilities__grid')).toHaveCSS('display', 'grid');
});
test('problem and solution card exposes the approved copy and benefit structure', async ({
  page
}) => {
  await page.goto('/');
  const card = page.locator('.problem-solution');
  await expect(card.getByRole('heading', {
    name: 'Проблема',
    exact: true
  })).toBeVisible();
  await expect(card.locator('.problem-item')).toHaveCount(3);
  await expect(card.locator('.problem-item__description')).toHaveText(['Снижает производительность и увеличивает сроки', 'Из-за человеческого фактора страдает качество изделий', 'Ручной труд ограничивает объёмы и увеличивает затраты']);
  await expect(card.locator('.solution-panel__eyebrow')).toHaveText('Наше решение');
  await expect(card.locator('.solution-benefit')).toHaveCount(4);
  await expect(card.locator('.solution-benefit__title')).toHaveText(['Точное позиционирование по заданному контуру', 'Стабильное качество', 'Высокая скорость', 'Лёгкое масштабирование']);
  await expect(card.getByRole('link', {
    name: 'Узнать больше о решении'
  })).toHaveAttribute('href', '#equipment');
});
test('hero transition uses the approved responsive spacing', async ({
  page
}) => {
  for (const [width, expectedGap] of [[1440, 48], [768, 32], [390, 24]]) {
    await page.setViewportSize({
      width,
      height: 900
    });
    await page.goto('/');
    const gap = await page.evaluate(() => {
      const hero = document.querySelector('.hero').getBoundingClientRect();
      const card = document.querySelector('.problem-solution').getBoundingClientRect();
      return Math.round(card.top - hero.bottom);
    });
    expect(gap).toBe(expectedGap);
  }
});
test('problem and solution card matches the approved desktop composition', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 1100
  });
  await page.goto('/');
  const geometry = await page.locator('.problem-solution').evaluate(card => {
    const problem = card.querySelector('.problem-panel').getBoundingClientRect();
    const media = card.querySelector('.problem-solution__media').getBoundingClientRect();
    const solution = card.querySelector('.solution-panel').getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    return {
      card: {
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      columns: [problem, media, solution].map(column => Math.round(column.width)),
      aligned: [problem, media, solution].every(column => Math.abs(column.height - rect.height) <= 2),
      radius: getComputedStyle(card).borderRadius,
      benefits: getComputedStyle(card.querySelector('.solution-benefits')).gridTemplateColumns
    };
  });
  expect(geometry.card.width).toBe(1440);
  expect(geometry.card.height).toBeGreaterThanOrEqual(560);
  expect(geometry.aligned).toBe(true);
  expect(geometry.columns.every(width => width >= 400)).toBe(true);
  expect(geometry.radius).not.toBe('0px');
  expect(geometry.benefits.split(' ').length).toBe(2);
});
test('redesigned problem solution and footer stack safely across breakpoints', async ({
  page
}) => {
  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({
      width,
      height: 1000
    });
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
test('capabilities reproduce the five-card reference composition', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 1100
  });
  await page.goto('/');
  await expect(page.locator('.capability')).toHaveCount(5);
  expect(await page.locator('.capability__number').evaluateAll(nodes => nodes.map(node => node.dataset.number))).toEqual(['01', '02', '03', '04', '05']);
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
  expect(desktop).toMatchObject({
    left: 230,
    width: 1440,
    columns: 5,
    radius: '12px'
  });
  expect(desktop.minHeight).toBeGreaterThanOrEqual(400);
  for (const [width, columns] of [[1024, 3], [768, 2], [390, 1]]) {
    await page.setViewportSize({
      width,
      height: 900
    });
    await page.reload();
    expect(await page.locator('.capabilities__grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
  }
});
test('specifications expose separate source-based J6 and M9 tables', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 1100
  });
  await page.goto('/');
  await expect(page.getByRole('tab')).toHaveCount(2);
  await expect(page.getByRole('tab', {
    name: 'JACK J6'
  })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', {
    name: 'JACK J6'
  }).locator('tbody tr')).toHaveCount(16);
  await expect(page.getByRole('tabpanel', {
    name: 'JACK J6'
  })).toContainText('До 210 мм');
  await expect(page.getByRole('tabpanel', {
    name: 'JACK J6'
  })).toContainText('120 Вт');
  await expect(page.locator('.specifications')).not.toContainText('JK-T2210');
  await expect(page.locator('.specifications')).not.toContainText('MS-100A');
  await page.getByRole('tab', {
    name: 'JACK M9'
  }).click();
  const m9 = page.getByRole('tabpanel', {
    name: 'JACK M9'
  });
  await expect(m9.locator('tbody tr')).toHaveCount(12);
  await expect(m9).toContainText('1400 × 950 мм');
  await expect(m9).toContainText('До 3 600 ст/мин');
  await expect(m9).toContainText('0,6 МПа, 3 л/мин');
  await expect(m9).toContainText('610 / 690 кг (нетто / брутто)');
  await expect(m9).toContainText('2200 × 1220 × 1650 мм');
  await expect(m9).toContainText('M9-SS-F13-X');
  await expect(page.locator('.product-benefit')).toHaveCount(4);
  await expect(page.locator('.product-benefit h3')).toHaveText(['Высокая точность', 'Скорость и стабильность', 'Надёжность', 'Простое управление']);
  await expect(page.locator('.specifications__download-copy small')).toHaveText('Подробные характеристики и руководство');
  const geometry = await page.evaluate(() => {
    const container = document.querySelector('.specifications > .container').getBoundingClientRect();
    const panel = document.querySelector('.specifications__panel').getBoundingClientRect();
    return {
      container: {
        left: Math.round(container.left),
        width: Math.round(container.width)
      },
      panelWidth: Math.round(panel.width),
      radius: getComputedStyle(document.querySelector('.specifications__panel')).borderRadius,
      columns: getComputedStyle(document.querySelector('.specifications__grid')).gridTemplateColumns.split(' ').length
    };
  });
  expect(geometry).toEqual({
    container: {
      left: 230,
      width: 1440
    },
    panelWidth: 1440,
    radius: '12px',
    columns: 2
  });
});
test('mobile specifications switch models without horizontal scrolling', async ({
  page
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({
      width,
      height: 844
    });
    await page.goto('/');
    await expect(page.getByRole('tabpanel', {
      name: 'JACK J6'
    })).toContainText('До 210 мм');
    await page.getByRole('tab', {
      name: 'JACK M9'
    }).click();
    await expect(page.getByRole('tabpanel', {
      name: 'JACK M9'
    })).toContainText('1400 × 950 мм');
    const geometry = await page.evaluate(() => {
      const wrapper = document.querySelector('#panel-m9 .table-scroll');
      const row = document.querySelector('#panel-m9 tbody tr');
      return {
        overflows: wrapper.scrollWidth > wrapper.clientWidth + 1,
        bodyOverflows: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        rowColumns: getComputedStyle(row).gridTemplateColumns.split(' ').length
      };
    });
    expect(geometry).toEqual({
      overflows: false,
      bodyOverflows: false,
      rowColumns: 1
    });
  }
});
test('mobile technical-sheet button keeps copy readable and icons full size', async ({
  page
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({
      width,
      height: 844
    });
    await page.goto('/');
    const download = page.locator('.button--download');
    await expect(download).toHaveAttribute('aria-label', 'Скачать характеристики JACK J6 и JACK M9 в PDF');
    const geometry = await download.evaluate(button => {
      const lineCount = node => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size;
      };
      const icons = [...button.querySelectorAll(':scope > [data-icon]')];
      const iconRects = icons.map(icon => icon.getBoundingClientRect());
      const copy = button.querySelector('.specifications__download-copy');
      const copyRect = copy.getBoundingClientRect();
      return {
        height: Math.round(button.getBoundingClientRect().height),
        icons: iconRects.map(rect => [Math.round(rect.width), Math.round(rect.height)]),
        titleDisplay: getComputedStyle(button.querySelector('strong')).display,
        detailLines: lineCount(button.querySelector('small')),
        leftIconRight: iconRects[0].right,
        copyLeft: copyRect.left,
        copyRight: copyRect.right,
        rightIconLeft: iconRects[1].left
      };
    });
    expect(geometry.height).toBeLessThanOrEqual(84);
    expect(geometry.icons).toEqual([[24, 24], [24, 24]]);
    expect(geometry.titleDisplay).toBe('none');
    expect(geometry.detailLines).toBeLessThanOrEqual(width === 390 ? 2 : 3);
    expect(geometry.leftIconRight).toBeLessThanOrEqual(geometry.copyLeft);
    expect(geometry.copyRight).toBeLessThanOrEqual(geometry.rightIconLeft);
  }
});
test('Industrial Control Room CTA exposes the approved copy and form contract', async ({
  page
}) => {
  await page.goto('/');
  const section = page.locator('.lead-section');
  const panel = section.locator('.lead-panel');
  const form = section.locator('#consultation-form');
  await expect(section.locator(':scope > .container')).toHaveCount(1);
  await expect(panel).toHaveCount(1);
  await expect(panel.locator('.lead-section__media')).toHaveCount(1);
  await expect(section.locator('.lead-section__eyebrow')).toHaveText('Расчёт проекта');
  await expect(section.getByRole('heading', {
    level: 2
  })).toHaveText('Ускорьте производство с Текстиль Опт Торг');
  await expect(section.locator('.lead-section__copy > p')).toHaveText('Опишите задачу. Специалист подберёт конфигурацию оборудования под ваши операции и материалы.');
  await expect(section.locator('.lead-section__point')).toHaveText(['Бесплатная консультация', 'Подбор под задачу']);
  await expect(section.locator('.lead-section__point [data-icon="check-circle"]')).toHaveCount(2);
  expect(await section.locator('.lead-section__point [data-icon="check-circle"]').first().evaluate(node => {
    const style = getComputedStyle(node);
    return style.maskImage || style.webkitMaskImage;
  })).toContain('check-circle.svg');
  await expect(form.locator('.lead-form__header h3')).toHaveText('Получить консультацию');
  await expect(form.locator('.lead-form__header p')).toHaveText('Оставьте контакты для связи со специалистом');
  await expect(form.locator('.field__label')).toHaveText(['Ваше имя', 'Телефон', 'Какую операцию нужно автоматизировать']);
  await expect(form.locator('[name="name"]')).toHaveAttribute('aria-describedby', 'name-error');
  await expect(form.locator('[name="phone"]')).toHaveAttribute('aria-describedby', 'phone-hint phone-error');
  await expect(form.locator('[name="task"]')).toHaveAttribute('aria-describedby', 'task-hint task-error');
  await expect(form.locator('[name="consent"]')).toHaveAttribute('aria-describedby', 'consent-error');
  await expect(form.getByRole('button', {
    name: 'Обсудить задачу'
  })).toHaveCount(1);
  await expect(form.locator('[name="company_website"]')).toHaveCount(1);
  await expect(form.locator('.form-status')).toHaveAttribute('aria-live', 'polite');
});
test('consultation panel keeps its contrast overlay without a decorative grid', async ({
  page
}) => {
  await page.goto('/');
  const layers = await page.locator('.lead-panel').evaluate(node => {
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
test('Industrial Control Room CTA stays contained, layered, and responsive', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 1100
  });
  await page.goto('/');
  const desktop = await page.evaluate(() => {
    const container = document.querySelector('.lead-section > .container').getBoundingClientRect();
    const panel = document.querySelector('.lead-panel').getBoundingClientRect();
    const media = document.querySelector('.lead-section__media').getBoundingClientRect();
    const inner = document.querySelector('.lead-section__inner');
    const form = document.querySelector('.lead-form').getBoundingClientRect();
    return {
      container: {
        left: Math.round(container.left),
        width: Math.round(container.width)
      },
      panel: {
        width: Math.round(panel.width),
        height: Math.round(panel.height)
      },
      media: {
        width: Math.round(media.width),
        height: Math.round(media.height)
      },
      mediaPosition: getComputedStyle(document.querySelector('.lead-section__media')).position,
      columns: getComputedStyle(inner).gridTemplateColumns.split(' ').length,
      radius: getComputedStyle(document.querySelector('.lead-panel')).borderRadius,
      formWidth: Math.round(form.width)
    };
  });
  expect(desktop.container).toEqual({
    left: 230,
    width: 1440
  });
  expect(desktop.panel.width).toBe(1440);
  expect(desktop.panel.height).toBeGreaterThanOrEqual(480);
  expect(desktop.media).toEqual(desktop.panel);
  expect(desktop.mediaPosition).toBe('absolute');
  expect(desktop.columns).toBe(2);
  expect(desktop.radius).toBe('12px');
  expect(desktop.formWidth).toBeLessThanOrEqual(430);
  for (const [width, expectedColumns] of [[1024, 2], [768, 1], [390, 1]]) {
    await page.setViewportSize({
      width,
      height: 1000
    });
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
  await page.setViewportSize({
    width: 390,
    height: 900
  });
  await page.reload();
  const form = page.locator('#consultation-form');
  const widthBefore = await form.evaluate(node => Math.round(node.getBoundingClientRect().width));
  await form.locator('button[type="submit"]').click();
  const widthAfter = await form.evaluate(node => Math.round(node.getBoundingClientRect().width));
  expect(widthAfter).toBe(widthBefore);
  await expect(form.locator('#name-error')).toContainText('Укажите имя');
  await expect(form.locator('#phone-error')).toContainText('Введите телефон');
});
test('controls and redesigned panels share the approved soft geometry', async ({
  page
}) => {
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
test('applications keep the approved proportions and use check markers', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 1000
  });
  await page.goto('/');
  const metrics = await page.evaluate(() => {
    const applications = document.querySelector('.applications__grid').getBoundingClientRect();
    const applicationStyle = getComputedStyle(document.querySelector('.applications__grid'));
    const markerStyle = getComputedStyle(document.querySelector('.check-list li'), '::before');
    const columns = applicationStyle.gridTemplateColumns.split(' ').map(value => Number.parseFloat(value));
    return {
      applicationsWidth: Math.round(applications.width),
      columnRatios: columns.map(value => value / applications.width),
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
test('major sections use the approved 1440px grid and responsive desktop spacing', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 1100
  });
  await page.goto('/');
  await expect(page.locator('.problem-solution-section')).toHaveCount(1);
  const geometry = await page.evaluate(() => {
    const rect = selector => document.querySelector(selector).getBoundingClientRect();
    const hero = rect('.hero');
    const problemOuter = rect('.problem-solution-section');
    const problem = rect('.problem-solution');
    const capabilities = rect('.capabilities');
    const applications = rect('.applications');
    const reasons = rect('.reasons');
    const about = rect('.about-company');
    const specifications = rect('.specifications');
    const lead = rect('.lead-section');
    const footer = rect('.site-footer');
    const gap = (before, after) => Math.round(after.top - before.bottom);
    return {
      problem: {
        left: Math.round(problem.left),
        width: Math.round(problem.width)
      },
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
        specificationsToAbout: gap(specifications, about),
        aboutToLead: gap(about, lead),
        leadToFooter: gap(lead, footer)
      }
    };
  });
  expect(geometry.problem).toEqual({
    left: 230,
    width: 1440
  });
  expect(geometry.applications).toEqual({
    left: 230,
    width: 1440
  });
  expect(geometry.gaps).toEqual({
    heroToProblem: 0,
    problemToCapabilities: 24,
    capabilitiesToApplications: 24,
    applicationsToReasons: 24,
    reasonsToSpecifications: 24,
    specificationsToAbout: 24,
    aboutToLead: 24,
    leadToFooter: 24
  });
});
test('applications use the supplied demonstration photo and a factual consultation CTA', async ({
  page
}) => {
  await page.setViewportSize({
    width: 1900,
    height: 1000
  });
  await page.goto('/');
  await expect(page.getByRole('link', {
    name: 'Читать кейс'
  })).toHaveCount(0);
  await expect(page.locator('.case-card h2')).toHaveText('Демонстрация оборудования в Кугеси');
  await expect(page.locator('.applications__media img')).toHaveAttribute('src', '/assets/images/company-demo.webp');
  await expect(page.locator('.case-card .demo-points li')).toHaveCount(3);
  await expect(page.locator('.case-card .button')).toHaveAttribute('href', '#lead-form');
  await expect(page.getByText('+35%', {
    exact: true
  })).toHaveCount(0);
  await expect(page.getByText('×2', {
    exact: true
  })).toHaveCount(0);
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
  await page.setViewportSize({
    width: 1024,
    height: 900
  });
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
  await page.setViewportSize({
    width: 390,
    height: 844
  });
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
test('mobile demonstration card keeps its content and CTA readable', async ({
  page
}) => {
  await page.setViewportSize({
    width: 320,
    height: 844
  });
  await page.goto('/');
  const geometry = await page.locator('.case-card--demo').evaluate(card => {
    const button = card.querySelector('.button').getBoundingClientRect();
    return {
      width: Math.round(card.getBoundingClientRect().width),
      buttonWidth: Math.round(button.width),
      buttonHeight: Math.round(button.height),
      points: card.querySelectorAll('.demo-points li').length
    };
  });
  expect(geometry.width).toBeLessThanOrEqual(320);
  expect(geometry.buttonWidth).toBeLessThanOrEqual(geometry.width);
  expect(geometry.buttonHeight).toBeGreaterThanOrEqual(44);
  expect(geometry.points).toBe(3);
});
for (const width of [1440, 1024, 768, 390, 320]) {
  test(`landing has no overflow at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({
      width,
      height: 900
    });
    await page.goto('/');
    const diagnostics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll('body *')].filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.right > document.documentElement.clientWidth + 1;
      }).slice(0, 12).map(element => ({
        selector: `${element.tagName.toLowerCase()}.${element.className}`,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width)
      }))
    }));
    expect(diagnostics.scrollWidth, JSON.stringify(diagnostics.offenders)).toBeLessThanOrEqual(width);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0ZXN0IiwiZXhwZWN0IiwicGFnZSIsImdvdG8iLCJnZXRCeVJvbGUiLCJsZXZlbCIsInRvQ29udGFpblRleHQiLCJoYXNPdmVyZmxvdyIsImV2YWx1YXRlIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJzY3JvbGxXaWR0aCIsImNsaWVudFdpZHRoIiwidG9CZSIsInRleHQiLCJnZXRCeVRleHQiLCJleGFjdCIsImZpcnN0IiwidG9CZVZpc2libGUiLCJmb290ZXIiLCJsb2NhdG9yIiwibmFtZSIsInRvSGF2ZUF0dHJpYnV0ZSIsInRvSGF2ZUNvdW50IiwidG9IYXZlVGV4dCIsImhlYWRlciIsImNvbnRyYXN0IiwicGFyc2VSZ2IiLCJ2YWx1ZSIsIm1hdGNoIiwic2xpY2UiLCJtYXAiLCJOdW1iZXIiLCJsdW1pbmFuY2UiLCJyZ2IiLCJjaGFubmVsIiwicmVkdWNlIiwic3VtIiwiaW5kZXgiLCJ5ZWFyIiwicXVlcnlTZWxlY3RvciIsImZvcmVncm91bmQiLCJnZXRDb21wdXRlZFN0eWxlIiwiY29sb3IiLCJiYWNrZ3JvdW5kIiwiYmFja2dyb3VuZENvbG9yIiwiTWF0aCIsIm1heCIsIm1pbiIsInRvQmVHcmVhdGVyVGhhbk9yRXF1YWwiLCJhY3Rpb24iLCJzdHlsZSIsInRyYW5zaXRpb24iLCJkYXRhc2V0IiwidGhlbWUiLCJub3QiLCJ0b0hhdmVDU1MiLCJzZXRWaWV3cG9ydFNpemUiLCJ3aWR0aCIsImhlaWdodCIsImdlb21ldHJ5IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiZ3JpZCIsImhlbHAiLCJsZWZ0Iiwicm91bmQiLCJoZWxwSGVpZ2h0IiwidG9FcXVhbCIsImNsaWNrIiwidG9CZUluVmlld3BvcnQiLCJmYWlsZWRBc3NldHMiLCJvbiIsInJlc3BvbnNlIiwidXJsIiwiaW5jbHVkZXMiLCJzdGF0dXMiLCJwdXNoIiwic2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCIsIndhaXRGb3JMb2FkU3RhdGUiLCJ0b0hhdmVKU1Byb3BlcnR5IiwiaGVhZGVyTG9nbyIsImZvb3RlckxvZ28iLCJhbHBoYSIsImltYWdlIiwiSW1hZ2UiLCJzcmMiLCJkZWNvZGUiLCJjYW52YXMiLCJjcmVhdGVFbGVtZW50IiwibmF0dXJhbFdpZHRoIiwibmF0dXJhbEhlaWdodCIsImNvbnRleHQiLCJnZXRDb250ZXh0Iiwid2lsbFJlYWRGcmVxdWVudGx5IiwiZHJhd0ltYWdlIiwiYXQiLCJ4IiwieSIsImdldEltYWdlRGF0YSIsImRhdGEiLCJjb3JuZXJzIiwibG93ZXJJbnRlcmlvciIsImhlYWRlckhlaWdodCIsImhlYWRlckxvZ29XaWR0aCIsImhlYWRlckxvZ29SYXRpbyIsImZvb3RlckxvZ29XaWR0aCIsImZvb3RlckxvZ29SYXRpbyIsIm92ZXJmbG93IiwidG9CZUNsb3NlVG8iLCJ0b0JlTGVzc1RoYW5PckVxdWFsIiwicmVxdWVzdCIsImdldCIsImhlYWRlcnMiLCJ0b0NvbnRhaW4iLCJib2R5Iiwic3ViYXJyYXkiLCJ0b1N0cmluZyIsInN1Ym1pdHRlZEJvZHkiLCJyb3V0ZSIsImZ1bGZpbGwiLCJjb250ZW50VHlwZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0b2tlbiIsInBhcnNlIiwicG9zdERhdGEiLCJvayIsImZvcm0iLCJwaG9uZSIsImZpbGwiLCJ0b0hhdmVWYWx1ZSIsInByZXNzIiwiY2hlY2siLCJjc3JmX3Rva2VuIiwiaW5wdXQiLCJzZXRTZWxlY3Rpb25SYW5nZSIsInR5cGUiLCJzdHlsZXMiLCJub2RlIiwiY29tcHV0ZWQiLCJwb3NpdGlvbiIsInRvcCIsInNoYWRvdyIsImJveFNoYWRvdyIsIndpbmRvdyIsInNjcm9sbFRvIiwiYm94IiwiYm91bmRpbmdCb3giLCJhYnMiLCJidXR0b24iLCJwYW5lbCIsImJlZm9yZSIsInNjcm9sbFkiLCJzY3JvbGxiYXJXaWR0aCIsImlubmVyV2lkdGgiLCJodG1sT3ZlcmZsb3ciLCJnZXRQcm9wZXJ0eVZhbHVlIiwiYm9keVBhZGRpbmdSaWdodCIsImNvbXB1dGVkQm9keVBhZGRpbmciLCJwYXJzZUZsb2F0IiwicGFkZGluZ1JpZ2h0IiwiY3RhWCIsImVsZW1lbnQiLCJ0b0JlRm9jdXNlZCIsImxvY2tlZCIsImtleWJvYXJkIiwicmVzdG9yZWQiLCJjbG9zZWQiLCJib3VuZHMiLCJpbnNldElubGluZUVuZCIsInRyYW5zbGF0ZSIsInN0YXJ0c1dpdGgiLCJ3YWl0Rm9yVGltZW91dCIsIm9wZW4iLCJvcGVuQnV0dG9uIiwidG9CZUdyZWF0ZXJUaGFuIiwib3ZlcmxheSIsImNvb2tpZUJhbm5lciIsImxheWVycyIsInBhcnNlSW50IiwiekluZGV4IiwiY29va2llIiwic3Ryb2tlSGVpZ2h0cyIsImxpbmVzIiwiZGlhbG9nIiwidG9CZUhpZGRlbiIsInRyaWdnZXIiLCJjb250YWluZXJYIiwidmlld3BvcnQiLCJtYXhUaXRsZUxpbmVzIiwibGluZUNvdW50IiwicmFuZ2UiLCJjcmVhdGVSYW5nZSIsInNlbGVjdE5vZGVDb250ZW50cyIsIlNldCIsImdldENsaWVudFJlY3RzIiwicmVjdCIsInNpemUiLCJtZWRpYSIsImNvbnRlbnQiLCJ0aXRsZSIsImNvcHkiLCJkaWFsb2dIZWlnaHQiLCJtZWRpYUhlaWdodCIsImNvbnRlbnRQYWRkaW5nIiwicGFkZGluZ1RvcCIsInRpdGxlRm9udCIsImZvbnRTaXplIiwiY29weUZvbnQiLCJidXR0b25Gb250IiwidGl0bGVMaW5lcyIsImNvcHlMaW5lcyIsImJ1dHRvbkxpbmVzIiwiZmlyc3RDaGlsZCIsImJ1dHRvbkhlaWdodCIsImJhbm5lciIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJyZWxvYWQiLCJtZXRyaWNzIiwiaGVyb0lubmVyIiwibmF2IiwiYm9keUZhbWlseSIsImZvbnRGYW1pbHkiLCJib2R5TGluZUhlaWdodCIsImxpbmVIZWlnaHQiLCJuYXZGYW1pbHkiLCJjb250YWluZXJXaWR0aCIsImNvbnRhaW5lckxlZnQiLCJleHBlY3RlZFRvcCIsImlubmVyIiwiY29udGVudFJlY3QiLCJpbm5lckxlZnQiLCJjb250ZW50TGVmdCIsInRpdGxlTGVmdCIsInBhZGRpbmdCb3R0b20iLCJwYWRkaW5nTGVmdCIsInZpZXdwb3J0V2lkdGgiLCJldmFsdWF0ZUFsbCIsImJ1dHRvbnMiLCJyZWN0cyIsIndpZHRocyIsImxlZnRzIiwiaGVpZ2h0cyIsInZlcnRpY2FsR2FwIiwiYm90dG9tIiwiZXZlcnkiLCJnYXAiLCJsYXN0QWN0aW9uIiwiZGVza3RvcCIsImhlcm8iLCJtZWRpYUVsZW1lbnQiLCJyaWdodCIsIm1lZGlhUG9zaXRpb24iLCJ0aXRsZVNpemUiLCJ0aXRsZUxpbmVIZWlnaHQiLCJtb2JpbGUiLCJpbm5lckJvdHRvbSIsIm1lZGlhVG9wIiwibWVkaWFXaWR0aCIsImNhcmQiLCJleHBlY3RlZEdhcCIsInByb2JsZW0iLCJzb2x1dGlvbiIsImNvbHVtbnMiLCJjb2x1bW4iLCJhbGlnbmVkIiwicmFkaXVzIiwiYm9yZGVyUmFkaXVzIiwiYmVuZWZpdHMiLCJncmlkVGVtcGxhdGVDb2x1bW5zIiwic3BsaXQiLCJsZW5ndGgiLCJwcm9ibGVtQ29sdW1ucyIsImZvb3RlckNvbHVtbnMiLCJiZW5lZml0c0NvbHVtbnMiLCJub2RlcyIsIm51bWJlciIsInNlY3Rpb24iLCJtaW5IZWlnaHQiLCJ0b01hdGNoT2JqZWN0IiwibTkiLCJjb250YWluZXIiLCJwYW5lbFdpZHRoIiwid3JhcHBlciIsInJvdyIsIm92ZXJmbG93cyIsImJvZHlPdmVyZmxvd3MiLCJyb3dDb2x1bW5zIiwiZG93bmxvYWQiLCJpY29ucyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJpY29uUmVjdHMiLCJpY29uIiwiY29weVJlY3QiLCJ0aXRsZURpc3BsYXkiLCJkaXNwbGF5IiwiZGV0YWlsTGluZXMiLCJsZWZ0SWNvblJpZ2h0IiwiY29weUxlZnQiLCJjb3B5UmlnaHQiLCJyaWdodEljb25MZWZ0IiwibWFza0ltYWdlIiwid2Via2l0TWFza0ltYWdlIiwiYWZ0ZXIiLCJiZWZvcmVDb250ZW50IiwiYmVmb3JlQmFja2dyb3VuZEltYWdlIiwiYmFja2dyb3VuZEltYWdlIiwiYWZ0ZXJDb250ZW50IiwiYWZ0ZXJCYWNrZ3JvdW5kSW1hZ2UiLCJmb3JtV2lkdGgiLCJleHBlY3RlZENvbHVtbnMiLCJwYW5lbFJpZ2h0Iiwid2lkdGhCZWZvcmUiLCJ3aWR0aEFmdGVyIiwiY2FwYWJpbGl0eSIsInNwZWNpZmljYXRpb25zIiwiYXBwbGljYXRpb25zIiwiYXBwbGljYXRpb25TdHlsZSIsIm1hcmtlclN0eWxlIiwiYXBwbGljYXRpb25zV2lkdGgiLCJjb2x1bW5SYXRpb3MiLCJtYXJrZXJNYXNrIiwibWFya2VyQmFja2dyb3VuZEltYWdlIiwic2VsZWN0b3IiLCJwcm9ibGVtT3V0ZXIiLCJjYXBhYmlsaXRpZXMiLCJyZWFzb25zIiwiYWJvdXQiLCJsZWFkIiwiZ2FwcyIsImhlcm9Ub1Byb2JsZW0iLCJwcm9ibGVtVG9DYXBhYmlsaXRpZXMiLCJjYXBhYmlsaXRpZXNUb0FwcGxpY2F0aW9ucyIsImFwcGxpY2F0aW9uc1RvUmVhc29ucyIsInJlYXNvbnNUb1NwZWNpZmljYXRpb25zIiwic3BlY2lmaWNhdGlvbnNUb0Fib3V0IiwiYWJvdXRUb0xlYWQiLCJsZWFkVG9Gb290ZXIiLCJncmlkV2lkdGgiLCJjYXJkUmlnaHQiLCJncmlkUmlnaHQiLCJ0YWJsZXQiLCJjYXJkVG9wIiwibWVkaWFCb3R0b20iLCJjYXJkV2lkdGgiLCJtb2JpbGVPcmRlciIsImxpc3QiLCJ0b0JlTGVzc1RoYW4iLCJidXR0b25XaWR0aCIsInBvaW50cyIsImRpYWdub3N0aWNzIiwib2ZmZW5kZXJzIiwiZmlsdGVyIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiY2xhc3NOYW1lIl0sInNvdXJjZXMiOlsibGFuZGluZy5zcGVjLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0ZXN0LCBleHBlY3QgfSBmcm9tICdAcGxheXdyaWdodC90ZXN0JztcblxudGVzdCgnbGFuZGluZyByZW5kZXJzIHRoZSBwcmltYXJ5IGhlYWRpbmcgYW5kIGhhcyBubyBob3Jpem9udGFsIG92ZXJmbG93JywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVJvbGUoJ2hlYWRpbmcnLCB7IGxldmVsOiAxIH0pKS50b0NvbnRhaW5UZXh0KCfQkNCy0YLQvtC80LDRgtC40LfQuNGA0YPQudGC0LUnKTtcblxuICBjb25zdCBoYXNPdmVyZmxvdyA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoXG4gICAgKCkgPT4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoID4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gICk7XG5cbiAgZXhwZWN0KGhhc092ZXJmbG93KS50b0JlKGZhbHNlKTtcbn0pO1xuXG50ZXN0KCdhbGwgcmVmZXJlbmNlIHNlY3Rpb25zIGFuZCBsZWdhbCBsaW5rcyBleGlzdCcsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBmb3IgKGNvbnN0IHRleHQgb2YgW1xuICAgICfQn9GA0L7QsdC70LXQvNCwJyxcbiAgICAn0KDQtdGI0LXQvdC40LUgSmFjaycsXG4gICAgJ9Cn0YLQviDRg9C80LXQtdGCJyxcbiAgICAn0J/RgNC40LzQtdGA0Ysg0L/RgNC40LzQtdC90LXQvdC40Y8nLFxuICAgICfQn9C+0YfQtdC80YMg0LLRi9Cx0LjRgNCw0Y7RgiDQotC10LrRgdGC0LjQu9GMINCe0L/RgiDQotC+0YDQsycsXG4gICAgJ9Ce0LHQvtGA0YPQtNC+0LLQsNC90LjQtSDQuCDRgdC+0L/RgNC+0LLQvtC20LTQtdC90LjQtSDQtNC70Y8g0YjQstC10LnQvdC+0LPQviDQv9GA0L7QuNC30LLQvtC00YHRgtCy0LAnLFxuICAgICfQotC10YXQvdC40YfQtdGB0LrQuNC1INGF0LDRgNCw0LrRgtC10YDQuNGB0YLQuNC60LgnXG4gIF0pIHtcbiAgICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVRleHQodGV4dCwgeyBleGFjdDogZmFsc2UgfSkuZmlyc3QoKSkudG9CZVZpc2libGUoKTtcbiAgfVxuXG4gIGNvbnN0IGZvb3RlciA9IHBhZ2UubG9jYXRvcignLnNpdGUtZm9vdGVyJyk7XG4gIGF3YWl0IGV4cGVjdChmb290ZXIuZ2V0QnlSb2xlKCdsaW5rJywgeyBuYW1lOiAn0J/QvtC70LjRgtC40LrQsCDQutC+0L3RhNC40LTQtdC90YbQuNCw0LvRjNC90L7RgdGC0LgnLCBleGFjdDogdHJ1ZSB9KSkudG9IYXZlQXR0cmlidXRlKCdocmVmJywgJy9wcml2YWN5Lmh0bWwnKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5nZXRCeVJvbGUoJ2xpbmsnLCB7IG5hbWU6ICfQodC+0LPQu9Cw0YHQuNC1INC90LAg0L7QsdGA0LDQsdC+0YLQutGDINC/0LXRgNGB0L7QvdCw0LvRjNC90YvRhSDQtNCw0L3QvdGL0YUnLCBleGFjdDogdHJ1ZSB9KSkudG9IYXZlQXR0cmlidXRlKCdocmVmJywgJy9jb25zZW50Lmh0bWwnKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5nZXRCeVJvbGUoJ2xpbmsnLCB7IG5hbWU6ICfQoNC10LrQstC40LfQuNGC0Ysg0L7RgNCz0LDQvdC40LfQsNGG0LjQuCcsIGV4YWN0OiB0cnVlIH0pKS50b0hhdmVBdHRyaWJ1dGUoJ2hyZWYnLCAnL3JlcXVpc2l0ZXMuaHRtbCcpO1xufSk7XG5cbnRlc3QoJ2Zvb3RlciBtYXRjaGVzIHRoZSBhcHByb3ZlZCBjb250YWN0IG5hdmlnYXRpb24gaGVscCBhbmQgbGVnYWwgY29udHJhY3QnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG4gIGNvbnN0IGZvb3RlciA9IHBhZ2UubG9jYXRvcignLnNpdGUtZm9vdGVyJyk7XG5cbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5sb2NhdG9yKCcuZm9vdGVyLWNvbHVtbicpKS50b0hhdmVDb3VudCgzKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5sb2NhdG9yKCcuZm9vdGVyLWNvbnRhY3QnKSkudG9IYXZlQ291bnQoMyk7XG4gIGF3YWl0IGV4cGVjdChmb290ZXIuZ2V0QnlSb2xlKCdsaW5rJywgeyBuYW1lOiAv0J3Rg9C20L3QsCDQv9C+0LzQvtGJ0YwvaSB9KSkudG9IYXZlQXR0cmlidXRlKCdocmVmJywgJyNsZWFkLWZvcm0nKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5sb2NhdG9yKCcuZm9vdGVyLW5hdiBsaScpKS50b0hhdmVDb3VudCg2KTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5sb2NhdG9yKCcuc29jaWFsLWxpbmsnKSkudG9IYXZlQ291bnQoMCk7XG4gIGF3YWl0IGV4cGVjdChmb290ZXIuZ2V0QnlUZXh0KCfQnNGLINCyINGB0L7RhtGB0LXRgtGP0YUnLCB7IGV4YWN0OiB0cnVlIH0pKS50b0hhdmVDb3VudCgwKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5nZXRCeVJvbGUoJ2hlYWRpbmcnLCB7IG5hbWU6ICfQlNC+0LrRg9C80LXQvdGC0YsnLCBleGFjdDogdHJ1ZSB9KSkudG9CZVZpc2libGUoKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5sb2NhdG9yKCcuZm9vdGVyLWxlZ2FsIGEnKSkudG9IYXZlQ291bnQoMyk7XG4gIGF3YWl0IGV4cGVjdChmb290ZXIubG9jYXRvcignLnNpdGUtZm9vdGVyX195ZWFyJykpLnRvSGF2ZVRleHQoJzIwMjYnKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5nZXRCeVJvbGUoJ2xpbmsnLCB7IG5hbWU6ICfQn9C+0LvQuNGC0LjQutCwINC60L7QvdGE0LjQtNC10L3RhtC40LDQu9GM0L3QvtGB0YLQuCcgfSkpLnRvSGF2ZUF0dHJpYnV0ZSgnaHJlZicsICcvcHJpdmFjeS5odG1sJyk7XG4gIGF3YWl0IGV4cGVjdChmb290ZXIuZ2V0QnlSb2xlKCdsaW5rJywgeyBuYW1lOiAn0KHQvtCz0LvQsNGB0LjQtSDQvdCwINC+0LHRgNCw0LHQvtGC0LrRgyDQv9C10YDRgdC+0L3QsNC70YzQvdGL0YUg0LTQsNC90L3Ri9GFJyB9KSkudG9IYXZlQXR0cmlidXRlKCdocmVmJywgJy9jb25zZW50Lmh0bWwnKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5nZXRCeVJvbGUoJ2xpbmsnLCB7IG5hbWU6ICfQoNC10LrQstC40LfQuNGC0Ysg0L7RgNCz0LDQvdC40LfQsNGG0LjQuCcgfSkpLnRvSGF2ZUF0dHJpYnV0ZSgnaHJlZicsICcvcmVxdWlzaXRlcy5odG1sJyk7XG59KTtcblxudGVzdCgnbGFuZGluZyBleHBvc2VzIHRoZSBzdXBwbGllZCBvcmdhbml6YXRpb24gY29udGFjdHMnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG4gIGNvbnN0IGhlYWRlciA9IHBhZ2UubG9jYXRvcignLnNpdGUtaGVhZGVyJyk7XG4gIGNvbnN0IGZvb3RlciA9IHBhZ2UubG9jYXRvcignLnNpdGUtZm9vdGVyJyk7XG5cbiAgYXdhaXQgZXhwZWN0KGhlYWRlci5sb2NhdG9yKCcuaGVhZGVyLXBob25lJykpLnRvSGF2ZUF0dHJpYnV0ZSgnaHJlZicsICd0ZWw6Kzc5Mjc2Njc3MzA3Jyk7XG4gIGF3YWl0IGV4cGVjdChoZWFkZXIubG9jYXRvcignLmhlYWRlci1waG9uZScpKS50b0hhdmVUZXh0KCc4ICg5MjcpIDY2Ny03My0wNycpO1xuICBhd2FpdCBleHBlY3QoaGVhZGVyLmxvY2F0b3IoJy5zaXRlLWhlYWRlcl9fY29udGFjdCBzcGFuJykpLnRvSGF2ZVRleHQoJ9Ca0L7QvdGB0YPQu9GM0YLQsNGG0LjRjyDQv9C+INC+0LHQvtGA0YPQtNC+0LLQsNC90LjRjicpO1xuICBhd2FpdCBleHBlY3QoZm9vdGVyLmdldEJ5Um9sZSgnbGluaycsIHsgbmFtZTogJzggKDkyNykgNjY3LTczLTA3JyB9KSkudG9IYXZlQXR0cmlidXRlKCdocmVmJywgJ3RlbDorNzkyNzY2NzczMDcnKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3Rlci5nZXRCeVJvbGUoJ2xpbmsnLCB7IG5hbWU6ICd0ZWtzdGlsb3B0dG9yZ0BtYWlsLnJ1JyB9KSkudG9IYXZlQXR0cmlidXRlKCdocmVmJywgJ21haWx0bzp0ZWtzdGlsb3B0dG9yZ0BtYWlsLnJ1Jyk7XG4gIGF3YWl0IGV4cGVjdChmb290ZXIuZ2V0QnlUZXh0KC/Qv9C+0YFcXC4g0JrRg9Cz0LXRgdC4LCDRg9C7XFwuINCo0L7RgNGI0LXQu9GB0LrQsNGPLCDQtFxcLiAyLykpLnRvQmVWaXNpYmxlKCk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmdldEJ5VGV4dCgnOCAoODAwKSA1NTUtNTctMTgnLCB7IGV4YWN0OiB0cnVlIH0pKS50b0hhdmVDb3VudCgwKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UuZ2V0QnlUZXh0KCdpbmZvQGphY2stc2V3aW5nLnJ1JywgeyBleGFjdDogdHJ1ZSB9KSkudG9IYXZlQ291bnQoMCk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmdldEJ5VGV4dCgv0J/RgNC+0LzRi9GI0LvQtdC90L3QsNGPLCAxMS8pKS50b0hhdmVDb3VudCgwKTtcbn0pO1xuXG50ZXN0KCdmb290ZXIgYWNjZW50IHRleHQga2VlcHMgV0NBRyBBQSBjb250cmFzdCBvbiB0aGUgaW5kdXN0cmlhbCBiYWNrZ3JvdW5kJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuXG4gIGNvbnN0IGNvbnRyYXN0ID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VSZ2IgPSAodmFsdWUpID0+IHZhbHVlLm1hdGNoKC9bXFxkLl0rL2cpLnNsaWNlKDAsIDMpLm1hcChOdW1iZXIpO1xuICAgIGNvbnN0IGx1bWluYW5jZSA9IChyZ2IpID0+IHJnYlxuICAgICAgLm1hcCgoY2hhbm5lbCkgPT4gY2hhbm5lbCAvIDI1NSlcbiAgICAgIC5tYXAoKGNoYW5uZWwpID0+IGNoYW5uZWwgPD0gMC4wMzkyOCA/IGNoYW5uZWwgLyAxMi45MiA6ICgoY2hhbm5lbCArIDAuMDU1KSAvIDEuMDU1KSAqKiAyLjQpXG4gICAgICAucmVkdWNlKChzdW0sIGNoYW5uZWwsIGluZGV4KSA9PiBzdW0gKyBjaGFubmVsICogWzAuMjEyNiwgMC43MTUyLCAwLjA3MjJdW2luZGV4XSwgMCk7XG4gICAgY29uc3QgeWVhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaXRlLWZvb3Rlcl9feWVhcicpO1xuICAgIGNvbnN0IGZvb3RlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaXRlLWZvb3RlcicpO1xuICAgIGNvbnN0IGZvcmVncm91bmQgPSBsdW1pbmFuY2UocGFyc2VSZ2IoZ2V0Q29tcHV0ZWRTdHlsZSh5ZWFyKS5jb2xvcikpO1xuICAgIGNvbnN0IGJhY2tncm91bmQgPSBsdW1pbmFuY2UocGFyc2VSZ2IoZ2V0Q29tcHV0ZWRTdHlsZShmb290ZXIpLmJhY2tncm91bmRDb2xvcikpO1xuICAgIHJldHVybiAoTWF0aC5tYXgoZm9yZWdyb3VuZCwgYmFja2dyb3VuZCkgKyAwLjA1KSAvIChNYXRoLm1pbihmb3JlZ3JvdW5kLCBiYWNrZ3JvdW5kKSArIDAuMDUpO1xuICB9KTtcblxuICBleHBlY3QoY29udHJhc3QpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoNC41KTtcbn0pO1xuXG50ZXN0KCdzb2x1dGlvbiBhY3Rpb24ga2VlcHMgV0NBRyBBQSBjb250cmFzdCB3aGVuIGRhcmsgdG9rZW5zIGFyZSBhY3RpdmUnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgY29udHJhc3QgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHtcbiAgICBjb25zdCBhY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9uLS1zb2x1dGlvbicpO1xuICAgIGFjdGlvbi5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kYXRhc2V0LnRoZW1lID0gJ2RhcmsnO1xuICAgIGNvbnN0IHBhcnNlUmdiID0gKHZhbHVlKSA9PiB2YWx1ZS5tYXRjaCgvW1xcZC5dKy9nKS5zbGljZSgwLCAzKS5tYXAoTnVtYmVyKTtcbiAgICBjb25zdCBsdW1pbmFuY2UgPSAocmdiKSA9PiByZ2JcbiAgICAgIC5tYXAoKGNoYW5uZWwpID0+IGNoYW5uZWwgLyAyNTUpXG4gICAgICAubWFwKChjaGFubmVsKSA9PiBjaGFubmVsIDw9IDAuMDM5MjggPyBjaGFubmVsIC8gMTIuOTIgOiAoKGNoYW5uZWwgKyAwLjA1NSkgLyAxLjA1NSkgKiogMi40KVxuICAgICAgLnJlZHVjZSgoc3VtLCBjaGFubmVsLCBpbmRleCkgPT4gc3VtICsgY2hhbm5lbCAqIFswLjIxMjYsIDAuNzE1MiwgMC4wNzIyXVtpbmRleF0sIDApO1xuICAgIGNvbnN0IGZvcmVncm91bmQgPSBsdW1pbmFuY2UocGFyc2VSZ2IoZ2V0Q29tcHV0ZWRTdHlsZShhY3Rpb24pLmNvbG9yKSk7XG4gICAgY29uc3QgYmFja2dyb3VuZCA9IGx1bWluYW5jZShwYXJzZVJnYihnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zb2x1dGlvbi1wYW5lbCcpKS5iYWNrZ3JvdW5kQ29sb3IpKTtcbiAgICByZXR1cm4gKE1hdGgubWF4KGZvcmVncm91bmQsIGJhY2tncm91bmQpICsgMC4wNSkgLyAoTWF0aC5taW4oZm9yZWdyb3VuZCwgYmFja2dyb3VuZCkgKyAwLjA1KTtcbiAgfSk7XG5cbiAgZXhwZWN0KGNvbnRyYXN0KS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDQuNSk7XG59KTtcblxudGVzdCgncHJvYmxlbSBwYW5lbCBleHBvc2VzIGEgc29saWQgcmVkIGZhbGxiYWNrIGJlaGluZCBpdHMgZ3JhZGllbnQnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLnByb2JsZW0tcGFuZWwnKSkubm90LnRvSGF2ZUNTUygnYmFja2dyb3VuZC1jb2xvcicsICdyZ2JhKDAsIDAsIDAsIDApJyk7XG59KTtcblxudGVzdCgnZm9vdGVyIHNwYW5zIHRoZSB2aWV3cG9ydCB3aGlsZSBpdHMgY29udGVudCBzdGF5cyBvbiB0aGUgMTQ0MHB4IGdyaWQnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aDogMTkwMCwgaGVpZ2h0OiAxMTAwIH0pO1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBjb25zdCBnZW9tZXRyeSA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4ge1xuICAgIGNvbnN0IGZvb3RlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaXRlLWZvb3RlcicpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGdyaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZS1mb290ZXJfX2dyaWQnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBoZWxwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvb3Rlci1oZWxwJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZvb3RlcjogeyBsZWZ0OiBNYXRoLnJvdW5kKGZvb3Rlci5sZWZ0KSwgd2lkdGg6IE1hdGgucm91bmQoZm9vdGVyLndpZHRoKSB9LFxuICAgICAgZ3JpZDogeyBsZWZ0OiBNYXRoLnJvdW5kKGdyaWQubGVmdCksIHdpZHRoOiBNYXRoLnJvdW5kKGdyaWQud2lkdGgpIH0sXG4gICAgICBoZWxwSGVpZ2h0OiBNYXRoLnJvdW5kKGhlbHAuaGVpZ2h0KVxuICAgIH07XG4gIH0pO1xuXG4gIGV4cGVjdChnZW9tZXRyeS5mb290ZXIpLnRvRXF1YWwoeyBsZWZ0OiAwLCB3aWR0aDogMTkwMCB9KTtcbiAgZXhwZWN0KGdlb21ldHJ5LmdyaWQpLnRvRXF1YWwoeyBsZWZ0OiAyMzAsIHdpZHRoOiAxNDQwIH0pO1xuICBleHBlY3QoZ2VvbWV0cnkuaGVscEhlaWdodCkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCg4OCk7XG5cbiAgYXdhaXQgcGFnZS5nZXRCeVJvbGUoJ2xpbmsnLCB7IG5hbWU6IC/QndGD0LbQvdCwINC/0L7QvNC+0YnRjC9pIH0pLmNsaWNrKCk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmxvY2F0b3IoJyNjb25zdWx0YXRpb24tZm9ybScpKS50b0JlSW5WaWV3cG9ydCgpO1xufSk7XG5cbnRlc3QoJ29wdGltaXplZCBpbWFnZXJ5IGFuZCB2ZWN0b3IgaWNvbnMgYXJlIHNlcnZlZCB3aXRob3V0IG1pc3NpbmcgYXNzZXRzJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGNvbnN0IGZhaWxlZEFzc2V0cyA9IFtdO1xuXG4gIHBhZ2Uub24oJ3Jlc3BvbnNlJywgKHJlc3BvbnNlKSA9PiB7XG4gICAgY29uc3QgdXJsID0gcmVzcG9uc2UudXJsKCk7XG4gICAgaWYgKCh1cmwuaW5jbHVkZXMoJy9hc3NldHMvaW1hZ2VzLycpIHx8IHVybC5pbmNsdWRlcygnL2Fzc2V0cy9pY29ucy8nKSkgJiYgcmVzcG9uc2Uuc3RhdHVzKCkgPj0gNDAwKSB7XG4gICAgICBmYWlsZWRBc3NldHMucHVzaChgJHtyZXNwb25zZS5zdGF0dXMoKX0gJHt1cmx9YCk7XG4gICAgfVxuICB9KTtcblxuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcbiAgYXdhaXQgcGFnZS5sb2NhdG9yKCdmb290ZXInKS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKCk7XG4gIGF3YWl0IHBhZ2Uud2FpdEZvckxvYWRTdGF0ZSgnbmV0d29ya2lkbGUnKTtcblxuICBhd2FpdCBleHBlY3QocGFnZS5sb2NhdG9yKCcuaGVyb19fbWVkaWEgaW1nJykpLnRvSGF2ZUpTUHJvcGVydHkoJ25hdHVyYWxXaWR0aCcsIDE2MDApO1xuICBleHBlY3QoZmFpbGVkQXNzZXRzKS50b0VxdWFsKFtdKTtcbn0pO1xuXG50ZXN0KCd0ZXh0aWxlb3B0dG9yZyBsb2dvIGJyYW5kcyB0aGUgaGVhZGVyIGFuZCBmb290ZXIgd2l0aCBvbmUgb3B0aW1pemVkIGFzc2V0JywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuICBjb25zdCBoZWFkZXJMb2dvID0gcGFnZS5sb2NhdG9yKCcuYnJhbmQtbG9nby0taGVhZGVyJyk7XG4gIGNvbnN0IGZvb3RlckxvZ28gPSBwYWdlLmxvY2F0b3IoJy5icmFuZC1sb2dvLS1mb290ZXInKTtcblxuICBhd2FpdCBleHBlY3QoaGVhZGVyTG9nbykudG9IYXZlQXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ9Ci0LXQutGB0YLQuNC70YzQvtC/0YLRgtC+0YDQsyDigJQg0LPQu9Cw0LLQvdCw0Y8nKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3RlckxvZ28pLnRvSGF2ZUF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICfQotC10LrRgdGC0LjQu9GM0L7Qv9GC0YLQvtGA0LMg4oCUINCz0LvQsNCy0L3QsNGPJyk7XG4gIGF3YWl0IGV4cGVjdChoZWFkZXJMb2dvLmxvY2F0b3IoJ2ltZycpKS50b0hhdmVBdHRyaWJ1dGUoJ3NyYycsICcvYXNzZXRzL2ltYWdlcy90ZXh0aWxlb3B0dG9yZy1sb2dvLndlYnAnKTtcbiAgYXdhaXQgZXhwZWN0KGZvb3RlckxvZ28ubG9jYXRvcignaW1nJykpLnRvSGF2ZUF0dHJpYnV0ZSgnc3JjJywgJy9hc3NldHMvaW1hZ2VzL3RleHRpbGVvcHR0b3JnLWxvZ28ud2VicCcpO1xuICBhd2FpdCBleHBlY3QoaGVhZGVyTG9nby5sb2NhdG9yKCdpbWcnKSkudG9IYXZlSlNQcm9wZXJ0eSgnbmF0dXJhbFdpZHRoJywgODAwKTtcbiAgYXdhaXQgZm9vdGVyTG9nby5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKCk7XG4gIGF3YWl0IGV4cGVjdChmb290ZXJMb2dvLmxvY2F0b3IoJ2ltZycpKS50b0hhdmVKU1Byb3BlcnR5KCduYXR1cmFsV2lkdGgnLCA4MDApO1xufSk7XG5cbnRlc3QoJ3RleHRpbGVvcHR0b3JnIGxvZ28gaXMgdHJhbnNwYXJlbnQgb3V0c2lkZSBpdHMgcm91bmRlZCBmcmFtZScsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBjb25zdCBhbHBoYSA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2Uuc3JjID0gJy9hc3NldHMvaW1hZ2VzL3RleHRpbGVvcHR0b3JnLWxvZ28ud2VicCc7XG4gICAgYXdhaXQgaW1hZ2UuZGVjb2RlKCk7XG5cbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSBpbWFnZS5uYXR1cmFsV2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGltYWdlLm5hdHVyYWxIZWlnaHQ7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcsIHsgd2lsbFJlYWRGcmVxdWVudGx5OiB0cnVlIH0pO1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcblxuICAgIGNvbnN0IGF0ID0gKHgsIHkpID0+IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKHgsIHksIDEsIDEpLmRhdGFbM107XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvcm5lcnM6IFthdCgwLCAwKSwgYXQoNzk5LCAwKSwgYXQoMCwgNDMzKSwgYXQoNzk5LCA0MzMpXSxcbiAgICAgIGxvd2VySW50ZXJpb3I6IGF0KDQwMCwgMzkwKVxuICAgIH07XG4gIH0pO1xuXG4gIGV4cGVjdChhbHBoYS5jb3JuZXJzKS50b0VxdWFsKFswLCAwLCAwLCAwXSk7XG4gIGV4cGVjdChhbHBoYS5sb3dlckludGVyaW9yKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDI1MCk7XG59KTtcblxudGVzdCgnYnJhbmQgbG9nb3MgcHJlc2VydmUgdGhlaXIgcmF0aW8gd2l0aG91dCBvdmVyZmxvd2luZyBzaXRlIGNocm9tZScsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBmb3IgKGNvbnN0IHdpZHRoIG9mIFsxNDQwLCA3NjgsIDM5MCwgMzIwXSkge1xuICAgIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGgsIGhlaWdodDogOTAwIH0pO1xuICAgIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZS1oZWFkZXInKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IGhlYWRlckxvZ28gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnJhbmQtbG9nby0taGVhZGVyIGltZycpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgZm9vdGVyTG9nbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5icmFuZC1sb2dvLS1mb290ZXIgaW1nJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBoZWFkZXJIZWlnaHQ6IE1hdGgucm91bmQoaGVhZGVyLmhlaWdodCksXG4gICAgICAgIGhlYWRlckxvZ29XaWR0aDogTWF0aC5yb3VuZChoZWFkZXJMb2dvLndpZHRoKSxcbiAgICAgICAgaGVhZGVyTG9nb1JhdGlvOiBoZWFkZXJMb2dvLndpZHRoIC8gaGVhZGVyTG9nby5oZWlnaHQsXG4gICAgICAgIGZvb3RlckxvZ29XaWR0aDogTWF0aC5yb3VuZChmb290ZXJMb2dvLndpZHRoKSxcbiAgICAgICAgZm9vdGVyTG9nb1JhdGlvOiBmb290ZXJMb2dvLndpZHRoIC8gZm9vdGVyTG9nby5oZWlnaHQsXG4gICAgICAgIG92ZXJmbG93OiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBleHBlY3QoZ2VvbWV0cnkub3ZlcmZsb3cpLnRvQmUoZmFsc2UpO1xuICAgIGV4cGVjdChnZW9tZXRyeS5oZWFkZXJMb2dvUmF0aW8pLnRvQmVDbG9zZVRvKDgwMCAvIDQzNCwgMik7XG4gICAgZXhwZWN0KGdlb21ldHJ5LmZvb3RlckxvZ29SYXRpbykudG9CZUNsb3NlVG8oODAwIC8gNDM0LCAyKTtcbiAgICBpZiAod2lkdGggPD0gNzY4KSBleHBlY3QoZ2VvbWV0cnkuaGVhZGVySGVpZ2h0KS50b0JlKDcyKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkuaGVhZGVyTG9nb1dpZHRoKS50b0JlTGVzc1RoYW5PckVxdWFsKHdpZHRoIDw9IDc2OCA/IDg4IDogMTEyKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkuZm9vdGVyTG9nb1dpZHRoKS50b0JlTGVzc1RoYW5PckVxdWFsKHdpZHRoIDw9IDQ4MCA/IDE0OCA6IDE3Nik7XG4gIH1cbn0pO1xuXG50ZXN0KCd0ZWNobmljYWwgc2hlZXQgaXMgYSByZWFsIGRvd25sb2FkYWJsZSBQREYnLCBhc3luYyAoeyBwYWdlLCByZXF1ZXN0IH0pID0+IHtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmdldEJ5Um9sZSgnbGluaycsIHtcbiAgICBuYW1lOiAn0KHQutCw0YfQsNGC0Ywg0YXQsNGA0LDQutGC0LXRgNC40YHRgtC40LrQuCBKQUNLIEo2INC4IEpBQ0sgTTkg0LIgUERGJ1xuICB9KSkudG9IYXZlQXR0cmlidXRlKCdkb3dubG9hZCcsICcnKTtcblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QuZ2V0KCcvYXNzZXRzL2RvY3MvamFjay1qNi1tOS5wZGYnKTtcbiAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cygpKS50b0JlKDIwMCk7XG4gIGV4cGVjdChyZXNwb25zZS5oZWFkZXJzKClbJ2NvbnRlbnQtdHlwZSddKS50b0NvbnRhaW4oJ2FwcGxpY2F0aW9uL3BkZicpO1xuICBleHBlY3QoKGF3YWl0IHJlc3BvbnNlLmJvZHkoKSkuc3ViYXJyYXkoMCwgNCkudG9TdHJpbmcoKSkudG9CZSgnJVBERicpO1xufSk7XG5cbnRlc3QoJ2xlYWQgZm9ybSBtYXNrcyBpbnB1dCwgdmFsaWRhdGVzIGVycm9ycywgYW5kIHN1Ym1pdHMgYSBub3JtYWxpemVkIHBob25lJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGxldCBzdWJtaXR0ZWRCb2R5O1xuXG4gIGF3YWl0IHBhZ2Uucm91dGUoJyoqL2FwaS9jc3JmLnBocCcsIGFzeW5jIChyb3V0ZSkgPT4ge1xuICAgIGF3YWl0IHJvdXRlLmZ1bGZpbGwoeyBzdGF0dXM6IDIwMCwgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJywgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB0b2tlbjogJ3Rlc3QtY3NyZicgfSkgfSk7XG4gIH0pO1xuICBhd2FpdCBwYWdlLnJvdXRlKCcqKi9hcGkvc3VibWl0LnBocCcsIGFzeW5jIChyb3V0ZSkgPT4ge1xuICAgIHN1Ym1pdHRlZEJvZHkgPSBKU09OLnBhcnNlKHJvdXRlLnJlcXVlc3QoKS5wb3N0RGF0YSgpID8/ICd7fScpO1xuICAgIGF3YWl0IHJvdXRlLmZ1bGZpbGwoeyBzdGF0dXM6IDIwMCwgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJywgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBvazogdHJ1ZSB9KSB9KTtcbiAgfSk7XG5cbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG4gIGNvbnN0IGZvcm0gPSBwYWdlLmxvY2F0b3IoJyNjb25zdWx0YXRpb24tZm9ybScpO1xuICBjb25zdCBwaG9uZSA9IGZvcm0ubG9jYXRvcignW25hbWU9XCJwaG9uZVwiXScpO1xuXG4gIGF3YWl0IHBob25lLmZpbGwoJzg5OTkxMjM0NTY3Jyk7XG4gIGF3YWl0IGV4cGVjdChwaG9uZSkudG9IYXZlVmFsdWUoJys3ICg5OTkpIDEyMy00NS02NycpO1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgMTE7IGluZGV4ICs9IDEpIGF3YWl0IHBob25lLnByZXNzKCdCYWNrc3BhY2UnKTtcbiAgYXdhaXQgZXhwZWN0KHBob25lKS50b0hhdmVWYWx1ZSgnJyk7XG5cbiAgYXdhaXQgZm9ybS5sb2NhdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmNsaWNrKCk7XG4gIGF3YWl0IGV4cGVjdChmb3JtLmxvY2F0b3IoJyNuYW1lLWVycm9yJykpLnRvQ29udGFpblRleHQoJ9Cj0LrQsNC20LjRgtC1INC40LzRjycpO1xuICBhd2FpdCBleHBlY3QoZm9ybS5sb2NhdG9yKCcjcGhvbmUtZXJyb3InKSkudG9Db250YWluVGV4dCgn0JLQstC10LTQuNGC0LUg0YLQtdC70LXRhNC+0L0nKTtcblxuICBhd2FpdCBmb3JtLmxvY2F0b3IoJ1tuYW1lPVwibmFtZVwiXScpLmZpbGwoJ9CQ0L3QvdCwJyk7XG4gIGF3YWl0IHBob25lLmZpbGwoJzk5OTEyMzQ1NjcnKTtcbiAgYXdhaXQgZm9ybS5sb2NhdG9yKCdbbmFtZT1cImNvbnNlbnRcIl0nKS5jaGVjaygpO1xuICBhd2FpdCBmb3JtLmxvY2F0b3IoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykuY2xpY2soKTtcblxuICBhd2FpdCBleHBlY3QoZm9ybS5sb2NhdG9yKCcuZm9ybS1zdGF0dXMnKSkudG9Db250YWluVGV4dCgn0KHQv9Cw0YHQuNCx0L4nKTtcbiAgZXhwZWN0KHN1Ym1pdHRlZEJvZHkucGhvbmUpLnRvQmUoJys3OTk5MTIzNDU2NycpO1xuICBleHBlY3Qoc3VibWl0dGVkQm9keS5jc3JmX3Rva2VuKS50b0JlKCd0ZXN0LWNzcmYnKTtcbn0pO1xuXG50ZXN0KCdwaG9uZSBtYXNrIHN1cHBvcnRzIG1pZGRsZSBkZWxldGlvbiwgc2VsZWN0aW9uIHJlcGxhY2VtZW50LCBjbGVhcmluZywgYW5kIHJlLWVudHJ5JywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuICBjb25zdCBwaG9uZSA9IHBhZ2UubG9jYXRvcignI2NvbnN1bHRhdGlvbi1mb3JtIFtuYW1lPVwicGhvbmVcIl0nKTtcblxuICBhd2FpdCBwaG9uZS5maWxsKCc4OTk5MTIzNDU2NycpO1xuICBhd2FpdCBwaG9uZS5ldmFsdWF0ZSgoaW5wdXQpID0+IGlucHV0LnNldFNlbGVjdGlvblJhbmdlKDExLCAxMSkpO1xuICBhd2FpdCBwaG9uZS5wcmVzcygnQmFja3NwYWNlJyk7XG4gIGF3YWl0IGV4cGVjdChwaG9uZSkudG9IYXZlVmFsdWUoJys3ICg5OTkpIDEzNC01Ni03Jyk7XG5cbiAgYXdhaXQgcGhvbmUuZmlsbCgnODk5OTEyMzQ1NjcnKTtcbiAgYXdhaXQgcGhvbmUuZXZhbHVhdGUoKGlucHV0KSA9PiBpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZSgxMCwgMTApKTtcbiAgYXdhaXQgcGhvbmUucHJlc3MoJ0RlbGV0ZScpO1xuICBhd2FpdCBleHBlY3QocGhvbmUpLnRvSGF2ZVZhbHVlKCcrNyAoOTk5KSAxMzQtNTYtNycpO1xuXG4gIGF3YWl0IHBob25lLmZpbGwoJzg5OTkxMjM0NTY3Jyk7XG4gIGF3YWl0IHBob25lLmV2YWx1YXRlKChpbnB1dCkgPT4gaW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2UoOSwgMTIpKTtcbiAgYXdhaXQgcGhvbmUudHlwZSgnNTU1Jyk7XG4gIGF3YWl0IGV4cGVjdChwaG9uZSkudG9IYXZlVmFsdWUoJys3ICg5OTkpIDU1NS00NS02NycpO1xuXG4gIGF3YWl0IHBob25lLmZpbGwoJycpO1xuICBhd2FpdCBleHBlY3QocGhvbmUpLnRvSGF2ZVZhbHVlKCcnKTtcbiAgYXdhaXQgcGhvbmUuZmlsbCgnKzcgOTIxIDU1NSAwMSAwMicpO1xuICBhd2FpdCBleHBlY3QocGhvbmUpLnRvSGF2ZVZhbHVlKCcrNyAoOTIxKSA1NTUtMDEtMDInKTtcbn0pO1xuXG50ZXN0KCdzaXRlIGhlYWRlciBzdGF5cyBwaW5uZWQgd2l0aCBhIHN1YnRsZSBzaGFkb3cgb24gZXZlcnkgdmlld3BvcnQnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgZm9yIChjb25zdCB3aWR0aCBvZiBbMTQ0MCwgMzkwXSkge1xuICAgIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGgsIGhlaWdodDogOTAwIH0pO1xuICAgIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuXG4gICAgY29uc3QgaGVhZGVyID0gcGFnZS5sb2NhdG9yKCcuc2l0ZS1oZWFkZXInKTtcbiAgICBjb25zdCBzdHlsZXMgPSBhd2FpdCBoZWFkZXIuZXZhbHVhdGUoKG5vZGUpID0+IHtcbiAgICAgIGNvbnN0IGNvbXB1dGVkID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBvc2l0aW9uOiBjb21wdXRlZC5wb3NpdGlvbixcbiAgICAgICAgdG9wOiBjb21wdXRlZC50b3AsXG4gICAgICAgIHNoYWRvdzogY29tcHV0ZWQuYm94U2hhZG93XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgZXhwZWN0KHN0eWxlcy5wb3NpdGlvbikudG9CZSgnc3RpY2t5Jyk7XG4gICAgZXhwZWN0KHN0eWxlcy50b3ApLnRvQmUoJzBweCcpO1xuICAgIGV4cGVjdChzdHlsZXMuc2hhZG93KS5ub3QudG9CZSgnbm9uZScpO1xuXG4gICAgYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB3aW5kb3cuc2Nyb2xsVG8oMCwgMTIwMCkpO1xuICAgIGF3YWl0IGV4cGVjdChoZWFkZXIpLnRvQmVJblZpZXdwb3J0KCk7XG4gICAgY29uc3QgYm94ID0gYXdhaXQgaGVhZGVyLmJvdW5kaW5nQm94KCk7XG4gICAgZXhwZWN0KE1hdGguYWJzKGJveD8ueSA/PyA5OTkpKS50b0JlTGVzc1RoYW5PckVxdWFsKDEpO1xuICB9XG59KTtcblxudGVzdCgnbW9iaWxlIG1lbnUgb3BlbnMgYWNjZXNzaWJseSB3aXRob3V0IHNoaWZ0aW5nIHRoZSBwYWdlIGFuZCBjbG9zZXMgYnkgRXNjYXBlJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDM5MCwgaGVpZ2h0OiA4NDQgfSk7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuXG4gIGNvbnN0IGJ1dHRvbiA9IHBhZ2UubG9jYXRvcignW2RhdGEtbWVudS1idXR0b25dJyk7XG4gIGNvbnN0IHBhbmVsID0gcGFnZS5sb2NhdG9yKCdbZGF0YS1tZW51LXBhbmVsXScpO1xuICBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHdpbmRvdy5zY3JvbGxUbygwLCAxMjAwKSk7XG4gIGNvbnN0IGJlZm9yZSA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gKHtcbiAgICBzY3JvbGxZOiB3aW5kb3cuc2Nyb2xsWSxcbiAgICBzY3JvbGxiYXJXaWR0aDogd2luZG93LmlubmVyV2lkdGggLSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgaHRtbE92ZXJmbG93OiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnb3ZlcmZsb3cnKSxcbiAgICBib2R5UGFkZGluZ1JpZ2h0OiBkb2N1bWVudC5ib2R5LnN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctcmlnaHQnKSxcbiAgICBjb21wdXRlZEJvZHlQYWRkaW5nOiBOdW1iZXIucGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLnBhZGRpbmdSaWdodCkgfHwgMCxcbiAgICBjdGFYOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVhZGVyLWN0YScpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnhcbiAgfSkpO1xuXG4gIC8vIERpc3BhdGNoIHRoZSBjbGljayBhdCB0aGUgc3RpY2t5IGJ1dHRvbidzIGN1cnJlbnQgcG9zaXRpb24uIFBsYXl3cmlnaHQnc1xuICAvLyBhY3Rpb25hYmlsaXR5IHNjcm9sbCB3b3VsZCBvdGhlcndpc2UgbW92ZSBhIHN0aWNreSBlbGVtZW50IGJlZm9yZSB0aGVcbiAgLy8gcGFnZSdzIG93biBtZW51IGhhbmRsZXIgcnVucywgd2hpY2ggY2Fubm90IGhhcHBlbiBkdXJpbmcgYSByZWFsIHRhcC5cbiAgYXdhaXQgYnV0dG9uLmV2YWx1YXRlKChlbGVtZW50KSA9PiBlbGVtZW50LmNsaWNrKCkpO1xuICBhd2FpdCBleHBlY3QoYnV0dG9uKS50b0hhdmVBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICBhd2FpdCBleHBlY3QocGFuZWwpLnRvSGF2ZUF0dHJpYnV0ZSgnZGF0YS1vcGVuJywgJ3RydWUnKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignW2RhdGEtbWVudS1vdmVybGF5XScpKS50b0JlVmlzaWJsZSgpO1xuICBhd2FpdCBleHBlY3QocGFuZWwubG9jYXRvcignYScpLmZpcnN0KCkpLnRvQmVGb2N1c2VkKCk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmxvY2F0b3IoJ21haW4nKSkudG9IYXZlSlNQcm9wZXJ0eSgnaW5lcnQnLCB0cnVlKTtcblxuICBjb25zdCBsb2NrZWQgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+ICh7XG4gICAgc2Nyb2xsWTogd2luZG93LnNjcm9sbFksXG4gICAgaHRtbE92ZXJmbG93OiBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkub3ZlcmZsb3csXG4gICAgY29tcHV0ZWRCb2R5UGFkZGluZzogTnVtYmVyLnBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5wYWRkaW5nUmlnaHQpIHx8IDAsXG4gICAgY3RhWDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlYWRlci1jdGEnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS54XG4gIH0pKTtcblxuICBleHBlY3QobG9ja2VkLmh0bWxPdmVyZmxvdykudG9CZSgnaGlkZGVuJyk7XG4gIGV4cGVjdChsb2NrZWQuc2Nyb2xsWSkudG9CZShiZWZvcmUuc2Nyb2xsWSk7XG4gIGV4cGVjdChNYXRoLnJvdW5kKGxvY2tlZC5jb21wdXRlZEJvZHlQYWRkaW5nIC0gYmVmb3JlLmNvbXB1dGVkQm9keVBhZGRpbmcpKS50b0JlKGJlZm9yZS5zY3JvbGxiYXJXaWR0aCk7XG4gIGV4cGVjdChNYXRoLmFicyhsb2NrZWQuY3RhWCAtIGJlZm9yZS5jdGFYKSkudG9CZUxlc3NUaGFuT3JFcXVhbCgxKTtcblxuICBhd2FpdCBwYWdlLmtleWJvYXJkLnByZXNzKCdTaGlmdCtUYWInKTtcbiAgYXdhaXQgZXhwZWN0KGJ1dHRvbikudG9CZUZvY3VzZWQoKTtcbiAgYXdhaXQgcGFnZS5rZXlib2FyZC5wcmVzcygnVGFiJyk7XG4gIGF3YWl0IGV4cGVjdChwYW5lbC5sb2NhdG9yKCdhJykuZmlyc3QoKSkudG9CZUZvY3VzZWQoKTtcblxuICBhd2FpdCBwYWdlLmtleWJvYXJkLnByZXNzKCdFc2NhcGUnKTtcbiAgYXdhaXQgZXhwZWN0KGJ1dHRvbikudG9IYXZlQXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG4gIGF3YWl0IGV4cGVjdChwYW5lbCkubm90LnRvSGF2ZUF0dHJpYnV0ZSgnZGF0YS1vcGVuJywgJ3RydWUnKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignbWFpbicpKS50b0hhdmVKU1Byb3BlcnR5KCdpbmVydCcsIGZhbHNlKTtcbiAgYXdhaXQgZXhwZWN0KGJ1dHRvbikudG9CZUZvY3VzZWQoKTtcblxuICBjb25zdCByZXN0b3JlZCA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gKHtcbiAgICBzY3JvbGxZOiB3aW5kb3cuc2Nyb2xsWSxcbiAgICBodG1sT3ZlcmZsb3c6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdvdmVyZmxvdycpLFxuICAgIGJvZHlQYWRkaW5nUmlnaHQ6IGRvY3VtZW50LmJvZHkuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpXG4gIH0pKTtcblxuICBleHBlY3QocmVzdG9yZWQpLnRvRXF1YWwoe1xuICAgIHNjcm9sbFk6IGJlZm9yZS5zY3JvbGxZLFxuICAgIGh0bWxPdmVyZmxvdzogYmVmb3JlLmh0bWxPdmVyZmxvdyxcbiAgICBib2R5UGFkZGluZ1JpZ2h0OiBiZWZvcmUuYm9keVBhZGRpbmdSaWdodFxuICB9KTtcbn0pO1xuXG50ZXN0KCdtb2JpbGUgbWVudSBkcmF3ZXIgZW50ZXJzIGZyb20gdGhlIHNhbWUgcmlnaHQgZWRnZSBhcyB0aGUgYnVyZ2VyIGJ1dHRvbicsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh7IHdpZHRoOiAzOTAsIGhlaWdodDogODQ0IH0pO1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBjb25zdCBidXR0b24gPSBwYWdlLmxvY2F0b3IoJ1tkYXRhLW1lbnUtYnV0dG9uXScpO1xuICBjb25zdCBwYW5lbCA9IHBhZ2UubG9jYXRvcignW2RhdGEtbWVudS1wYW5lbF0nKTtcbiAgY29uc3QgY2xvc2VkID0gYXdhaXQgcGFuZWwuZXZhbHVhdGUoKGVsZW1lbnQpID0+IHtcbiAgICBjb25zdCBzdHlsZXMgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgIGNvbnN0IGJvdW5kcyA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGluc2V0SW5saW5lRW5kOiBzdHlsZXMuaW5zZXRJbmxpbmVFbmQsXG4gICAgICB0cmFuc2xhdGU6IHN0eWxlcy50cmFuc2xhdGUsXG4gICAgICBsZWZ0OiBNYXRoLnJvdW5kKGJvdW5kcy5sZWZ0KVxuICAgIH07XG4gIH0pO1xuXG4gIGV4cGVjdChjbG9zZWQuaW5zZXRJbmxpbmVFbmQpLnRvQmUoJzBweCcpO1xuICBleHBlY3QoY2xvc2VkLnRyYW5zbGF0ZS5zdGFydHNXaXRoKCcxMDQlJykpLnRvQmUodHJ1ZSk7XG4gIGV4cGVjdChjbG9zZWQubGVmdCkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgzOTApO1xuXG4gIGF3YWl0IGJ1dHRvbi5ldmFsdWF0ZSgoZWxlbWVudCkgPT4gZWxlbWVudC5jbGljaygpKTtcbiAgYXdhaXQgZXhwZWN0KHBhbmVsKS50b0hhdmVBdHRyaWJ1dGUoJ2RhdGEtb3BlbicsICd0cnVlJyk7XG4gIGF3YWl0IHBhZ2Uud2FpdEZvclRpbWVvdXQoMjUwKTtcblxuICBjb25zdCBvcGVuID0gYXdhaXQgcGFuZWwuYm91bmRpbmdCb3goKTtcbiAgY29uc3Qgb3BlbkJ1dHRvbiA9IGF3YWl0IGJ1dHRvbi5ldmFsdWF0ZSgoZWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IHN0eWxlcyA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBzdHlsZXMucG9zaXRpb24sXG4gICAgICBpbnNldElubGluZUVuZDogc3R5bGVzLmluc2V0SW5saW5lRW5kXG4gICAgfTtcbiAgfSk7XG4gIGV4cGVjdChNYXRoLmFicygob3Blbj8ueCA/PyAwKSArIChvcGVuPy53aWR0aCA/PyAwKSAtIDM5MCkpLnRvQmVMZXNzVGhhbk9yRXF1YWwoMSk7XG4gIGV4cGVjdChvcGVuPy54ID8/IDApLnRvQmVHcmVhdGVyVGhhbigwKTtcbiAgZXhwZWN0KG9wZW5CdXR0b24ucG9zaXRpb24pLnRvQmUoJ2ZpeGVkJyk7XG4gIGV4cGVjdChvcGVuQnV0dG9uLmluc2V0SW5saW5lRW5kKS50b0JlKCcxNnB4Jyk7XG59KTtcblxudGVzdCgnb3BlbiBtb2JpbGUgbWVudSBzdGF5cyBhYm92ZSB0aGUgY29va2llIGJhbm5lciBvbiBhIGZpcnN0IHZpc2l0JywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDM5MCwgaGVpZ2h0OiA4NDQgfSk7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuXG4gIGNvbnN0IGJ1dHRvbiA9IHBhZ2UubG9jYXRvcignW2RhdGEtbWVudS1idXR0b25dJyk7XG4gIGNvbnN0IHBhbmVsID0gcGFnZS5sb2NhdG9yKCdbZGF0YS1tZW51LXBhbmVsXScpO1xuICBjb25zdCBvdmVybGF5ID0gcGFnZS5sb2NhdG9yKCdbZGF0YS1tZW51LW92ZXJsYXldJyk7XG4gIGNvbnN0IGNvb2tpZUJhbm5lciA9IHBhZ2UubG9jYXRvcignW2RhdGEtY29va2llLWJhbm5lcl0nKTtcbiAgYXdhaXQgZXhwZWN0KGNvb2tpZUJhbm5lcikudG9CZVZpc2libGUoKTtcblxuICBhd2FpdCBidXR0b24uZXZhbHVhdGUoKGVsZW1lbnQpID0+IGVsZW1lbnQuY2xpY2soKSk7XG4gIGF3YWl0IGV4cGVjdChwYW5lbCkudG9IYXZlQXR0cmlidXRlKCdkYXRhLW9wZW4nLCAndHJ1ZScpO1xuICBjb25zdCBsYXllcnMgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+ICh7XG4gICAgaGVhZGVyOiBOdW1iZXIucGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZS1oZWFkZXInKSkuekluZGV4LCAxMCksXG4gICAgcGFuZWw6IE51bWJlci5wYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1lbnUtcGFuZWxdJykpLnpJbmRleCwgMTApLFxuICAgIG92ZXJsYXk6IE51bWJlci5wYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1lbnUtb3ZlcmxheV0nKSkuekluZGV4LCAxMCksXG4gICAgY29va2llOiBOdW1iZXIucGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jb29raWUtYmFubmVyXScpKS56SW5kZXgsIDEwKVxuICB9KSk7XG5cbiAgZXhwZWN0KGxheWVycy5oZWFkZXIpLnRvQmVHcmVhdGVyVGhhbihsYXllcnMuY29va2llKTtcbiAgZXhwZWN0KGxheWVycy5wYW5lbCkudG9CZUdyZWF0ZXJUaGFuKGxheWVycy5jb29raWUpO1xuICBleHBlY3QobGF5ZXJzLm92ZXJsYXkpLnRvQmVHcmVhdGVyVGhhbihsYXllcnMuY29va2llKTtcbiAgYXdhaXQgZXhwZWN0KGNvb2tpZUJhbm5lcikudG9IYXZlSlNQcm9wZXJ0eSgnaW5lcnQnLCB0cnVlKTtcbiAgYXdhaXQgZXhwZWN0KG92ZXJsYXkpLnRvQmVWaXNpYmxlKCk7XG59KTtcblxudGVzdCgnbW9iaWxlIGJ1cmdlciB1c2VzIHRocmVlIGNvbmZpZGVudCB0d28tcGl4ZWwgc3Ryb2tlcycsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh7IHdpZHRoOiAzOTAsIGhlaWdodDogODQ0IH0pO1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBjb25zdCBzdHJva2VIZWlnaHRzID0gYXdhaXQgcGFnZS5sb2NhdG9yKCcubWVudS1idXR0b25fX2xpbmVzJykuZXZhbHVhdGUoKGxpbmVzKSA9PiBbXG4gICAgZ2V0Q29tcHV0ZWRTdHlsZShsaW5lcykuaGVpZ2h0LFxuICAgIGdldENvbXB1dGVkU3R5bGUobGluZXMsICc6OmJlZm9yZScpLmhlaWdodCxcbiAgICBnZXRDb21wdXRlZFN0eWxlKGxpbmVzLCAnOjphZnRlcicpLmhlaWdodFxuICBdKTtcblxuICBleHBlY3Qoc3Ryb2tlSGVpZ2h0cykudG9FcXVhbChbJzJweCcsICcycHgnLCAnMnB4J10pO1xufSk7XG5cbnRlc3QoJ3NlcnZpY2UgYW5kIHZpZGVvIGNvbnRyb2xzIGhhdmUgbWVhbmluZ2Z1bCBiZWhhdmlvciB3aXRob3V0IHNvY2lhbCBwbGFjZWhvbGRlcnMnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmxvY2F0b3IoJyNzZXJ2aWNlJykpLnRvSGF2ZUNvdW50KDEpO1xuXG4gIGF3YWl0IHBhZ2UuZ2V0QnlSb2xlKCdidXR0b24nLCB7IG5hbWU6ICfQodC80L7RgtGA0LXRgtGMINCy0LjQtNC10L4nIH0pLmNsaWNrKCk7XG4gIGNvbnN0IGRpYWxvZyA9IHBhZ2UuZ2V0QnlSb2xlKCdkaWFsb2cnLCB7IG5hbWU6ICfQlNC10LzQvtC90YHRgtGA0LDRhtC40Y8g0L7QsdC+0YDRg9C00L7QstCw0L3QuNGPIEpBQ0snIH0pO1xuICBhd2FpdCBleHBlY3QoZGlhbG9nKS50b0JlVmlzaWJsZSgpO1xuICBhd2FpdCBkaWFsb2cuZ2V0QnlSb2xlKCdidXR0b24nLCB7IG5hbWU6ICfQl9Cw0LrRgNGL0YLRjCDQstC40LTQtdC+JyB9KS5jbGljaygpO1xuICBhd2FpdCBleHBlY3QoZGlhbG9nKS50b0JlSGlkZGVuKCk7XG5cbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLnNvY2lhbC1saW5rLS1kaXNhYmxlZCcpKS50b0hhdmVDb3VudCgwKTtcbn0pO1xuXG50ZXN0KCd2aWRlbyBkaWFsb2cgbG9ja3MgcGFnZSBzY3JvbGxpbmcgd2l0aG91dCBhIGxheW91dCBqdW1wIGFuZCByZXN0b3JlcyBpdCBvbiBFc2NhcGUnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aDogMzkwLCBoZWlnaHQ6IDg0NCB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgdHJpZ2dlciA9IHBhZ2UuZ2V0QnlSb2xlKCdidXR0b24nLCB7IG5hbWU6ICfQodC80L7RgtGA0LXRgtGMINCy0LjQtNC10L4nIH0pO1xuICBjb25zdCBkaWFsb2cgPSBwYWdlLmdldEJ5Um9sZSgnZGlhbG9nJywgeyBuYW1lOiAn0JTQtdC80L7QvdGB0YLRgNCw0YbQuNGPINC+0LHQvtGA0YPQtNC+0LLQsNC90LjRjyBKQUNLJyB9KTtcbiAgYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB3aW5kb3cuc2Nyb2xsVG8oMCwgMTIwMCkpO1xuICBjb25zdCBiZWZvcmUgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+ICh7XG4gICAgc2Nyb2xsWTogd2luZG93LnNjcm9sbFksXG4gICAgc2Nyb2xsYmFyV2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoIC0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgIGh0bWxPdmVyZmxvdzogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ292ZXJmbG93JyksXG4gICAgYm9keVBhZGRpbmdSaWdodDogZG9jdW1lbnQuYm9keS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXJpZ2h0JyksXG4gICAgY29tcHV0ZWRCb2R5UGFkZGluZzogTnVtYmVyLnBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5wYWRkaW5nUmlnaHQpIHx8IDAsXG4gICAgY29udGFpbmVyWDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm9fX2lubmVyJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkueFxuICB9KSk7XG5cbiAgLy8gQSByZWFsIHRhcCBkb2VzIG5vdCBydW4gUGxheXdyaWdodCdzIGFjdGlvbmFiaWxpdHkgc2Nyb2xsIGJlZm9yZSB0aGVcbiAgLy8gc2l0ZSdzIGhhbmRsZXIsIHNvIGRpc3BhdGNoIHRoZSBjbGljayBhdCB0aGUgcGFnZSdzIGN1cnJlbnQgcG9zaXRpb24uXG4gIGF3YWl0IHRyaWdnZXIuZXZhbHVhdGUoKGVsZW1lbnQpID0+IGVsZW1lbnQuY2xpY2soKSk7XG4gIGF3YWl0IGV4cGVjdChkaWFsb2cpLnRvQmVWaXNpYmxlKCk7XG5cbiAgY29uc3QgbG9ja2VkID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiAoe1xuICAgIHNjcm9sbFk6IHdpbmRvdy5zY3JvbGxZLFxuICAgIGh0bWxPdmVyZmxvdzogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLm92ZXJmbG93LFxuICAgIGNvbXB1dGVkQm9keVBhZGRpbmc6IE51bWJlci5wYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkucGFkZGluZ1JpZ2h0KSB8fCAwLFxuICAgIGNvbnRhaW5lclg6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZXJvX19pbm5lcicpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnhcbiAgfSkpO1xuXG4gIGV4cGVjdChsb2NrZWQuaHRtbE92ZXJmbG93KS50b0JlKCdoaWRkZW4nKTtcbiAgZXhwZWN0KGxvY2tlZC5zY3JvbGxZKS50b0JlKGJlZm9yZS5zY3JvbGxZKTtcbiAgZXhwZWN0KE1hdGgucm91bmQobG9ja2VkLmNvbXB1dGVkQm9keVBhZGRpbmcgLSBiZWZvcmUuY29tcHV0ZWRCb2R5UGFkZGluZykpLnRvQmUoYmVmb3JlLnNjcm9sbGJhcldpZHRoKTtcbiAgZXhwZWN0KE1hdGguYWJzKGxvY2tlZC5jb250YWluZXJYIC0gYmVmb3JlLmNvbnRhaW5lclgpKS50b0JlTGVzc1RoYW5PckVxdWFsKDEpO1xuXG4gIGF3YWl0IHBhZ2Uua2V5Ym9hcmQucHJlc3MoJ0VzY2FwZScpO1xuICBhd2FpdCBleHBlY3QoZGlhbG9nKS50b0JlSGlkZGVuKCk7XG4gIGF3YWl0IGV4cGVjdCh0cmlnZ2VyKS50b0JlRm9jdXNlZCgpO1xuXG4gIGNvbnN0IHJlc3RvcmVkID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiAoe1xuICAgIHNjcm9sbFk6IHdpbmRvdy5zY3JvbGxZLFxuICAgIGh0bWxPdmVyZmxvdzogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ292ZXJmbG93JyksXG4gICAgYm9keVBhZGRpbmdSaWdodDogZG9jdW1lbnQuYm9keS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXJpZ2h0JylcbiAgfSkpO1xuXG4gIGV4cGVjdChyZXN0b3JlZCkudG9FcXVhbCh7XG4gICAgc2Nyb2xsWTogYmVmb3JlLnNjcm9sbFksXG4gICAgaHRtbE92ZXJmbG93OiBiZWZvcmUuaHRtbE92ZXJmbG93LFxuICAgIGJvZHlQYWRkaW5nUmlnaHQ6IGJlZm9yZS5ib2R5UGFkZGluZ1JpZ2h0XG4gIH0pO1xufSk7XG5cbnRlc3QoJ21vYmlsZSB2aWRlbyBkaWFsb2cgc3RheXMgY29tcGFjdCBhdCBuYXJyb3cgdmlld3BvcnRzJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGZvciAoY29uc3Qgdmlld3BvcnQgb2YgW1xuICAgIHsgd2lkdGg6IDM5MCwgaGVpZ2h0OiA4NDQsIG1heFRpdGxlTGluZXM6IDIgfSxcbiAgICB7IHdpZHRoOiAzMjAsIGhlaWdodDogNzAwLCBtYXhUaXRsZUxpbmVzOiAzIH0sXG4gICAgeyB3aWR0aDogMjgwLCBoZWlnaHQ6IDY1MCwgbWF4VGl0bGVMaW5lczogMyB9XG4gIF0pIHtcbiAgICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh2aWV3cG9ydCk7XG4gICAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG4gICAgYXdhaXQgcGFnZS5nZXRCeVJvbGUoJ2J1dHRvbicsIHsgbmFtZTogJ9Ch0LzQvtGC0YDQtdGC0Ywg0LLQuNC00LXQvicgfSkuY2xpY2soKTtcblxuICAgIGNvbnN0IGRpYWxvZyA9IHBhZ2UuZ2V0QnlSb2xlKCdkaWFsb2cnLCB7IG5hbWU6ICfQlNC10LzQvtC90YHRgtGA0LDRhtC40Y8g0L7QsdC+0YDRg9C00L7QstCw0L3QuNGPIEpBQ0snIH0pO1xuICAgIGF3YWl0IGV4cGVjdChkaWFsb2cpLnRvQmVWaXNpYmxlKCk7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBhd2FpdCBkaWFsb2cuZXZhbHVhdGUoKGVsZW1lbnQpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVDb3VudCA9IChub2RlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKG5vZGUpO1xuICAgICAgICByZXR1cm4gbmV3IFNldChbLi4ucmFuZ2UuZ2V0Q2xpZW50UmVjdHMoKV0ubWFwKChyZWN0KSA9PiBNYXRoLnJvdW5kKHJlY3QudG9wKSkpLnNpemU7XG4gICAgICB9O1xuICAgICAgY29uc3QgbWVkaWEgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy52aWRlby1kaWFsb2dfX21lZGlhJyk7XG4gICAgICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudmlkZW8tZGlhbG9nX19jb250ZW50Jyk7XG4gICAgICBjb25zdCB0aXRsZSA9IGNvbnRlbnQucXVlcnlTZWxlY3RvcignaDInKTtcbiAgICAgIGNvbnN0IGNvcHkgPSBjb250ZW50LnF1ZXJ5U2VsZWN0b3IoJ3AnKTtcbiAgICAgIGNvbnN0IGJ1dHRvbiA9IGNvbnRlbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbicpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlhbG9nSGVpZ2h0OiBNYXRoLnJvdW5kKGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KSxcbiAgICAgICAgbWVkaWFIZWlnaHQ6IE1hdGgucm91bmQobWVkaWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KSxcbiAgICAgICAgY29udGVudFBhZGRpbmc6IE51bWJlci5wYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoY29udGVudCkucGFkZGluZ1RvcCksXG4gICAgICAgIHRpdGxlRm9udDogTnVtYmVyLnBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZSh0aXRsZSkuZm9udFNpemUpLFxuICAgICAgICBjb3B5Rm9udDogTnVtYmVyLnBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZShjb3B5KS5mb250U2l6ZSksXG4gICAgICAgIGJ1dHRvbkZvbnQ6IE51bWJlci5wYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoYnV0dG9uKS5mb250U2l6ZSksXG4gICAgICAgIHRpdGxlTGluZXM6IGxpbmVDb3VudCh0aXRsZSksXG4gICAgICAgIGNvcHlMaW5lczogbGluZUNvdW50KGNvcHkpLFxuICAgICAgICBidXR0b25MaW5lczogbGluZUNvdW50KGJ1dHRvbi5maXJzdENoaWxkKSxcbiAgICAgICAgYnV0dG9uSGVpZ2h0OiBNYXRoLnJvdW5kKGJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgZXhwZWN0KGdlb21ldHJ5LmRpYWxvZ0hlaWdodCkudG9CZUxlc3NUaGFuT3JFcXVhbCh2aWV3cG9ydC5oZWlnaHQgLSAzMik7XG4gICAgZXhwZWN0KGdlb21ldHJ5Lm1lZGlhSGVpZ2h0KS50b0JlTGVzc1RoYW5PckVxdWFsKDE2MCk7XG4gICAgZXhwZWN0KGdlb21ldHJ5LmNvbnRlbnRQYWRkaW5nKS50b0JlKDIwKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkudGl0bGVGb250KS50b0JlKDI0KTtcbiAgICBleHBlY3QoZ2VvbWV0cnkuY29weUZvbnQpLnRvQmUoMTQpO1xuICAgIGV4cGVjdChnZW9tZXRyeS5idXR0b25Gb250KS50b0JlKDEyKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkudGl0bGVMaW5lcykudG9CZUxlc3NUaGFuT3JFcXVhbCh2aWV3cG9ydC5tYXhUaXRsZUxpbmVzKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkuY29weUxpbmVzKS50b0JlTGVzc1RoYW5PckVxdWFsKDUpO1xuICAgIGV4cGVjdChnZW9tZXRyeS5idXR0b25MaW5lcykudG9CZSgxKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkuYnV0dG9uSGVpZ2h0KS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDQ0KTtcblxuICAgIGF3YWl0IGRpYWxvZy5nZXRCeVJvbGUoJ2J1dHRvbicsIHsgbmFtZTogJ9CX0LDQutGA0YvRgtGMINCy0LjQtNC10L4nIH0pLmNsaWNrKCk7XG4gIH1cbn0pO1xuXG50ZXN0KCdjb29raWUgY2hvaWNlIGlzIHN0b3JlZCBhbmQgc3VwcHJlc3NlcyB0aGUgYmFubmVyIG9uIHJldHVybicsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcbiAgY29uc3QgYmFubmVyID0gcGFnZS5sb2NhdG9yKCdbZGF0YS1jb29raWUtYmFubmVyXScpO1xuICBhd2FpdCBleHBlY3QoYmFubmVyKS50b0JlVmlzaWJsZSgpO1xuICBhd2FpdCBwYWdlLmxvY2F0b3IoJ1tkYXRhLWNvb2tpZS1uZWNlc3NhcnldJykuY2xpY2soKTtcbiAgYXdhaXQgZXhwZWN0KGJhbm5lcikudG9CZUhpZGRlbigpO1xuICBleHBlY3QoYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnamFja19jb29raWVfcHJlZmVyZW5jZV92MScpKSkudG9CZSgnbmVjZXNzYXJ5Jyk7XG5cbiAgYXdhaXQgcGFnZS5yZWxvYWQoKTtcbiAgYXdhaXQgZXhwZWN0KGJhbm5lcikudG9CZUhpZGRlbigpO1xufSk7XG5cbnRlc3QoJ2Rlc2t0b3AgdXNlcyB0aGUgYXBwcm92ZWQgMTQ0MHB4IGNvbnRhaW5lciBhbmQgbG9jYWwgc2Fucy1zZXJpZiB0eXBvZ3JhcGh5JywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDE5MDAsIGhlaWdodDogOTAwIH0pO1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBjb25zdCBtZXRyaWNzID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgY29uc3QgYm9keSA9IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSk7XG4gICAgY29uc3QgaGVyb0lubmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm9fX2lubmVyJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgbmF2ID0gZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZS1uYXYgYScpKTtcbiAgICByZXR1cm4ge1xuICAgICAgYm9keUZhbWlseTogYm9keS5mb250RmFtaWx5LFxuICAgICAgYm9keUxpbmVIZWlnaHQ6IGJvZHkubGluZUhlaWdodCxcbiAgICAgIG5hdkZhbWlseTogbmF2LmZvbnRGYW1pbHksXG4gICAgICBjb250YWluZXJXaWR0aDogTWF0aC5yb3VuZChoZXJvSW5uZXIud2lkdGgpLFxuICAgICAgY29udGFpbmVyTGVmdDogTWF0aC5yb3VuZChoZXJvSW5uZXIubGVmdClcbiAgICB9O1xuICB9KTtcblxuICBleHBlY3QobWV0cmljcy5ib2R5RmFtaWx5KS50b0NvbnRhaW4oJ0ludGVyIExvY2FsJyk7XG4gIGV4cGVjdChtZXRyaWNzLmJvZHlGYW1pbHkpLm5vdC50b0NvbnRhaW4oJ1RpbWVzIE5ldyBSb21hbicpO1xuICBleHBlY3QobWV0cmljcy5uYXZGYW1pbHkpLnRvQ29udGFpbignSW50ZXIgTG9jYWwnKTtcbiAgZXhwZWN0KG1ldHJpY3MuYm9keUxpbmVIZWlnaHQpLm5vdC50b0JlKCdub3JtYWwnKTtcbiAgZXhwZWN0KG1ldHJpY3MuY29udGFpbmVyV2lkdGgpLnRvQmUoMTQ0MCk7XG4gIGV4cGVjdChtZXRyaWNzLmNvbnRhaW5lckxlZnQpLnRvQmUoMjMwKTtcbn0pO1xuXG50ZXN0KCdoZXJvIGNvcHkgYWxpZ25zIHdpdGggdGhlIGNvbnRhaW5lciBhbmQga2VlcHMgb25seSByZXNwb25zaXZlIHRvcCBwYWRkaW5nJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGZvciAoY29uc3QgW3dpZHRoLCBleHBlY3RlZFRvcF0gb2YgW1sxOTAwLCA2NF0sIFs3NjgsIDQ4XSwgWzM5MCwgNDhdXSkge1xuICAgIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGgsIGhlaWdodDogOTAwIH0pO1xuICAgIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuXG4gICAgY29uc3QgZ2VvbWV0cnkgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHtcbiAgICAgIGNvbnN0IGlubmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm9fX2lubmVyJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm9fX2NvbnRlbnQnKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRSZWN0ID0gY29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm8gaDEnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShjb250ZW50KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlubmVyTGVmdDogTWF0aC5yb3VuZChpbm5lci5sZWZ0KSxcbiAgICAgICAgY29udGVudExlZnQ6IE1hdGgucm91bmQoY29udGVudFJlY3QubGVmdCksXG4gICAgICAgIHRpdGxlTGVmdDogTWF0aC5yb3VuZCh0aXRsZS5sZWZ0KSxcbiAgICAgICAgcGFkZGluZ1RvcDogTnVtYmVyLnBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCksXG4gICAgICAgIHBhZGRpbmdSaWdodDogTnVtYmVyLnBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1JpZ2h0KSxcbiAgICAgICAgcGFkZGluZ0JvdHRvbTogTnVtYmVyLnBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSksXG4gICAgICAgIHBhZGRpbmdMZWZ0OiBOdW1iZXIucGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCksXG4gICAgICAgIHZpZXdwb3J0V2lkdGg6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCxcbiAgICAgICAgc2Nyb2xsV2lkdGg6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIGV4cGVjdChnZW9tZXRyeS5jb250ZW50TGVmdCkudG9CZShnZW9tZXRyeS5pbm5lckxlZnQpO1xuICAgIGV4cGVjdChnZW9tZXRyeS50aXRsZUxlZnQpLnRvQmUoZ2VvbWV0cnkuaW5uZXJMZWZ0KTtcbiAgICBleHBlY3QoZ2VvbWV0cnkucGFkZGluZ1RvcCkudG9CZShleHBlY3RlZFRvcCk7XG4gICAgZXhwZWN0KGdlb21ldHJ5LnBhZGRpbmdSaWdodCkudG9CZSgwKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkucGFkZGluZ0JvdHRvbSkudG9CZSgwKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkucGFkZGluZ0xlZnQpLnRvQmUoMCk7XG4gICAgZXhwZWN0KGdlb21ldHJ5LnNjcm9sbFdpZHRoKS50b0JlKGdlb21ldHJ5LnZpZXdwb3J0V2lkdGgpO1xuICB9XG59KTtcblxudGVzdCgnbW9iaWxlIGhlcm8gYWN0aW9ucyBmb3JtIG9uZSBlcXVhbC13aWR0aCBDVEEgc3RhY2snLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aDogNDMwLCBoZWlnaHQ6IDkzMiB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgZ2VvbWV0cnkgPSBhd2FpdCBwYWdlLmxvY2F0b3IoJy5oZXJvX19hY3Rpb25zIC5idXR0b24nKS5ldmFsdWF0ZUFsbCgoYnV0dG9ucykgPT4ge1xuICAgIGNvbnN0IHJlY3RzID0gYnV0dG9ucy5tYXAoKGJ1dHRvbikgPT4gYnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGhzOiByZWN0cy5tYXAoKHsgd2lkdGggfSkgPT4gTWF0aC5yb3VuZCh3aWR0aCkpLFxuICAgICAgbGVmdHM6IHJlY3RzLm1hcCgoeyBsZWZ0IH0pID0+IE1hdGgucm91bmQobGVmdCkpLFxuICAgICAgaGVpZ2h0czogcmVjdHMubWFwKCh7IGhlaWdodCB9KSA9PiBNYXRoLnJvdW5kKGhlaWdodCkpLFxuICAgICAgdmVydGljYWxHYXA6IE1hdGgucm91bmQocmVjdHNbMV0udG9wIC0gcmVjdHNbMF0uYm90dG9tKVxuICAgIH07XG4gIH0pO1xuXG4gIGV4cGVjdChnZW9tZXRyeS53aWR0aHNbMF0pLnRvQmUoZ2VvbWV0cnkud2lkdGhzWzFdKTtcbiAgZXhwZWN0KGdlb21ldHJ5LmxlZnRzWzBdKS50b0JlKGdlb21ldHJ5LmxlZnRzWzFdKTtcbiAgZXhwZWN0KGdlb21ldHJ5LmhlaWdodHMuZXZlcnkoKGhlaWdodCkgPT4gaGVpZ2h0ID49IDQ4KSkudG9CZSh0cnVlKTtcbiAgZXhwZWN0KGdlb21ldHJ5LnZlcnRpY2FsR2FwKS50b0JlKDEyKTtcbn0pO1xuXG50ZXN0KCdtb2JpbGUgaGVybyBsZWF2ZXMgYnJlYXRoaW5nIHJvb20gYWZ0ZXIgdGhlIENUQSBzdGFjaycsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh7IHdpZHRoOiAzOTAsIGhlaWdodDogODQ0IH0pO1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBjb25zdCBnYXAgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHtcbiAgICBjb25zdCBsYXN0QWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm9fX2FjdGlvbnMgLmJ1dHRvbjpsYXN0LWNoaWxkJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgbWVkaWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb19fbWVkaWEnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtZWRpYS50b3AgLSBsYXN0QWN0aW9uLmJvdHRvbSk7XG4gIH0pO1xuXG4gIGV4cGVjdChnYXApLnRvQmUoMTYpO1xufSk7XG5cbnRlc3QoJ21vYmlsZSBoZXJvIGxlYWQga2VlcHMgYSB3b3JkIGJvdW5kYXJ5IHdoZW4gaXRzIGxpbmUgYnJlYWsgaXMgaGlkZGVuJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDM5MCwgaGVpZ2h0OiA4NDQgfSk7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuXG4gIGF3YWl0IGV4cGVjdChwYWdlLmxvY2F0b3IoJy5oZXJvX19sZWFkJykpLnRvSGF2ZVRleHQoXG4gICAgJ9Ci0L7Rh9C90L7QtSDQv9GA0LjRiNC40LLQsNC90LjQtSDQtNC10YLQsNC70LXQuSDQv9C+INC60L7QvdGC0YPRgNGDOiDQutCw0YDQvNCw0L3Riywg0LzQvtC70L3QuNC4LCDRjdGC0LjQutC10YLQutC4INCx0LXQtyDRgNGD0YfQvdC+0LPQviDRgtGA0YPQtNCwJ1xuICApO1xufSk7XG5cbnRlc3QoJ2hlcm8gbWVkaWEgc3BhbnMgdGhlIHZpZXdwb3J0IHdoaWxlIGNvcHkgc3RheXMgb24gdGhlIDE0NDBweCBncmlkJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDE5MDAsIGhlaWdodDogOTAwIH0pO1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBjb25zdCBkZXNrdG9wID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgY29uc3QgaGVybyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZXJvJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgaW5uZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb19faW5uZXInKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBtZWRpYUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb19fbWVkaWEnKTtcbiAgICBjb25zdCBtZWRpYSA9IG1lZGlhRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB0aXRsZSA9IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm8gaDEnKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlcm86IHtcbiAgICAgICAgbGVmdDogTWF0aC5yb3VuZChoZXJvLmxlZnQpLFxuICAgICAgICByaWdodDogTWF0aC5yb3VuZChoZXJvLnJpZ2h0KSxcbiAgICAgICAgd2lkdGg6IE1hdGgucm91bmQoaGVyby53aWR0aCksXG4gICAgICAgIGhlaWdodDogTWF0aC5yb3VuZChoZXJvLmhlaWdodClcbiAgICAgIH0sXG4gICAgICBpbm5lcjoge1xuICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKGlubmVyLmxlZnQpLFxuICAgICAgICB3aWR0aDogTWF0aC5yb3VuZChpbm5lci53aWR0aCksXG4gICAgICAgIGhlaWdodDogTWF0aC5yb3VuZChpbm5lci5oZWlnaHQpXG4gICAgICB9LFxuICAgICAgbWVkaWE6IHtcbiAgICAgICAgbGVmdDogTWF0aC5yb3VuZChtZWRpYS5sZWZ0KSxcbiAgICAgICAgcmlnaHQ6IE1hdGgucm91bmQobWVkaWEucmlnaHQpLFxuICAgICAgICB3aWR0aDogTWF0aC5yb3VuZChtZWRpYS53aWR0aCksXG4gICAgICAgIGhlaWdodDogTWF0aC5yb3VuZChtZWRpYS5oZWlnaHQpXG4gICAgICB9LFxuICAgICAgbWVkaWFQb3NpdGlvbjogZ2V0Q29tcHV0ZWRTdHlsZShtZWRpYUVsZW1lbnQpLnBvc2l0aW9uLFxuICAgICAgdGl0bGVTaXplOiB0aXRsZS5mb250U2l6ZSxcbiAgICAgIHRpdGxlTGluZUhlaWdodDogTnVtYmVyLnBhcnNlRmxvYXQodGl0bGUubGluZUhlaWdodClcbiAgICB9O1xuICB9KTtcblxuICBleHBlY3QoZGVza3RvcC5oZXJvKS50b0VxdWFsKHsgbGVmdDogMCwgcmlnaHQ6IDE5MDAsIHdpZHRoOiAxOTAwLCBoZWlnaHQ6IDQ0MCB9KTtcbiAgZXhwZWN0KGRlc2t0b3AuaW5uZXIpLnRvRXF1YWwoeyBsZWZ0OiAyMzAsIHdpZHRoOiAxNDQwLCBoZWlnaHQ6IDQ0MCB9KTtcbiAgZXhwZWN0KGRlc2t0b3AubWVkaWEpLnRvRXF1YWwoeyBsZWZ0OiAwLCByaWdodDogMTkwMCwgd2lkdGg6IDE5MDAsIGhlaWdodDogNDQwIH0pO1xuICBleHBlY3QoZGVza3RvcC5tZWRpYVBvc2l0aW9uKS50b0JlKCdhYnNvbHV0ZScpO1xuICBleHBlY3QoZGVza3RvcC50aXRsZVNpemUpLnRvQmUoJzQ2cHgnKTtcbiAgZXhwZWN0KGRlc2t0b3AudGl0bGVMaW5lSGVpZ2h0KS50b0JlQ2xvc2VUbyg0OS42OCwgMSk7XG5cbiAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aDogMzkwLCBoZWlnaHQ6IDg0NCB9KTtcbiAgYXdhaXQgcGFnZS5yZWxvYWQoKTtcbiAgY29uc3QgbW9iaWxlID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgY29uc3QgaW5uZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb19faW5uZXInKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBtZWRpYUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb19fbWVkaWEnKTtcbiAgICBjb25zdCBtZWRpYSA9IG1lZGlhRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4ge1xuICAgICAgbWVkaWFQb3NpdGlvbjogZ2V0Q29tcHV0ZWRTdHlsZShtZWRpYUVsZW1lbnQpLnBvc2l0aW9uLFxuICAgICAgaW5uZXJCb3R0b206IE1hdGgucm91bmQoaW5uZXIuYm90dG9tKSxcbiAgICAgIG1lZGlhVG9wOiBNYXRoLnJvdW5kKG1lZGlhLnRvcCksXG4gICAgICBtZWRpYVdpZHRoOiBNYXRoLnJvdW5kKG1lZGlhLndpZHRoKVxuICAgIH07XG4gIH0pO1xuXG4gIGV4cGVjdChtb2JpbGUubWVkaWFQb3NpdGlvbikudG9CZSgncmVsYXRpdmUnKTtcbiAgZXhwZWN0KG1vYmlsZS5tZWRpYVRvcCkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbChtb2JpbGUuaW5uZXJCb3R0b20pO1xuICBleHBlY3QobW9iaWxlLm1lZGlhV2lkdGgpLnRvQmUoMzkwKTtcbn0pO1xuXG50ZXN0KCdkZXNrdG9wIHVzZXMgdGhlIHJlZmVyZW5jZSBncmlkIGNvbXBvc2l0aW9uJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDE0NDAsIGhlaWdodDogMTAwMCB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLmhlcm9fX2lubmVyJykpLnRvSGF2ZUNTUygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLnByb2JsZW0tc29sdXRpb24nKSkudG9IYXZlQ1NTKCdkaXNwbGF5JywgJ2dyaWQnKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLmNhcGFiaWxpdGllc19fZ3JpZCcpKS50b0hhdmVDU1MoJ2Rpc3BsYXknLCAnZ3JpZCcpO1xufSk7XG5cbnRlc3QoJ3Byb2JsZW0gYW5kIHNvbHV0aW9uIGNhcmQgZXhwb3NlcyB0aGUgYXBwcm92ZWQgY29weSBhbmQgYmVuZWZpdCBzdHJ1Y3R1cmUnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgY2FyZCA9IHBhZ2UubG9jYXRvcignLnByb2JsZW0tc29sdXRpb24nKTtcbiAgYXdhaXQgZXhwZWN0KGNhcmQuZ2V0QnlSb2xlKCdoZWFkaW5nJywgeyBuYW1lOiAn0J/RgNC+0LHQu9C10LzQsCcsIGV4YWN0OiB0cnVlIH0pKS50b0JlVmlzaWJsZSgpO1xuICBhd2FpdCBleHBlY3QoY2FyZC5sb2NhdG9yKCcucHJvYmxlbS1pdGVtJykpLnRvSGF2ZUNvdW50KDMpO1xuICBhd2FpdCBleHBlY3QoY2FyZC5sb2NhdG9yKCcucHJvYmxlbS1pdGVtX19kZXNjcmlwdGlvbicpKS50b0hhdmVUZXh0KFtcbiAgICAn0KHQvdC40LbQsNC10YIg0L/RgNC+0LjQt9Cy0L7QtNC40YLQtdC70YzQvdC+0YHRgtGMINC4INGD0LLQtdC70LjRh9C40LLQsNC10YIg0YHRgNC+0LrQuCcsXG4gICAgJ9CY0Lct0LfQsCDRh9C10LvQvtCy0LXRh9C10YHQutC+0LPQviDRhNCw0LrRgtC+0YDQsCDRgdGC0YDQsNC00LDQtdGCINC60LDRh9C10YHRgtCy0L4g0LjQt9C00LXQu9C40LknLFxuICAgICfQoNGD0YfQvdC+0Lkg0YLRgNGD0LQg0L7Qs9GA0LDQvdC40YfQuNCy0LDQtdGCINC+0LHRitGR0LzRiyDQuCDRg9Cy0LXQu9C40YfQuNCy0LDQtdGCINC30LDRgtGA0LDRgtGLJ1xuICBdKTtcbiAgYXdhaXQgZXhwZWN0KGNhcmQubG9jYXRvcignLnNvbHV0aW9uLXBhbmVsX19leWVicm93JykpLnRvSGF2ZVRleHQoJ9Cd0LDRiNC1INGA0LXRiNC10L3QuNC1Jyk7XG4gIGF3YWl0IGV4cGVjdChjYXJkLmxvY2F0b3IoJy5zb2x1dGlvbi1iZW5lZml0JykpLnRvSGF2ZUNvdW50KDQpO1xuICBhd2FpdCBleHBlY3QoY2FyZC5sb2NhdG9yKCcuc29sdXRpb24tYmVuZWZpdF9fdGl0bGUnKSkudG9IYXZlVGV4dChbXG4gICAgJ9Ci0L7Rh9C90L7QtSDQv9C+0LfQuNGG0LjQvtC90LjRgNC+0LLQsNC90LjQtSDQv9C+INC30LDQtNCw0L3QvdC+0LzRgyDQutC+0L3RgtGD0YDRgycsXG4gICAgJ9Ch0YLQsNCx0LjQu9GM0L3QvtC1INC60LDRh9C10YHRgtCy0L4nLFxuICAgICfQktGL0YHQvtC60LDRjyDRgdC60L7RgNC+0YHRgtGMJyxcbiAgICAn0JvRkdCz0LrQvtC1INC80LDRgdGI0YLQsNCx0LjRgNC+0LLQsNC90LjQtSdcbiAgXSk7XG4gIGF3YWl0IGV4cGVjdChjYXJkLmdldEJ5Um9sZSgnbGluaycsIHsgbmFtZTogJ9Cj0LfQvdCw0YLRjCDQsdC+0LvRjNGI0LUg0L4g0YDQtdGI0LXQvdC40LgnIH0pKS50b0hhdmVBdHRyaWJ1dGUoJ2hyZWYnLCAnI2VxdWlwbWVudCcpO1xufSk7XG5cbnRlc3QoJ2hlcm8gdHJhbnNpdGlvbiB1c2VzIHRoZSBhcHByb3ZlZCByZXNwb25zaXZlIHNwYWNpbmcnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgZm9yIChjb25zdCBbd2lkdGgsIGV4cGVjdGVkR2FwXSBvZiBbWzE0NDAsIDQ4XSwgWzc2OCwgMzJdLCBbMzkwLCAyNF1dKSB7XG4gICAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aCwgaGVpZ2h0OiA5MDAgfSk7XG4gICAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgICBjb25zdCBnYXAgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHtcbiAgICAgIGNvbnN0IGhlcm8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVybycpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9ibGVtLXNvbHV0aW9uJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChjYXJkLnRvcCAtIGhlcm8uYm90dG9tKTtcbiAgICB9KTtcblxuICAgIGV4cGVjdChnYXApLnRvQmUoZXhwZWN0ZWRHYXApO1xuICB9XG59KTtcblxudGVzdCgncHJvYmxlbSBhbmQgc29sdXRpb24gY2FyZCBtYXRjaGVzIHRoZSBhcHByb3ZlZCBkZXNrdG9wIGNvbXBvc2l0aW9uJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDE5MDAsIGhlaWdodDogMTEwMCB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgZ2VvbWV0cnkgPSBhd2FpdCBwYWdlLmxvY2F0b3IoJy5wcm9ibGVtLXNvbHV0aW9uJykuZXZhbHVhdGUoKGNhcmQpID0+IHtcbiAgICBjb25zdCBwcm9ibGVtID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcucHJvYmxlbS1wYW5lbCcpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IG1lZGlhID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcucHJvYmxlbS1zb2x1dGlvbl9fbWVkaWEnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBzb2x1dGlvbiA9IGNhcmQucXVlcnlTZWxlY3RvcignLnNvbHV0aW9uLXBhbmVsJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgcmVjdCA9IGNhcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNhcmQ6IHsgd2lkdGg6IE1hdGgucm91bmQocmVjdC53aWR0aCksIGhlaWdodDogTWF0aC5yb3VuZChyZWN0LmhlaWdodCkgfSxcbiAgICAgIGNvbHVtbnM6IFtwcm9ibGVtLCBtZWRpYSwgc29sdXRpb25dLm1hcCgoY29sdW1uKSA9PiBNYXRoLnJvdW5kKGNvbHVtbi53aWR0aCkpLFxuICAgICAgYWxpZ25lZDogW3Byb2JsZW0sIG1lZGlhLCBzb2x1dGlvbl0uZXZlcnkoKGNvbHVtbikgPT4gTWF0aC5hYnMoY29sdW1uLmhlaWdodCAtIHJlY3QuaGVpZ2h0KSA8PSAyKSxcbiAgICAgIHJhZGl1czogZ2V0Q29tcHV0ZWRTdHlsZShjYXJkKS5ib3JkZXJSYWRpdXMsXG4gICAgICBiZW5lZml0czogZ2V0Q29tcHV0ZWRTdHlsZShjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5zb2x1dGlvbi1iZW5lZml0cycpKS5ncmlkVGVtcGxhdGVDb2x1bW5zXG4gICAgfTtcbiAgfSk7XG5cbiAgZXhwZWN0KGdlb21ldHJ5LmNhcmQud2lkdGgpLnRvQmUoMTQ0MCk7XG4gIGV4cGVjdChnZW9tZXRyeS5jYXJkLmhlaWdodCkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCg1NjApO1xuICBleHBlY3QoZ2VvbWV0cnkuYWxpZ25lZCkudG9CZSh0cnVlKTtcbiAgZXhwZWN0KGdlb21ldHJ5LmNvbHVtbnMuZXZlcnkoKHdpZHRoKSA9PiB3aWR0aCA+PSA0MDApKS50b0JlKHRydWUpO1xuICBleHBlY3QoZ2VvbWV0cnkucmFkaXVzKS5ub3QudG9CZSgnMHB4Jyk7XG4gIGV4cGVjdChnZW9tZXRyeS5iZW5lZml0cy5zcGxpdCgnICcpLmxlbmd0aCkudG9CZSgyKTtcbn0pO1xuXG50ZXN0KCdyZWRlc2lnbmVkIHByb2JsZW0gc29sdXRpb24gYW5kIGZvb3RlciBzdGFjayBzYWZlbHkgYWNyb3NzIGJyZWFrcG9pbnRzJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGZvciAoY29uc3Qgd2lkdGggb2YgWzEwMjQsIDc2OCwgMzkwLCAzMjBdKSB7XG4gICAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aCwgaGVpZ2h0OiAxMDAwIH0pO1xuICAgIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuXG4gICAgY29uc3QgbWV0cmljcyA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gKHtcbiAgICAgIG92ZXJmbG93OiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICBwcm9ibGVtQ29sdW1uczogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvYmxlbS1zb2x1dGlvbicpKS5ncmlkVGVtcGxhdGVDb2x1bW5zLnNwbGl0KCcgJykubGVuZ3RoLFxuICAgICAgZm9vdGVyQ29sdW1uczogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZS1mb290ZXJfX2dyaWQnKSkuZ3JpZFRlbXBsYXRlQ29sdW1ucy5zcGxpdCgnICcpLmxlbmd0aCxcbiAgICAgIGJlbmVmaXRzQ29sdW1uczogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc29sdXRpb24tYmVuZWZpdHMnKSkuZ3JpZFRlbXBsYXRlQ29sdW1ucy5zcGxpdCgnICcpLmxlbmd0aFxuICAgIH0pKTtcblxuICAgIGV4cGVjdChtZXRyaWNzLm92ZXJmbG93KS50b0JlKGZhbHNlKTtcbiAgICBpZiAod2lkdGggPj0gMTAyNCkgZXhwZWN0KG1ldHJpY3MucHJvYmxlbUNvbHVtbnMpLnRvQmUoMik7XG4gICAgaWYgKHdpZHRoIDw9IDc2OCkgZXhwZWN0KG1ldHJpY3MucHJvYmxlbUNvbHVtbnMpLnRvQmUoMSk7XG4gICAgaWYgKHdpZHRoIDw9IDM5MCkge1xuICAgICAgZXhwZWN0KG1ldHJpY3MuZm9vdGVyQ29sdW1ucykudG9CZSgxKTtcbiAgICAgIGV4cGVjdChtZXRyaWNzLmJlbmVmaXRzQ29sdW1ucykudG9CZSgxKTtcbiAgICB9XG4gIH1cbn0pO1xuXG50ZXN0KCdjYXBhYmlsaXRpZXMgcmVwcm9kdWNlIHRoZSBmaXZlLWNhcmQgcmVmZXJlbmNlIGNvbXBvc2l0aW9uJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDE5MDAsIGhlaWdodDogMTEwMCB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLmNhcGFiaWxpdHknKSkudG9IYXZlQ291bnQoNSk7XG4gIGV4cGVjdChhd2FpdCBwYWdlLmxvY2F0b3IoJy5jYXBhYmlsaXR5X19udW1iZXInKS5ldmFsdWF0ZUFsbChcbiAgICAobm9kZXMpID0+IG5vZGVzLm1hcCgobm9kZSkgPT4gbm9kZS5kYXRhc2V0Lm51bWJlcilcbiAgKSkudG9FcXVhbChbJzAxJywgJzAyJywgJzAzJywgJzA0JywgJzA1J10pO1xuICBhd2FpdCBleHBlY3QocGFnZS5sb2NhdG9yKCcuY2FwYWJpbGl0eV9fZGVzY3JpcHRpb24nKSkudG9IYXZlQ291bnQoNSk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmxvY2F0b3IoJy5jYXBhYmlsaXRpZXNfX2hlYWRpbmctYWNjZW50JykpLnRvSGF2ZVRleHQoL9GD0LzQtdC10YIvaSk7XG5cbiAgY29uc3QgZGVza3RvcCA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4ge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FwYWJpbGl0aWVzIC5jb250YWluZXInKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBncmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhcGFiaWxpdGllc19fZ3JpZCcpO1xuICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FwYWJpbGl0eScpO1xuICAgIHJldHVybiB7XG4gICAgICBsZWZ0OiBNYXRoLnJvdW5kKHNlY3Rpb24ubGVmdCksXG4gICAgICB3aWR0aDogTWF0aC5yb3VuZChzZWN0aW9uLndpZHRoKSxcbiAgICAgIGNvbHVtbnM6IGdldENvbXB1dGVkU3R5bGUoZ3JpZCkuZ3JpZFRlbXBsYXRlQ29sdW1ucy5zcGxpdCgnICcpLmxlbmd0aCxcbiAgICAgIHJhZGl1czogZ2V0Q29tcHV0ZWRTdHlsZShjYXJkKS5ib3JkZXJSYWRpdXMsXG4gICAgICBtaW5IZWlnaHQ6IE1hdGgucm91bmQoY2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpXG4gICAgfTtcbiAgfSk7XG5cbiAgZXhwZWN0KGRlc2t0b3ApLnRvTWF0Y2hPYmplY3QoeyBsZWZ0OiAyMzAsIHdpZHRoOiAxNDQwLCBjb2x1bW5zOiA1LCByYWRpdXM6ICcxMnB4JyB9KTtcbiAgZXhwZWN0KGRlc2t0b3AubWluSGVpZ2h0KS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDQwMCk7XG5cbiAgZm9yIChjb25zdCBbd2lkdGgsIGNvbHVtbnNdIG9mIFtbMTAyNCwgM10sIFs3NjgsIDJdLCBbMzkwLCAxXV0pIHtcbiAgICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh7IHdpZHRoLCBoZWlnaHQ6IDkwMCB9KTtcbiAgICBhd2FpdCBwYWdlLnJlbG9hZCgpO1xuICAgIGV4cGVjdChhd2FpdCBwYWdlLmxvY2F0b3IoJy5jYXBhYmlsaXRpZXNfX2dyaWQnKS5ldmFsdWF0ZShcbiAgICAgIChub2RlKSA9PiBnZXRDb21wdXRlZFN0eWxlKG5vZGUpLmdyaWRUZW1wbGF0ZUNvbHVtbnMuc3BsaXQoJyAnKS5sZW5ndGhcbiAgICApKS50b0JlKGNvbHVtbnMpO1xuICB9XG59KTtcblxudGVzdCgnc3BlY2lmaWNhdGlvbnMgZXhwb3NlIHNlcGFyYXRlIHNvdXJjZS1iYXNlZCBKNiBhbmQgTTkgdGFibGVzJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDE5MDAsIGhlaWdodDogMTEwMCB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgYXdhaXQgZXhwZWN0KHBhZ2UuZ2V0QnlSb2xlKCd0YWInKSkudG9IYXZlQ291bnQoMik7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmdldEJ5Um9sZSgndGFiJywgeyBuYW1lOiAnSkFDSyBKNicgfSkpLnRvSGF2ZUF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICd0cnVlJyk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmdldEJ5Um9sZSgndGFicGFuZWwnLCB7IG5hbWU6ICdKQUNLIEo2JyB9KS5sb2NhdG9yKCd0Ym9keSB0cicpKS50b0hhdmVDb3VudCgxNik7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmdldEJ5Um9sZSgndGFicGFuZWwnLCB7IG5hbWU6ICdKQUNLIEo2JyB9KSkudG9Db250YWluVGV4dCgn0JTQviAyMTAg0LzQvCcpO1xuICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVJvbGUoJ3RhYnBhbmVsJywgeyBuYW1lOiAnSkFDSyBKNicgfSkpLnRvQ29udGFpblRleHQoJzEyMCDQktGCJyk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmxvY2F0b3IoJy5zcGVjaWZpY2F0aW9ucycpKS5ub3QudG9Db250YWluVGV4dCgnSkstVDIyMTAnKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLnNwZWNpZmljYXRpb25zJykpLm5vdC50b0NvbnRhaW5UZXh0KCdNUy0xMDBBJyk7XG5cbiAgYXdhaXQgcGFnZS5nZXRCeVJvbGUoJ3RhYicsIHsgbmFtZTogJ0pBQ0sgTTknIH0pLmNsaWNrKCk7XG4gIGNvbnN0IG05ID0gcGFnZS5nZXRCeVJvbGUoJ3RhYnBhbmVsJywgeyBuYW1lOiAnSkFDSyBNOScgfSk7XG4gIGF3YWl0IGV4cGVjdChtOS5sb2NhdG9yKCd0Ym9keSB0cicpKS50b0hhdmVDb3VudCgxMik7XG4gIGF3YWl0IGV4cGVjdChtOSkudG9Db250YWluVGV4dCgnMTQwMCDDlyA5NTAg0LzQvCcpO1xuICBhd2FpdCBleHBlY3QobTkpLnRvQ29udGFpblRleHQoJ9CU0L4gMyA2MDAg0YHRgi/QvNC40L0nKTtcbiAgYXdhaXQgZXhwZWN0KG05KS50b0NvbnRhaW5UZXh0KCcwLDYg0JzQn9CwLCAzINC7L9C80LjQvScpO1xuICBhd2FpdCBleHBlY3QobTkpLnRvQ29udGFpblRleHQoJzYxMCAvIDY5MCDQutCzICjQvdC10YLRgtC+IC8g0LHRgNGD0YLRgtC+KScpO1xuICBhd2FpdCBleHBlY3QobTkpLnRvQ29udGFpblRleHQoJzIyMDAgw5cgMTIyMCDDlyAxNjUwINC80LwnKTtcbiAgYXdhaXQgZXhwZWN0KG05KS50b0NvbnRhaW5UZXh0KCdNOS1TUy1GMTMtWCcpO1xuICBhd2FpdCBleHBlY3QocGFnZS5sb2NhdG9yKCcucHJvZHVjdC1iZW5lZml0JykpLnRvSGF2ZUNvdW50KDQpO1xuICBhd2FpdCBleHBlY3QocGFnZS5sb2NhdG9yKCcucHJvZHVjdC1iZW5lZml0IGgzJykpLnRvSGF2ZVRleHQoW1xuICAgICfQktGL0YHQvtC60LDRjyDRgtC+0YfQvdC+0YHRgtGMJyxcbiAgICAn0KHQutC+0YDQvtGB0YLRjCDQuCDRgdGC0LDQsdC40LvRjNC90L7RgdGC0YwnLFxuICAgICfQndCw0LTRkdC20L3QvtGB0YLRjCcsXG4gICAgJ9Cf0YDQvtGB0YLQvtC1INGD0L/RgNCw0LLQu9C10L3QuNC1J1xuICBdKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLnNwZWNpZmljYXRpb25zX19kb3dubG9hZC1jb3B5IHNtYWxsJykpLnRvSGF2ZVRleHQoJ9Cf0L7QtNGA0L7QsdC90YvQtSDRhdCw0YDQsNC60YLQtdGA0LjRgdGC0LjQutC4INC4INGA0YPQutC+0LLQvtC00YHRgtCy0L4nKTtcblxuICBjb25zdCBnZW9tZXRyeSA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGVjaWZpY2F0aW9ucyA+IC5jb250YWluZXInKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGVjaWZpY2F0aW9uc19fcGFuZWwnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4ge1xuICAgICAgY29udGFpbmVyOiB7IGxlZnQ6IE1hdGgucm91bmQoY29udGFpbmVyLmxlZnQpLCB3aWR0aDogTWF0aC5yb3VuZChjb250YWluZXIud2lkdGgpIH0sXG4gICAgICBwYW5lbFdpZHRoOiBNYXRoLnJvdW5kKHBhbmVsLndpZHRoKSxcbiAgICAgIHJhZGl1czogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3BlY2lmaWNhdGlvbnNfX3BhbmVsJykpLmJvcmRlclJhZGl1cyxcbiAgICAgIGNvbHVtbnM6IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNwZWNpZmljYXRpb25zX19ncmlkJykpLmdyaWRUZW1wbGF0ZUNvbHVtbnMuc3BsaXQoJyAnKS5sZW5ndGhcbiAgICB9O1xuICB9KTtcblxuICBleHBlY3QoZ2VvbWV0cnkpLnRvRXF1YWwoe1xuICAgIGNvbnRhaW5lcjogeyBsZWZ0OiAyMzAsIHdpZHRoOiAxNDQwIH0sXG4gICAgcGFuZWxXaWR0aDogMTQ0MCxcbiAgICByYWRpdXM6ICcxMnB4JyxcbiAgICBjb2x1bW5zOiAyXG4gIH0pO1xufSk7XG5cbnRlc3QoJ21vYmlsZSBzcGVjaWZpY2F0aW9ucyBzd2l0Y2ggbW9kZWxzIHdpdGhvdXQgaG9yaXpvbnRhbCBzY3JvbGxpbmcnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgZm9yIChjb25zdCB3aWR0aCBvZiBbMzkwLCAzMjBdKSB7XG4gICAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aCwgaGVpZ2h0OiA4NDQgfSk7XG4gICAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVJvbGUoJ3RhYnBhbmVsJywgeyBuYW1lOiAnSkFDSyBKNicgfSkpLnRvQ29udGFpblRleHQoJ9CU0L4gMjEwINC80LwnKTtcbiAgICBhd2FpdCBwYWdlLmdldEJ5Um9sZSgndGFiJywgeyBuYW1lOiAnSkFDSyBNOScgfSkuY2xpY2soKTtcbiAgICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVJvbGUoJ3RhYnBhbmVsJywgeyBuYW1lOiAnSkFDSyBNOScgfSkpLnRvQ29udGFpblRleHQoJzE0MDAgw5cgOTUwINC80LwnKTtcblxuICAgIGNvbnN0IGdlb21ldHJ5ID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BhbmVsLW05IC50YWJsZS1zY3JvbGwnKTtcbiAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYW5lbC1tOSB0Ym9keSB0cicpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3ZlcmZsb3dzOiB3cmFwcGVyLnNjcm9sbFdpZHRoID4gd3JhcHBlci5jbGllbnRXaWR0aCArIDEsXG4gICAgICAgIGJvZHlPdmVyZmxvd3M6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCArIDEsXG4gICAgICAgIHJvd0NvbHVtbnM6IGdldENvbXB1dGVkU3R5bGUocm93KS5ncmlkVGVtcGxhdGVDb2x1bW5zLnNwbGl0KCcgJykubGVuZ3RoXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgZXhwZWN0KGdlb21ldHJ5KS50b0VxdWFsKHtcbiAgICAgIG92ZXJmbG93czogZmFsc2UsXG4gICAgICBib2R5T3ZlcmZsb3dzOiBmYWxzZSxcbiAgICAgIHJvd0NvbHVtbnM6IDFcbiAgICB9KTtcbiAgfVxufSk7XG5cbnRlc3QoJ21vYmlsZSB0ZWNobmljYWwtc2hlZXQgYnV0dG9uIGtlZXBzIGNvcHkgcmVhZGFibGUgYW5kIGljb25zIGZ1bGwgc2l6ZScsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBmb3IgKGNvbnN0IHdpZHRoIG9mIFszOTAsIDMyMF0pIHtcbiAgICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh7IHdpZHRoLCBoZWlnaHQ6IDg0NCB9KTtcbiAgICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICAgIGNvbnN0IGRvd25sb2FkID0gcGFnZS5sb2NhdG9yKCcuYnV0dG9uLS1kb3dubG9hZCcpO1xuICAgIGF3YWl0IGV4cGVjdChkb3dubG9hZCkudG9IYXZlQXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ9Ch0LrQsNGH0LDRgtGMINGF0LDRgNCw0LrRgtC10YDQuNGB0YLQuNC60LggSkFDSyBKNiDQuCBKQUNLIE05INCyIFBERicpO1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gYXdhaXQgZG93bmxvYWQuZXZhbHVhdGUoKGJ1dHRvbikgPT4ge1xuICAgICAgY29uc3QgbGluZUNvdW50ID0gKG5vZGUpID0+IHtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMobm9kZSk7XG4gICAgICAgIHJldHVybiBuZXcgU2V0KFsuLi5yYW5nZS5nZXRDbGllbnRSZWN0cygpXS5tYXAoKHJlY3QpID0+IE1hdGgucm91bmQocmVjdC50b3ApKSkuc2l6ZTtcbiAgICAgIH07XG4gICAgICBjb25zdCBpY29ucyA9IFsuLi5idXR0b24ucXVlcnlTZWxlY3RvckFsbCgnOnNjb3BlID4gW2RhdGEtaWNvbl0nKV07XG4gICAgICBjb25zdCBpY29uUmVjdHMgPSBpY29ucy5tYXAoKGljb24pID0+IGljb24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgY29uc3QgY29weSA9IGJ1dHRvbi5xdWVyeVNlbGVjdG9yKCcuc3BlY2lmaWNhdGlvbnNfX2Rvd25sb2FkLWNvcHknKTtcbiAgICAgIGNvbnN0IGNvcHlSZWN0ID0gY29weS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhlaWdodDogTWF0aC5yb3VuZChidXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KSxcbiAgICAgICAgaWNvbnM6IGljb25SZWN0cy5tYXAoKHJlY3QpID0+IFtNYXRoLnJvdW5kKHJlY3Qud2lkdGgpLCBNYXRoLnJvdW5kKHJlY3QuaGVpZ2h0KV0pLFxuICAgICAgICB0aXRsZURpc3BsYXk6IGdldENvbXB1dGVkU3R5bGUoYnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ3N0cm9uZycpKS5kaXNwbGF5LFxuICAgICAgICBkZXRhaWxMaW5lczogbGluZUNvdW50KGJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdzbWFsbCcpKSxcbiAgICAgICAgbGVmdEljb25SaWdodDogaWNvblJlY3RzWzBdLnJpZ2h0LFxuICAgICAgICBjb3B5TGVmdDogY29weVJlY3QubGVmdCxcbiAgICAgICAgY29weVJpZ2h0OiBjb3B5UmVjdC5yaWdodCxcbiAgICAgICAgcmlnaHRJY29uTGVmdDogaWNvblJlY3RzWzFdLmxlZnRcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBleHBlY3QoZ2VvbWV0cnkuaGVpZ2h0KS50b0JlTGVzc1RoYW5PckVxdWFsKDg0KTtcbiAgICBleHBlY3QoZ2VvbWV0cnkuaWNvbnMpLnRvRXF1YWwoW1syNCwgMjRdLCBbMjQsIDI0XV0pO1xuICAgIGV4cGVjdChnZW9tZXRyeS50aXRsZURpc3BsYXkpLnRvQmUoJ25vbmUnKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkuZGV0YWlsTGluZXMpLnRvQmVMZXNzVGhhbk9yRXF1YWwod2lkdGggPT09IDM5MCA/IDIgOiAzKTtcbiAgICBleHBlY3QoZ2VvbWV0cnkubGVmdEljb25SaWdodCkudG9CZUxlc3NUaGFuT3JFcXVhbChnZW9tZXRyeS5jb3B5TGVmdCk7XG4gICAgZXhwZWN0KGdlb21ldHJ5LmNvcHlSaWdodCkudG9CZUxlc3NUaGFuT3JFcXVhbChnZW9tZXRyeS5yaWdodEljb25MZWZ0KTtcbiAgfVxufSk7XG5cbnRlc3QoJ0luZHVzdHJpYWwgQ29udHJvbCBSb29tIENUQSBleHBvc2VzIHRoZSBhcHByb3ZlZCBjb3B5IGFuZCBmb3JtIGNvbnRyYWN0JywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuXG4gIGNvbnN0IHNlY3Rpb24gPSBwYWdlLmxvY2F0b3IoJy5sZWFkLXNlY3Rpb24nKTtcbiAgY29uc3QgcGFuZWwgPSBzZWN0aW9uLmxvY2F0b3IoJy5sZWFkLXBhbmVsJyk7XG4gIGNvbnN0IGZvcm0gPSBzZWN0aW9uLmxvY2F0b3IoJyNjb25zdWx0YXRpb24tZm9ybScpO1xuXG4gIGF3YWl0IGV4cGVjdChzZWN0aW9uLmxvY2F0b3IoJzpzY29wZSA+IC5jb250YWluZXInKSkudG9IYXZlQ291bnQoMSk7XG4gIGF3YWl0IGV4cGVjdChwYW5lbCkudG9IYXZlQ291bnQoMSk7XG4gIGF3YWl0IGV4cGVjdChwYW5lbC5sb2NhdG9yKCcubGVhZC1zZWN0aW9uX19tZWRpYScpKS50b0hhdmVDb3VudCgxKTtcbiAgYXdhaXQgZXhwZWN0KHNlY3Rpb24ubG9jYXRvcignLmxlYWQtc2VjdGlvbl9fZXllYnJvdycpKS50b0hhdmVUZXh0KCfQoNCw0YHRh9GR0YIg0L/RgNC+0LXQutGC0LAnKTtcbiAgYXdhaXQgZXhwZWN0KHNlY3Rpb24uZ2V0QnlSb2xlKCdoZWFkaW5nJywgeyBsZXZlbDogMiB9KSkudG9IYXZlVGV4dCgn0KPRgdC60L7RgNGM0YLQtSDQv9GA0L7QuNC30LLQvtC00YHRgtCy0L4g0YEg0KLQtdC60YHRgtC40LvRjCDQntC/0YIg0KLQvtGA0LMnKTtcbiAgYXdhaXQgZXhwZWN0KHNlY3Rpb24ubG9jYXRvcignLmxlYWQtc2VjdGlvbl9fY29weSA+IHAnKSkudG9IYXZlVGV4dChcbiAgICAn0J7Qv9C40YjQuNGC0LUg0LfQsNC00LDRh9GDLiDQodC/0LXRhtC40LDQu9C40YHRgiDQv9C+0LTQsdC10YDRkdGCINC60L7QvdGE0LjQs9GD0YDQsNGG0LjRjiDQvtCx0L7RgNGD0LTQvtCy0LDQvdC40Y8g0L/QvtC0INCy0LDRiNC4INC+0L/QtdGA0LDRhtC40Lgg0Lgg0LzQsNGC0LXRgNC40LDQu9GLLidcbiAgKTtcbiAgYXdhaXQgZXhwZWN0KHNlY3Rpb24ubG9jYXRvcignLmxlYWQtc2VjdGlvbl9fcG9pbnQnKSkudG9IYXZlVGV4dChbXG4gICAgJ9CR0LXRgdC/0LvQsNGC0L3QsNGPINC60L7QvdGB0YPQu9GM0YLQsNGG0LjRjycsXG4gICAgJ9Cf0L7QtNCx0L7RgCDQv9C+0LQg0LfQsNC00LDRh9GDJ1xuICBdKTtcbiAgYXdhaXQgZXhwZWN0KHNlY3Rpb24ubG9jYXRvcignLmxlYWQtc2VjdGlvbl9fcG9pbnQgW2RhdGEtaWNvbj1cImNoZWNrLWNpcmNsZVwiXScpKS50b0hhdmVDb3VudCgyKTtcbiAgZXhwZWN0KGF3YWl0IHNlY3Rpb24ubG9jYXRvcignLmxlYWQtc2VjdGlvbl9fcG9pbnQgW2RhdGEtaWNvbj1cImNoZWNrLWNpcmNsZVwiXScpLmZpcnN0KCkuZXZhbHVhdGUoKG5vZGUpID0+IHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgcmV0dXJuIHN0eWxlLm1hc2tJbWFnZSB8fCBzdHlsZS53ZWJraXRNYXNrSW1hZ2U7XG4gIH0pKS50b0NvbnRhaW4oJ2NoZWNrLWNpcmNsZS5zdmcnKTtcblxuICBhd2FpdCBleHBlY3QoZm9ybS5sb2NhdG9yKCcubGVhZC1mb3JtX19oZWFkZXIgaDMnKSkudG9IYXZlVGV4dCgn0J/QvtC70YPRh9C40YLRjCDQutC+0L3RgdGD0LvRjNGC0LDRhtC40Y4nKTtcbiAgYXdhaXQgZXhwZWN0KGZvcm0ubG9jYXRvcignLmxlYWQtZm9ybV9faGVhZGVyIHAnKSkudG9IYXZlVGV4dCgn0J7RgdGC0LDQstGM0YLQtSDQutC+0L3RgtCw0LrRgtGLINC00LvRjyDRgdCy0Y/Qt9C4INGB0L4g0YHQv9C10YbQuNCw0LvQuNGB0YLQvtC8Jyk7XG4gIGF3YWl0IGV4cGVjdChmb3JtLmxvY2F0b3IoJy5maWVsZF9fbGFiZWwnKSkudG9IYXZlVGV4dChbXG4gICAgJ9CS0LDRiNC1INC40LzRjycsXG4gICAgJ9Ci0LXQu9C10YTQvtC9JyxcbiAgICAn0JrQsNC60YPRjiDQvtC/0LXRgNCw0YbQuNGOINC90YPQttC90L4g0LDQstGC0L7QvNCw0YLQuNC30LjRgNC+0LLQsNGC0YwnXG4gIF0pO1xuICBhd2FpdCBleHBlY3QoZm9ybS5sb2NhdG9yKCdbbmFtZT1cIm5hbWVcIl0nKSkudG9IYXZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgJ25hbWUtZXJyb3InKTtcbiAgYXdhaXQgZXhwZWN0KGZvcm0ubG9jYXRvcignW25hbWU9XCJwaG9uZVwiXScpKS50b0hhdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCAncGhvbmUtaGludCBwaG9uZS1lcnJvcicpO1xuICBhd2FpdCBleHBlY3QoZm9ybS5sb2NhdG9yKCdbbmFtZT1cInRhc2tcIl0nKSkudG9IYXZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgJ3Rhc2staGludCB0YXNrLWVycm9yJyk7XG4gIGF3YWl0IGV4cGVjdChmb3JtLmxvY2F0b3IoJ1tuYW1lPVwiY29uc2VudFwiXScpKS50b0hhdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCAnY29uc2VudC1lcnJvcicpO1xuICBhd2FpdCBleHBlY3QoZm9ybS5nZXRCeVJvbGUoJ2J1dHRvbicsIHsgbmFtZTogJ9Ce0LHRgdGD0LTQuNGC0Ywg0LfQsNC00LDRh9GDJyB9KSkudG9IYXZlQ291bnQoMSk7XG4gIGF3YWl0IGV4cGVjdChmb3JtLmxvY2F0b3IoJ1tuYW1lPVwiY29tcGFueV93ZWJzaXRlXCJdJykpLnRvSGF2ZUNvdW50KDEpO1xuICBhd2FpdCBleHBlY3QoZm9ybS5sb2NhdG9yKCcuZm9ybS1zdGF0dXMnKSkudG9IYXZlQXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG59KTtcblxudGVzdCgnY29uc3VsdGF0aW9uIHBhbmVsIGtlZXBzIGl0cyBjb250cmFzdCBvdmVybGF5IHdpdGhvdXQgYSBkZWNvcmF0aXZlIGdyaWQnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgbGF5ZXJzID0gYXdhaXQgcGFnZS5sb2NhdG9yKCcubGVhZC1wYW5lbCcpLmV2YWx1YXRlKChub2RlKSA9PiB7XG4gICAgY29uc3QgYmVmb3JlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCAnOjpiZWZvcmUnKTtcbiAgICBjb25zdCBhZnRlciA9IGdldENvbXB1dGVkU3R5bGUobm9kZSwgJzo6YWZ0ZXInKTtcbiAgICByZXR1cm4ge1xuICAgICAgYmVmb3JlQ29udGVudDogYmVmb3JlLmNvbnRlbnQsXG4gICAgICBiZWZvcmVCYWNrZ3JvdW5kSW1hZ2U6IGJlZm9yZS5iYWNrZ3JvdW5kSW1hZ2UsXG4gICAgICBhZnRlckNvbnRlbnQ6IGFmdGVyLmNvbnRlbnQsXG4gICAgICBhZnRlckJhY2tncm91bmRJbWFnZTogYWZ0ZXIuYmFja2dyb3VuZEltYWdlXG4gICAgfTtcbiAgfSk7XG5cbiAgZXhwZWN0KGxheWVycy5iZWZvcmVDb250ZW50KS5ub3QudG9CZSgnbm9uZScpO1xuICBleHBlY3QobGF5ZXJzLmJlZm9yZUJhY2tncm91bmRJbWFnZSkubm90LnRvQmUoJ25vbmUnKTtcbiAgZXhwZWN0KGxheWVycy5hZnRlckNvbnRlbnQpLnRvQmUoJ25vbmUnKTtcbiAgZXhwZWN0KGxheWVycy5hZnRlckJhY2tncm91bmRJbWFnZSkudG9CZSgnbm9uZScpO1xufSk7XG5cbnRlc3QoJ0luZHVzdHJpYWwgQ29udHJvbCBSb29tIENUQSBzdGF5cyBjb250YWluZWQsIGxheWVyZWQsIGFuZCByZXNwb25zaXZlJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDE5MDAsIGhlaWdodDogMTEwMCB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgZGVza3RvcCA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sZWFkLXNlY3Rpb24gPiAuY29udGFpbmVyJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubGVhZC1wYW5lbCcpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IG1lZGlhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxlYWQtc2VjdGlvbl9fbWVkaWEnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBpbm5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sZWFkLXNlY3Rpb25fX2lubmVyJyk7XG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sZWFkLWZvcm0nKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4ge1xuICAgICAgY29udGFpbmVyOiB7IGxlZnQ6IE1hdGgucm91bmQoY29udGFpbmVyLmxlZnQpLCB3aWR0aDogTWF0aC5yb3VuZChjb250YWluZXIud2lkdGgpIH0sXG4gICAgICBwYW5lbDogeyB3aWR0aDogTWF0aC5yb3VuZChwYW5lbC53aWR0aCksIGhlaWdodDogTWF0aC5yb3VuZChwYW5lbC5oZWlnaHQpIH0sXG4gICAgICBtZWRpYTogeyB3aWR0aDogTWF0aC5yb3VuZChtZWRpYS53aWR0aCksIGhlaWdodDogTWF0aC5yb3VuZChtZWRpYS5oZWlnaHQpIH0sXG4gICAgICBtZWRpYVBvc2l0aW9uOiBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sZWFkLXNlY3Rpb25fX21lZGlhJykpLnBvc2l0aW9uLFxuICAgICAgY29sdW1uczogZ2V0Q29tcHV0ZWRTdHlsZShpbm5lcikuZ3JpZFRlbXBsYXRlQ29sdW1ucy5zcGxpdCgnICcpLmxlbmd0aCxcbiAgICAgIHJhZGl1czogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubGVhZC1wYW5lbCcpKS5ib3JkZXJSYWRpdXMsXG4gICAgICBmb3JtV2lkdGg6IE1hdGgucm91bmQoZm9ybS53aWR0aClcbiAgICB9O1xuICB9KTtcblxuICBleHBlY3QoZGVza3RvcC5jb250YWluZXIpLnRvRXF1YWwoeyBsZWZ0OiAyMzAsIHdpZHRoOiAxNDQwIH0pO1xuICBleHBlY3QoZGVza3RvcC5wYW5lbC53aWR0aCkudG9CZSgxNDQwKTtcbiAgZXhwZWN0KGRlc2t0b3AucGFuZWwuaGVpZ2h0KS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDQ4MCk7XG4gIGV4cGVjdChkZXNrdG9wLm1lZGlhKS50b0VxdWFsKGRlc2t0b3AucGFuZWwpO1xuICBleHBlY3QoZGVza3RvcC5tZWRpYVBvc2l0aW9uKS50b0JlKCdhYnNvbHV0ZScpO1xuICBleHBlY3QoZGVza3RvcC5jb2x1bW5zKS50b0JlKDIpO1xuICBleHBlY3QoZGVza3RvcC5yYWRpdXMpLnRvQmUoJzEycHgnKTtcbiAgZXhwZWN0KGRlc2t0b3AuZm9ybVdpZHRoKS50b0JlTGVzc1RoYW5PckVxdWFsKDQzMCk7XG5cbiAgZm9yIChjb25zdCBbd2lkdGgsIGV4cGVjdGVkQ29sdW1uc10gb2YgW1sxMDI0LCAyXSwgWzc2OCwgMV0sIFszOTAsIDFdXSkge1xuICAgIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGgsIGhlaWdodDogMTAwMCB9KTtcbiAgICBhd2FpdCBwYWdlLnJlbG9hZCgpO1xuICAgIGNvbnN0IG1ldHJpY3MgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHtcbiAgICAgIGNvbnN0IHBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxlYWQtcGFuZWwnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IG1lZGlhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxlYWQtc2VjdGlvbl9fbWVkaWEnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbHVtbnM6IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxlYWQtc2VjdGlvbl9faW5uZXInKSkuZ3JpZFRlbXBsYXRlQ29sdW1ucy5zcGxpdCgnICcpLmxlbmd0aCxcbiAgICAgICAgcGFuZWxSaWdodDogTWF0aC5yb3VuZChwYW5lbC5yaWdodCksXG4gICAgICAgIHZpZXdwb3J0V2lkdGg6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCxcbiAgICAgICAgc2Nyb2xsV2lkdGg6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCxcbiAgICAgICAgbWVkaWFXaWR0aDogTWF0aC5yb3VuZChtZWRpYS53aWR0aCksXG4gICAgICAgIHBhbmVsV2lkdGg6IE1hdGgucm91bmQocGFuZWwud2lkdGgpXG4gICAgICB9O1xuICAgIH0pO1xuICAgIGV4cGVjdChtZXRyaWNzLmNvbHVtbnMpLnRvQmUoZXhwZWN0ZWRDb2x1bW5zKTtcbiAgICBleHBlY3QobWV0cmljcy5tZWRpYVdpZHRoKS50b0JlKG1ldHJpY3MucGFuZWxXaWR0aCk7XG4gICAgZXhwZWN0KG1ldHJpY3MucGFuZWxSaWdodCkudG9CZUxlc3NUaGFuT3JFcXVhbChtZXRyaWNzLnZpZXdwb3J0V2lkdGgpO1xuICAgIGV4cGVjdChtZXRyaWNzLnNjcm9sbFdpZHRoKS50b0JlKG1ldHJpY3Mudmlld3BvcnRXaWR0aCk7XG4gIH1cblxuICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh7IHdpZHRoOiAzOTAsIGhlaWdodDogOTAwIH0pO1xuICBhd2FpdCBwYWdlLnJlbG9hZCgpO1xuICBjb25zdCBmb3JtID0gcGFnZS5sb2NhdG9yKCcjY29uc3VsdGF0aW9uLWZvcm0nKTtcbiAgY29uc3Qgd2lkdGhCZWZvcmUgPSBhd2FpdCBmb3JtLmV2YWx1YXRlKChub2RlKSA9PiBNYXRoLnJvdW5kKG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpKTtcbiAgYXdhaXQgZm9ybS5sb2NhdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmNsaWNrKCk7XG4gIGNvbnN0IHdpZHRoQWZ0ZXIgPSBhd2FpdCBmb3JtLmV2YWx1YXRlKChub2RlKSA9PiBNYXRoLnJvdW5kKG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpKTtcbiAgZXhwZWN0KHdpZHRoQWZ0ZXIpLnRvQmUod2lkdGhCZWZvcmUpO1xuICBhd2FpdCBleHBlY3QoZm9ybS5sb2NhdG9yKCcjbmFtZS1lcnJvcicpKS50b0NvbnRhaW5UZXh0KCfQo9C60LDQttC40YLQtSDQuNC80Y8nKTtcbiAgYXdhaXQgZXhwZWN0KGZvcm0ubG9jYXRvcignI3Bob25lLWVycm9yJykpLnRvQ29udGFpblRleHQoJ9CS0LLQtdC00LjRgtC1INGC0LXQu9C10YTQvtC9Jyk7XG59KTtcblxudGVzdCgnY29udHJvbHMgYW5kIHJlZGVzaWduZWQgcGFuZWxzIHNoYXJlIHRoZSBhcHByb3ZlZCBzb2Z0IGdlb21ldHJ5JywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2UuZ290bygnLycpO1xuICBjb25zdCBnZW9tZXRyeSA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gKHtcbiAgICBidXR0b246IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbicpKS5ib3JkZXJSYWRpdXMsXG4gICAgaW5wdXQ6IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZpZWxkIGlucHV0JykpLmJvcmRlclJhZGl1cyxcbiAgICBjYXBhYmlsaXR5OiBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXBhYmlsaXR5JykpLmJvcmRlclJhZGl1cyxcbiAgICBzcGVjaWZpY2F0aW9uczogZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3BlY2lmaWNhdGlvbnNfX3BhbmVsJykpLmJvcmRlclJhZGl1c1xuICB9KSk7XG5cbiAgZXhwZWN0KGdlb21ldHJ5KS50b0VxdWFsKHtcbiAgICBidXR0b246ICc4cHgnLFxuICAgIGlucHV0OiAnOHB4JyxcbiAgICBjYXBhYmlsaXR5OiAnMTJweCcsXG4gICAgc3BlY2lmaWNhdGlvbnM6ICcxMnB4J1xuICB9KTtcbn0pO1xuXG50ZXN0KCdhcHBsaWNhdGlvbnMga2VlcCB0aGUgYXBwcm92ZWQgcHJvcG9ydGlvbnMgYW5kIHVzZSBjaGVjayBtYXJrZXJzJywgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDE5MDAsIGhlaWdodDogMTAwMCB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgbWV0cmljcyA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4ge1xuICAgIGNvbnN0IGFwcGxpY2F0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHBsaWNhdGlvbnNfX2dyaWQnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBhcHBsaWNhdGlvblN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYXBwbGljYXRpb25zX19ncmlkJykpO1xuICAgIGNvbnN0IG1hcmtlclN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2hlY2stbGlzdCBsaScpLCAnOjpiZWZvcmUnKTtcbiAgICBjb25zdCBjb2x1bW5zID0gYXBwbGljYXRpb25TdHlsZS5ncmlkVGVtcGxhdGVDb2x1bW5zXG4gICAgICAuc3BsaXQoJyAnKVxuICAgICAgLm1hcCgodmFsdWUpID0+IE51bWJlci5wYXJzZUZsb2F0KHZhbHVlKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgYXBwbGljYXRpb25zV2lkdGg6IE1hdGgucm91bmQoYXBwbGljYXRpb25zLndpZHRoKSxcbiAgICAgIGNvbHVtblJhdGlvczogY29sdW1ucy5tYXAoKHZhbHVlKSA9PiB2YWx1ZSAvIGFwcGxpY2F0aW9ucy53aWR0aCksXG4gICAgICBtYXJrZXJNYXNrOiBtYXJrZXJTdHlsZS5tYXNrSW1hZ2UgfHwgbWFya2VyU3R5bGUud2Via2l0TWFza0ltYWdlLFxuICAgICAgbWFya2VyQmFja2dyb3VuZEltYWdlOiBtYXJrZXJTdHlsZS5iYWNrZ3JvdW5kSW1hZ2VcbiAgICB9O1xuICB9KTtcblxuICBleHBlY3QobWV0cmljcy5hcHBsaWNhdGlvbnNXaWR0aCkudG9CZSgxNDQwKTtcbiAgZXhwZWN0KG1ldHJpY3MuY29sdW1uUmF0aW9zWzBdKS50b0JlQ2xvc2VUbygwLjMsIDIpO1xuICBleHBlY3QobWV0cmljcy5jb2x1bW5SYXRpb3NbMV0pLnRvQmVDbG9zZVRvKDAuMzUsIDIpO1xuICBleHBlY3QobWV0cmljcy5jb2x1bW5SYXRpb3NbMl0pLnRvQmVDbG9zZVRvKDAuMzUsIDIpO1xuICBleHBlY3QobWV0cmljcy5tYXJrZXJNYXNrKS50b0NvbnRhaW4oJ2NoZWNrLWNpcmNsZS5zdmcnKTtcbiAgZXhwZWN0KG1ldHJpY3MubWFya2VyQmFja2dyb3VuZEltYWdlKS50b0JlKCdub25lJyk7XG59KTtcblxudGVzdCgnbWFqb3Igc2VjdGlvbnMgdXNlIHRoZSBhcHByb3ZlZCAxNDQwcHggZ3JpZCBhbmQgcmVzcG9uc2l2ZSBkZXNrdG9wIHNwYWNpbmcnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aDogMTkwMCwgaGVpZ2h0OiAxMTAwIH0pO1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBhd2FpdCBleHBlY3QocGFnZS5sb2NhdG9yKCcucHJvYmxlbS1zb2x1dGlvbi1zZWN0aW9uJykpLnRvSGF2ZUNvdW50KDEpO1xuXG4gIGNvbnN0IGdlb21ldHJ5ID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgY29uc3QgcmVjdCA9IChzZWxlY3RvcikgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgaGVybyA9IHJlY3QoJy5oZXJvJyk7XG4gICAgY29uc3QgcHJvYmxlbU91dGVyID0gcmVjdCgnLnByb2JsZW0tc29sdXRpb24tc2VjdGlvbicpO1xuICAgIGNvbnN0IHByb2JsZW0gPSByZWN0KCcucHJvYmxlbS1zb2x1dGlvbicpO1xuICAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IHJlY3QoJy5jYXBhYmlsaXRpZXMnKTtcbiAgICBjb25zdCBhcHBsaWNhdGlvbnMgPSByZWN0KCcuYXBwbGljYXRpb25zJyk7XG4gICAgY29uc3QgcmVhc29ucyA9IHJlY3QoJy5yZWFzb25zJyk7XG4gICAgY29uc3QgYWJvdXQgPSByZWN0KCcuYWJvdXQtY29tcGFueScpO1xuICAgIGNvbnN0IHNwZWNpZmljYXRpb25zID0gcmVjdCgnLnNwZWNpZmljYXRpb25zJyk7XG4gICAgY29uc3QgbGVhZCA9IHJlY3QoJy5sZWFkLXNlY3Rpb24nKTtcbiAgICBjb25zdCBmb290ZXIgPSByZWN0KCcuc2l0ZS1mb290ZXInKTtcbiAgICBjb25zdCBnYXAgPSAoYmVmb3JlLCBhZnRlcikgPT4gTWF0aC5yb3VuZChhZnRlci50b3AgLSBiZWZvcmUuYm90dG9tKTtcblxuICAgIHJldHVybiB7XG4gICAgICBwcm9ibGVtOiB7IGxlZnQ6IE1hdGgucm91bmQocHJvYmxlbS5sZWZ0KSwgd2lkdGg6IE1hdGgucm91bmQocHJvYmxlbS53aWR0aCkgfSxcbiAgICAgIGFwcGxpY2F0aW9uczoge1xuICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKHJlY3QoJy5hcHBsaWNhdGlvbnNfX2dyaWQnKS5sZWZ0KSxcbiAgICAgICAgd2lkdGg6IE1hdGgucm91bmQocmVjdCgnLmFwcGxpY2F0aW9uc19fZ3JpZCcpLndpZHRoKVxuICAgICAgfSxcbiAgICAgIGdhcHM6IHtcbiAgICAgICAgaGVyb1RvUHJvYmxlbTogZ2FwKGhlcm8sIHByb2JsZW1PdXRlciksXG4gICAgICAgIHByb2JsZW1Ub0NhcGFiaWxpdGllczogZ2FwKHByb2JsZW1PdXRlciwgY2FwYWJpbGl0aWVzKSxcbiAgICAgICAgY2FwYWJpbGl0aWVzVG9BcHBsaWNhdGlvbnM6IGdhcChjYXBhYmlsaXRpZXMsIGFwcGxpY2F0aW9ucyksXG4gICAgICAgIGFwcGxpY2F0aW9uc1RvUmVhc29uczogZ2FwKGFwcGxpY2F0aW9ucywgcmVhc29ucyksXG4gICAgICAgIHJlYXNvbnNUb1NwZWNpZmljYXRpb25zOiBnYXAocmVhc29ucywgc3BlY2lmaWNhdGlvbnMpLFxuICAgICAgICBzcGVjaWZpY2F0aW9uc1RvQWJvdXQ6IGdhcChzcGVjaWZpY2F0aW9ucywgYWJvdXQpLFxuICAgICAgICBhYm91dFRvTGVhZDogZ2FwKGFib3V0LCBsZWFkKSxcbiAgICAgICAgbGVhZFRvRm9vdGVyOiBnYXAobGVhZCwgZm9vdGVyKVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG4gIGV4cGVjdChnZW9tZXRyeS5wcm9ibGVtKS50b0VxdWFsKHsgbGVmdDogMjMwLCB3aWR0aDogMTQ0MCB9KTtcbiAgZXhwZWN0KGdlb21ldHJ5LmFwcGxpY2F0aW9ucykudG9FcXVhbCh7IGxlZnQ6IDIzMCwgd2lkdGg6IDE0NDAgfSk7XG4gIGV4cGVjdChnZW9tZXRyeS5nYXBzKS50b0VxdWFsKHtcbiAgICBoZXJvVG9Qcm9ibGVtOiAwLFxuICAgIHByb2JsZW1Ub0NhcGFiaWxpdGllczogMjQsXG4gICAgY2FwYWJpbGl0aWVzVG9BcHBsaWNhdGlvbnM6IDI0LFxuICAgIGFwcGxpY2F0aW9uc1RvUmVhc29uczogMjQsXG4gICAgcmVhc29uc1RvU3BlY2lmaWNhdGlvbnM6IDI0LFxuICAgIHNwZWNpZmljYXRpb25zVG9BYm91dDogMjQsXG4gICAgYWJvdXRUb0xlYWQ6IDI0LFxuICAgIGxlYWRUb0Zvb3RlcjogMjRcbiAgfSk7XG59KTtcblxudGVzdCgnYXBwbGljYXRpb25zIHVzZSB0aGUgc3VwcGxpZWQgZGVtb25zdHJhdGlvbiBwaG90byBhbmQgYSBmYWN0dWFsIGNvbnN1bHRhdGlvbiBDVEEnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aDogMTkwMCwgaGVpZ2h0OiAxMDAwIH0pO1xuICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVJvbGUoJ2xpbmsnLCB7IG5hbWU6ICfQp9C40YLQsNGC0Ywg0LrQtdC50YEnIH0pKS50b0hhdmVDb3VudCgwKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLmNhc2UtY2FyZCBoMicpKS50b0hhdmVUZXh0KCfQlNC10LzQvtC90YHRgtGA0LDRhtC40Y8g0L7QsdC+0YDRg9C00L7QstCw0L3QuNGPINCyINCa0YPQs9C10YHQuCcpO1xuICBhd2FpdCBleHBlY3QocGFnZS5sb2NhdG9yKCcuYXBwbGljYXRpb25zX19tZWRpYSBpbWcnKSkudG9IYXZlQXR0cmlidXRlKCdzcmMnLCAnL2Fzc2V0cy9pbWFnZXMvY29tcGFueS1kZW1vLndlYnAnKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignLmNhc2UtY2FyZCAuZGVtby1wb2ludHMgbGknKSkudG9IYXZlQ291bnQoMyk7XG4gIGF3YWl0IGV4cGVjdChwYWdlLmxvY2F0b3IoJy5jYXNlLWNhcmQgLmJ1dHRvbicpKS50b0hhdmVBdHRyaWJ1dGUoJ2hyZWYnLCAnI2xlYWQtZm9ybScpO1xuICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVRleHQoJyszNSUnLCB7IGV4YWN0OiB0cnVlIH0pKS50b0hhdmVDb3VudCgwKTtcbiAgYXdhaXQgZXhwZWN0KHBhZ2UuZ2V0QnlUZXh0KCfDlzInLCB7IGV4YWN0OiB0cnVlIH0pKS50b0hhdmVDb3VudCgwKTtcblxuICBjb25zdCBkZXNrdG9wID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHBsaWNhdGlvbnNfX2dyaWQnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhc2UtY2FyZCcpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB7XG4gICAgICBncmlkV2lkdGg6IE1hdGgucm91bmQoZ3JpZC53aWR0aCksXG4gICAgICBjYXJkUmlnaHQ6IE1hdGgucm91bmQoY2FyZC5yaWdodCksXG4gICAgICBncmlkUmlnaHQ6IE1hdGgucm91bmQoZ3JpZC5yaWdodClcbiAgICB9O1xuICB9KTtcblxuICBleHBlY3QoZGVza3RvcC5ncmlkV2lkdGgpLnRvQmUoMTQ0MCk7XG4gIGV4cGVjdChkZXNrdG9wLmNhcmRSaWdodCkudG9CZShkZXNrdG9wLmdyaWRSaWdodCk7XG5cbiAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aDogMTAyNCwgaGVpZ2h0OiA5MDAgfSk7XG4gIGF3YWl0IHBhZ2UucmVsb2FkKCk7XG5cbiAgY29uc3QgdGFibGV0ID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XG4gICAgY29uc3QgbWVkaWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYXBwbGljYXRpb25zX19tZWRpYScpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FzZS1jYXJkJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHBsaWNhdGlvbnNfX2dyaWQnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4ge1xuICAgICAgY2FyZFRvcDogTWF0aC5yb3VuZChjYXJkLnRvcCksXG4gICAgICBtZWRpYUJvdHRvbTogTWF0aC5yb3VuZChtZWRpYS5ib3R0b20pLFxuICAgICAgY2FyZFdpZHRoOiBNYXRoLnJvdW5kKGNhcmQud2lkdGgpLFxuICAgICAgZ3JpZFdpZHRoOiBNYXRoLnJvdW5kKGdyaWQud2lkdGgpXG4gICAgfTtcbiAgfSk7XG5cbiAgZXhwZWN0KHRhYmxldC5jYXJkVG9wKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKHRhYmxldC5tZWRpYUJvdHRvbSk7XG4gIGV4cGVjdCh0YWJsZXQuY2FyZFdpZHRoKS50b0JlKHRhYmxldC5ncmlkV2lkdGgpO1xuXG4gIGF3YWl0IHBhZ2Uuc2V0Vmlld3BvcnRTaXplKHsgd2lkdGg6IDM5MCwgaGVpZ2h0OiA4NDQgfSk7XG4gIGF3YWl0IHBhZ2UucmVsb2FkKCk7XG5cbiAgY29uc3QgbW9iaWxlT3JkZXIgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHtcbiAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFwcGxpY2F0aW9uc19fbGlzdCcpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IG1lZGlhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFwcGxpY2F0aW9uc19fbWVkaWEnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhc2UtY2FyZCcpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiBbTWF0aC5yb3VuZChsaXN0LnRvcCksIE1hdGgucm91bmQobWVkaWEudG9wKSwgTWF0aC5yb3VuZChjYXJkLnRvcCldO1xuICB9KTtcblxuICBleHBlY3QobW9iaWxlT3JkZXJbMF0pLnRvQmVMZXNzVGhhbihtb2JpbGVPcmRlclsxXSk7XG4gIGV4cGVjdChtb2JpbGVPcmRlclsxXSkudG9CZUxlc3NUaGFuKG1vYmlsZU9yZGVyWzJdKTtcbn0pO1xuXG50ZXN0KCdtb2JpbGUgZGVtb25zdHJhdGlvbiBjYXJkIGtlZXBzIGl0cyBjb250ZW50IGFuZCBDVEEgcmVhZGFibGUnLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aDogMzIwLCBoZWlnaHQ6IDg0NCB9KTtcbiAgYXdhaXQgcGFnZS5nb3RvKCcvJyk7XG5cbiAgY29uc3QgZ2VvbWV0cnkgPSBhd2FpdCBwYWdlLmxvY2F0b3IoJy5jYXNlLWNhcmQtLWRlbW8nKS5ldmFsdWF0ZSgoY2FyZCkgPT4ge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNhcmQucXVlcnlTZWxlY3RvcignLmJ1dHRvbicpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogTWF0aC5yb3VuZChjYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKSxcbiAgICAgIGJ1dHRvbldpZHRoOiBNYXRoLnJvdW5kKGJ1dHRvbi53aWR0aCksXG4gICAgICBidXR0b25IZWlnaHQ6IE1hdGgucm91bmQoYnV0dG9uLmhlaWdodCksXG4gICAgICBwb2ludHM6IGNhcmQucXVlcnlTZWxlY3RvckFsbCgnLmRlbW8tcG9pbnRzIGxpJykubGVuZ3RoXG4gICAgfTtcbiAgfSk7XG5cbiAgZXhwZWN0KGdlb21ldHJ5LndpZHRoKS50b0JlTGVzc1RoYW5PckVxdWFsKDMyMCk7XG4gIGV4cGVjdChnZW9tZXRyeS5idXR0b25XaWR0aCkudG9CZUxlc3NUaGFuT3JFcXVhbChnZW9tZXRyeS53aWR0aCk7XG4gIGV4cGVjdChnZW9tZXRyeS5idXR0b25IZWlnaHQpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoNDQpO1xuICBleHBlY3QoZ2VvbWV0cnkucG9pbnRzKS50b0JlKDMpO1xufSk7XG5cbmZvciAoY29uc3Qgd2lkdGggb2YgWzE0NDAsIDEwMjQsIDc2OCwgMzkwLCAzMjBdKSB7XG4gIHRlc3QoYGxhbmRpbmcgaGFzIG5vIG92ZXJmbG93IGF0ICR7d2lkdGh9cHhgLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh7IHdpZHRoLCBoZWlnaHQ6IDkwMCB9KTtcbiAgICBhd2FpdCBwYWdlLmdvdG8oJy8nKTtcblxuICAgIGNvbnN0IGRpYWdub3N0aWNzID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiAoe1xuICAgICAgc2Nyb2xsV2lkdGg6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCxcbiAgICAgIG9mZmVuZGVyczogWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2JvZHkgKicpXVxuICAgICAgICAuZmlsdGVyKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgcmV0dXJuIHJlY3QucmlnaHQgPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggKyAxO1xuICAgICAgICB9KVxuICAgICAgICAuc2xpY2UoMCwgMTIpXG4gICAgICAgIC5tYXAoKGVsZW1lbnQpID0+ICh7XG4gICAgICAgICAgc2VsZWN0b3I6IGAke2VsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpfS4ke2VsZW1lbnQuY2xhc3NOYW1lfWAsXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQpLFxuICAgICAgICAgIHJpZ2h0OiBNYXRoLnJvdW5kKGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQpLFxuICAgICAgICAgIHdpZHRoOiBNYXRoLnJvdW5kKGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpXG4gICAgICAgIH0pKVxuICAgIH0pKTtcblxuICAgIGV4cGVjdChkaWFnbm9zdGljcy5zY3JvbGxXaWR0aCwgSlNPTi5zdHJpbmdpZnkoZGlhZ25vc3RpY3Mub2ZmZW5kZXJzKSkudG9CZUxlc3NUaGFuT3JFcXVhbCh3aWR0aCk7XG4gIH0pO1xufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxJQUFJLEVBQUVDLE1BQU0s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