'use client';

import { useEffect } from 'react';
import { findAccentPalette } from '@/lib/accent-palettes';
import type { AccentPaletteId } from '@/types/palette';

const ACCENT_TRANSITION_MS = 600;

const toRgbaTuple = (hex: string): string => {
  const sanitized = hex.replace('#', '').trim();
  if (!/^[0-9a-f]{6}$/i.test(sanitized)) {
    return '0 0 0';
  }
  const r = Number.parseInt(sanitized.slice(0, 2), 16);
  const g = Number.parseInt(sanitized.slice(2, 4), 16);
  const b = Number.parseInt(sanitized.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
};

export function useAccentTheme(paletteId: AccentPaletteId): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const palette = findAccentPalette(paletteId);
    const rgb = toRgbaTuple(palette.baseHex);

    root.style.setProperty('--color-brand-active', palette.baseHex);
    root.style.setProperty('--color-brand-active-foreground', palette.onAccentHex);
    root.style.setProperty('--color-brand-rgb', rgb);
    root.style.setProperty('--color-brand-rgb-fade', `rgba(${rgb} / 0.45)`);
    root.dataset.accent = palette.id;
  }, [paletteId]);
}

export const ACCENT_TRANSITION = `${ACCENT_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
