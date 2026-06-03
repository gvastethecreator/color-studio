export type AccentPaletteId =
  | 'neutral'
  | 'red'
  | 'orange'
  | 'amber'
  | 'green'
  | 'blue'
  | 'violet'
  | 'pink';

export interface AccentPaletteDescriptor {
  id: AccentPaletteId;
  label: string;
  /** Approximate "vivid" tone for solid surfaces (background-color, ring, etc). */
  baseHex: string;
  /** Foreground tone (text on solid accent surfaces). */
  onAccentHex: string;
  /** Optional preview swatch (a different step from the base for variety). */
  previewHex: string;
}

export const ACCENT_PALETTES: readonly AccentPaletteDescriptor[] = [
  {
    id: 'neutral',
    label: 'Neutral',
    baseHex: '#525252',
    onAccentHex: '#FAFAFA',
    previewHex: '#A3A3A3',
  },
  {
    id: 'red',
    label: 'Red',
    baseHex: '#DC2626',
    onAccentHex: '#FFFFFF',
    previewHex: '#F87171',
  },
  {
    id: 'orange',
    label: 'Orange',
    baseHex: '#EA580C',
    onAccentHex: '#FFFFFF',
    previewHex: '#FB923C',
  },
  {
    id: 'amber',
    label: 'Amber',
    baseHex: '#D97706',
    onAccentHex: '#FFFFFF',
    previewHex: '#FBBF24',
  },
  {
    id: 'green',
    label: 'Green',
    baseHex: '#16A34A',
    onAccentHex: '#FFFFFF',
    previewHex: '#4ADE80',
  },
  {
    id: 'blue',
    label: 'Blue',
    baseHex: '#2563EB',
    onAccentHex: '#FFFFFF',
    previewHex: '#60A5FA',
  },
  {
    id: 'violet',
    label: 'Violet',
    baseHex: '#7C3AED',
    onAccentHex: '#FFFFFF',
    previewHex: '#A78BFA',
  },
  {
    id: 'pink',
    label: 'Pink',
    baseHex: '#DB2777',
    onAccentHex: '#FFFFFF',
    previewHex: '#F472B6',
  },
] as const;

export const DEFAULT_ACCENT_PALETTE: AccentPaletteId = 'neutral';

const ACCENT_INDEX: Record<AccentPaletteId, number> = ACCENT_PALETTES.reduce(
  (acc, palette, index) => {
    acc[palette.id] = index;
    return acc;
  },
  {} as Record<AccentPaletteId, number>,
);

export const findAccentPalette = (id: AccentPaletteId): AccentPaletteDescriptor =>
  ACCENT_PALETTES[ACCENT_INDEX[id]] ?? ACCENT_PALETTES[0]!;

export const getNextAccentPalette = (id: AccentPaletteId): AccentPaletteDescriptor => {
  const currentIndex = ACCENT_INDEX[id] ?? 0;
  const nextIndex = (currentIndex + 1) % ACCENT_PALETTES.length;
  return ACCENT_PALETTES[nextIndex]!;
};

export const isAccentPalette = (value: string): value is AccentPaletteId =>
  ACCENT_PALETTES.some((palette) => palette.id === value);
