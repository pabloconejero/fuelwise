import { minetur } from '../api/minetur';
import type { FuelCode, StationsResult } from '../api/minetur';
import { useAsyncResource } from './useAsyncResource';

export function useStationsByProvince(
  provinceId: string | null,
  fuel?: FuelCode,
) {
  return useAsyncResource<StationsResult>(
    // provinceId=null triggers idle; fuel=undefined is fine (undefined ≠ null)
    [provinceId, fuel],
    () => minetur.getStationsByProvince(provinceId!, { fuel }),
  );
}

export function useStationsByMunicipality(
  municipalityId: string | null,
  fuel?: FuelCode,
) {
  return useAsyncResource<StationsResult>(
    [municipalityId, fuel],
    () => minetur.getStationsByMunicipality(municipalityId!, { fuel }),
  );
}
