import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAsyncResource } from '../useAsyncResource';

function makeLoader<T>(result: T) {
  return jest.fn((_signal: AbortSignal) => Promise.resolve(result));
}

function makeFailingLoader(error: Error) {
  return jest.fn((_signal: AbortSignal) => Promise.reject(error));
}

describe('useAsyncResource', () => {
  it('starts in loading state and transitions to data', async () => {
    const loader = makeLoader({ value: 42 });
    const { result } = renderHook(() =>
      useAsyncResource([1], loader),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ value: 42 });
    expect(result.current.error).toBeNull();
  });

  it('captures errors and clears loading', async () => {
    const loader = makeFailingLoader(new Error('fetch failed'));
    const { result } = renderHook(() => useAsyncResource([1], loader));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('fetch failed');
    expect(result.current.data).toBeUndefined();
  });

  it('is idle and has no data when a key is null', async () => {
    const loader = makeLoader({ value: 1 });
    const { result } = renderHook(() => useAsyncResource([null], loader));

    // Stay idle, no loader call.
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(loader).not.toHaveBeenCalled();
  });

  it('re-fetches when key changes', async () => {
    let id = 'a';
    const loader = jest.fn((signal: AbortSignal) =>
      Promise.resolve(`data for ${id}`),
    );

    const { result, rerender } = renderHook(() =>
      useAsyncResource([id], loader),
    );

    await waitFor(() => expect(result.current.data).toBe('data for a'));
    expect(loader).toHaveBeenCalledTimes(1);

    id = 'b';
    rerender({});

    await waitFor(() => expect(result.current.data).toBe('data for b'));
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('sets refreshing=true (not loading=true) on refresh() when data already exists', async () => {
    // First call resolves immediately; second (refresh) never resolves so we
    // can observe the in-flight refreshing state before it completes.
    let resolveRefresh!: (v: { value: number }) => void;
    const loader = jest
      .fn<Promise<{ value: number }>, [AbortSignal]>()
      .mockResolvedValueOnce({ value: 1 })
      .mockImplementationOnce(
        () => new Promise<{ value: number }>((r) => { resolveRefresh = r; }),
      );

    const { result } = renderHook(() => useAsyncResource([1], loader));
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Start refresh (synchronous part of the async fn runs inside act).
    act(() => { void result.current.refresh(); });

    expect(result.current.refreshing).toBe(true);
    expect(result.current.loading).toBe(false);

    // Let the refresh complete and verify state cleans up.
    await act(async () => resolveRefresh({ value: 2 }));
    expect(result.current.refreshing).toBe(false);
  });

  it('aborts in-flight request on unmount', async () => {
    let capturedSignal: AbortSignal | undefined;
    const loader = jest.fn((signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise<string>(() => {}); // never resolves
    });

    const { unmount } = renderHook(() => useAsyncResource([1], loader));

    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
