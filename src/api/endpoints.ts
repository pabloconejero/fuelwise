export const ENDPOINTS = {
    municipalities: (provinceId: string) => `/Listados/MunicipiosPorProvincia/${provinceId}`,
    localStations: {
        all: (municipalityId: string) => `/EstacionesTerrestres/FiltroMunicipio/${municipalityId}`,
        byFuelProduct: (municipalityId: string, fuelProductId: string) => `/EstacionesTerrestres/FiltroMunicipioProducto/${municipalityId}/${fuelProductId}`
    }
} as const