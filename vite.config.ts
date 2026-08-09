import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';
import 'vite-plus';

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
      exclude: ['src/test/**', '**/*.d.ts', 'src/components/ui/**', 'src/hooks/**', 'src/main.tsx'],
      thresholds: {
        lines: 73,
        statements: 72,
        functions: 69,
        branches: 55,
      },
    },
  },
  lint: {
    ignorePatterns: ['dist/**', 'logs/**', 'node_modules/**', '.agents/**', '.local/**'],
  },
  fmt: {
    semi: true,
    singleQuote: true,
    experimentalSortPackageJson: true,
    ignorePatterns: ['.agents/**', '.local/**', '**/*.md'],
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
