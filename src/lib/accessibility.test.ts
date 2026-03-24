import { getContrastRatio, getReadableTextColor, getRelativeLuminance } from '@/lib/accessibility';

describe('accessibility helpers', () => {
  it('calculates relative luminance for hex colors', () => {
    expect(getRelativeLuminance('#000000')).toBe(0);
    expect(getRelativeLuminance('#FFFFFF')).toBe(1);
  });

  it('prefers the higher contrast text color', () => {
    expect(getReadableTextColor('#FFFFFF')).toBe('#000000');
    expect(getReadableTextColor('#111111')).toBe('#FFFFFF');
  });

  it('returns WCAG contrast ratios', () => {
    expect(getContrastRatio('#000000', '#FFFFFF')).toBe(21);
  });
});
