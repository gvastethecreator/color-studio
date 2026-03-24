import { BASELINE_CURVE, PRESETS } from '@/data/presets';
import { DEFAULT_OVERRIDE } from '@/types/palette';
import type {
  ColorFamily,
  ColorStep,
  GeneratorSettings,
  PresetRegistry,
  PresetFamilyDefinition,
} from '@/types/palette';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const normalizeHue = (hue: number): number => {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

export const oklchToHex = (l: number, c: number, h: number): string => {
  const hRad = h * (Math.PI / 180);

  const L = l;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const transfer = (value: number): number =>
    value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(Math.max(0, value), 1 / 2.4) - 0.055;

  const red = clamp(transfer(rLin), 0, 1);
  const green = clamp(transfer(gLin), 0, 1);
  const blue = clamp(transfer(bLin), 0, 1);

  const toHex = (value: number): string =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
};

const getClosestColorName = (hue: number, families: PresetFamilyDefinition[]): string => {
  if (families.length === 0) {
    return 'Color';
  }

  let closest = families[0];
  let minDiff = Number.POSITIVE_INFINITY;

  for (const family of families) {
    let diff = Math.abs(family.baseHue - hue);
    if (diff > 180) diff = 360 - diff;

    if (diff < minDiff) {
      closest = family;
      minDiff = diff;
    }
  }

  return closest.name;
};

const computeSteps = (
  baseHue: number,
  intrinsicChroma: number,
  settings: GeneratorSettings,
  familyOverride: GeneratorSettings['overrides'][string],
): ColorStep[] => {
  const effectiveHue = normalizeHue(baseHue + settings.hueShift + familyOverride.hueShift);

  return BASELINE_CURVE.map((curvePoint) => {
    const l = clamp(curvePoint.l * settings.lightnessScale * familyOverride.lightnessScale, 0, 1);
    const c = clamp(
      curvePoint.c * settings.chromaScale * familyOverride.chromaScale * intrinsicChroma,
      0,
      2,
    );

    return {
      step: curvePoint.step,
      l,
      c,
      h: effectiveHue,
      css: `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${effectiveHue.toFixed(1)})`,
      hex: oklchToHex(l, c, effectiveHue),
    };
  });
};

export const generatePalettes = (
  settings: GeneratorSettings,
  presetRegistry: PresetRegistry = PRESETS,
): ColorFamily[] => {
  const fallbackPreset =
    presetRegistry.spectrum ?? Object.values(presetRegistry)[0] ?? PRESETS.spectrum;
  const preset = presetRegistry[settings.preset] ?? fallbackPreset;

  return preset.families.map((family) => {
    const override = settings.overrides[family.id] ?? DEFAULT_OVERRIDE;
    const intrinsicChroma = family.intrinsicChroma ?? 1;
    const steps = computeSteps(family.baseHue, intrinsicChroma, settings, override);

    const dynamicName = getClosestColorName(steps[0]?.h ?? family.baseHue, preset.families);

    return {
      id: family.id,
      name: dynamicName,
      baseHue: family.baseHue,
      steps,
    };
  });
};

export const getSafeActiveFamily = (
  palettes: ColorFamily[],
  selectedId: string | null,
): ColorFamily | null => {
  if (palettes.length === 0) return null;
  if (!selectedId) return palettes[0];
  return palettes.find((palette) => palette.id === selectedId) ?? palettes[0];
};
