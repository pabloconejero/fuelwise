import { Community, Municipality, Province } from '@/types/location';
import { FuelProduct } from '@/types/fuelProduct';
import { Station } from '@/types/station';
import {
  RawCommunity,
  RawFuelProduct,
  RawMunicipality,
  RawProvince,
  RawStation,
} from './types';

type ApiStation = Omit<Station, 'distance' | 'color' | 'trend' | 'history'>;

function parseSpanishFloat(value: string): number | undefined {
  if (!value) return undefined;
  const n = parseFloat(value.replace(',', '.'));
  return isNaN(n) ? undefined : n;
}

export function mapStation(raw: RawStation): ApiStation {
  return {
    id: raw['IDEESS'],
    name: raw['Rótulo'],
    address: raw['Dirección'],
    mapX: parseSpanishFloat(raw['Longitud (WGS84)']) ?? 0,
    mapY: parseSpanishFloat(raw['Latitud']) ?? 0,
    prices: {
      '95': parseSpanishFloat(raw['Precio Gasolina 95 E5']),
      '98': parseSpanishFloat(raw['Precio Gasolina 98 E5']),
      diesel: parseSpanishFloat(raw['Precio Gasoleo A']),
    },
  };
}

export function mapProvince(raw: RawProvince): Province {
  return {
    id: raw['IDPovincia'],  // preserving API typo intentionally
    communityId: raw['IDCCAA'],
    name: raw['Provincia'],
    communityName: raw['CCAA'],
  };
}

export function mapMunicipality(raw: RawMunicipality): Municipality {
  return {
    id: raw['IDMunicipio'],
    provinceId: raw['IDProvincia'],
    communityId: raw['IDCCAA'],
    name: raw['Municipio'],
    provinceName: raw['Provincia'],
    communityName: raw['CCAA'],
  };
}

export function mapCommunity(raw: RawCommunity): Community {
  return {
    id: raw['IDCCAA'],
    name: raw['CCAA'],
  };
}

export function mapFuelProduct(raw: RawFuelProduct): FuelProduct {
  return {
    id: raw['IDProducto'],
    name: raw['NombreProducto'],
    shortName: raw['NombreProductoAbreviatura'],
  };
}
