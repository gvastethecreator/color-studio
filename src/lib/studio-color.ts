import {
  formatOklch,
  hexToOklch,
  hexToRgb,
  normalizeHex,
  normalizeHue,
  oklchToHex,
  rgbToHex,
} from '@/lib/color-formats';
import type { HarmonyId, PaletteSize } from '@/types/studio';

export {
  hexToOklch,
  hexToRgb,
  isValidHex,
  normalizeHex,
  normalizeHue,
  rgbToHex,
} from '@/lib/color-formats';

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

  let usedSeedSlot = false;
  return offsets.map((offset, index) => {
    if (offset === 0 && !usedSeedSlot) {
      usedSeedSlot = true;
      return normalizeHex(seed);
    }
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
