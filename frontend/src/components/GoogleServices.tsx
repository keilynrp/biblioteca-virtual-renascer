"use client"

import { useState, useEffect } from "react"
import Script from "next/script"
import { useSiteSettings } from "@/context/site-settings-context"
import { getCookieConsent } from "@/components/cookie-consent-banner"

export function GoogleServices() {
    const { ga_id, gtm_id, gsc_id, cookie_consent_enabled } = useSiteSettings()
    const [analyticsAllowed, setAnalyticsAllowed] = useState(!cookie_consent_enabled)

    useEffect(() => {
        function checkConsent() {
            if (!cookie_consent_enabled) {
                setAnalyticsAllowed(true)
                return
            }
            const consent = getCookieConsent()
            setAnalyticsAllowed(consent?.analytics ?? false)
        }

        checkConsent()
        window.addEventListener("cookie-consent-updated", checkConsent)
        return () => window.removeEventListener("cookie-consent-updated", checkConsent)
    }, [cookie_consent_enabled])

    return (
        <>
            {/* Google Search Console Verification — always allowed (meta tag only) */}
            {gsc_id && (
                <meta name="google-site-verification" content={gsc_id} />
            )}

            {/* Google Analytics (ga_id) — conditioned on consent */}
            {ga_id && analyticsAllowed && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${ga_id}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${ga_id}');
                        `}
                    </Script>
                </>
            )}

            {/* Google Tag Manager (gtm_id) — conditioned on consent */}
            {gtm_id && analyticsAllowed && (
                <Script id="google-tag-manager" strategy="afterInteractive">
                    {`
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','${gtm_id}');
                    `}
                </Script>
            )}
        </>
    )
}
