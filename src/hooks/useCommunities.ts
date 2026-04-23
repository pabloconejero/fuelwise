import { minetur } from '../api/minetur';
import type { Community } from '../api/minetur';
import { useAsyncResource } from './useAsyncResource';

export function useCommunities() {
  return useAsyncResource<Community[]>(
    ['communities'],
    () => minetur.getCommunities(),
  );
}
