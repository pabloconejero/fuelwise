import {
  mapCommunity,
  mapFuelProduct,
  mapMunicipality,
  mapProvince,
  mapStation,
  mapStationsResponse,
} from '../mappers';
import type { RawStation, RawStationsResponse } from '../minetur.types';
import { PRICE_KEY_TO_CODE } from '../minetur.types';

// ---------------------------------------------------------------------------
// Golden sample: a real station record representative of the API response
// (Repsol Ajalvir, province Madrid, captured 2026-04-13).
// ---------------------------------------------------------------------------
const GOLDEN_STATION: RawStation = {
  'C.P.': '28864',
  'Dirección': 'CL MAYOR, 1',
  'Horario': 'L-D: 24H',
  'Latitud': '40,528028',
  'Localidad': 'AJALVIR',
  'Longitud (WGS84)': '-3,471167',
  'Margen': 'D',
  'Municipio': 'Ajalvir',
  'Provincia': 'MADRID',
  'Remisión': 'dm',
  'Rótulo': 'REPSOL',
  'Tipo Venta': 'P',
  '% BioEtanol': '0,0',
  '% Éster metílico': '7,0',
  'IDEESS': '1234',
  'IDMunicipio': '4554',
  'IDProvincia': '28',
  'IDCCAA': '13',
  'Precio Gasolina 95 E5': '1,659',
  'Precio Gasolina 95 E10': '',
  'Precio Gasolina 95 E25': '',
  'Precio Gasolina 95 E85': '',
  'Precio Gasolina 95 E5 Premium': '',
  'Precio Gasolina 98 E5': '1,799',
  'Precio Gasolina 98 E10': '',
  'Precio Gasoleo A': '1,539',
  'Precio Gasoleo Premium': '1,629',
  'Precio Gasoleo B': '',
  'Precio Bioetanol': '',
  'Precio Biodiesel': '',
  'Precio Gases licuados del petróleo': '',
  'Precio Gas Natural Comprimido': '',
  'Precio Gas Natural Licuado': '',
  'Precio Hidrogeno': '',
  'Precio Adblue': '0,299',
  'Precio Amoniaco': '',
  'Precio Metanol': '',
  'Precio Diésel Renovable': '',
  'Precio Gasolina Renovable': '',
  'Precio Biogas Natural Comprimido': '',
  'Precio Biogas Natural Licuado': '',
};

describe('mapStation (golden sample)', () => {
  const station = mapStation(GOLDEN_STATION);

  it('maps identifiers correctly', () => {
    expect(station.id).toBe('1234');
    expect(station.municipality.id).toBe('4554');
    expect(station.province.id).toBe('28');
    expect(station.community.id).toBe('13');
  });

  it('maps text fields', () => {
    expect(station.brand).toBe('REPSOL');
    expect(station.address).toBe('CL MAYOR, 1');
    expect(station.postalCode).toBe('28864');
    expect(station.schedule).toBe('L-D: 24H');
    expect(station.locality).toBe('AJALVIR');
    expect(station.municipality.name).toBe('Ajalvir');
    expect(station.province.name).toBe('MADRID');
  });

  it('parses coordinates from comma-decimal strings', () => {
    expect(station.latitude).toBeCloseTo(40.528028);
    expect(station.longitude).toBeCloseTo(-3.471167);
  });

  it('maps side codes', () => {
    expect(station.side).toBe('right'); // Margen = D
  });

  it('maps sale type', () => {
    expect(station.saleType).toBe('public'); // Tipo Venta = P
  });

  it('maps percentage fields', () => {
    expect(station.bioethanolPct).toBeCloseTo(0.0);
    expect(station.biodieselPct).toBeCloseTo(7.0);
  });

  it('maps present fuel prices to numbers', () => {
    expect(station.prices.G95E5).toBeCloseTo(1.659);
    expect(station.prices.G98E5).toBeCloseTo(1.799);
    expect(station.prices.GOA).toBeCloseTo(1.539);
    expect(station.prices.GOA_PREMIUM).toBeCloseTo(1.629);
    expect(station.prices.ADB).toBeCloseTo(0.299);
  });

  it('omits prices for fuels the station does not sell', () => {
    expect(station.prices.G95E10).toBeUndefined();
    expect(station.prices.H2).toBeUndefined();
    expect(station.prices.GNC).toBeUndefined();
  });
});

describe('mapStation — Margen and Tipo Venta variants', () => {
  function stationWith(overrides: Partial<RawStation>): RawStation {
    return { ...GOLDEN_STATION, ...overrides };
  }

  it('maps Margen I → left', () => {
    expect(mapStation(stationWith({ Margen: 'I' })).side).toBe('left');
  });

  it('maps Margen N → center', () => {
    expect(mapStation(stationWith({ Margen: 'N' })).side).toBe('center');
  });

  it('maps unknown Margen → unknown', () => {
    expect(mapStation(stationWith({ Margen: '' })).side).toBe('unknown');
  });

  it('maps Tipo Venta R → restricted', () => {
    expect(mapStation(stationWith({ 'Tipo Venta': 'R' })).saleType).toBe('restricted');
  });

  it('maps unknown Tipo Venta → unknown', () => {
    expect(mapStation(stationWith({ 'Tipo Venta': 'X' })).saleType).toBe('unknown');
  });
});

describe('mapStationsResponse', () => {
  const raw: RawStationsResponse = {
    Fecha: '14/04/2026 0:28:19',
    ListaEESSPrecio: [GOLDEN_STATION],
    Nota: 'Some note',
    ResultadoConsulta: 'OK',
  };

  it('maps resultOk', () => {
    expect(mapStationsResponse(raw).resultOk).toBe(true);
    expect(mapStationsResponse({ ...raw, ResultadoConsulta: 'ERROR' }).resultOk).toBe(false);
  });

  it('parses Fecha into a Date', () => {
    const result = mapStationsResponse(raw);
    expect(result.fetchedAt).toBeInstanceOf(Date);
    expect(result.fetchedAt.getFullYear()).toBe(2026);
  });

  it('maps all stations', () => {
    const result = mapStationsResponse(raw);
    expect(result.stations).toHaveLength(1);
    expect(result.stations[0].id).toBe('1234');
  });

  it('preserves the note', () => {
    expect(mapStationsResponse(raw).note).toBe('Some note');
  });
});

describe('mapProvince — IDPovincia typo', () => {
  it('renames IDPovincia (misspelled) to id', () => {
    const result = mapProvince({
      IDPovincia: '28',
      IDCCAA: '13',
      Provincia: 'MADRID',
      CCAA: 'Madrid',
    });
    expect(result.id).toBe('28');
    expect(result.communityId).toBe('13');
    expect(result.name).toBe('MADRID');
    expect(result.communityName).toBe('Madrid');
  });
});

describe('mapMunicipality', () => {
  it('maps all fields', () => {
    const result = mapMunicipality({
      IDMunicipio: '4554',
      IDProvincia: '28',
      IDCCAA: '13',
      Municipio: 'Ajalvir',
      Provincia: 'MADRID',
      CCAA: 'Madrid',
    });
    expect(result.id).toBe('4554');
    expect(result.provinceId).toBe('28');
    expect(result.communityId).toBe('13');
    expect(result.name).toBe('Ajalvir');
    expect(result.provinceName).toBe('MADRID');
    expect(result.communityName).toBe('Madrid');
  });
});

describe('mapCommunity', () => {
  it('maps IDCCAA and CCAA', () => {
    const result = mapCommunity({ IDCCAA: '13', CCAA: 'Madrid' });
    expect(result.id).toBe('13');
    expect(result.name).toBe('Madrid');
  });
});

describe('mapFuelProduct', () => {
  it('maps all fields', () => {
    const result = mapFuelProduct({
      IDProducto: '3',
      NombreProducto: 'Gasolina 95 E5',
      NombreProductoAbreviatura: 'G95E5',
    });
    expect(result.id).toBe('3');
    expect(result.name).toBe('Gasolina 95 E5');
    expect(result.abbreviation).toBe('G95E5');
  });
});

describe('PRICE_KEY_TO_CODE exhaustiveness', () => {
  it('every key in PRICE_KEY_TO_CODE has a corresponding field in RawStation', () => {
    // This test acts as a canary: if the API adds a new Precio field that we haven't
    // mapped, the live probe output will differ and a test like this will surface it.
    const priceKeys = Object.keys(PRICE_KEY_TO_CODE);
    const rawStationKeys = Object.keys(GOLDEN_STATION).filter((k) => k.startsWith('Precio'));

    const missingFromMapping = rawStationKeys.filter((k) => !(k in PRICE_KEY_TO_CODE));
    const missingFromSample = priceKeys.filter(
      (k) => !rawStationKeys.includes(k),
    );

    expect(missingFromMapping).toEqual([]);
    expect(missingFromSample).toEqual([]);
  });
});
