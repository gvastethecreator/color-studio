import { hexToRgb, isValidHex } from '@/lib/color-formats';

const toLinearChannel = (value: number): number => {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
};

export const getRelativeLuminance = (hex: string): number => {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid HEX color: ${hex}`);
  }

  const { r: red, g: green, b: blue } = hexToRgb(hex);

  return (
    0.2126 * toLinearChannel(red) + 0.7152 * toLinearChannel(green) + 0.0722 * toLinearChannel(blue)
  );
};

export const getContrastRatio = (foregroundHex: string, backgroundHex: string): number => {
  const foreground = getRelativeLuminance(foregroundHex);
  const background = getRelativeLuminance(backgroundHex);
  const [lighter, darker] =
    foreground > background ? [foreground, background] : [background, foreground];

  return (lighter + 0.05) / (darker + 0.05);
};

export const getReadableTextColor = (backgroundHex: string): '#000000' | '#FFFFFF' => {
  const blackContrast = getContrastRatio('#000000', backgroundHex);
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundHex);

  return blackContrast >= whiteContrast ? '#000000' : '#FFFFFF';
};
