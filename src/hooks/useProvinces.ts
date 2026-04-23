import { minetur } from '../api/minetur';
import type { Province } from '../api/minetur';
import { useAsyncResource } from './useAsyncResource';

export function useProvinces() {
  return useAsyncResource<Province[]>(
    ['provinces'],
    (_signal) => minetur.getProvinces(),
  );
}
