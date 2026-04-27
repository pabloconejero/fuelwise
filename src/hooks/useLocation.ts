import { useEffect, useRef } from "react";
import useLocationStore from '../store/useLocationStore'
import { AppState } from "react-native";
import useFuelStore from "@/store/useFuelStore";

export default function useLocation() {
    const { fetchLocation } = useLocationStore()
    const { fetchStations } = useFuelStore()
    const appState = useRef(AppState.currentState)

    useEffect(() => {

        const init = async () => {
            const location = await fetchLocation()
            if (location?.IDMunicipio) {
                console.log(location)
                await fetchStations(location.IDMunicipio)
            }
        }

        init()

        const $appHasChanged = AppState.addEventListener('change', (nextState) => {
            if (appState.current === 'background' && nextState === 'active') {
                init()
            }
            appState.current = nextState
        })

        return () => {
            $appHasChanged.remove()
        }

    }, [])
}