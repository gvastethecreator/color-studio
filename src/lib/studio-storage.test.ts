import {
  createDefaultStudioState,
  readStoredStudioState,
  STUDIO_STORAGE_KEY,
  writeStoredStudioState,
} from '@/lib/studio-storage';

describe('studio storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips a versioned workbench state', () => {
    const state = createDefaultStudioState();
    state.activeTool = 'gradient';
    state.palette.count = 6;
    state.palette.colors = [...state.palette.colors, '#112233'];
    writeStoredStudioState(state);

    const restored = readStoredStudioState();
    expect(restored.activeTool).toBe('gradient');
    expect(restored.palette.count).toBe(6);
    expect(restored.palette.colors).toHaveLength(6);
  });

  it('falls back from malformed storage', () => {
    window.localStorage.setItem(STUDIO_STORAGE_KEY, '{not-json');
    expect(readStoredStudioState()).toEqual(createDefaultStudioState());
  });

  it('repairs invalid colors and underfilled gradients', () => {
    window.localStorage.setItem(
      STUDIO_STORAGE_KEY,
      JSON.stringify({
        activeTool: 'unknown',
        palette: { seed: 'bad', count: 6, colors: ['#fff'] },
        gradient: { stops: [{ id: 'only', color: '#fff', position: 200 }] },
        contrast: { foreground: '#abc', background: 'bad' },
      }),
    );

    const restored = readStoredStudioState();
    expect(restored.activeTool).toBe('palette');
    expect(restored.palette.colors).toHaveLength(6);
    expect(restored.gradient.stops).toHaveLength(3);
    expect(restored.contrast.foreground).toBe('#AABBCC');
  });

  it('repairs duplicate stop ids and keeps up to eight valid stops', () => {
    window.localStorage.setItem(
      STUDIO_STORAGE_KEY,
      JSON.stringify({
        gradient: {
          selectedStopId: 'duplicate',
          stops: [
            { id: 'invalid', color: 'bad', position: 0 },
            ...Array.from({ length: 9 }, (_, index) => ({
              id: 'duplicate',
              color: '#123456',
              position: index * 12,
            })),
          ],
        },
      }),
    );

    const restored = readStoredStudioState();
    expect(restored.gradient.stops).toHaveLength(8);
    expect(new Set(restored.gradient.stops.map((stop) => stop.id))).toHaveProperty('size', 8);
    expect(restored.gradient.selectedStopId).toBe('duplicate');
  });
});
