/**
 * Pure URL builder functions for every minetur endpoint used by this app.
 * No network calls here — fully testable without mocking.
 */
const BASE =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

export const endpoints = {
  // Reference / lookup lists
  communities: () => `${BASE}/Listados/ComunidadesAutonomas/`,
  provinces: () => `${BASE}/Listados/Provincias/`,
  municipalities: (provinceId: string) =>
    `${BASE}/Listados/MunicipiosPorProvincia/${encodeURIComponent(provinceId)}`,
  fuelProducts: () => `${BASE}/Listados/ProductosPetroliferos/`,

  // Current station prices — province-scoped
  stationsByProvince: (provinceId: string) =>
    `${BASE}/EstacionesTerrestres/FiltroProvincia/${encodeURIComponent(provinceId)}`,
  stationsByProvinceAndProduct: (provinceId: string, productId: string) =>
    `${BASE}/EstacionesTerrestres/FiltroProvinciaProducto/${encodeURIComponent(provinceId)}/${encodeURIComponent(productId)}`,

  // Current station prices — municipality-scoped
  stationsByMunicipality: (municipalityId: string) =>
    `${BASE}/EstacionesTerrestres/FiltroMunicipio/${encodeURIComponent(municipalityId)}`,
  stationsByMunicipalityAndProduct: (municipalityId: string, productId: string) =>
    `${BASE}/EstacionesTerrestres/FiltroMunicipioProducto/${encodeURIComponent(municipalityId)}/${encodeURIComponent(productId)}`,
} as const;
