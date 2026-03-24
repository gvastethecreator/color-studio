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

export interface GeneratorSettings {
  preset: string;
  hueShift: number;
  chromaScale: number;
  lightnessScale: number;
  overrides: Record<string, FamilyOverride>;
}

export interface PresetFamilyDefinition {
  id: string;
  name: string;
  baseHue: number;
  intrinsicChroma?: number;
}

export interface PresetDefinition {
  name: string;
  description: string;
  families: PresetFamilyDefinition[];
}

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
};

export const createDefaultSettings = (): GeneratorSettings => ({
  ...DEFAULT_SETTINGS,
  overrides: {},
});
