export type ColorFormat =
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

export interface ColorFormatDescriptor {
  id: ColorFormat;
  label: string;
  shortLabel: string;
  description: string;
}

export const COLOR_FORMATS: readonly ColorFormatDescriptor[] = [
  {
    id: 'oklch',
    label: 'OKLCH',
    shortLabel: 'oklch',
    description: 'Perceptually uniform lightness, chroma, and hue.',
  },
  {
    id: 'oklab',
    label: 'OKLab',
    shortLabel: 'oklab',
    description: 'Lightness, a (green-red), and b (blue-yellow).',
  },
  {
    id: 'hex',
    label: 'HEX',
    shortLabel: 'HEX',
    description: 'Six-digit hexadecimal color (uppercase).',
  },
  {
    id: 'hex-lower',
    label: 'hex',
    shortLabel: 'hex',
    description: 'Six-digit hexadecimal color (lowercase).',
  },
  {
    id: 'rgb',
    label: 'RGB',
    shortLabel: 'rgb',
    description: 'Red, green, and blue channels (0-255).',
  },
  {
    id: 'rgba',
    label: 'RGBA',
    shortLabel: 'rgba',
    description: 'Red, green, blue, and alpha (0-1).',
  },
  {
    id: 'hsl',
    label: 'HSL',
    shortLabel: 'hsl',
    description: 'Hue, saturation, and lightness.',
  },
  {
    id: 'hsla',
    label: 'HSLA',
    shortLabel: 'hsla',
    description: 'Hue, saturation, lightness, and alpha.',
  },
  {
    id: 'hwb',
    label: 'HWB',
    shortLabel: 'hwb',
    description: 'Hue, whiteness, and blackness.',
  },
  {
    id: 'lab',
    label: 'Lab',
    shortLabel: 'lab',
    description: 'CIE L*a*b* color space.',
  },
  {
    id: 'lch',
    label: 'LCH',
    shortLabel: 'lch',
    description: 'CIE L*C h° cylindrical color space.',
  },
] as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

interface RgbTuple {
  r: number;
  g: number;
  b: number;
}

interface HslTuple {
  h: number;
  s: number;
  l: number;
}

export const normalizeHue = (hue: number): number => {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

export const isValidHex = (value: string): boolean =>
  /^#?[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value.trim());

export const normalizeHex = (value: string, fallback = '#000000'): string => {
  const trimmed = value.trim();
  const threeDigit = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(trimmed);
  if (threeDigit) {
    return `#${threeDigit[1]}${threeDigit[1]}${threeDigit[2]}${threeDigit[2]}${threeDigit[3]}${threeDigit[3]}`.toUpperCase();
  }

  const sixDigit = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  return sixDigit ? `#${sixDigit[1]}`.toUpperCase() : fallback.toUpperCase();
};

export const hexToRgb = (hex: string): RgbTuple => {
  const normalized = normalizeHex(hex);
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
};

export const rgbToHex = (red: number, green: number, blue: number): string => {
  const toHex = (channel: number) =>
    Math.round(clamp(channel, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
};

export const hexToOklch = (hex: string): { l: number; c: number; h: number } => {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (value: number): number => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const red = toLinear(r);
  const green = toLinear(g);
  const blue = toLinear(b);
  const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);
  const lightness = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bAxis = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
  const chroma = Math.hypot(a, bAxis);
  const hue = chroma < 0.00001 ? 0 : normalizeHue((Math.atan2(bAxis, a) * 180) / Math.PI);

  return { l: lightness, c: chroma, h: hue };
};

const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const formatChannel = (value: number, decimals: number): string => {
  const rounded = round(value, decimals);
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(decimals);
};

const formatPercent = (value: number, decimals: number): string =>
  `${formatChannel(value, decimals)}%`;

const oklchToLinearRgb = (l: number, c: number, h: number): { r: number; g: number; b: number } => {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  return {
    r: 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  };
};

const linearToSrgb = (value: number): number => {
  const absolute = Math.max(0, value);
  return absolute <= 0.0031308 ? 12.92 * absolute : 1.055 * Math.pow(absolute, 1 / 2.4) - 0.055;
};

const toSrgbByte = (value: number): number => Math.round(clamp(linearToSrgb(value) * 255, 0, 255));

export const oklchToRgb = (l: number, c: number, h: number): RgbTuple => {
  const linear = oklchToLinearRgb(l, c, h);
  return {
    r: toSrgbByte(linear.r),
    g: toSrgbByte(linear.g),
    b: toSrgbByte(linear.b),
  };
};

export const oklchToHex = (l: number, c: number, h: number): string => {
  const { r, g, b } = oklchToRgb(l, c, h);
  const toHex = (value: number): string => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const rgbToHsl = ({ r, g, b }: RgbTuple): HslTuple => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        hue = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
        break;
      case gNorm:
        hue = ((bNorm - rNorm) / delta + 2) * 60;
        break;
      default:
        hue = ((rNorm - gNorm) / delta + 4) * 60;
        break;
    }
  }

  return { h: hue, s: saturation * 100, l: lightness * 100 };
};

const rgbToXyz = ({ r, g, b }: RgbTuple): { x: number; y: number; z: number } => {
  const toLinear = (value: number): number => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  };
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  return {
    x: rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375,
    y: rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.072175,
    z: rLinear * 0.0193339 + gLinear * 0.119192 + bLinear * 0.9503041,
  };
};

const xyzToLab = ({ x, y, z }: { x: number; y: number; z: number }) => {
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const transform = (value: number, ref: number): number => {
    const ratio = value / ref;
    return ratio > 0.008856 ? Math.cbrt(ratio) : 7.787 * ratio + 16 / 116;
  };
  const fx = transform(x, xn);
  const fy = transform(y, yn);
  const fz = transform(z, zn);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
};

const labToLch = ({ l, a, b }: { l: number; a: number; b: number }) => {
  const chroma = Math.hypot(a, b);
  let hue = (Math.atan2(b, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return { l, c: chroma, h: hue };
};

const oklchToOklab = (l: number, c: number, h: number) => {
  const hRad = (h * Math.PI) / 180;
  return {
    l,
    a: c * Math.cos(hRad),
    b: c * Math.sin(hRad),
  };
};

export const formatOklch = (l: number, c: number, h: number): string => {
  const lStr = formatChannel(l, 3);
  const cStr = formatChannel(c, 3);
  const hStr = formatChannel(h, 1);
  return `oklch(${lStr} ${cStr} ${hStr})`;
};

export const formatOklab = (l: number, c: number, h: number): string => {
  const { a, b } = oklchToOklab(l, c, h);
  return `oklab(${formatChannel(l, 3)} ${formatChannel(a, 4)} ${formatChannel(b, 4)})`;
};

export const formatHex = (l: number, c: number, h: number, lowerCase = false): string => {
  const { r, g, b } = oklchToRgb(l, c, h);
  const toHex = (value: number): string => value.toString(16).padStart(2, '0');
  const value = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return lowerCase ? value.toLowerCase() : value.toUpperCase();
};

export const formatRgb = (l: number, c: number, h: number): string => {
  const { r, g, b } = oklchToRgb(l, c, h);
  return `rgb(${r}, ${g}, ${b})`;
};

export const formatRgba = (l: number, c: number, h: number): string => {
  const { r, g, b } = oklchToRgb(l, c, h);
  const rNorm = formatChannel(r / 255, 3);
  const gNorm = formatChannel(g / 255, 3);
  const bNorm = formatChannel(b / 255, 3);
  return `rgba(${r}, ${g}, ${b}, ${rNorm === gNorm && gNorm === bNorm ? rNorm : '1'})`.replace(
    '1)',
    '1)',
  );
};

const formatHue = (hue: number): string => `${formatChannel(hue, 1)}deg`;

export const formatHsl = (l: number, c: number, h: number): string => {
  const { h: hue, s, l: lightness } = rgbToHsl(oklchToRgb(l, c, h));
  return `hsl(${formatHue(hue)} ${formatPercent(s, 1)} ${formatPercent(lightness, 1)})`;
};

export const formatHsla = (l: number, c: number, h: number): string => {
  const { h: hue, s, l: lightness } = rgbToHsl(oklchToRgb(l, c, h));
  return `hsla(${formatHue(hue)} ${formatPercent(s, 1)} ${formatPercent(lightness, 1)} / 1)`;
};

export const formatHwb = (l: number, c: number, h: number): string => {
  const { r, g, b } = oklchToRgb(l, c, h);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const whiteness = formatPercent((min / 255) * 100, 1);
  const blackness = formatPercent((1 - max / 255) * 100, 1);
  return `hwb(${formatHue(h)} ${whiteness} ${blackness})`;
};

export const formatLab = (l: number, c: number, h: number): string => {
  const lab = xyzToLab(rgbToXyz(oklchToRgb(l, c, h)));
  return `lab(${formatChannel(lab.l, 2)} ${formatChannel(lab.a, 2)} ${formatChannel(lab.b, 2)})`;
};

export const formatLch = (l: number, c: number, h: number): string => {
  const lch = labToLch(xyzToLab(rgbToXyz(oklchToRgb(l, c, h))));
  return `lch(${formatChannel(lch.l, 2)} ${formatChannel(lch.c, 2)} ${formatChannel(lch.h, 1)})`;
};

export const formatColor = (format: ColorFormat, l: number, c: number, h: number): string => {
  switch (format) {
    case 'oklch':
      return formatOklch(l, c, h);
    case 'oklab':
      return formatOklab(l, c, h);
    case 'hex':
      return formatHex(l, c, h, false);
    case 'hex-lower':
      return formatHex(l, c, h, true);
    case 'rgb':
      return formatRgb(l, c, h);
    case 'rgba':
      return formatRgba(l, c, h);
    case 'hsl':
      return formatHsl(l, c, h);
    case 'hsla':
      return formatHsla(l, c, h);
    case 'hwb':
      return formatHwb(l, c, h);
    case 'lab':
      return formatLab(l, c, h);
    case 'lch':
      return formatLch(l, c, h);
  }
};

export const isColorFormat = (value: string): value is ColorFormat =>
  COLOR_FORMATS.some((format) => format.id === value);

export const DEFAULT_COLOR_FORMAT: ColorFormat = 'oklch';
