import { mixHexColors, normalizeHex } from '@/lib/studio-color';
import type { GradientStop, GradientStudioState } from '@/types/studio';

const clampPosition = (value: number): number => Math.min(Math.max(Math.round(value), 0), 100);

let stopSequence = 0;

export const createStopId = (): string => {
  stopSequence += 1;
  return `stop-${Date.now()}-${stopSequence}`;
};

export const sortGradientStops = (stops: GradientStop[]): GradientStop[] =>
  [...stops]
    .map((stop) => ({
      ...stop,
      color: normalizeHex(stop.color),
      position: clampPosition(stop.position),
    }))
    .sort((first, second) => first.position - second.position);

const stopList = (stops: GradientStop[]): string =>
  sortGradientStops(stops)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ');

export const buildGradientCss = (state: GradientStudioState, enhanced = false): string => {
  const interpolation =
    enhanced && state.interpolation !== 'srgb' ? ` in ${state.interpolation}` : '';
  const stops = stopList(state.stops);

  switch (state.type) {
    case 'radial':
      return `radial-gradient(circle at center${interpolation}, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${Math.round(state.angle)}deg at center${interpolation}, ${stops})`;
    case 'linear':
      return `linear-gradient(${Math.round(state.angle)}deg${interpolation}, ${stops})`;
  }
};

export const createStopInLargestGap = (stops: GradientStop[], id: string): GradientStop => {
  const sorted = sortGradientStops(stops);
  if (sorted.length === 0) {
    return { id, color: '#808080', position: 50 };
  }
  if (sorted.length === 1) {
    const onlyStop = sorted[0]!;
    return {
      id,
      color: onlyStop.color,
      position: onlyStop.position < 50 ? 100 : 0,
    };
  }

  let gapStart = sorted[0]!;
  let gapEnd = sorted[sorted.length - 1]!;
  let largestGap = -1;

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index]!;
    const next = sorted[index + 1]!;
    const gap = next.position - current.position;
    if (gap > largestGap) {
      gapStart = current;
      gapEnd = next;
      largestGap = gap;
    }
  }

  const position = clampPosition((gapStart.position + gapEnd.position) / 2);
  return {
    id,
    position,
    color: mixHexColors(gapStart.color, gapEnd.color, 50),
  };
};
