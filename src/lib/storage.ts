import { PRESETS } from '@/data/presets';
import { parseCustomPresetData } from '@/lib/custom-presets';
import { createDefaultSettings } from '@/types/palette';
import type { GeneratorSettings, PresetRegistry } from '@/types/palette';

export const STORAGE_KEYS = {
  settings: 'oklch-prism-architect.settings',
  customPresets: 'oklch-prism-architect.custom-presets',
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const toFiniteNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const ensureAvailablePreset = (
  settings: GeneratorSettings,
  presetRegistry: PresetRegistry,
): GeneratorSettings => {
  if (presetRegistry[settings.preset]) {
    return settings;
  }

  const fallbackPreset = Object.keys(presetRegistry)[0] ?? createDefaultSettings().preset;

  return {
    ...settings,
    preset: fallbackPreset,
    overrides: {},
  };
};

export const readStoredSettings = (): GeneratorSettings => {
  const defaults = createDefaultSettings();

  if (!hasStorage()) {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.settings);

    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return defaults;
    }

    const overrides = isRecord(parsed.overrides)
      ? Object.fromEntries(
          Object.entries(parsed.overrides)
            .filter((entry): entry is [string, Record<string, unknown>] => isRecord(entry[1]))
            .map(([familyId, override]) => [
              familyId,
              {
                hueShift: toFiniteNumber(override.hueShift, 0),
                chromaScale: toFiniteNumber(override.chromaScale, 1),
                lightnessScale: toFiniteNumber(override.lightnessScale, 1),
              },
            ]),
        )
      : {};

    return {
      preset: typeof parsed.preset === 'string' ? parsed.preset : defaults.preset,
      hueShift: toFiniteNumber(parsed.hueShift, defaults.hueShift),
      chromaScale: toFiniteNumber(parsed.chromaScale, defaults.chromaScale),
      lightnessScale: toFiniteNumber(parsed.lightnessScale, defaults.lightnessScale),
      overrides,
    };
  } catch {
    return defaults;
  }
};

export const writeStoredSettings = (settings: GeneratorSettings): void => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
};

export const readStoredCustomPresets = (): PresetRegistry => {
  if (!hasStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.customPresets);

    if (!raw) {
      return {};
    }

    return parseCustomPresetData(JSON.parse(raw), Object.keys(PRESETS));
  } catch {
    return {};
  }
};

export const writeStoredCustomPresets = (presetRegistry: PresetRegistry): void => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.customPresets, JSON.stringify(presetRegistry));
};
