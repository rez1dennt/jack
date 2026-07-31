import { expect, test } from '@playwright/test';

test('submit endpoint rejects non-POST requests before loading private SMTP config', async ({ request }) => {
  const response = await request.get('/api/submit.php');

  expect(response.status()).toBe(405);
  expect(response.headers().allow).toBe('POST');
  await expect(response.json()).resolves.toEqual({ ok: false });
});

test('submit endpoint rejects unsupported content types before loading private SMTP config', async ({ request }) => {
  const response = await request.post('/api/submit.php', {
    data: '{}',
    headers: { 'Content-Type': 'text/plain' }
  });

  expect(response.status()).toBe(403);
  await expect(response.json()).resolves.toEqual({ ok: false });
});
