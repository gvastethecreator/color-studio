import { formatOklch, oklchToHex } from '@/lib/color-formats';
import type { HarmonyId, PaletteSize } from '@/types/studio';

export const HARMONY_OPTIONS: ReadonlyArray<{
  id: HarmonyId;
  label: string;
  shortDescription: string;
}> = [
  {
    id: 'analogous',
    label: 'Analogous',
    shortDescription: 'Neighboring hues with a gentle visual rhythm.',
  },
  {
    id: 'complementary',
    label: 'Complementary',
    shortDescription: 'Two opposing hue families with strong separation.',
  },
  {
    id: 'split-complementary',
    label: 'Split complement',
    shortDescription: 'A base hue plus both neighbors of its opposite.',
  },
  {
    id: 'triadic',
    label: 'Triadic',
    shortDescription: 'Three evenly spaced hue families with broad range.',
  },
  {
    id: 'monochromatic',
    label: 'Monochromatic',
    shortDescription: 'One hue expressed through lightness and chroma.',
  },
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const normalizeHue = (hue: number): number => {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

export const normalizeHex = (value: string, fallback = '#000000'): string => {
  const trimmed = value.trim();
  const threeDigit = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(trimmed);
  if (threeDigit) {
    return `#${threeDigit[1]}${threeDigit[1]}${threeDigit[2]}${threeDigit[2]}${threeDigit[3]}${threeDigit[3]}`.toUpperCase();
  }

  const sixDigit = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  return sixDigit ? `#${sixDigit[1]}`.toUpperCase() : fallback.toUpperCase();
};

export const isValidHex = (value: string): boolean =>
  /^#?[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value.trim());

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const normalized = normalizeHex(hex);
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
};

export const rgbToHex = (red: number, green: number, blue: number): string => {
  const toHex = (channel: number) =>
    Math.round(clamp(channel, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
};

export const hexToOklch = (hex: string): { l: number; c: number; h: number } => {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (value: number): number => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const red = toLinear(r);
  const green = toLinear(g);
  const blue = toLinear(b);
  const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);
  const lightness = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bAxis = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
  const chroma = Math.hypot(a, bAxis);
  const hue = chroma < 0.00001 ? 0 : normalizeHue((Math.atan2(bAxis, a) * 180) / Math.PI);

  return { l: lightness, c: chroma, h: hue };
};

export const formatHexAsOklch = (hex: string): string => {
  const color = hexToOklch(hex);
  return formatOklch(color.l, color.c, color.h);
};

const HARMONY_OFFSETS: Record<HarmonyId, Record<PaletteSize, number[]>> = {
  analogous: {
    5: [-54, -27, 0, 27, 54],
    6: [-60, -36, -12, 12, 36, 60],
  },
  complementary: {
    5: [-18, 0, 18, 162, 198],
    6: [-24, 0, 24, 156, 180, 204],
  },
  'split-complementary': {
    5: [0, 18, 138, 162, 222],
    6: [-15, 15, 138, 162, 198, 222],
  },
  triadic: {
    5: [0, 24, 120, 216, 240],
    6: [0, 24, 120, 144, 240, 264],
  },
  monochromatic: {
    5: [0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0],
  },
};

const LIGHTNESS_OFFSETS: Record<PaletteSize, number[]> = {
  5: [0.16, 0.08, 0, -0.09, -0.18],
  6: [0.18, 0.11, 0.04, -0.04, -0.12, -0.2],
};

const CHROMA_FACTORS: Record<PaletteSize, number[]> = {
  5: [0.7, 0.88, 1, 0.92, 0.72],
  6: [0.66, 0.8, 0.96, 1, 0.86, 0.68],
};

export const getHarmonyHueOffsets = (harmony: HarmonyId, count: PaletteSize): number[] => [
  ...HARMONY_OFFSETS[harmony][count],
];

export const generateHarmonyPalette = ({
  seed,
  harmony,
  count,
  chroma,
  lightness,
}: {
  seed: string;
  harmony: HarmonyId;
  count: PaletteSize;
  chroma: number;
  lightness: number;
}): string[] => {
  const seedColor = hexToOklch(seed);
  const offsets = getHarmonyHueOffsets(harmony, count);
  const lightnessOffsets = LIGHTNESS_OFFSETS[count];
  const chromaFactors = CHROMA_FACTORS[count];

  return offsets.map((offset, index) => {
    const resolvedLightness = clamp(lightness + (lightnessOffsets[index] ?? 0), 0.28, 0.92);
    const resolvedChroma = clamp(chroma * (chromaFactors[index] ?? 1), 0.025, 0.29);
    return oklchToHex(resolvedLightness, resolvedChroma, normalizeHue(seedColor.h + offset));
  });
};

export const mixHexColors = (start: string, end: string, amount: number): string => {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  const ratio = clamp(amount, 0, 100) / 100;
  return rgbToHex(
    startRgb.r + (endRgb.r - startRgb.r) * ratio,
    startRgb.g + (endRgb.g - startRgb.g) * ratio,
    startRgb.b + (endRgb.b - startRgb.b) * ratio,
  );
};

export const generatePaletteCss = (colors: string[]): string =>
  [
    ':root {',
    ...colors.map((color, index) => `  --color-palette-${index + 1}: ${normalizeHex(color)};`),
    '}',
  ].join('\n');

export const generatePaletteJson = (colors: string[]): string =>
  JSON.stringify(
    Object.fromEntries(colors.map((color, index) => [`color-${index + 1}`, normalizeHex(color)])),
    null,
    2,
  );
