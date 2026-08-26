import {
  buildGradientCss,
  createStopId,
  createStopInLargestGap,
  sortGradientStops,
} from '@/lib/gradient';
import type { GradientStudioState } from '@/types/studio';

const gradient: GradientStudioState = {
  type: 'linear',
  angle: 128,
  interpolation: 'oklab',
  selectedStopId: 'middle',
  stops: [
    { id: 'end', color: '#00FF00', position: 100 },
    { id: 'start', color: '#FF0000', position: 0 },
    { id: 'middle', color: '#0000FF', position: 40 },
  ],
};

describe('gradient domain', () => {
  it('sorts and clamps stop positions without mutating input', () => {
    const result = sortGradientStops([
      { id: 'b', color: '#fff', position: 140 },
      { id: 'a', color: '#000', position: -10 },
    ]);
    expect(result.map((stop) => stop.position)).toEqual([0, 100]);
    expect(result.map((stop) => stop.color)).toEqual(['#000000', '#FFFFFF']);
  });

  it('serializes compatible and perceptual CSS in stop order', () => {
    expect(buildGradientCss(gradient)).toBe(
      'linear-gradient(128deg, #FF0000 0%, #0000FF 40%, #00FF00 100%)',
    );
    expect(buildGradientCss(gradient, true)).toContain('128deg in oklab');
    expect(buildGradientCss({ ...gradient, type: 'radial' }, true)).toContain(
      'radial-gradient(circle at center in oklab',
    );
  });

  it('creates unique stop ids', () => {
    expect(createStopId()).not.toBe(createStopId());
  });

  it('adds a blended stop in the largest available gap', () => {
    expect(createStopInLargestGap(gradient.stops, 'new')).toEqual({
      id: 'new',
      color: '#008080',
      position: 70,
    });
  });
});
