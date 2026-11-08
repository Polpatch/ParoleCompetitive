import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/ParoleCompetitive/',
  test: {
    include: ['{test,tests}/**/*.test.ts'],
  },
});
