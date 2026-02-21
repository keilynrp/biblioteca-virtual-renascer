"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from '@/lib/api'

type CurrencyContextType = {
    symbol: string
    code: string
    refresh: () => void
}

const CurrencyContext = createContext<CurrencyContextType>({
    symbol: '$',
    code: 'USD',
    refresh: () => {},
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [symbol, setSymbol] = useState('$')
    const [code, setCode] = useState('USD')

    const fetchBaseCurrency = useCallback(async () => {
        try {
            const res = await api.get('/currencies/currencies/')
            const list = Array.isArray(res.data) ? res.data : (res.data.results ?? [])
            const base = list.find((c: any) => c.is_base)
            if (base) {
                setSymbol(base.symbol)
                setCode(base.code)
            }
        } catch {
            // mantiene fallback $
        }
    }, [])

    useEffect(() => { fetchBaseCurrency() }, [fetchBaseCurrency])

    return (
        <CurrencyContext.Provider value={{ symbol, code, refresh: fetchBaseCurrency }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    return useContext(CurrencyContext)
}
