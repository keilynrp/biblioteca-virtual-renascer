import sharp from '../node_modules/sharp/lib/index.js';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const iconsDir = resolve(publicDir, 'icons');
const logoPath = resolve(publicDir, 'Logo_renascerdosaber.png');

// Crear carpeta icons si no existe
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Color de fondo del manifest: #0f172a
const BG_COLOR = { r: 15, g: 23, b: 42, alpha: 1 };

console.log('Generando iconos PWA desde:', logoPath);
console.log('Destino:', iconsDir);
console.log('');

async function generateIcon(size) {
  const outputPath = resolve(iconsDir, `icon-${size}x${size}.png`);

  await sharp(logoPath)
    .resize(size, size, {
      fit: 'contain',
      background: BG_COLOR,
    })
    .png()
    .toFile(outputPath);

  console.log(`✓ icon-${size}x${size}.png`);
}

async function generateMaskableIcon() {
  // Maskable: logo ocupa el 72% del área (safe zone PWA)
  const size = 512;
  const logoSize = Math.round(size * 0.72);
  const padding = Math.round((size - logoSize) / 2);

  const outputPath = resolve(iconsDir, 'maskable-icon.png');

  const logoBuffer = await sharp(logoPath)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: logoBuffer, top: padding, left: padding }])
    .png()
    .toFile(outputPath);

  console.log(`✓ maskable-icon.png (${size}x${size} con padding safe zone)`);
}

async function main() {
  try {
    for (const size of sizes) {
      await generateIcon(size);
    }
    await generateMaskableIcon();
    console.log('\n✅ Todos los iconos generados correctamente en /public/icons/');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
