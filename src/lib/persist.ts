export interface StoredRead<T> {
  value: T;
  /** True when stored data existed but was discarded because it was unreadable. */
  discarded: boolean;
}

export const hasStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const readLocalJson = (key: string): StoredRead<unknown | null> => {
  if (!hasStorage()) {
    return { value: null, discarded: false };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { value: null, discarded: false };
    }
    return { value: JSON.parse(raw), discarded: false };
  } catch {
    return { value: null, discarded: true };
  }
};

export const writeLocalJson = (key: string, value: unknown): void => {
  if (!hasStorage()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};
