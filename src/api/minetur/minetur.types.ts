// ---------------------------------------------------------------------------
// Raw types — model the minetur API wire format exactly.
// Field names use quoted string syntax because they contain spaces, accents,
// parentheses and % signs (this is the JSON variant; no _x0020_ encoding).
// ---------------------------------------------------------------------------

export interface RawStation {
  'C.P.': string;
  'Dirección': string;
  'Horario': string;
  'Latitud': string;
  'Localidad': string;
  'Longitud (WGS84)': string;
  'Margen': string; // "I" = left, "D" = right, "N" = center/none
  'Municipio': string;
  'Provincia': string;
  'Remisión': string;
  'Rótulo': string;
  'Tipo Venta': string; // "P" = public, "R" = restricted
  '% BioEtanol': string;
  '% Éster metílico': string;
  'IDEESS': string;
  'IDMunicipio': string;
  'IDProvincia': string;
  'IDCCAA': string;
  'Precio Gasolina 95 E5': string;
  'Precio Gasolina 95 E10': string;
  'Precio Gasolina 95 E25': string;
  'Precio Gasolina 95 E85': string;
  'Precio Gasolina 95 E5 Premium': string;
  'Precio Gasolina 98 E5': string;
  'Precio Gasolina 98 E10': string;
  'Precio Gasoleo A': string;
  'Precio Gasoleo Premium': string;
  'Precio Gasoleo B': string;
  'Precio Bioetanol': string;
  'Precio Biodiesel': string;
  'Precio Gases licuados del petróleo': string;
  'Precio Gas Natural Comprimido': string;
  'Precio Gas Natural Licuado': string;
  'Precio Hidrogeno': string;
  'Precio Adblue': string;
  'Precio Amoniaco': string;
  'Precio Metanol': string;
  'Precio Diésel Renovable': string;
  'Precio Gasolina Renovable': string;
  'Precio Biogas Natural Comprimido': string;
  'Precio Biogas Natural Licuado': string;
}

export interface RawStationsResponse {
  Fecha: string; // "DD/MM/YYYY H:MM:SS"
  ListaEESSPrecio: RawStation[];
  Nota: string;
  ResultadoConsulta: string; // "OK" on success
}

export interface RawProvince {
  IDPovincia: string; // API typo: missing 'r' — all other endpoints use IDProvincia
  IDCCAA: string;
  Provincia: string;
  CCAA: string;
}

export interface RawMunicipality {
  IDMunicipio: string;
  IDProvincia: string;
  IDCCAA: string;
  Municipio: string;
  Provincia: string;
  CCAA: string;
}

export interface RawCommunity {
  IDCCAA: string;
  CCAA: string;
}

export interface RawFuelProduct {
  IDProducto: string;
  NombreProducto: string;
  NombreProductoAbreviatura: string;
}

// ---------------------------------------------------------------------------
// Clean domain types — what the rest of the app consumes.
// ---------------------------------------------------------------------------

/**
 * Stable short codes for every fuel product the API tracks.
 * Used as keys in FuelPrices and as filter parameters to API calls.
 */
export type FuelCode =
  | 'G95E5'
  | 'G95E10'
  | 'G95E25'
  | 'G95E85'
  | 'G95E5_PREMIUM'
  | 'G98E5'
  | 'G98E10'
  | 'GOA'
  | 'GOA_PREMIUM'
  | 'GOB'
  | 'GLP'
  | 'GNC'
  | 'GNL'
  | 'BIO'
  | 'BIE'
  | 'H2'
  | 'ADB'
  | 'AMO'
  | 'MET'
  | 'DREN'
  | 'GREN'
  | 'BGNC'
  | 'BGNL';

/** Prices available at a station. Absence of a key means the fuel is not sold. */
export type FuelPrices = Partial<Record<FuelCode, number>>;

export interface Station {
  id: string;
  brand: string;
  address: string;
  postalCode: string;
  schedule: string;
  latitude: number;
  longitude: number;
  side: 'left' | 'right' | 'center' | 'unknown';
  locality: string;
  municipality: { id: string; name: string };
  province: { id: string; name: string };
  community: { id: string };
  saleType: 'public' | 'restricted' | 'unknown';
  bioethanolPct: number | null;
  biodieselPct: number | null;
  prices: FuelPrices;
}

export interface StationsResult {
  fetchedAt: Date;
  stations: Station[];
  note: string;
  resultOk: boolean;
}

export interface Province {
  id: string;
  communityId: string;
  name: string;
  communityName: string;
}

export interface Municipality {
  id: string;
  provinceId: string;
  communityId: string;
  name: string;
  provinceName: string;
  communityName: string;
}

export interface Community {
  id: string;
  name: string;
}

export interface FuelProduct {
  id: string;
  name: string;
  abbreviation: string;
}

// ---------------------------------------------------------------------------
// Mapping table: raw "Precio *" key → FuelCode
// This is the single source of truth for price field resolution.
// The `satisfies` guard ensures every value is a valid FuelCode at compile time.
// ---------------------------------------------------------------------------

export const PRICE_KEY_TO_CODE = {
  'Precio Gasolina 95 E5': 'G95E5',
  'Precio Gasolina 95 E10': 'G95E10',
  'Precio Gasolina 95 E25': 'G95E25',
  'Precio Gasolina 95 E85': 'G95E85',
  'Precio Gasolina 95 E5 Premium': 'G95E5_PREMIUM',
  'Precio Gasolina 98 E5': 'G98E5',
  'Precio Gasolina 98 E10': 'G98E10',
  'Precio Gasoleo A': 'GOA',
  'Precio Gasoleo Premium': 'GOA_PREMIUM',
  'Precio Gasoleo B': 'GOB',
  'Precio Gases licuados del petróleo': 'GLP',
  'Precio Gas Natural Comprimido': 'GNC',
  'Precio Gas Natural Licuado': 'GNL',
  'Precio Bioetanol': 'BIE',
  'Precio Biodiesel': 'BIO',
  'Precio Hidrogeno': 'H2',
  'Precio Adblue': 'ADB',
  'Precio Amoniaco': 'AMO',
  'Precio Metanol': 'MET',
  'Precio Diésel Renovable': 'DREN',
  'Precio Gasolina Renovable': 'GREN',
  'Precio Biogas Natural Comprimido': 'BGNC',
  'Precio Biogas Natural Licuado': 'BGNL',
} as const satisfies Record<string, FuelCode>;

export type PriceKey = keyof typeof PRICE_KEY_TO_CODE;
