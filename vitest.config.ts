import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      threshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 80,
          statements: 80
        }
      },
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        'coverage/',
        '*.config.js',
        '*.config.ts'
      ]
    },
    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,
    // Reporter options
    reporter: process.env.CI ? ['dot', 'json'] : ['verbose'],
    // Fail fast in CI
    bail: process.env.CI ? 1 : 0,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
