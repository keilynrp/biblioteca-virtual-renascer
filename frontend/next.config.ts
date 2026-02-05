// =============================================================================
// Next.js Configuration with Sentry Integration
// =============================================================================
// import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import withPWAInit from '@ducanh2912/next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  // typedRoutes disabled - requires full route typing across codebase
  // typedRoutes: true,
  // Turbopack configuration (required for Next.js 16+)
  turbopack: {},
  // Experimental features for better performance
  experimental: {
    // Optimize package imports for faster compilation
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-avatar',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'react-hook-form',
      'zod',
      'zustand'
    ],
    // Optimize CSS chunking
    optimizeCss: true,
    // Faster TypeScript processing

  },

  // Optimize compilation
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**',
      },
    ],
    // Add these settings for better compatibility
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Increase formats for better support
    formats: ['image/avif', 'image/webp'],
    // Allow unoptimized as fallback during development
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Optimize output
  poweredByHeader: false,
  compress: true,

  // Development optimizations
  devIndicators: {
    position: 'bottom-right',
  },

  // Production optimizations
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

// =============================================================================
// Sentry Configuration
// =============================================================================
// Sentry has been removed due to dependency conflicts with Next.js 16
// const shouldUseSentry = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
});

export default withNextIntl(withPWA(nextConfig));

