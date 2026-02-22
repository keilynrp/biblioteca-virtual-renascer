"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { navigationApi, type NavZone } from '@/services/navigationApi'

type NavigationContextType = {
    zones: NavZone[]
    getZone: (location: NavZone['location']) => NavZone | undefined
    getZones: (location: NavZone['location']) => NavZone[]
    refresh: () => void
}

const NavigationContext = createContext<NavigationContextType>({
    zones: [],
    getZone: () => undefined,
    getZones: () => [],
    refresh: () => {},
})

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [zones, setZones] = useState<NavZone[]>([])

    const fetchZones = useCallback(async () => {
        try {
            const data = await navigationApi.getAll()
            setZones(data)
        } catch {
            // mantiene fallback vacío
        }
    }, [])

    useEffect(() => { fetchZones() }, [fetchZones])

    const getZone = (location: NavZone['location']) =>
        zones.find(z => z.location === location)

    const getZones = (location: NavZone['location']) =>
        zones.filter(z => z.location === location).sort((a, b) => a.order - b.order)

    return (
        <NavigationContext.Provider value={{ zones, getZone, getZones, refresh: fetchZones }}>
            {children}
        </NavigationContext.Provider>
    )
}

export function useNavigation() {
    return useContext(NavigationContext)
}
