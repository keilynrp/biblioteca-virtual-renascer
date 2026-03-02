import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { PwaManager } from "@/components/pwa-manager";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import { NavigationProvider } from "@/context/navigation-context";
import { GoogleServices } from "@/components/GoogleServices";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { SiteSettingsProvider } from "@/context/site-settings-context";
import { DynamicFavicon } from "@/components/dynamic-favicon";

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
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SiteSettingsProvider>
        <NavigationProvider>
          <DynamicFavicon />
          <GoogleServices />
          <PwaManager />
          {children}
          <CookieConsentBanner />
          <Toaster />
        </NavigationProvider>
      </SiteSettingsProvider>
    </NextIntlClientProvider>
  );
}
