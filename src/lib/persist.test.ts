import { readLocalJson, writeLocalJson } from '@/lib/persist';

describe('persist adapter', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips JSON and reports discarded malformed data', () => {
    writeLocalJson('color-studio.test', { ok: true });
    expect(readLocalJson('color-studio.test')).toEqual({ value: { ok: true }, discarded: false });

    window.localStorage.setItem('color-studio.test', '{nope');
    expect(readLocalJson('color-studio.test')).toEqual({ value: null, discarded: true });
  });
});
