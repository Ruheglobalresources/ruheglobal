"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a debounced function that always invokes the LATEST version of
 * `callback` (so the wizard doesn't need to worry about stale closures over
 * `answers`/`currentStep`), plus a `cancel()` escape hatch so an explicit
 * "Save & Continue" / Back click can pre-empt a pending autosave instead of
 * racing it.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debounced = useCallback(
    (...args: Args) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...args);
      }, delayMs);
    },
    [cancel, delayMs]
  );

  useEffect(() => cancel, [cancel]);

  return { debounced, cancel };
}