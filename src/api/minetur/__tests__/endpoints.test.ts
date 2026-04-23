import { endpoints } from '../endpoints';

const BASE =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

describe('endpoints', () => {
  describe('reference lists', () => {
    it('communities', () => {
      expect(endpoints.communities()).toBe(`${BASE}/Listados/ComunidadesAutonomas/`);
    });

    it('provinces', () => {
      expect(endpoints.provinces()).toBe(`${BASE}/Listados/Provincias/`);
    });

    it('municipalities by province', () => {
      expect(endpoints.municipalities('28')).toBe(
        `${BASE}/Listados/MunicipiosPorProvincia/28`,
      );
    });

    it('municipalities encodes province ID', () => {
      expect(endpoints.municipalities('28/foo')).toContain(encodeURIComponent('28/foo'));
    });

    it('fuelProducts', () => {
      expect(endpoints.fuelProducts()).toBe(`${BASE}/Listados/ProductosPetroliferos/`);
    });
  });

  describe('station endpoints — province-scoped', () => {
    it('stationsByProvince', () => {
      expect(endpoints.stationsByProvince('28')).toBe(
        `${BASE}/EstacionesTerrestres/FiltroProvincia/28`,
      );
    });

    it('stationsByProvinceAndProduct', () => {
      expect(endpoints.stationsByProvinceAndProduct('28', '3')).toBe(
        `${BASE}/EstacionesTerrestres/FiltroProvinciaProducto/28/3`,
      );
    });
  });

  describe('station endpoints — municipality-scoped', () => {
    it('stationsByMunicipality', () => {
      expect(endpoints.stationsByMunicipality('4554')).toBe(
        `${BASE}/EstacionesTerrestres/FiltroMunicipio/4554`,
      );
    });

    it('stationsByMunicipalityAndProduct', () => {
      expect(endpoints.stationsByMunicipalityAndProduct('4554', '5')).toBe(
        `${BASE}/EstacionesTerrestres/FiltroMunicipioProducto/4554/5`,
      );
    });
  });
});
