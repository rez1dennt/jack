import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8080',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'php -c tools/php.ini -S 127.0.0.1:8080 -t public',
    url: 'http://127.0.0.1:8080/health.txt',
    reuseExistingServer: true
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 }
      }
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] }
    }
  ]
});
