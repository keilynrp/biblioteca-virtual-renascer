import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
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
import { fetchSiteSettings } from "@/lib/fetch-site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const siteName = settings?.site_name || 'Biblioteca Virtual Renascer do Saber';
  const description = settings?.og_description || 'Tu biblioteca digital personal con miles de libros, préstamos y lectura offline';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    manifest: "/manifest.json",
    appleWebApp: {
      title: siteName,
      statusBarStyle: "default",
      startupImage: [
        "/icons/icon-512x512.png",
      ],
    },
  };
}

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
