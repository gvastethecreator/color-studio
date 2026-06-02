/// <reference types="vitest/config" />

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const repoSlug = 'color-studio';
const pagesBase = `/${repoSlug}/`;
const isPagesBuild = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isPagesBuild ? pagesBase : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    reportCompressedSize: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './logs/coverage',
      exclude: ['src/test/**', '**/*.d.ts'],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 70,
        branches: 70,
      },
    },
  },
  lint: {
    ignorePatterns: ['dist/**', 'logs/**', 'node_modules/**'],
  },
  fmt: {
    semi: true,
    singleQuote: true,
    experimentalSortPackageJson: true,
  },
  run: {
    cache: {
      scripts: true,
      tasks: true,
    },
  },
  staged: {
    '*.{css,js,json,jsx,md,ts,tsx}': 'vp check --fix',
  },
});
