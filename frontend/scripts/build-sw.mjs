/**
 * Compila el service worker con esbuild.
 * Ejecutado como postbuild desde package.json.
 *
 * Por qué esbuild standalone:
 *   Next.js 16 usa Turbopack para producción. Los plugins de PWA basados en
 *   webpack (@serwist/next, @ducanh2912/next-pwa) no se ejecutan con Turbopack.
 *   Compilamos el SW independientemente con esbuild (ya instalado por Next.js).
 */

import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

async function main() {
    console.log('🔧 Compilando service worker con esbuild...');

    await build({
        entryPoints: [resolve(root, 'src/app/sw.ts')],
        bundle: true,
        outfile: resolve(root, 'public/sw.js'),
        format: 'esm',
        target: 'chrome91',   // mínimo para soporte ESM en SW
        minify: true,
        sourcemap: false,
        platform: 'browser',
        // Definir __SW_MANIFEST como array vacío (sin precaché, solo runtime caching)
        define: {
            'self.__SW_MANIFEST': '[]',
        },
        // serwist es puro ESM, resolverlo desde node_modules
        conditions: ['browser', 'module'],
    });

    console.log('✅ public/sw.js generado correctamente.');
}

main().catch(err => {
    console.error('❌ Error compilando service worker:', err.message);
    process.exit(1);
});
