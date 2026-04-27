import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { Station } from "@/types/station";
import { mapStation } from "./mappers";
import { RawStationsResponse } from "./types";

type ApiStation = Omit<Station, 'distance' | 'color' | 'trend' | 'history'>;

export const stationService = {
    getAllStationsFromMunicipality: async (municipalityId: string): Promise<ApiStation[]> => {
        const { data }: { data: RawStationsResponse } = await client.get(ENDPOINTS.localStations.all(municipalityId))
        return data.ListaEESSPrecio.map(mapStation)
    }
}

