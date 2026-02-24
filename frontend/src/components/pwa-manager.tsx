"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const OfflineIndicator = dynamic(
    () => import('@/components/offline-indicator').then(mod => mod.OfflineIndicator),
    { ssr: false }
);
const InstallPwaPrompt = dynamic(
    () => import('@/components/install-pwa-prompt').then(mod => mod.InstallPwaPrompt),
    { ssr: false }
);

export function PwaManager() {
    useEffect(() => {
        if (
            process.env.NODE_ENV === 'production' &&
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator
        ) {
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then(reg => console.log('[SW] Registrado:', reg.scope))
                .catch(err => console.warn('[SW] Error al registrar:', err));
        }
    }, []);

    return (
        <>
            <OfflineIndicator />
            <InstallPwaPrompt />
        </>
    );
}
