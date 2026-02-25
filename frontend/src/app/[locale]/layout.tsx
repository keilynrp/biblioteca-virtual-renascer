import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { PwaManager } from "@/components/pwa-manager";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import { NavigationProvider } from "@/context/navigation-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biblioteca Virtual Renascer do Saber",
  description: "Tu biblioteca digital personal con miles de libros, préstamos y lectura offline",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "BVS Renascer",
    statusBarStyle: "default",
    startupImage: [
      "/icons/icon-512x512.png",
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script
          id="performance-patch"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress negative timestamp error in performance.measure
              // This is a known Next.js/React 19 internal bug (#86060)
              (function() {
                if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
                  const originalMeasure = window.performance.measure;
                  window.performance.measure = function() {
                    try {
                      return originalMeasure.apply(window.performance, arguments);
                    } catch (e) {
                      // Catch both TypeError and DOMException related to negative timestamps
                      const msg = e && e.message ? e.message.toLowerCase() : '';
                      if (msg.includes('cannot be negative') || msg.includes('negative')) {
                        return;
                      }
                      throw e;
                    }
                  };
                }
                
                // Keep Grammarly disable logic
                window.grammarly = { isExtensionInstalled: false };
              })();
            `,
          }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <NavigationProvider>
            <PwaManager />
            {children}
            <Toaster />
          </NavigationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
