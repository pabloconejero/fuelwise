import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { RawMunicipality } from "./types";

export const municipalityService = {
    getMunicipalityFromProvince: async (provinceId: string, cityName: string): Promise<RawMunicipality> => {
        const { data } = await client.get(ENDPOINTS.municipalities(provinceId))
        const filteredData = data.filter((municipality: RawMunicipality) => municipality.Municipio.includes(cityName))
        
        return filteredData[0]
    },
}