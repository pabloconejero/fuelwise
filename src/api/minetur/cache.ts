import { dayKey } from '../../utils/dayKey';

// ---------------------------------------------------------------------------
// Storage abstraction (injectable for tests)
// ---------------------------------------------------------------------------

export interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
}

// ---------------------------------------------------------------------------
// Cache entry shapes
// ---------------------------------------------------------------------------

interface StationCacheEntry<T> {
  kind: 'station';
  dayKey: string; // "YYYY-MM-DD" in Europe/Madrid
  savedAt: number;
  payload: T;
}

interface ReferenceCacheEntry<T> {
  kind: 'reference';
  savedAt: number;
  payload: T;
}

type CacheEntry<T> = StationCacheEntry<T> | ReferenceCacheEntry<T>;

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface MineturCache {
  /**
   * Returns cached station data if it was saved on today's Madrid day.
   * Returns null on a miss (different day or key not found).
   */
  getStations<T>(key: string): Promise<T | null>;
  setStations<T>(key: string, payload: T): Promise<void>;

  /**
   * Returns cached reference data if it was saved within the TTL window.
   * Returns null on a miss.
   */
  getReference<T>(key: string, ttlMs?: number): Promise<T | null>;
  setReference<T>(key: string, payload: T): Promise<void>;

  /** Removes all fuelwise:v1:minetur:* keys from storage. */
  clearAll(): Promise<void>;
}

const NAMESPACE = 'fuelwise:v1:minetur:';
const DEFAULT_REFERENCE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createCache(storage: AsyncStorageLike): MineturCache {
  function ns(key: string): string {
    return NAMESPACE + key;
  }

  async function read<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const raw = await storage.getItem(ns(key));
      if (raw === null) return null;
      return JSON.parse(raw) as CacheEntry<T>;
    } catch {
      return null;
    }
  }

  async function write<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    await storage.setItem(ns(key), JSON.stringify(entry));
  }

  return {
    async getStations<T>(key: string): Promise<T | null> {
      const entry = await read<T>(key);
      if (!entry || entry.kind !== 'station') return null;
      const today = dayKey(new Date());
      if (entry.dayKey !== today) return null;
      return entry.payload;
    },

    async setStations<T>(key: string, payload: T): Promise<void> {
      await write<T>(key, {
        kind: 'station',
        dayKey: dayKey(new Date()),
        savedAt: Date.now(),
        payload,
      });
    },

    async getReference<T>(key: string, ttlMs = DEFAULT_REFERENCE_TTL_MS): Promise<T | null> {
      const entry = await read<T>(key);
      if (!entry || entry.kind !== 'reference') return null;
      if (Date.now() - entry.savedAt > ttlMs) return null;
      return entry.payload;
    },

    async setReference<T>(key: string, payload: T): Promise<void> {
      await write<T>(key, {
        kind: 'reference',
        savedAt: Date.now(),
        payload,
      });
    },

    async clearAll(): Promise<void> {
      const allKeys = await storage.getAllKeys();
      await Promise.all(
        allKeys
          .filter((k) => k.startsWith(NAMESPACE))
          .map((k) => storage.removeItem(k)),
      );
    },
  };
}
