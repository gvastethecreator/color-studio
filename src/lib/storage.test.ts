import {
  STORAGE_KEYS,
  ensureAvailablePreset,
  readStoredCustomPresets,
  readStoredSettings,
  writeStoredCustomPresets,
  writeStoredSettings,
} from '@/lib/storage';
import { createDefaultSettings } from '@/types/palette';

describe('storage helpers', () => {
  it('stores and reads generator settings', () => {
    const settings = {
      ...createDefaultSettings(),
      preset: 'neon',
      hueShift: 20,
      overrides: {
        flamingo: {
          hueShift: 10,
          chromaScale: 1.4,
          lightnessScale: 1.1,
        },
      },
    };

    writeStoredSettings(settings);

    expect(window.localStorage.getItem(STORAGE_KEYS.settings)).toContain('"preset":"neon"');
    expect(readStoredSettings()).toEqual(settings);
  });

  it('stores and reads custom presets safely', () => {
    writeStoredCustomPresets({
      aurora: {
        name: 'Aurora',
        description: 'Cool preset',
        families: [{ id: 'glacier', name: 'Glacier', baseHue: 210 }],
      },
    });

    expect(readStoredCustomPresets()).toHaveProperty('aurora');
  });

  it('falls back when a selected preset no longer exists', () => {
    const next = ensureAvailablePreset(
      {
        ...createDefaultSettings(),
        preset: 'missing-preset',
        overrides: { custom: { hueShift: 10, chromaScale: 1.1, lightnessScale: 1.1 } },
      },
      {
        spectrum: {
          name: 'Spectrum',
          description: 'Fallback',
          families: [{ id: 'flamingo', name: 'Flamingo', baseHue: 0 }],
        },
      },
    );

    expect(next.preset).toBe('spectrum');
    expect(next.overrides).toEqual({});
  });
});
