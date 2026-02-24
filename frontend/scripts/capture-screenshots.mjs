/**
 * Captura screenshots PWA para el manifest (1280×720).
 *
 * Uso:
 *   node scripts/capture-screenshots.mjs
 *   node scripts/capture-screenshots.mjs --email admin@example.com --password mipassword
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { Socket } from 'net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = resolve(__dirname, '../public/screenshots');
const BASE_URL = 'http://localhost:3002';
const LOCALE = 'es';
const VIEWPORT = { width: 1280, height: 720 };

// Argumentos CLI
const args = process.argv.slice(2);
const getArg = (k) => { const i = args.indexOf(k); return i !== -1 ? args[i + 1] : null; };
const EMAIL    = getArg('--email');
const PASSWORD = getArg('--password');

if (!existsSync(screenshotsDir)) mkdirSync(screenshotsDir, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

function checkPort(port) {
  return new Promise((resolve) => {
    const sock = new Socket();
    sock.setTimeout(1000);
    sock.on('connect', () => { sock.destroy(); resolve(true); });
    sock.on('error',   () => resolve(false));
    sock.on('timeout', () => resolve(false));
    sock.connect(port, '127.0.0.1');
  });
}

async function waitForServer(url, timeout = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (r.status < 500) return true;
    } catch { /* sigue esperando */ }
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let devProcess = null;

  // Verificar si el servidor ya está corriendo
  const running = await checkPort(3002);
  if (!running) {
    console.log('🚀 Iniciando Next.js dev server (puerto 3002)...');
    devProcess = spawn('npm', ['run', 'dev'], {
      cwd: resolve(__dirname, '..'),
      shell: true,
      stdio: 'pipe',
    });
    devProcess.stdout.on('data', d => process.stdout.write(d));
    devProcess.stderr.on('data', d => process.stderr.write(d));

    const ok = await waitForServer(`${BASE_URL}/`);
    if (!ok) {
      console.error('❌ El servidor no respondió en 2 minutos.');
      devProcess.kill();
      process.exit(1);
    }
    console.log('\n✅ Servidor listo.\n');
  } else {
    console.log(`✅ Servidor detectado en ${BASE_URL}\n`);
  }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT });

  try {
    // ── Screenshot 1: Home marketing (pública) ────────
    console.log('📸 Capturando home.png ...');
    const p1 = await ctx.newPage();
    await p1.goto(`${BASE_URL}/${LOCALE}`, { waitUntil: 'networkidle', timeout: 30_000 });
    await p1.waitForTimeout(800);
    await p1.screenshot({ path: resolve(screenshotsDir, 'home.png') });
    await p1.close();
    console.log('   ✓ home.png (1280×720)');

    // ── Screenshot 2: Library (requiere sesión) ───────
    console.log('\n📸 Capturando library.png ...');
    const p2 = await ctx.newPage();

    if (EMAIL && PASSWORD) {
      console.log(`   → Obteniendo token JWT para ${EMAIL}...`);

      // Obtener token directamente del backend (puerto 8000, bypass proxy Next.js)
      const tokenRes = await fetch(`http://localhost:8000/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: EMAIL, password: PASSWORD }),
      });
      const tokenData = await tokenRes.json();

      if (!tokenData.access) {
        console.warn(`   ⚠  No se pudo obtener token: ${JSON.stringify(tokenData)}`);
      } else {
        console.log('   → Token obtenido. Inyectando sesión en el navegador...');

        // Abrir una página vacía para poder escribir en localStorage del dominio
        await p2.goto(`${BASE_URL}/${LOCALE}/login`, { waitUntil: 'domcontentloaded', timeout: 15_000 });

        // Inyectar auth-storage en localStorage (formato Zustand persist)
        await p2.evaluate(({ access, refresh }) => {
          const authState = {
            state: {
              user: { username: 'keilyn', email: '', user_type: 'admin' },
              accessToken: access,
              refreshToken: refresh,
              isAuthenticated: true,
            },
            version: 0,
          };
          localStorage.setItem('auth-storage', JSON.stringify(authState));
        }, { access: tokenData.access, refresh: tokenData.refresh });

        console.log('   → Sesión inyectada correctamente');
      }
    } else {
      console.log('   ℹ  Sin credenciales — se captura el estado actual');
    }

    await p2.goto(`${BASE_URL}/${LOCALE}/library`, { waitUntil: 'networkidle', timeout: 30_000 });
    await p2.waitForTimeout(1200);
    await p2.screenshot({ path: resolve(screenshotsDir, 'library.png') });
    await p2.close();
    console.log('   ✓ library.png (1280×720)');

  } finally {
    await browser.close();
    if (devProcess) { devProcess.kill(); console.log('\n🛑 Servidor detenido.'); }
  }

  console.log('\n✅ Screenshots guardadas en /public/screenshots/');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
