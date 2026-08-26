import { generateHarmonyPalette, isValidHex, normalizeHex } from '@/lib/studio-color';
import { isRecord, readLocalJson, writeLocalJson, type StoredRead } from '@/lib/persist';
import type {
  GradientInterpolation,
  GradientStudioState,
  GradientType,
  HarmonyId,
  PaletteComposerState,
  PaletteSize,
  StudioState,
  StudioToolId,
} from '@/types/studio';

export const STUDIO_STORAGE_KEY = 'color-studio.workbench.v1';
export type { StoredRead };

const HARMONIES: HarmonyId[] = [
  'analogous',
  'complementary',
  'split-complementary',
  'triadic',
  'monochromatic',
];
const TOOLS: StudioToolId[] = ['palette', 'gradient', 'scale', 'contrast'];
const GRADIENT_TYPES: GradientType[] = ['linear', 'radial', 'conic'];
const INTERPOLATIONS: GradientInterpolation[] = ['srgb', 'oklab', 'oklch'];

const finite = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(value, min), max)
    : fallback;

const known = <T extends string>(value: unknown, options: T[], fallback: T): T =>
  typeof value === 'string' && options.includes(value as T) ? (value as T) : fallback;

export const createDefaultStudioState = (): StudioState => {
  const palette: Omit<PaletteComposerState, 'colors'> = {
    seed: '#6D5DFC',
    harmony: 'split-complementary',
    count: 5,
    chroma: 0.17,
    lightness: 0.68,
  };

  return {
    version: 1,
    activeTool: 'palette',
    palette: {
      ...palette,
      colors: generateHarmonyPalette(palette),
    },
    gradient: {
      type: 'linear',
      angle: 128,
      interpolation: 'oklab',
      selectedStopId: 'stop-2',
      stops: [
        { id: 'stop-1', color: '#FF7A59', position: 0 },
        { id: 'stop-2', color: '#6D5DFC', position: 48 },
        { id: 'stop-3', color: '#0FD6B3', position: 100 },
      ],
    },
    contrast: {
      foreground: '#F7F4EE',
      background: '#25212D',
    },
    mixer: {
      start: '#FF7A59',
      end: '#6D5DFC',
      amount: 50,
    },
  };
};

const parsePalette = (value: unknown, defaults: PaletteComposerState): PaletteComposerState => {
  if (!isRecord(value)) return defaults;
  const count: PaletteSize = value.count === 6 ? 6 : 5;
  const seed =
    typeof value.seed === 'string' && isValidHex(value.seed)
      ? normalizeHex(value.seed)
      : defaults.seed;
  const harmony = known(value.harmony, HARMONIES, defaults.harmony);
  const chroma = finite(value.chroma, defaults.chroma, 0.04, 0.29);
  const lightness = finite(value.lightness, defaults.lightness, 0.35, 0.85);
  const colors = Array.isArray(value.colors)
    ? value.colors
        .filter((color): color is string => typeof color === 'string' && isValidHex(color))
        .map((color) => normalizeHex(color))
    : [];

  const base = { seed, harmony, count, chroma, lightness };
  return {
    ...base,
    colors: colors.length === count ? colors : generateHarmonyPalette(base),
  };
};

const parseGradient = (value: unknown, defaults: GradientStudioState): GradientStudioState => {
  if (!isRecord(value)) return defaults;
  const usedIds = new Set<string>();
  const parsedStops = Array.isArray(value.stops)
    ? value.stops
        .map((stop, index) => {
          if (!isRecord(stop) || typeof stop.color !== 'string' || !isValidHex(stop.color))
            return null;

          const preferredId = typeof stop.id === 'string' && stop.id ? stop.id : 'stored-stop';
          let id = preferredId;
          let suffix = index + 1;
          while (usedIds.has(id)) {
            id = `${preferredId}-${suffix}`;
            suffix += 1;
          }
          usedIds.add(id);

          return {
            id,
            color: normalizeHex(stop.color),
            position: finite(stop.position, index * 50, 0, 100),
          };
        })
        .filter((stop): stop is NonNullable<typeof stop> => stop !== null)
        .slice(0, 8)
    : [];
  const stops = parsedStops.length >= 2 ? parsedStops : defaults.stops;
  const selectedStopId =
    typeof value.selectedStopId === 'string' &&
    stops.some((stop) => stop.id === value.selectedStopId)
      ? value.selectedStopId
      : (stops[0]?.id ?? defaults.selectedStopId);

  return {
    type: known(value.type, GRADIENT_TYPES, defaults.type),
    angle: finite(value.angle, defaults.angle, 0, 360),
    interpolation: known(value.interpolation, INTERPOLATIONS, defaults.interpolation),
    stops,
    selectedStopId,
  };
};

export const readStoredStudioStateWithStatus = (): StoredRead<StudioState> => {
  const defaults = createDefaultStudioState();
  const stored = readLocalJson(STUDIO_STORAGE_KEY);
  if (stored.discarded) return { value: defaults, discarded: true };
  if (stored.value === null) return { value: defaults, discarded: false };

  try {
    const value = stored.value;
    if (!isRecord(value)) return { value: defaults, discarded: true };

    const contrast = isRecord(value.contrast) ? value.contrast : {};
    const mixer = isRecord(value.mixer) ? value.mixer : {};

    return {
      value: {
        version: 1,
        activeTool: known(value.activeTool, TOOLS, defaults.activeTool),
        palette: parsePalette(value.palette, defaults.palette),
        gradient: parseGradient(value.gradient, defaults.gradient),
        contrast: {
          foreground:
            typeof contrast.foreground === 'string' && isValidHex(contrast.foreground)
              ? normalizeHex(contrast.foreground)
              : defaults.contrast.foreground,
          background:
            typeof contrast.background === 'string' && isValidHex(contrast.background)
              ? normalizeHex(contrast.background)
              : defaults.contrast.background,
        },
        mixer: {
          start:
            typeof mixer.start === 'string' && isValidHex(mixer.start)
              ? normalizeHex(mixer.start)
              : defaults.mixer.start,
          end:
            typeof mixer.end === 'string' && isValidHex(mixer.end)
              ? normalizeHex(mixer.end)
              : defaults.mixer.end,
          amount: finite(mixer.amount, defaults.mixer.amount, 0, 100),
        },
      },
      discarded: false,
    };
  } catch {
    return { value: defaults, discarded: true };
  }
};

export const readStoredStudioState = (): StudioState => readStoredStudioStateWithStatus().value;

export const writeStoredStudioState = (state: StudioState): void => {
  writeLocalJson(STUDIO_STORAGE_KEY, state);
};
