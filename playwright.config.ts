import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [['html'], ['line']],
  
  use: {
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://financial-tracker-brain.vercel.app'
      : 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  
  webServer: {
    command: 'npm run dev',
    port: 3001,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
