import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
    environment: 'node',
    exclude: ['test/**/*.e2e-spec.ts'],
    globals: true,
    include: ['test/**/*.spec.ts'],
  },
});
