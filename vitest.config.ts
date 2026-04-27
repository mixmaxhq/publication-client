import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: true,
    include: ['test/**/*.test.{js,ts}'],
    coverage: {
      include: ['src/**/*.js'],
    },
  },
});
