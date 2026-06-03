'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface DebouncedCommitApi<T> {
  /** Local value that updates immediately during interaction. */
  localValue: T;
  /** Schedule a new value. Replaces any pending commit. */
  update: (next: T) => void;
  /** Flush the pending value right now (e.g. on pointer release). */
  commitNow: () => void;
  /** True while a debounce timer is pending. */
  isPending: boolean;
}

const DEFAULT_DEBOUNCE_MS = 80;

/**
 * Slider-friendly commit pipeline.
 *
 * - `localValue` updates synchronously so the slider can render the new value
 *   while the user is still dragging.
 * - `update` debounces the underlying commit. Each new value resets the timer.
 * - `commitNow` flushes immediately, used for the slider's
 *   `onValueCommitted` callback (pointerup / keyboard release).
 */
export function useDebouncedCommit<T>(
  value: T,
  commit: (next: T) => void,
  delay: number = DEFAULT_DEBOUNCE_MS,
): DebouncedCommitApi<T> {
  const [localValue, setLocalValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<number | null>(null);
  const commitRef = useRef(commit);
  const valueRef = useRef(value);

  commitRef.current = commit;
  valueRef.current = value;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setLocalValue(value);
    clearTimer();
    setIsPending(false);
    return clearTimer;
  }, [value, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const update = useCallback(
    (next: T) => {
      setLocalValue(next);
      clearTimer();
      setIsPending(true);
      timerRef.current = window.setTimeout(() => {
        commitRef.current(next);
        timerRef.current = null;
        setIsPending(false);
      }, delay);
    },
    [clearTimer, delay],
  );

  const commitNow = useCallback(() => {
    if (timerRef.current === null && valueRef.current === localValue) {
      return;
    }

    clearTimer();
    commitRef.current(localValue);
    setIsPending(false);
  }, [clearTimer, localValue]);

  return { localValue, update, commitNow, isPending };
}
