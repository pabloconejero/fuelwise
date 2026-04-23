import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncResource<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

/**
 * Generic hook that manages async data loading with:
 * - Initial `loading` state on first fetch
 * - Separate `refreshing` state for pull-to-refresh re-fetches
 * - AbortController cleanup on unmount or `key` change
 * - Error isolation (throws are caught and stored in `error`)
 *
 * @param key   Array of values — when any value changes, the data is re-fetched.
 *              Pass a `null` value anywhere to short-circuit to idle state.
 * @param loader  Async function that receives an AbortSignal and returns data.
 */
export function useAsyncResource<T>(
  key: unknown[],
  loader: (signal: AbortSignal) => Promise<T>,
): AsyncResource<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Track whether any key is null → skip fetching.
  const isIdle = key.some((k) => k === null);

  // Stable ref for the loader to avoid stale closure issues.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  // Track whether we have ever loaded data (distinguishes initial load from refresh).
  const hasData = useRef(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (isRefresh: boolean) => {
      // Cancel any in-flight request.
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await loaderRef.current(controller.signal);
        if (!controller.signal.aborted) {
          setData(result);
          hasData.current = true;
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // We intentionally omit `loader` — we use the ref instead to keep identity stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Re-fetch whenever the key changes.
  useEffect(() => {
    if (isIdle) {
      setData(undefined);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    load(hasData.current);

    return () => {
      abortControllerRef.current?.abort();
    };
    // `key` is spread into deps so any element change triggers the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...key]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, error, loading, refreshing, refresh };
}
