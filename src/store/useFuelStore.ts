import { stationService } from '@/services/minetur/station.service'
import { RawStationsResponse } from '@/services/minetur/types'
import { Station } from '@/types/station'
import { create } from 'zustand'

interface FuelStore {
    stations: Station[] | null
    error: Error | null,
    loading: boolean
    fetchStations: (municipalityId: string, fuelCode?: string) => Promise<void>,
    clear: () => void
}

const useFuelStore = create<FuelStore>((set) => ({
    stations: null,
    error: null,
    loading: false,
    fetchStations: async (municipalityId, fuelCode) => {

        set({ loading: true, error: null})

        try {
            const stations = await stationService.getAllStationsFromMunicipality(municipalityId)

            if (!stations) {
                set({ loading: false, error: new Error('No stations have been fetched') })
                return
            }

            set({ loading: false, stations })

        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error')
            set({ loading: false, error })
        }

    },

    clear: () => { set({ loading: false, error: null, stations: null }) }
}))

export default useFuelStore