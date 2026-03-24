import { PRESETS } from '@/data/presets';
import { generatePalettes, getSafeActiveFamily, normalizeHue } from '@/lib/color';
import { createDefaultSettings } from '@/types/palette';

describe('color utilities', () => {
  it('normalizes hue values into the 0-360 range', () => {
    expect(normalizeHue(-30)).toBe(330);
    expect(normalizeHue(380)).toBe(20);
  });

  it('generates families with stable ids and dynamic display names', () => {
    const palettes = generatePalettes(createDefaultSettings());

    expect(palettes[0]).toMatchObject({
      id: PRESETS.spectrum.families[0]?.id,
      name: 'Flamingo',
    });
    expect(palettes[0]?.steps).toHaveLength(9);
  });

  it('returns a safe active family even when the selection is missing', () => {
    const palettes = generatePalettes(createDefaultSettings());

    expect(getSafeActiveFamily(palettes, null)?.id).toBe(palettes[0]?.id);
    expect(getSafeActiveFamily(palettes, 'does-not-exist')?.id).toBe(palettes[0]?.id);
  });
});
