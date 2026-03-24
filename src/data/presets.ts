import type { PresetDefinition, PresetFamilyDefinition } from '@/types/palette';

export interface BaselinePoint {
  step: number;
  l: number;
  c: number;
}

export const BASELINE_CURVE: BaselinePoint[] = [
  { step: 1, l: 0.97, c: 0.02 },
  { step: 2, l: 0.92, c: 0.05 },
  { step: 3, l: 0.87, c: 0.1 },
  { step: 4, l: 0.81, c: 0.15 },
  { step: 5, l: 0.73, c: 0.23 },
  { step: 6, l: 0.63, c: 0.29 },
  { step: 7, l: 0.54, c: 0.24 },
  { step: 8, l: 0.42, c: 0.19 },
  { step: 9, l: 0.3, c: 0.13 },
];

const FULL_SPECTRUM: PresetFamilyDefinition[] = [
  { id: 'flamingo', name: 'Flamingo', baseHue: 0 },
  { id: 'pink', name: 'Pink', baseHue: 10 },
  { id: 'red', name: 'Red', baseHue: 20 },
  { id: 'coral', name: 'Coral', baseHue: 30 },
  { id: 'mahogany', name: 'Mahogany', baseHue: 40 },
  { id: 'apricot', name: 'Apricot', baseHue: 50 },
  { id: 'bronze', name: 'Bronze', baseHue: 60 },
  { id: 'orange', name: 'Orange', baseHue: 70 },
  { id: 'amber', name: 'Amber', baseHue: 80 },
  { id: 'mustard', name: 'Mustard', baseHue: 90 },
  { id: 'yellow', name: 'Yellow', baseHue: 100 },
  { id: 'turmeric', name: 'Turmeric', baseHue: 110 },
  { id: 'pear', name: 'Pear', baseHue: 120 },
  { id: 'avocado', name: 'Avocado', baseHue: 130 },
  { id: 'lime', name: 'Lime', baseHue: 140 },
  { id: 'green', name: 'Green', baseHue: 150 },
  { id: 'emerald', name: 'Emerald', baseHue: 160 },
  { id: 'aquamarine', name: 'Aquamarine', baseHue: 170 },
  { id: 'turquoise', name: 'Turquoise', baseHue: 180 },
  { id: 'cyan', name: 'Cyan', baseHue: 190 },
  { id: 'electric', name: 'Electric', baseHue: 200 },
  { id: 'pelorus', name: 'Pelorus', baseHue: 210 },
  { id: 'sky', name: 'Sky', baseHue: 220 },
  { id: 'cerulean', name: 'Cerulean', baseHue: 230 },
  { id: 'steel', name: 'Steel', baseHue: 240 },
  { id: 'azure', name: 'Azure', baseHue: 250 },
  { id: 'blue', name: 'Blue', baseHue: 260 },
  { id: 'neon', name: 'Neon', baseHue: 270 },
  { id: 'iris', name: 'Iris', baseHue: 280 },
  { id: 'lavender', name: 'Lavender', baseHue: 290 },
  { id: 'violet', name: 'Violet', baseHue: 300 },
  { id: 'purple', name: 'Purple', baseHue: 310 },
  { id: 'fuchsia', name: 'Fuchsia', baseHue: 320 },
  { id: 'orchid', name: 'Orchid', baseHue: 330 },
  { id: 'byzantium', name: 'Byzantium', baseHue: 340 },
  { id: 'mulberry', name: 'Mulberry', baseHue: 350 },
];

const TAILWIND_LIKE: PresetFamilyDefinition[] = [
  { id: 'slate', name: 'Slate', baseHue: 210, intrinsicChroma: 0.15 },
  { id: 'gray', name: 'Gray', baseHue: 220, intrinsicChroma: 0.2 },
  { id: 'zinc', name: 'Zinc', baseHue: 240, intrinsicChroma: 0.1 },
  { id: 'neutral', name: 'Neutral', baseHue: 0, intrinsicChroma: 0 },
  { id: 'stone', name: 'Stone', baseHue: 30, intrinsicChroma: 0.15 },
  { id: 'red', name: 'Red', baseHue: 25 },
  { id: 'orange', name: 'Orange', baseHue: 32 },
  { id: 'amber', name: 'Amber', baseHue: 45 },
  { id: 'yellow', name: 'Yellow', baseHue: 55 },
  { id: 'lime', name: 'Lime', baseHue: 85 },
  { id: 'green', name: 'Green', baseHue: 142 },
  { id: 'emerald', name: 'Emerald', baseHue: 160 },
  { id: 'teal', name: 'Teal', baseHue: 175 },
  { id: 'cyan', name: 'Cyan', baseHue: 190 },
  { id: 'sky', name: 'Sky', baseHue: 205 },
  { id: 'blue', name: 'Blue', baseHue: 220 },
  { id: 'indigo', name: 'Indigo', baseHue: 240 },
  { id: 'violet', name: 'Violet', baseHue: 265 },
  { id: 'purple', name: 'Purple', baseHue: 280 },
  { id: 'fuchsia', name: 'Fuchsia', baseHue: 300 },
  { id: 'pink', name: 'Pink', baseHue: 330 },
  { id: 'rose', name: 'Rose', baseHue: 350 },
];

const MATERIAL_LIKE: PresetFamilyDefinition[] = [
  { id: 'red', name: 'Red', baseHue: 14 },
  { id: 'pink', name: 'Pink', baseHue: 335 },
  { id: 'purple', name: 'Purple', baseHue: 280 },
  { id: 'deep-purple', name: 'Deep Purple', baseHue: 265 },
  { id: 'indigo', name: 'Indigo', baseHue: 245 },
  { id: 'blue', name: 'Blue', baseHue: 215 },
  { id: 'light-blue', name: 'Light Blue', baseHue: 200 },
  { id: 'cyan', name: 'Cyan', baseHue: 185 },
  { id: 'teal', name: 'Teal', baseHue: 170 },
  { id: 'green', name: 'Green', baseHue: 140 },
  { id: 'light-green', name: 'Light Green', baseHue: 100 },
  { id: 'lime', name: 'Lime', baseHue: 75 },
  { id: 'yellow', name: 'Yellow', baseHue: 55 },
  { id: 'amber', name: 'Amber', baseHue: 40 },
  { id: 'orange', name: 'Orange', baseHue: 30 },
  { id: 'deep-orange', name: 'Deep Orange', baseHue: 15 },
  { id: 'brown', name: 'Brown', baseHue: 25, intrinsicChroma: 0.3 },
  { id: 'blue-grey', name: 'Blue Grey', baseHue: 215, intrinsicChroma: 0.3 },
];

const SHADCN_BASES: PresetFamilyDefinition[] = [
  { id: 'slate', name: 'Slate', baseHue: 210, intrinsicChroma: 0.15 },
  { id: 'gray', name: 'Gray', baseHue: 220, intrinsicChroma: 0.15 },
  { id: 'zinc', name: 'Zinc', baseHue: 240, intrinsicChroma: 0.1 },
  { id: 'neutral', name: 'Neutral', baseHue: 0, intrinsicChroma: 0 },
  { id: 'stone', name: 'Stone', baseHue: 30, intrinsicChroma: 0.15 },
];

const NEON_PUNK: PresetFamilyDefinition[] = [
  { id: 'cyber-yellow', name: 'Cyber Yellow', baseHue: 60 },
  { id: 'neon-green', name: 'Neon Green', baseHue: 120 },
  { id: 'electric-blue', name: 'Electric Blue', baseHue: 200 },
  { id: 'hot-pink', name: 'Hot Pink', baseHue: 320 },
  { id: 'plasma-purple', name: 'Plasma Purple', baseHue: 280 },
  { id: 'laser-red', name: 'Laser Red', baseHue: 0 },
];

export const PRESETS: Record<string, PresetDefinition> = {
  spectrum: {
    name: 'Prism Spectrum',
    description: 'Full 360° range of generated hues with stable family anchors.',
    families: FULL_SPECTRUM,
  },
  tailwind: {
    name: 'Tailwind-ish',
    description: 'Approximation of Tailwind-style scales with neutral and accent families.',
    families: TAILWIND_LIKE,
  },
  material: {
    name: 'Material Design',
    description: 'Classic Material-inspired hue families with balanced contrast.',
    families: MATERIAL_LIKE,
  },
  shadcn: {
    name: 'Shadcn Bases',
    description: 'Neutral base scales useful for dashboards and UI chrome.',
    families: SHADCN_BASES,
  },
  neon: {
    name: 'Neon Punk',
    description: 'High-chroma preset for experimentation and bold previews.',
    families: NEON_PUNK,
  },
};
