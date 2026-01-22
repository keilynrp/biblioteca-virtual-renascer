"use client";

import dynamic from 'next/dynamic';

const OfflineIndicator = dynamic(() => import('@/components/offline-indicator').then(mod => mod.OfflineIndicator), { ssr: false });
const InstallPwaPrompt = dynamic(() => import('@/components/install-pwa-prompt').then(mod => mod.InstallPwaPrompt), { ssr: false });

export function PwaManager() {
    return (
        <>
            <OfflineIndicator />
            <InstallPwaPrompt />
        </>
    );
}
