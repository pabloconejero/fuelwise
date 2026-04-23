import AsyncStorage from '@react-native-async-storage/async-storage';

import { createCache } from './cache';
import { createMineturClient } from './client';
import { endpoints } from './endpoints';
import {
  mapCommunity,
  mapFuelProduct,
  mapMunicipality,
  mapProvince,
  mapStationsResponse,
} from './mappers';
import type {
  Community,
  FuelCode,
  FuelProduct,
  Municipality,
  Province,
  RawCommunity,
  RawFuelProduct,
  RawMunicipality,
  RawProvince,
  RawStationsResponse,
  StationsResult,
} from './minetur.types';

// ---------------------------------------------------------------------------
// Module-level singletons (production)
// ---------------------------------------------------------------------------

const client = createMineturClient();
const cache = createCache(AsyncStorage);

/** In-flight request registry: prevents duplicate concurrent fetches. */
const inflight = new Map<string, Promise<unknown>>();

async function deduped<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = loader().finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Public API surface
// ---------------------------------------------------------------------------

export const minetur = {
  async getCommunities(): Promise<Community[]> {
    return deduped('communities', async () => {
      const cached = await cache.getReference<Community[]>('communities');
      if (cached) return cached;

      const raw = await client.getJson<RawCommunity[]>(endpoints.communities());
      const result = raw.map(mapCommunity);
      await cache.setReference('communities', result);
      return result;
    });
  },

  async getProvinces(): Promise<Province[]> {
    return deduped('provinces', async () => {
      const cached = await cache.getReference<Province[]>('provinces');
      if (cached) return cached;

      const raw = await client.getJson<RawProvince[]>(endpoints.provinces());
      const result = raw.map(mapProvince);
      await cache.setReference('provinces', result);
      return result;
    });
  },

  async getMunicipalities(provinceId: string): Promise<Municipality[]> {
    const cacheKey = `municipalities:${provinceId}`;
    return deduped(cacheKey, async () => {
      const cached = await cache.getReference<Municipality[]>(cacheKey);
      if (cached) return cached;

      const raw = await client.getJson<RawMunicipality[]>(
        endpoints.municipalities(provinceId),
      );
      const result = raw.map(mapMunicipality);
      await cache.setReference(cacheKey, result);
      return result;
    });
  },

  async getFuelProducts(): Promise<FuelProduct[]> {
    return deduped('fuelProducts', async () => {
      const cached = await cache.getReference<FuelProduct[]>('fuelProducts');
      if (cached) return cached;

      const raw = await client.getJson<RawFuelProduct[]>(endpoints.fuelProducts());
      const result = raw.map(mapFuelProduct);
      await cache.setReference('fuelProducts', result);
      return result;
    });
  },

  async getStationsByProvince(
    provinceId: string,
    opts: { fuel?: FuelCode; force?: boolean } = {},
  ): Promise<StationsResult> {
    const { fuel, force = false } = opts;
    const cacheKey = fuel
      ? `stations:province:${provinceId}:${fuel}`
      : `stations:province:${provinceId}`;

    return deduped(cacheKey, async () => {
      if (!force) {
        const cached = await cache.getStations<StationsResult>(cacheKey);
        if (cached) return cached;
      }

      const url = fuel
        ? endpoints.stationsByProvinceAndProduct(provinceId, fuel)
        : endpoints.stationsByProvince(provinceId);

      const raw = await client.getJson<RawStationsResponse>(url);
      if (raw.ResultadoConsulta !== 'OK') {
        const { MineturApiError } = await import('./errors');
        throw new MineturApiError(
          `API returned ResultadoConsulta="${raw.ResultadoConsulta}"`,
          200,
          '',
        );
      }

      const result = mapStationsResponse(raw);
      await cache.setStations(cacheKey, result);
      return result;
    });
  },

  async getStationsByMunicipality(
    municipalityId: string,
    opts: { fuel?: FuelCode; force?: boolean } = {},
  ): Promise<StationsResult> {
    const { fuel, force = false } = opts;
    const cacheKey = fuel
      ? `stations:municipality:${municipalityId}:${fuel}`
      : `stations:municipality:${municipalityId}`;

    return deduped(cacheKey, async () => {
      if (!force) {
        const cached = await cache.getStations<StationsResult>(cacheKey);
        if (cached) return cached;
      }

      const url = fuel
        ? endpoints.stationsByMunicipalityAndProduct(municipalityId, fuel)
        : endpoints.stationsByMunicipality(municipalityId);

      const raw = await client.getJson<RawStationsResponse>(url);
      if (raw.ResultadoConsulta !== 'OK') {
        const { MineturApiError } = await import('./errors');
        throw new MineturApiError(
          `API returned ResultadoConsulta="${raw.ResultadoConsulta}"`,
          200,
          '',
        );
      }

      const result = mapStationsResponse(raw);
      await cache.setStations(cacheKey, result);
      return result;
    });
  },
};

// Re-export types used by consumers (hooks, screens)
export type {
  Community,
  FuelCode,
  FuelProduct,
  Municipality,
  Province,
  StationsResult,
} from './minetur.types';
export type { Station } from './minetur.types';
