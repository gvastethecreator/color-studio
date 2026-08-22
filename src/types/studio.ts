export type StudioToolId = 'palette' | 'gradient' | 'scale' | 'contrast';

export type HarmonyId =
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'monochromatic';

export type PaletteSize = 5 | 6;

export interface PaletteComposerState {
  seed: string;
  harmony: HarmonyId;
  count: PaletteSize;
  chroma: number;
  lightness: number;
  colors: string[];
}

export type GradientType = 'linear' | 'radial' | 'conic';
export type GradientInterpolation = 'srgb' | 'oklab' | 'oklch';

export interface GradientStop {
  id: string;
  color: string;
  position: number;
}

export interface GradientStudioState {
  type: GradientType;
  angle: number;
  interpolation: GradientInterpolation;
  stops: GradientStop[];
  selectedStopId: string;
}

export interface ContrastStudioState {
  foreground: string;
  background: string;
}

export interface MixerStudioState {
  start: string;
  end: string;
  amount: number;
}

export interface StudioState {
  version: 1;
  activeTool: StudioToolId;
  palette: PaletteComposerState;
  gradient: GradientStudioState;
  contrast: ContrastStudioState;
  mixer: MixerStudioState;
}

export interface StudioNotifyOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Restores the previous state when the toast action activates. */
  undo?: () => void;
}

export type StudioNotify = (message: string, options?: StudioNotifyOptions) => void;
