import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Read saved token from token.json (after global setup)
let token = '';
if (fs.existsSync('token.json')) {
  token = JSON.parse(fs.readFileSync('token.json', 'utf-8')).token;
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Use HTML reporter for nice reports
  reporter: [['html'], ['list']],

  // Run global setup before tests (to fetch token)
  //globalSetup: './global-setup.ts',

  // Default configuration for all tests
  use: {
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
    trace: 'on-first-retry',
  },
});
