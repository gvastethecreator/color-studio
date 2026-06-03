import { BASELINE_CURVE, PRESETS } from '@/data/presets';
import { formatOklch, oklchToHex as oklchToHexImpl } from '@/lib/color-formats';
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

export const oklchToHex = oklchToHexImpl;

const getClosestColorName = (hue: number, families: PresetFamilyDefinition[]): string => {
  if (families.length === 0) {
    return 'Color';
  }

  let closest = families[0];
  let minDiff = Number.POSITIVE_INFINITY;

  for (const family of families) {
    if (family.baseHue === undefined) {
      continue;
    }
    let diff = Math.abs(family.baseHue - hue);
    if (diff > 180) diff = 360 - diff;

    if (diff < minDiff) {
      closest = family;
      minDiff = diff;
    }
  }

  return closest?.name ?? 'Color';
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
      css: formatOklch(l, c, effectiveHue),
      hex: oklchToHex(l, c, effectiveHue),
    };
  });
};

const hexToOklch = (hex: string): { l: number; c: number; h: number } => {
  const sanitized = hex.replace('#', '').trim();

  if (!/^[0-9a-f]{6}$/i.test(sanitized)) {
    return { l: 0.5, c: 0, h: 0 };
  }

  const r = Number.parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(sanitized.slice(4, 6), 16) / 255;

  const toLinear = (value: number): number =>
    value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);

  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const lCube = Math.cbrt(l);
  const mCube = Math.cbrt(m);
  const sCube = Math.cbrt(s);

  const L = 0.2104542553 * lCube + 0.793617785 * mCube - 0.0040720468 * sCube;
  const a = 1.9779984951 * lCube - 2.428592205 * mCube + 0.4505937099 * sCube;
  const bOk = 0.0259040371 * lCube + 0.7827717662 * mCube - 0.808675766 * sCube;

  const chroma = Math.hypot(a, bOk);
  let hue = (Math.atan2(bOk, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  return { l: L, c: chroma, h: hue };
};

const computeStepsFromHex = (
  sourceSteps: Array<{ step: number; hex: string }>,
  settings: GeneratorSettings,
  familyOverride: GeneratorSettings['overrides'][string],
  intrinsicChroma: number,
): ColorStep[] => {
  const anchorStep = sourceSteps[0];
  const anchorOklch = anchorStep ? hexToOklch(anchorStep.hex) : { l: 0.5, c: 0, h: 0 };
  const effectiveHue = normalizeHue(anchorOklch.h + settings.hueShift + familyOverride.hueShift);

  return sourceSteps.map((entry) => {
    const oklch = hexToOklch(entry.hex);
    const l = clamp(oklch.l * settings.lightnessScale * familyOverride.lightnessScale, 0, 1);
    const c = clamp(
      oklch.c * settings.chromaScale * familyOverride.chromaScale * intrinsicChroma,
      0,
      2,
    );

    return {
      step: entry.step,
      l,
      c,
      h: effectiveHue,
      css: formatOklch(l, c, effectiveHue),
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

    if (family.steps && family.steps.length > 0) {
      const intrinsicChroma = family.intrinsicChroma ?? 1;
      const steps = computeStepsFromHex(family.steps, settings, override, intrinsicChroma);

      return {
        id: family.id,
        name: family.name,
        baseHue: 0,
        steps,
      };
    }

    if (family.baseHue === undefined) {
      throw new Error(
        `Preset family "${family.id}" must provide either baseHue or explicit steps.`,
      );
    }

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
