'use client';

import { useEffect } from 'react';
import { findAccentPalette } from '@/lib/accent-palettes';
import { hexToRgb } from '@/lib/color-formats';
import type { AccentPaletteId } from '@/types/palette';

const ACCENT_TRANSITION_MS = 600;

const toRgbaTuple = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
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
