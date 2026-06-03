export interface ColorStep {
  step: number;
  l: number;
  c: number;
  h: number;
  hex: string;
  css: string;
}

export interface ColorFamily {
  id: string;
  name: string;
  baseHue: number;
  steps: ColorStep[];
}

export interface FamilyOverride {
  hueShift: number;
  chromaScale: number;
  lightnessScale: number;
}

export type ColorFormatId =
  | 'oklch'
  | 'oklab'
  | 'hex'
  | 'hex-lower'
  | 'rgb'
  | 'rgba'
  | 'hsl'
  | 'hsla'
  | 'hwb'
  | 'lab'
  | 'lch';

export type AccentPaletteId =
  | 'neutral'
  | 'red'
  | 'orange'
  | 'amber'
  | 'green'
  | 'blue'
  | 'violet'
  | 'pink';

export type ThemeMode = 'dark' | 'light';

export interface GeneratorSettings {
  preset: string;
  hueShift: number;
  chromaScale: number;
  lightnessScale: number;
  overrides: Record<string, FamilyOverride>;
  colorFormat: ColorFormatId;
  theme: ThemeMode;
  accentPalette: AccentPaletteId;
}

export interface PresetFamilyDefinition {
  id: string;
  name: string;
  /** Hue anchor used when the preset is generated from OKLCH. */
  baseHue?: number;
  /** Multiplier applied to chroma when the preset is generated. */
  intrinsicChroma?: number;
  /**
   * Fixed color stops (HEX). When provided, the generator returns these
   * exact values instead of computing a curve from `baseHue`.
   */
  steps?: Array<{ step: number; hex: string }>;
}

export interface PresetDefinition {
  name: string;
  description: string;
  families: PresetFamilyDefinition[];
}

export type PresetRegistry = Record<string, PresetDefinition>;

export const DEFAULT_OVERRIDE: FamilyOverride = {
  hueShift: 0,
  chromaScale: 1,
  lightnessScale: 1,
};

export const DEFAULT_SETTINGS: GeneratorSettings = {
  preset: 'spectrum',
  hueShift: 0,
  chromaScale: 1,
  lightnessScale: 1,
  overrides: {},
  colorFormat: 'oklch',
  theme: 'dark',
  accentPalette: 'neutral',
};

export const createDefaultSettings = (): GeneratorSettings => ({
  ...DEFAULT_SETTINGS,
  overrides: {},
});
