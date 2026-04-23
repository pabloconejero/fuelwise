import { minetur } from '../api/minetur';
import type { FuelProduct } from '../api/minetur';
import { useAsyncResource } from './useAsyncResource';

export function useFuelProducts() {
  return useAsyncResource<FuelProduct[]>(
    ['fuelProducts'],
    () => minetur.getFuelProducts(),
  );
}
