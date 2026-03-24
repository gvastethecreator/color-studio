import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const storage = new Map<string, string>();

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  writable: true,
  value: {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    clear: vi.fn(() => {
      storage.clear();
    }),
    key: vi.fn((index: number) => Array.from(storage.keys())[index] ?? null),
    get length() {
      return storage.size;
    },
  },
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

Object.defineProperty(URL, 'createObjectURL', {
  configurable: true,
  writable: true,
  value: vi.fn(() => 'blob:mock-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  configurable: true,
  writable: true,
  value: vi.fn(),
});
