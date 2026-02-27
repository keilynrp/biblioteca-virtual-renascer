"use client"

import Script from "next/script"
import { useSiteSettings } from "@/context/site-settings-context"

export function GoogleServices() {
    const { ga_id, gtm_id, gsc_id } = useSiteSettings()

    return (
        <>
            {/* Google Search Console Verification */}
            {gsc_id && (
                <meta name="google-site-verification" content={gsc_id} />
            )}

            {/* Google Analytics (ga_id) */}
            {ga_id && (
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

            {/* Google Tag Manager (gtm_id) */}
            {gtm_id && (
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
