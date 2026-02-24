// =============================================================================
// Next.js Configuration with Sentry Integration
// =============================================================================
// import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
// @serwist/next no soporta Next.js 16 Turbopack.
// El SW se compila con esbuild via scripts/build-sw.mjs (postbuild).
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  // typedRoutes disabled - requires full route typing across codebase
  // typedRoutes: true,
  // Note: Turbopack is enabled for dev via `next dev --turbo` in package.json.
  // Do NOT add `turbopack: {}` here — it enables Turbopack for `next build`
  // too, which breaks @ducanh2912/next-pwa (uses workbox-webpack-plugin).

  // Proxy all /api/* requests to the backend.
  // In Docker: API_INTERNAL_URL=http://backend:8000/api (inter-service)
  // Locally:   falls back to http://localhost:8000/api
  // This eliminates browser CORS requirements entirely.
  async rewrites() {
    const backendUrl =
      process.env.API_INTERNAL_URL || 'http://localhost:8000/api';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
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

  // Prevent pdfjs-dist from trying to import the native `canvas` module during
  // webpack builds (production). The PDF viewer runs client-side only.
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

// =============================================================================
// Sentry Configuration
// =============================================================================
// Sentry has been removed due to dependency conflicts with Next.js 16
// const shouldUseSentry = process.env.NODE_ENV === 'production';

// =============================================================================
// PWA — service worker compilado con esbuild (scripts/build-sw.mjs)
// =============================================================================
// next build → postbuild → esbuild compila src/app/sw.ts → public/sw.js
// El registro del SW ocurre en src/components/pwa-manager.tsx

export default withNextIntl(nextConfig);

