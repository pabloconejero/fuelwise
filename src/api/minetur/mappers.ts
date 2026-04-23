import { parseSpanishDate } from '../../utils/parseSpanishDate';
import { parseSpanishNumber } from '../../utils/parseSpanishNumber';
import {
  type Community,
  type FuelProduct,
  type Municipality,
  type PriceKey,
  PRICE_KEY_TO_CODE,
  type Province,
  type RawCommunity,
  type RawFuelProduct,
  type RawMunicipality,
  type RawProvince,
  type RawStation,
  type RawStationsResponse,
  type Station,
  type StationsResult,
} from './minetur.types';

export function mapStation(raw: RawStation): Station {
  const prices: Station['prices'] = {};

  for (const rawKey of Object.keys(PRICE_KEY_TO_CODE) as PriceKey[]) {
    const code = PRICE_KEY_TO_CODE[rawKey];
    const value = (raw as unknown as Record<string, string>)[rawKey];
    const parsed = parseSpanishNumber(value ?? '');
    if (parsed !== null) {
      prices[code] = parsed;
    }
  }

  const side: Station['side'] =
    raw['Margen'] === 'I' ? 'left'
    : raw['Margen'] === 'D' ? 'right'
    : raw['Margen'] === 'N' ? 'center'
    : 'unknown';

  const saleType: Station['saleType'] =
    raw['Tipo Venta'] === 'P' ? 'public'
    : raw['Tipo Venta'] === 'R' ? 'restricted'
    : 'unknown';

  return {
    id: raw['IDEESS'],
    brand: raw['Rótulo'],
    address: raw['Dirección'],
    postalCode: raw['C.P.'],
    schedule: raw['Horario'],
    latitude: parseSpanishNumber(raw['Latitud']) ?? 0,
    longitude: parseSpanishNumber(raw['Longitud (WGS84)']) ?? 0,
    side,
    locality: raw['Localidad'],
    municipality: { id: raw['IDMunicipio'], name: raw['Municipio'] },
    province: { id: raw['IDProvincia'], name: raw['Provincia'] },
    community: { id: raw['IDCCAA'] },
    saleType,
    bioethanolPct: parseSpanishNumber(raw['% BioEtanol']),
    biodieselPct: parseSpanishNumber(raw['% Éster metílico']),
    prices,
  };
}

export function mapStationsResponse(raw: RawStationsResponse): StationsResult {
  return {
    fetchedAt: parseSpanishDate(raw.Fecha) ?? new Date(0),
    stations: raw.ListaEESSPrecio.map(mapStation),
    note: raw.Nota,
    resultOk: raw.ResultadoConsulta === 'OK',
  };
}

export function mapProvince(raw: RawProvince): Province {
  return {
    id: raw.IDPovincia, // Intentional: the API misspells this field name
    communityId: raw.IDCCAA,
    name: raw.Provincia,
    communityName: raw.CCAA,
  };
}

export function mapMunicipality(raw: RawMunicipality): Municipality {
  return {
    id: raw.IDMunicipio,
    provinceId: raw.IDProvincia,
    communityId: raw.IDCCAA,
    name: raw.Municipio,
    provinceName: raw.Provincia,
    communityName: raw.CCAA,
  };
}

export function mapCommunity(raw: RawCommunity): Community {
  return {
    id: raw.IDCCAA,
    name: raw.CCAA,
  };
}

export function mapFuelProduct(raw: RawFuelProduct): FuelProduct {
  return {
    id: raw.IDProducto,
    name: raw.NombreProducto,
    abbreviation: raw.NombreProductoAbreviatura,
  };
}
