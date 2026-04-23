import { useEffect, useRef } from "react";
import  useLocationStore  from '../store/useLocationStore'
import { AppState } from "react-native";

export default function useLocation() {
    const {fetchLocation} = useLocationStore()
    const appState = useRef(AppState.currentState)
    
    useEffect(()=> {
        fetchLocation()

        const $appHasChanged = AppState.addEventListener('change', (nextState) => {
            if (appState.current === 'background' && nextState === 'active') {
                fetchLocation()
                console.log('A')
            }

        })

        return () => {
            $appHasChanged.remove()
        }

    }, [])
}