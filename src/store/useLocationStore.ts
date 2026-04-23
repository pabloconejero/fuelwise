import { create } from 'zustand'
import * as Location from 'expo-location'

interface LocationStore {
    location: Location.LocationGeocodedAddress | null
    error: boolean | null
    loading: boolean 
    fetchLocation: () => Promise<void>
    clear: () => void
}


const useLocationStore = create<LocationStore>((set) => ({
    location: null,
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
        const location = await Location.reverseGeocodeAsync({...coords.coords})

        set({ location: location[0], loading: false })
    },
    clear: () => set(() => ({ error: null, location: null }))
}))

export default useLocationStore