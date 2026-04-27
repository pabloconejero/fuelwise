import { create } from 'zustand'
import * as Location from 'expo-location'
import { municipalityService } from '@/services/minetur/municipality.service'
import { RawMunicipality } from '@/services/minetur/types'

interface LocationStore {
    location: Location.LocationGeocodedAddress | null,
    municipalityInfo: RawMunicipality | null
    error: boolean | null
    loading: boolean
    fetchLocation: () => Promise<RawMunicipality | undefined>
    clear: () => void
}


const useLocationStore = create<LocationStore>((set) => ({
    location: null,
    municipalityInfo: null,
    error: null,
    loading: false,
    fetchLocation: async () => {

        set({ loading: true, error: null })

        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== 'granted') {
            set({ error: true, loading: false })
            return
        }

        const coords = await Location.getCurrentPositionAsync({})
        const location = await Location.reverseGeocodeAsync({ ...coords.coords })
        const fetchedDataFromLocation = await municipalityService.getMunicipalityFromProvince(location[0].postalCode.slice(0, 2), location[0].city)
        
        set({ location: location[0], municipalityInfo: fetchedDataFromLocation, loading: false })
        return fetchedDataFromLocation
    },
    clear: () => set(() => ({ error: null, location: null }))
}))

export default useLocationStore