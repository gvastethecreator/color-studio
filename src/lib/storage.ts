import { PRESETS } from '@/data/presets';
import { parseCustomPresetData } from '@/lib/custom-presets';
import { COLOR_FORMATS } from '@/lib/color-formats';
import { isAccentPalette } from '@/lib/accent-palettes';
import { isRecord, readLocalJson, writeLocalJson, type StoredRead } from '@/lib/persist';
import { createDefaultSettings } from '@/types/palette';
import type { GeneratorSettings, PresetRegistry } from '@/types/palette';

export const STORAGE_KEYS = {
  settings: 'color-studio.settings',
  customPresets: 'color-studio.custom-presets',
} as const;

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

export const readStoredSettingsWithStatus = (): StoredRead<GeneratorSettings> => {
  const defaults = createDefaultSettings();
  const stored = readLocalJson(STORAGE_KEYS.settings);

  if (stored.discarded) {
    return { value: defaults, discarded: true };
  }

  if (stored.value === null) {
    return { value: defaults, discarded: false };
  }

  try {
    const parsed = stored.value;

    if (!isRecord(parsed)) {
      return { value: defaults, discarded: true };
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

    const colorFormat =
      typeof parsed.colorFormat === 'string' &&
      COLOR_FORMATS.some((format) => format.id === parsed.colorFormat)
        ? (parsed.colorFormat as GeneratorSettings['colorFormat'])
        : defaults.colorFormat;

    const theme: GeneratorSettings['theme'] = parsed.theme === 'light' ? 'light' : 'dark';

    const accentPalette: GeneratorSettings['accentPalette'] = isAccentPalette(parsed.accentPalette)
      ? parsed.accentPalette
      : defaults.accentPalette;

    return {
      value: {
        preset: typeof parsed.preset === 'string' ? parsed.preset : defaults.preset,
        hueShift: toFiniteNumber(parsed.hueShift, defaults.hueShift),
        chromaScale: toFiniteNumber(parsed.chromaScale, defaults.chromaScale),
        lightnessScale: toFiniteNumber(parsed.lightnessScale, defaults.lightnessScale),
        overrides,
        colorFormat,
        theme,
        accentPalette,
      },
      discarded: false,
    };
  } catch {
    return { value: defaults, discarded: true };
  }
};

export const readStoredSettings = (): GeneratorSettings => readStoredSettingsWithStatus().value;

export const writeStoredSettings = (settings: GeneratorSettings): void => {
  writeLocalJson(STORAGE_KEYS.settings, settings);
};

export const readStoredCustomPresetsWithStatus = (): StoredRead<PresetRegistry> => {
  const stored = readLocalJson(STORAGE_KEYS.customPresets);

  if (stored.discarded) {
    return { value: {}, discarded: true };
  }

  if (stored.value === null) {
    return { value: {}, discarded: false };
  }

  try {
    return {
      value: parseCustomPresetData(stored.value, Object.keys(PRESETS)),
      discarded: false,
    };
  } catch {
    return { value: {}, discarded: true };
  }
};

export const readStoredCustomPresets = (): PresetRegistry =>
  readStoredCustomPresetsWithStatus().value;

export const writeStoredCustomPresets = (presetRegistry: PresetRegistry): void => {
  writeLocalJson(STORAGE_KEYS.customPresets, presetRegistry);
};
