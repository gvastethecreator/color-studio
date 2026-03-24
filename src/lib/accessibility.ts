const hexToRgb = (hex: string): [number, number, number] => {
  const sanitized = hex.replace('#', '').trim();

  if (!/^[0-9a-f]{6}$/i.test(sanitized)) {
    throw new Error(`Invalid HEX color: ${hex}`);
  }

  return [0, 2, 4].map((offset) => Number.parseInt(sanitized.slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ];
};

const toLinearChannel = (value: number): number => {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
};

export const getRelativeLuminance = (hex: string): number => {
  const [red, green, blue] = hexToRgb(hex);

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
