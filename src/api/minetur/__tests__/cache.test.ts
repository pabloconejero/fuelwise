import { createCache } from '../cache';
import type { AsyncStorageLike } from '../cache';

// ---------------------------------------------------------------------------
// In-memory AsyncStorage fake — no native modules required
// ---------------------------------------------------------------------------
function createFakeStorage(): AsyncStorageLike {
  const store = new Map<string, string>();
  return {
    getItem: jest.fn((key) => Promise.resolve(store.get(key) ?? null)),
    setItem: jest.fn((key, value) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      store.delete(key);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve([...store.keys()])),
  };
}

afterEach(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('cache — station entries', () => {
  it('returns null on a cold cache', async () => {
    const cache = createCache(createFakeStorage());
    expect(await cache.getStations('test')).toBeNull();
  });

  it('returns payload on same-day hit', async () => {
    const cache = createCache(createFakeStorage());
    const payload = { stations: [{ id: '1' }] };
    await cache.setStations('stations:28', payload);
    expect(await cache.getStations('stations:28')).toEqual(payload);
  });

  it('returns null when the stored day key does not match today', async () => {
    // Save while system time is "yesterday" (2026-04-13 noon UTC / afternoon Madrid).
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-13T12:00:00.000Z'));

    const storage = createFakeStorage();
    const cache = createCache(storage);
    await cache.setStations('stations:28', { stale: true });

    // Advance to "tomorrow" (2026-04-14) and verify cache miss.
    jest.setSystemTime(new Date('2026-04-14T12:00:00.000Z'));
    const result = await cache.getStations('stations:28');
    expect(result).toBeNull();
  });

  it('returns null for a reference entry stored under a station key', async () => {
    const storage = createFakeStorage();
    const cache = createCache(storage);
    // Manually plant a reference entry under a station key.
    await (storage.setItem as jest.Mock)(
      'fuelwise:v1:minetur:stations:28',
      JSON.stringify({ kind: 'reference', savedAt: Date.now(), payload: {} }),
    );
    expect(await cache.getStations('stations:28')).toBeNull();
  });
});

describe('cache — reference entries', () => {
  it('returns payload within TTL', async () => {
    const cache = createCache(createFakeStorage());
    const payload = ['madrid', 'barcelona'];
    await cache.setReference('provinces', payload);
    expect(await cache.getReference('provinces')).toEqual(payload);
  });

  it('returns null after TTL expires', async () => {
    jest.useFakeTimers();
    const start = new Date('2026-04-14T12:00:00.000Z');
    jest.setSystemTime(start);

    const cache = createCache(createFakeStorage());
    await cache.setReference('provinces', ['data']);

    // Jump 2 seconds into the future — past a 1-second TTL.
    jest.setSystemTime(new Date(start.getTime() + 2000));
    const result = await cache.getReference('provinces', 1000);
    expect(result).toBeNull();
  });

  it('returns null on a cold cache', async () => {
    const cache = createCache(createFakeStorage());
    expect(await cache.getReference('provinces')).toBeNull();
  });
});

describe('cache — clearAll', () => {
  it('removes all fuelwise:v1:minetur:* keys', async () => {
    const storage = createFakeStorage();
    const cache = createCache(storage);

    await cache.setReference('provinces', ['data']);
    await cache.setStations('stations:28', { stations: [] });

    await cache.clearAll();

    expect(await cache.getReference('provinces')).toBeNull();
    expect(await cache.getStations('stations:28')).toBeNull();
  });

  it('does not remove non-namespace keys', async () => {
    const storage = createFakeStorage();
    // Plant a key outside our namespace.
    await storage.setItem('other:key', 'unrelated');

    const cache = createCache(storage);
    await cache.setReference('provinces', ['data']);
    await cache.clearAll();

    // The non-namespace key should still be present.
    expect(await storage.getItem('other:key')).toBe('unrelated');
  });
});
