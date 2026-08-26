import {
  generateHarmonyPalette,
  generatePaletteCss,
  getHarmonyHueOffsets,
  mixHexColors,
  normalizeHex,
} from '@/lib/studio-color';

describe('studio color domain', () => {
  it('normalizes short and long HEX values', () => {
    expect(normalizeHex('#7af')).toBe('#77AAFF');
    expect(normalizeHex('ff7a59')).toBe('#FF7A59');
    expect(normalizeHex('invalid', '#123456')).toBe('#123456');
  });

  it('uses literal harmony relationships for five and six color palettes', () => {
    expect(getHarmonyHueOffsets('analogous', 5)).toEqual([-54, -27, 0, 27, 54]);
    expect(getHarmonyHueOffsets('triadic', 6)).toEqual([0, 24, 120, 144, 240, 264]);
    expect(getHarmonyHueOffsets('monochromatic', 5)).toEqual([0, 0, 0, 0, 0]);
  });

  it('generates deterministic 5 or 6 color sets', () => {
    const base = {
      seed: '#6D5DFC',
      harmony: 'split-complementary' as const,
      chroma: 0.17,
      lightness: 0.68,
    };
    const five = generateHarmonyPalette({ ...base, count: 5 });
    const six = generateHarmonyPalette({ ...base, count: 6 });

    expect(five).toHaveLength(5);
    expect(six).toHaveLength(6);
    expect(five[0]).toBe('#6D5DFC');
    expect(generateHarmonyPalette({ ...base, count: 5 })).toEqual(five);
    expect(five.every((color) => /^#[0-9A-F]{6}$/.test(color))).toBe(true);
  });

  it('mixes sRGB endpoints and exports numbered variables', () => {
    expect(mixHexColors('#000000', '#FFFFFF', 50)).toBe('#808080');
    expect(mixHexColors('#FF0000', '#0000FF', 25)).toBe('#BF0040');
    expect(generatePaletteCss(['#FF0000', '#00FF00'])).toContain('--color-palette-2: #00FF00;');
  });
});
