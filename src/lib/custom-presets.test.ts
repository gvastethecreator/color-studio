import { parseCustomPresetData, parseCustomPresetText } from '@/lib/custom-presets';

describe('custom preset parsing', () => {
  it('parses a single preset object', () => {
    const parsed = parseCustomPresetData({
      id: 'sunset-lab',
      name: 'Sunset Lab',
      description: 'Warm imported preset.',
      families: [{ id: 'ember', name: 'Ember', baseHue: 12 }],
    });

    expect(parsed['sunset-lab']?.name).toBe('Sunset Lab');
  });

  it('parses a registry-like object of presets', () => {
    const parsed = parseCustomPresetData({
      aurora: {
        name: 'Aurora',
        description: 'Cool imported preset.',
        families: [{ id: 'glacier', name: 'Glacier', baseHue: 210 }],
      },
    });

    expect(parsed.aurora?.families).toHaveLength(1);
  });

  it('rejects invalid json text and built-in collisions', () => {
    expect(() => parseCustomPresetText('{nope')).toThrow('The selected file is not valid JSON.');

    expect(() =>
      parseCustomPresetData({
        id: 'spectrum',
        name: 'Spectrum Override',
        description: 'Should fail.',
        families: [{ id: 'test', name: 'Test', baseHue: 0 }],
      }),
    ).toThrow('collides with an existing built-in preset');
  });
});
