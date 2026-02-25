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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Absolute top-level patch for Performance APIs
              // Prevents crashes in Next.js/React 19 internal telemetry (#86060)
              (function() {
                try {
                  // Patch prototype if possible to catch all instances
                  const p = window.Performance ? window.Performance.prototype : (window.performance ? Object.getPrototypeOf(window.performance) : null);
                  const target = p || window.performance;
                  
                  if (target) {
                    const methods = ['measure', 'mark'];
                    methods.forEach(method => {
                      if (typeof target[method] === 'function') {
                        const original = target[method];
                        target[method] = function() {
                          try {
                            return original.apply(this, arguments);
                          } catch (e) {
                            // Silently swallow all telemetry errors
                            return null;
                          }
                        };
                      }
                    });
                  }
                } catch (e) {}
                
                // Keep Grammarly disable logic
                if (typeof window !== 'undefined') {
                  window.grammarly = { isExtensionInstalled: false };
                }
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
