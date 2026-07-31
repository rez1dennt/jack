import { test, expect } from '@playwright/test';

async function prepareForm(page, status, responseBody) {
  await page.route('**/api/csrf.php', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'test-csrf' })
    });
  });
  await page.route('**/api/lead.php', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseBody)
    });
  });

  await page.goto('/');
  const form = page.locator('#consultation-form');
  await form.locator('[name="name"]').fill('Анна');
  await form.locator('[name="phone"]').fill('9991234567');
  await form.locator('[name="consent"]').check();
  await form.locator('button[type="submit"]').click();
  return form;
}

for (const scenario of [
  {
    title: 'server validation error',
    status: 422,
    body: { ok: false, errors: { phone: 'Телефон не прошёл проверку сервера.' } },
    expectedStatus: 'Проверьте поля формы',
    expectedPhoneError: 'Телефон не прошёл проверку сервера.'
  },
  {
    title: 'rate limit error',
    status: 429,
    body: { ok: false },
    expectedStatus: 'Слишком много попыток'
  },
  {
    title: 'mail transport error',
    status: 500,
    body: { ok: false },
    expectedStatus: 'Не удалось отправить заявку'
  }
]) {
  test(`lead form keeps values after ${scenario.title}`, async ({ page }) => {
    const form = await prepareForm(page, scenario.status, scenario.body);

    await expect(form.locator('[name="name"]')).toHaveValue('Анна');
    await expect(form.locator('[name="phone"]')).toHaveValue('+7 (999) 123-45-67');
    await expect(form.locator('.form-status')).toContainText(scenario.expectedStatus);
    if (scenario.expectedPhoneError) {
      await expect(form.locator('#phone-error')).toContainText(scenario.expectedPhoneError);
    }
  });
}
