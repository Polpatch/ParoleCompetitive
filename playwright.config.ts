import { defineConfig } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT ?? '4173';
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: origin },
  webServer: {
    command: `npm run preview -- --port ${port} --strictPort`,
    url: `${origin}/ParoleCompetitive/`,
    reuseExistingServer: false,
  },
});
