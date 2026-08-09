import { describe, expect, it } from 'vite-plus/test';
import {
  COLOR_FORMATS,
  DEFAULT_COLOR_FORMAT,
  formatColor,
  formatHex,
  formatHsl,
  formatHwb,
  formatLab,
  formatLch,
  formatOklab,
  formatOklch,
  formatRgb,
  formatRgba,
  formatHsla,
  isColorFormat,
  oklchToHex,
  oklchToRgb,
} from '@/lib/color-formats';

const SAMPLE = { l: 0.62, c: 0.18, h: 28 };

describe('color-format helpers', () => {
  it('exposes a stable default format', () => {
    expect(DEFAULT_COLOR_FORMAT).toBe('oklch');
    expect(COLOR_FORMATS.length).toBeGreaterThan(5);
  });

  it('guards unknown format values', () => {
    expect(isColorFormat('oklch')).toBe(true);
    expect(isColorFormat('rgb')).toBe(true);
    expect(isColorFormat('nope')).toBe(false);
  });

  it('formats OKLCH with three-decimal channels', () => {
    expect(formatOklch(0.97, 0.02, 0)).toBe('oklch(0.970 0.020 0)');
    expect(formatOklch(0.5, 0.1, 180)).toBe('oklch(0.500 0.100 180)');
  });

  it('formats OKLab without hue angle', () => {
    const value = formatOklab(0.5, 0.1, 90);
    expect(value).toMatch(/^oklab\(0\.500 -?[\d.]+ -?[\d.]+\)$/);
  });

  it('formats HEX with uppercase by default and lowercase on demand', () => {
    expect(formatHex(0.5, 0.1, 200, false)).toBe(oklchToHex(0.5, 0.1, 200));
    expect(formatHex(0.5, 0.1, 200, true)).toBe(oklchToHex(0.5, 0.1, 200).toLowerCase());
  });

  it('formats RGB and RGBA from OKLCH', () => {
    const { r, g, b } = oklchToRgb(SAMPLE.l, SAMPLE.c, SAMPLE.h);
    expect(formatRgb(SAMPLE.l, SAMPLE.c, SAMPLE.h)).toBe(`rgb(${r}, ${g}, ${b})`);
    expect(formatRgba(SAMPLE.l, SAMPLE.c, SAMPLE.h)).toMatch(/^rgba\(\d+, \d+, \d+, /);
  });

  it('formats HSL variants', () => {
    expect(formatHsl(SAMPLE.l, SAMPLE.c, SAMPLE.h)).toMatch(/^hsl\(/);
    expect(formatHsla(SAMPLE.l, SAMPLE.c, SAMPLE.h)).toMatch(/^hsla\(/);
  });

  it('formats HWB, Lab, and Lch', () => {
    expect(formatHwb(SAMPLE.l, SAMPLE.c, SAMPLE.h)).toMatch(/^hwb\(/);
    expect(formatLab(SAMPLE.l, SAMPLE.c, SAMPLE.h)).toMatch(/^lab\(/);
    expect(formatLch(SAMPLE.l, SAMPLE.c, SAMPLE.h)).toMatch(/^lch\(/);
  });

  it('dispatches formatColor to the correct encoder', () => {
    expect(formatColor('oklch', SAMPLE.l, SAMPLE.c, SAMPLE.h)).toBe(
      formatOklch(SAMPLE.l, SAMPLE.c, SAMPLE.h),
    );
    expect(formatColor('rgb', SAMPLE.l, SAMPLE.c, SAMPLE.h)).toBe(
      formatRgb(SAMPLE.l, SAMPLE.c, SAMPLE.h),
    );
    expect(formatColor('hex-lower', SAMPLE.l, SAMPLE.c, SAMPLE.h)).toBe(
      formatHex(SAMPLE.l, SAMPLE.c, SAMPLE.h, true),
    );
  });
});
