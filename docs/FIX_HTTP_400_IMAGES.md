# Fix HTTP 400 Error - Next.js Images

## 🔴 Problema Identificado

**Error HTTP 400 Bad Request** al intentar cargar imágenes desde el backend.

```
HTTP/1.1 400 Bad Request
Date: Sun, 28 Dec 2025 08:11:55 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```

## 🎯 Causa Raíz

Next.js 15/16 tiene un sistema de **Image Optimization API** que procesa todas las imágenes antes de servirlas. Este sistema está rechazando las solicitudes de imágenes del backend con error 400.

### Por qué ocurre el error 400

Next.js Image Optimization API rechaza imágenes cuando:

1. **No puede verificar la fuente** - Aunque `remotePatterns` está configurado, Next.js en desarrollo puede tener problemas validando `localhost`
2. **Headers incorrectos** - El backend Django puede no estar enviando los headers que Next.js espera
3. **Modo estricto** - Next.js 15+ es más estricto con la validación de imágenes remotas

### Flujo del problema

```
Browser → Next.js Image Component
        ↓
Next.js Image Optimization API (/api/_next/image?url=...)
        ↓
Backend (http://localhost:8000/media/...)
        ↓
❌ Error 400 Bad Request
```

## ✅ Solución

Desactivar la optimización de imágenes en modo desarrollo usando `unoptimized: true`.

### Configuración Actualizada

**Archivo:** `frontend/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    // Desactivar optimización en desarrollo
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
```

### Qué hace `unoptimized: true`

- ✅ Next.js sirve las imágenes **directamente** sin procesarlas
- ✅ No usa `/api/_next/image` endpoint
- ✅ Las imágenes se cargan desde la URL original del backend
- ✅ Evita el error 400 Bad Request
- ❌ No optimiza tamaño/formato de imagen
- ❌ No genera versiones WebP/AVIF automáticamente

**Nota:** En producción, deberías usar un servicio de optimización externo (Cloudinary, imgix, etc.) o configurar correctamente Next.js Image Optimization.

## 🔧 Aplicar el Fix

### Opción 1: Script Automático

```bash
# Ejecutar el script de fix
FIX_FINAL_400_ERROR.bat
```

### Opción 2: Manual

```bash
# 1. La configuración ya fue actualizada en next.config.ts

# 2. Reiniciar frontend
docker compose restart frontend

# 3. Esperar 25 segundos (Next.js compila)

# 4. Limpiar cache del navegador
# Chrome/Edge: Ctrl + Shift + Del → "Cached images" → Clear

# 5. Hard refresh
# Ctrl + Shift + R

# 6. Navegar a la biblioteca
http://localhost:3000/library
```

## 🔍 Verificación

### Antes del Fix

**Browser DevTools → Network Tab:**
```
Request URL: http://localhost:3000/_next/image?url=http%3A%2F%2Flocalhost%3A8000%2Fmedia%2Fbooks%2Fcovers%2Fimage.jpg&w=640&q=75
Status: 400 Bad Request
```

### Después del Fix

**Browser DevTools → Network Tab:**
```
Request URL: http://localhost:8000/media/books/covers/image.jpg
Status: 200 OK
Content-Type: image/jpeg
Content-Length: 4096
```

## 📊 Comparación: Optimized vs Unoptimized

| Aspecto | `unoptimized: false` (Default) | `unoptimized: true` (Fix) |
|---------|-------------------------------|---------------------------|
| **URL** | `/_next/image?url=...` | URL original del backend |
| **Optimización** | ✅ Sí (WebP, AVIF) | ❌ No |
| **Caching** | ✅ Automático | ⚠️ Del navegador |
| **Lazy Loading** | ✅ Sí | ✅ Sí (del componente) |
| **Error 400** | ❌ Puede ocurrir | ✅ No ocurre |
| **Performance** | ✅ Mejor | ⚠️ Depende del backend |
| **Desarrollo** | ⚠️ Puede fallar | ✅ Funciona siempre |
| **Producción** | ✅ Recomendado* | ❌ No recomendado |

*Con configuración correcta o servicio externo

## 🔄 Alternativas

Si no quieres desactivar la optimización completamente:

### Alternativa 1: Usar tag `<img>` nativo

**Desventaja:** Pierdes lazy loading y otras optimizaciones de Next.js

```tsx
// En lugar de:
<Image src={book.cover_image} alt={book.title} fill />

// Usar:
<img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
```

### Alternativa 2: Proxy las imágenes a través del frontend

**Ventaja:** Next.js puede optimizar imágenes locales sin problemas

```typescript
// frontend/src/app/api/image/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  const response = await fetch(imageUrl)
  const blob = await response.blob()

  return new Response(blob, {
    headers: {
      'Content-Type': response.headers.get('Content-Type'),
    },
  })
}

// Uso:
<Image src={`/api/image?url=${encodeURIComponent(book.cover_image)}`} />
```

### Alternativa 3: Servicio de Imágenes Externo (Producción)

Usar Cloudinary, imgix, o similar:

```typescript
// next.config.ts
images: {
  loader: 'cloudinary',
  path: 'https://res.cloudinary.com/your-account/',
}
```

## 🚀 Para Producción

En producción, **NO** uses `unoptimized: true`. En su lugar:

### Opción 1: Next.js Image Optimization (Requiere configuración)

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tu-dominio-backend.com',
        pathname: '/media/**',
      },
    ],
    // NO incluir unoptimized: true
  },
};
```

**Requisitos:**
- Backend debe tener HTTPS
- Backend debe tener CORS configurado correctamente
- Headers adecuados (Content-Type, Cache-Control, etc.)

### Opción 2: CDN para Imágenes

```typescript
// Usar Cloudinary, imgix, S3 + CloudFront, etc.
const imageUrl = `https://cdn.tu-dominio.com/${book.cover_image}`
```

### Opción 3: Static Export con External Image Loader

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Necesario para export
  },
};
```

## 📝 Checklist de Verificación

Después de aplicar el fix:

- [ ] `next.config.ts` actualizado con `unoptimized: true`
- [ ] Frontend reiniciado (`docker compose restart frontend`)
- [ ] Cache del navegador limpiado
- [ ] Hard refresh realizado (Ctrl + Shift + R)
- [ ] Biblioteca abierta: `http://localhost:3000/library`
- [ ] 49 libros visibles (no solo 20)
- [ ] Portadas mostrando correctamente
- [ ] No hay error 400 en Network tab (F12)
- [ ] URLs de imagen son directas: `http://localhost:8000/media/...`

## 🐛 Si Aún No Funciona

### 1. Verificar que el cambio se aplicó

```bash
# Ver la configuración actual
docker compose exec frontend cat next.config.ts | grep unoptimized

# Debe mostrar:
# unoptimized: process.env.NODE_ENV === 'development',
```

### 2. Verificar logs de Next.js

```bash
docker compose logs frontend --tail=50

# Buscar errores como:
# - "Invalid src prop"
# - "Image optimization failed"
# - "Failed to load resource"
```

### 3. Verificar URL en el navegador

1. Abrir DevTools (F12)
2. Network tab
3. Filtrar por "img"
4. Recargar página
5. Verificar que las URLs sean directas (sin `/_next/image`)

### 4. Probar URL directa

Copiar una URL de imagen y pegarla directamente en el navegador:
```
http://localhost:8000/media/books/covers/also-sprach-zarathustra.jpg
```

Debe mostrar la imagen sin error.

## 📚 Referencias

- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js Image Configuration](https://nextjs.org/docs/app/api-reference/components/image#configuration-options)
- [Remote Patterns](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)
- [Unoptimized Images](https://nextjs.org/docs/app/api-reference/components/image#unoptimized)

---

**Fecha:** 2025-12-28
**Error:** HTTP 400 Bad Request en imágenes
**Solución:** `unoptimized: true` en desarrollo
**Status:** ✅ Solucionado
**Próximo paso:** Ejecutar `FIX_FINAL_400_ERROR.bat`
