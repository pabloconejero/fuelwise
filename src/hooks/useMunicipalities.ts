import { minetur } from '../api/minetur';
import type { Municipality } from '../api/minetur';
import { useAsyncResource } from './useAsyncResource';

export function useMunicipalities(provinceId: string | null) {
  return useAsyncResource<Municipality[]>(
    [provinceId],
    () => minetur.getMunicipalities(provinceId!),
  );
}
