/**
 * Tests for the minetur public facade (index.ts).
 *
 * Strategy: mock the cache and client modules so tests are pure and deterministic.
 * The facade's job is to orchestrate cache reads/writes and client calls correctly —
 * not to retest the client or cache internals.
 */

// Mock AsyncStorage before importing anything that uses it.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
  },
}));

// Mock the cache module with a controllable fake.
jest.mock('../cache', () => {
  const mockCache = {
    getStations: jest.fn().mockResolvedValue(null),
    setStations: jest.fn().mockResolvedValue(undefined),
    getReference: jest.fn().mockResolvedValue(null),
    setReference: jest.fn().mockResolvedValue(undefined),
    clearAll: jest.fn().mockResolvedValue(undefined),
  };
  return { createCache: jest.fn(() => mockCache) };
});

// Mock the client module.
jest.mock('../client', () => {
  const mockClient = { getJson: jest.fn() };
  return { createMineturClient: jest.fn(() => mockClient) };
});

import { createCache } from '../cache';
import { createMineturClient } from '../client';
import { minetur } from '../index';

const mockCache = (createCache as jest.Mock)() as ReturnType<typeof createCache>;
const mockClient = (createMineturClient as jest.Mock)() as ReturnType<typeof createMineturClient>;

const STATIONS_RESPONSE = {
  Fecha: '14/04/2026 10:00:00',
  ListaEESSPrecio: [],
  Nota: '',
  ResultadoConsulta: 'OK',
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: cache miss, client returns a valid empty stations response.
  (mockCache.getStations as jest.Mock).mockResolvedValue(null);
  (mockCache.getReference as jest.Mock).mockResolvedValue(null);
  (mockClient.getJson as jest.Mock).mockResolvedValue(STATIONS_RESPONSE);
});

// ---------------------------------------------------------------------------
// getStationsByMunicipality
// ---------------------------------------------------------------------------

describe('minetur.getStationsByMunicipality', () => {
  it('fetches from network on cache miss and stores result', async () => {
    await minetur.getStationsByMunicipality('4554');

    expect(mockClient.getJson).toHaveBeenCalledTimes(1);
    expect(mockCache.setStations).toHaveBeenCalledTimes(1);
  });

  it('returns cached result and skips network on cache hit', async () => {
    const cached = { fetchedAt: new Date(), stations: [], note: '', resultOk: true };
    (mockCache.getStations as jest.Mock).mockResolvedValue(cached);

    const result = await minetur.getStationsByMunicipality('4554');

    expect(mockClient.getJson).not.toHaveBeenCalled();
    expect(result).toBe(cached);
  });

  it('bypasses cache when force=true', async () => {
    const cached = { fetchedAt: new Date(), stations: [], note: '', resultOk: true };
    (mockCache.getStations as jest.Mock).mockResolvedValue(cached);

    await minetur.getStationsByMunicipality('4554', { force: true });

    expect(mockClient.getJson).toHaveBeenCalledTimes(1);
  });

  it('uses the producto endpoint when fuel is specified', async () => {
    await minetur.getStationsByMunicipality('4554', { fuel: 'G95E5' });

    const [url] = (mockClient.getJson as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain('FiltroMunicipioProducto');
  });

  it('uses the base endpoint when no fuel is specified', async () => {
    await minetur.getStationsByMunicipality('4554');

    const [url] = (mockClient.getJson as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain('FiltroMunicipio/');
    expect(url).not.toContain('Producto');
  });
});

// ---------------------------------------------------------------------------
// getStationsByProvince
// ---------------------------------------------------------------------------

describe('minetur.getStationsByProvince', () => {
  it('fetches from network on cache miss', async () => {
    await minetur.getStationsByProvince('28');
    expect(mockClient.getJson).toHaveBeenCalledTimes(1);
  });

  it('uses the producto endpoint when fuel is specified', async () => {
    await minetur.getStationsByProvince('28', { fuel: 'GOA' });

    const [url] = (mockClient.getJson as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain('FiltroProvinciaProducto');
  });
});

// ---------------------------------------------------------------------------
// In-flight deduplication
// ---------------------------------------------------------------------------

describe('in-flight deduplication', () => {
  it('concurrent calls with the same key share one fetch', async () => {
    let resolveFirst!: (v: typeof STATIONS_RESPONSE) => void;
    const pending = new Promise<typeof STATIONS_RESPONSE>((r) => { resolveFirst = r; });
    (mockClient.getJson as jest.Mock).mockReturnValueOnce(pending);

    const p1 = minetur.getStationsByMunicipality('4554');
    const p2 = minetur.getStationsByMunicipality('4554');
    resolveFirst(STATIONS_RESPONSE);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(mockClient.getJson).toHaveBeenCalledTimes(1);
    expect(r1).toBe(r2); // same reference
  });
});

// ---------------------------------------------------------------------------
// Reference data (getProvinces)
// ---------------------------------------------------------------------------

describe('minetur.getProvinces', () => {
  beforeEach(() => {
    (mockClient.getJson as jest.Mock).mockResolvedValue([
      { IDPovincia: '28', IDCCAA: '13', Provincia: 'MADRID', CCAA: 'Madrid' },
    ]);
  });

  it('fetches from network on cache miss and caches result', async () => {
    const result = await minetur.getProvinces();

    expect(mockClient.getJson).toHaveBeenCalledTimes(1);
    expect(mockCache.setReference).toHaveBeenCalledTimes(1);
    expect(result[0].id).toBe('28');
  });

  it('returns cached result without fetching', async () => {
    const cached = [{ id: '28', communityId: '13', name: 'MADRID', communityName: 'Madrid' }];
    (mockCache.getReference as jest.Mock).mockResolvedValue(cached);

    const result = await minetur.getProvinces();

    expect(mockClient.getJson).not.toHaveBeenCalled();
    expect(result).toBe(cached);
  });
});
