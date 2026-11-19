import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  expect: { timeout: 10000, toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.005 } },
  use: {
    baseURL: 'http://127.0.0.1:5174',
    browserName: 'chromium',
    channel: process.platform === 'win32' ? 'msedge' : undefined,
    headless: true,
    locale: 'en-US',
    timezoneId: 'Asia/Calcutta',
    reducedMotion: 'reduce',
    colorScheme: 'dark',
    trace: 'retain-on-failure',
  },
  projects: [1440,1024,768,390].map(width => ({ name:`width-${width}`, use:{viewport:{width,height:1000}} })),
  webServer: {
    command: 'npm run dev:test',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  reporter: [['list'],['json',{outputFile:'../docs/evidence/system-design-browser-results.json'}]],
});
