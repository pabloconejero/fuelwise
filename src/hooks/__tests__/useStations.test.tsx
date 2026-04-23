/**
 * Integration tests for useStationsByMunicipality and useStationsByProvince.
 * The minetur facade is mocked so tests are hermetic and fast.
 */

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
    getStationsByMunicipality: jest.fn(),
    getStationsByProvince: jest.fn(),
    getProvinces: jest.fn(),
    getMunicipalities: jest.fn(),
    getFuelProducts: jest.fn(),
    getCommunities: jest.fn(),
  },
}));

import { waitFor, renderHook, act } from '@testing-library/react-native';
import { minetur } from '../../api/minetur';
import { useStationsByMunicipality, useStationsByProvince } from '../useStations';
import type { StationsResult } from '../../api/minetur';

const RESULT: StationsResult = {
  fetchedAt: new Date('2026-04-14T10:00:00Z'),
  stations: [],
  note: '',
  resultOk: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useStationsByMunicipality', () => {
  it('loads data via the facade', async () => {
    (minetur.getStationsByMunicipality as jest.Mock).mockResolvedValue(RESULT);

    const { result } = renderHook(() => useStationsByMunicipality('4554'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(RESULT);
    expect(result.current.error).toBeNull();
  });

  it('is idle when municipalityId is null', () => {
    const { result } = renderHook(() => useStationsByMunicipality(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(minetur.getStationsByMunicipality).not.toHaveBeenCalled();
  });

  it('passes the fuel filter through to the facade', async () => {
    (minetur.getStationsByMunicipality as jest.Mock).mockResolvedValue(RESULT);
    renderHook(() => useStationsByMunicipality('4554', 'GOA'));

    await waitFor(() =>
      expect(minetur.getStationsByMunicipality).toHaveBeenCalledWith('4554', { fuel: 'GOA' }),
    );
  });

  it('stores an error when the facade rejects', async () => {
    (minetur.getStationsByMunicipality as jest.Mock).mockRejectedValue(
      new Error('API down'),
    );

    const { result } = renderHook(() => useStationsByMunicipality('4554'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe('API down');
    expect(result.current.data).toBeUndefined();
  });

  it('re-fetches when municipalityId changes', async () => {
    (minetur.getStationsByMunicipality as jest.Mock).mockResolvedValue(RESULT);

    let id = '1111';
    const { rerender } = renderHook(() => useStationsByMunicipality(id));
    await waitFor(() =>
      expect(minetur.getStationsByMunicipality).toHaveBeenCalledTimes(1),
    );

    id = '2222';
    rerender({});
    await waitFor(() =>
      expect(minetur.getStationsByMunicipality).toHaveBeenCalledTimes(2),
    );
  });
});

describe('useStationsByProvince', () => {
  it('loads data via the facade', async () => {
    (minetur.getStationsByProvince as jest.Mock).mockResolvedValue(RESULT);

    const { result } = renderHook(() => useStationsByProvince('28'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe(RESULT);
  });

  it('is idle when provinceId is null', () => {
    const { result } = renderHook(() => useStationsByProvince(null));
    expect(result.current.loading).toBe(false);
    expect(minetur.getStationsByProvince).not.toHaveBeenCalled();
  });
});
