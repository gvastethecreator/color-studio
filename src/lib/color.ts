import { BASELINE_CURVE, PRESETS } from '@/data/presets';
import {
  formatOklch,
  hexToOklch,
  normalizeHue,
  oklchToHex as oklchToHexImpl,
} from '@/lib/color-formats';
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

export { normalizeHue };

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
