import { defineConfig } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Values already set in the shell (e.g. CI secrets) take precedence over .env.
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

for (const name of ['PETSTORE_BASE_URL', 'PETSTORE_API_KEY']) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`);
  }
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.PETSTORE_BASE_URL,
    trace: 'on-first-retry',
  },
});
