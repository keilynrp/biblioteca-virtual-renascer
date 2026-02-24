/**
 * Service Worker — BVS Renascer
 * Compilado con esbuild (ver scripts/build-sw.mjs)
 *
 * Estrategias de caché Workbox:
 *   NetworkOnly         → auth (login, refresh)
 *   NetworkFirst 30min  → GET /api/content/**
 *   CacheFirst 24h      → PDFs y archivos de libros
 *   CacheFirst 7d       → imágenes de portadas (media, MinIO)
 *   CacheFirst 30d      → portadas externas (Open Library)
 *   CacheFirst 7d       → Next.js image optimization
 *   StaleWhileRevalidate → Google Fonts
 */

import {
    Serwist,
    NetworkFirst,
    NetworkOnly,
    CacheFirst,
    StaleWhileRevalidate,
    ExpirationPlugin,
    CacheableResponsePlugin,
} from 'serwist'

// En producción con @serwist/next, __SW_MANIFEST contiene el manifest de precaché.
// Con esbuild standalone, se omite y solo se usa runtime caching.
declare const self: ServiceWorkerGlobalScope & {
    __SW_MANIFEST?: unknown[]
}

const serwist = new Serwist({
    precacheEntries: (self.__SW_MANIFEST ?? []) as import('serwist').PrecacheEntry[],
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: false,
    fallbacks: {
        entries: [
            {
                url: '/es/offline',
                matcher({ request }: { request: Request }) {
                    return request.destination === 'document'
                },
            },
        ],
    },
    runtimeCaching: [
        // ── 1. Auth — NUNCA cachear ────────────────────────────────────────
        {
            matcher: /\/api\/auth\//,
            handler: new NetworkOnly(),
        },

        // ── 2. API de contenido (GET) — NetworkFirst 30 min ───────────────
        {
            matcher: ({ url, request }: { url: URL; request: Request }) =>
                url.pathname.startsWith('/api/content/') &&
                request.method === 'GET',
            handler: new NetworkFirst({
                cacheName: 'api-content-cache',
                networkTimeoutSeconds: 10,
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 30 * 60 }),
                ],
            }),
        },

        // ── 3. PDFs / archivos de libros — CacheFirst 24 h ────────────────
        {
            matcher: /\/api\/content\/.*\/(serve|download)\//,
            handler: new CacheFirst({
                cacheName: 'book-files-cache',
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 24 * 60 * 60 }),
                ],
            }),
        },

        // ── 4. Imágenes del backend — CacheFirst 7 d ──────────────────────
        {
            matcher: /localhost:8000\/media\//,
            handler: new CacheFirst({
                cacheName: 'backend-media-cache',
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 }),
                ],
            }),
        },

        // ── 5. MinIO object storage — CacheFirst 7 d ──────────────────────
        {
            matcher: /localhost:9000\//,
            handler: new CacheFirst({
                cacheName: 'minio-cache',
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 }),
                ],
            }),
        },

        // ── 6. Open Library covers — CacheFirst 30 d ──────────────────────
        {
            matcher: /covers\.openlibrary\.org\//,
            handler: new CacheFirst({
                cacheName: 'openlibrary-covers-cache',
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 }),
                ],
            }),
        },

        // ── 7. Next.js image optimization — CacheFirst 7 d ────────────────
        {
            matcher: /\/_next\/image/,
            handler: new CacheFirst({
                cacheName: 'next-image-cache',
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({ maxEntries: 256, maxAgeSeconds: 7 * 24 * 60 * 60 }),
                ],
            }),
        },

        // ── 8. Google Fonts — StaleWhileRevalidate ─────────────────────────
        {
            matcher: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: new StaleWhileRevalidate({
                cacheName: 'google-fonts-cache',
                plugins: [
                    new CacheableResponsePlugin({ statuses: [0, 200] }),
                    new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
                ],
            }),
        },
    ],
})

serwist.addEventListeners()
