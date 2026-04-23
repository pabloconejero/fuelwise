import { MineturApiError, MineturNetworkError, MineturTimeoutError } from './errors';

export interface MineturClientOptions {
  /** Override the base URL for testing (default: production). */
  baseUrl?: string;
  /** Request timeout in ms (default: 10 000). */
  timeoutMs?: number;
  /** Inject a custom fetch implementation (default: global fetch). */
  fetchImpl?: typeof fetch;
}

export interface MineturClient {
  getJson<T>(path: string, signal?: AbortSignal): Promise<T>;
}

/**
 * Creates a thin fetch wrapper for the minetur API.
 *
 * - Enforces `Accept: application/json`
 * - Races each request against an AbortController timeout
 * - Maps HTTP errors, timeouts, and JSON-parse failures to typed error classes
 */
export function createMineturClient(opts: MineturClientOptions = {}): MineturClient {
  const {
    baseUrl = '',
    timeoutMs = 10_000,
    fetchImpl = fetch,
  } = opts;

  async function getJson<T>(path: string, callerSignal?: AbortSignal): Promise<T> {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

    // Combine caller's signal with the internal timeout signal.
    const combinedSignal = callerSignal
      ? anySignal([callerSignal, timeoutController.signal])
      : timeoutController.signal;

    let res: Response;
    try {
      res = await fetchImpl(baseUrl + path, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: combinedSignal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (timeoutController.signal.aborted) {
        throw new MineturTimeoutError(timeoutMs);
      }
      throw new MineturNetworkError('Network request failed', err);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      let body = '';
      try {
        body = await res.text();
      } catch {
        // ignore
      }
      throw new MineturApiError(
        `Minetur API responded with ${res.status}`,
        res.status,
        body.slice(0, 200),
      );
    }

    try {
      return (await res.json()) as T;
    } catch (err) {
      throw new MineturNetworkError('Failed to parse JSON response', err);
    }
  }

  return { getJson };
}

/**
 * Returns an AbortSignal that aborts when ANY of the given signals abort.
 * Polyfill for `AbortSignal.any()` which isn't available on all RN versions.
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}
