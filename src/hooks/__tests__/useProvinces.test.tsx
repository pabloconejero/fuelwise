jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../api/minetur', () => ({
  minetur: {
    getProvinces: jest.fn(),
    getMunicipalities: jest.fn(),
    getFuelProducts: jest.fn(),
    getCommunities: jest.fn(),
    getStationsByMunicipality: jest.fn(),
    getStationsByProvince: jest.fn(),
  },
}));

import { act, waitFor, renderHook } from '@testing-library/react-native';
import { minetur } from '../../api/minetur';
import { useProvinces } from '../useProvinces';
import type { Province } from '../../api/minetur';

const PROVINCES: Province[] = [
  { id: '28', communityId: '13', name: 'MADRID', communityName: 'Madrid' },
];

beforeEach(() => {
  jest.clearAllMocks();
  (minetur.getProvinces as jest.Mock).mockResolvedValue(PROVINCES);
});

describe('useProvinces', () => {
  it('loads and returns the provinces list', async () => {
    const { result } = renderHook(() => useProvinces());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(PROVINCES);
  });

  it('exposes a refresh function that re-fetches', async () => {
    const { result } = renderHook(() => useProvinces());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.refresh());
    await waitFor(() =>
      expect(minetur.getProvinces).toHaveBeenCalledTimes(2),
    );
  });
});
