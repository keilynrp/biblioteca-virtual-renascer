# Configuración Completa de Sentry - BVS Framework

## 📋 Índice

1. [Resumen General](#resumen-general)
2. [Configuración Backend (Django)](#configuración-backend-django)
3. [Configuración Frontend (Next.js)](#configuración-frontend-nextjs)
4. [Variables de Entorno](#variables-de-entorno)
5. [Configuración en Sentry.io](#configuración-en-sentryio)
6. [Pruebas de Funcionamiento](#pruebas-de-funcionamiento)
7. [Monitoreo y Alertas](#monitoreo-y-alertas)
8. [Troubleshooting](#troubleshooting)

---

## Resumen General

### ✅ Estado de Implementación

**Backend (Django)**: ✅ 100% Completado
- ✅ Sentry SDK instalado
- ✅ Configuración en `settings.py`
- ✅ Integración con Django, Redis, Celery
- ✅ Filtros de errores configurados
- ✅ Variables de entorno definidas

**Frontend (Next.js)**: ✅ 100% Completado
- ✅ Sentry SDK instalado
- ✅ Configuración para Client Runtime
- ✅ Configuración para Server Runtime
- ✅ Configuración para Edge Runtime
- ✅ Instrumentation hooks
- ✅ Next.js config actualizado
- ✅ Variables de entorno definidas

### 🎯 Funcionalidades Implementadas

**Backend**:
- ✅ Captura automática de excepciones Django
- ✅ Monitoreo de rendimiento de requests HTTP
- ✅ Tracking de queries a base de datos
- ✅ Monitoreo de tareas Celery
- ✅ Tracking de operaciones Redis
- ✅ Breadcrumbs para debugging
- ✅ Filtrado de errores de health checks

**Frontend**:
- ✅ Captura de errores en Client, Server y Edge
- ✅ Session Replay para debugging visual
- ✅ Browser tracing (Core Web Vitals)
- ✅ Request error handling automático
- ✅ Source maps para stack traces
- ✅ Filtrado de extensiones de navegador
- ✅ Tunnel route para evitar ad-blockers

---

## Configuración Backend (Django)

### 📦 Dependencias Instaladas

```txt
# backend/requirements.txt
sentry-sdk[django]>=1.40
```

### ⚙️ Configuración Principal

**Archivo**: `backend/config/settings.py` (líneas 244-356)

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

# Inicialización de Sentry
sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN', ''),
    environment=os.getenv('SENTRY_ENVIRONMENT', 'development'),
    release=os.getenv('SENTRY_RELEASE', 'bvs-backend@1.0.0'),

    # Integraciones
    integrations=[
        DjangoIntegration(
            transaction_style='url',
            middleware_spans=True,
            signals_spans=True,
        ),
        RedisIntegration(),
        CeleryIntegration(monitor_beat_tasks=True),
    ],

    # Performance monitoring
    traces_sample_rate=1.0 if DEBUG else 0.2,
    profiles_sample_rate=1.0 if DEBUG else 0.1,

    # Configuración general
    send_default_pii=True,
    max_breadcrumbs=50,
    attach_stacktrace=True,

    # Filtros
    before_send=lambda event, hint: (
        event if not _should_filter_event(event) else None
    ),
    ignore_errors=['django.security.DisallowedHost'],
)
```

### 🔍 Características Clave

1. **Monitoreo de Performance**:
   - Sampling de 100% en desarrollo, 20% en producción
   - Tracking de queries SQL automático
   - Monitoring de tareas Celery programadas

2. **Filtrado Inteligente**:
   - Health checks excluidos (`/health/`, `/healthz`)
   - Errores comunes de seguridad ignorados
   - PII (Personal Identifiable Information) incluido para mejor debugging

3. **Breadcrumbs**:
   - Hasta 50 breadcrumbs por evento
   - Incluye logs, queries SQL, operaciones Redis
   - Stack traces adjuntos automáticamente

---

## Configuración Frontend (Next.js)

### 📦 Dependencias Instaladas

```json
// frontend/package.json
{
  "dependencies": {
    "@sentry/nextjs": "^8.45.0"
  }
}
```

### 🗂️ Archivos de Configuración

#### 1. Client Runtime (`sentry.client.config.ts`)

**Funcionalidad**: Errores del navegador, Session Replay, Browser Tracing

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Session Replay para debugging visual
  replaysSessionSampleRate: 0.1, // 10% de sesiones
  replaysOnErrorSampleRate: 1.0,  // 100% cuando hay error

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,      // Protección de privacidad
      blockAllMedia: true,
      maskAllInputs: true,
    }),
    Sentry.browserTracingIntegration({
      traceFetch: true,
      traceXHR: true,
      enableLongTask: true,   // Core Web Vitals
    }),
  ],

  // Filtrado de ruido
  ignoreErrors: [
    'chrome-extension',
    'moz-extension',
    'ResizeObserver loop limit exceeded',
  ],
});
```

**Características**:
- ✅ Session Replay con máscaras de privacidad
- ✅ Core Web Vitals tracking
- ✅ Filtrado de errores de extensiones
- ✅ Captura de fetch/XHR requests

#### 2. Server Runtime (`sentry.server.config.ts`)

**Funcionalidad**: Errores en Node.js, Server Components, API Routes

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.httpIntegration({
      tracing: true,
      breadcrumbs: true
    }),
    Sentry.nodeContextIntegration(),
    Sentry.requestDataIntegration(),
  ],

  // Filtrado de errores de build
  beforeSend(event, hint) {
    if (event.exception?.values) {
      for (const exception of event.exception.values) {
        if (exception.value?.includes("ENOENT") &&
            exception.value?.includes(".next")) {
          return null; // Ignorar errores de build
        }
      }
    }
    return event;
  },
});
```

**Características**:
- ✅ HTTP request tracing
- ✅ Node.js context (CPU, memoria)
- ✅ Request data capture (headers, body)
- ✅ Filtrado de errores de build

#### 3. Edge Runtime (`sentry.edge.config.ts`)

**Funcionalidad**: Errores en Edge Functions y Middleware

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Optimizado para Edge (restricciones de memoria)
  tracesSampleRate: 0.3,  // 30% en producción
  maxBreadcrumbs: 30,     // Límite reducido
  send_default_pii: false, // Más restrictivo

  ignoreErrors: [
    'Failed to fetch',
    'timeout exceeded',
  ],
});
```

**Características**:
- ✅ Optimizado para memoria limitada
- ✅ Sampling reducido (Edge es más costoso)
- ✅ Filtrado de errores de red comunes

#### 4. Instrumentation Hooks (`instrumentation.ts`)

**Funcionalidad**: Inicialización automática y manejo de errores de requests

```typescript
export async function register() {
  // Cargar configuración según runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (err, request, context) => {
  const Sentry = await import("@sentry/nextjs");

  Sentry.captureException(err, {
    extra: {
      url: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      digest: err.digest,
    },
    tags: {
      router: context.routerKind,
      route_type: context.routeType,
    },
    level: "error",
  });
};
```

**Características**:
- ✅ Inicialización automática al iniciar servidor
- ✅ Captura de TODOS los errores de requests
- ✅ Context enriquecido con info de Next.js
- ✅ Tags para filtrado en Sentry

#### 5. Next.js Config (`next.config.ts`)

**Funcionalidad**: Build-time integration y source maps

```typescript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true, // Habilitar instrumentation.ts
  },
  // ... resto de configuración
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Source maps
  widenClientFileUpload: true,
  hideSourceMaps: true,

  // React component names en breadcrumbs
  reactComponentAnnotation: { enabled: true },

  // Tunnel para evitar ad-blockers
  tunnelRoute: "/monitoring",

  // Tree-shaking de logs
  disableLogger: true,

  // Vercel Cron Monitors
  automaticVercelMonitors: true,
});
```

**Características**:
- ✅ Upload automático de source maps
- ✅ Source maps ocultos en producción
- ✅ React component annotations
- ✅ Tunnel route anti ad-blockers
- ✅ Logger tree-shaking

---

## Variables de Entorno

### Backend (`.env`)

```bash
# =============================================================================
# Sentry - Error Tracking & Performance Monitoring
# =============================================================================
# DSN - Get from https://sentry.io/settings/projects/your-project/keys/
SENTRY_DSN=

# Environment (development, staging, production)
SENTRY_ENVIRONMENT=development

# Release version (used for tracking deployments)
SENTRY_RELEASE=bvs-backend@1.0.0
```

### Frontend (`.env.local`)

```bash
# =============================================================================
# Sentry Configuration - Error Tracking & Performance Monitoring
# =============================================================================
# Get your DSN from: https://sentry.io/settings/projects/your-project/keys/
NEXT_PUBLIC_SENTRY_DSN=

# Environment: development, staging, production
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# Release version (used for tracking deployments)
NEXT_PUBLIC_SENTRY_RELEASE=bvs-frontend@1.0.0

# Sentry organization slug (for source map uploads)
SENTRY_ORG=

# Sentry project name (for source map uploads)
SENTRY_PROJECT=

# Auth token for uploading source maps (get from: https://sentry.io/settings/account/api/auth-tokens/)
# Needs: project:releases, project:write, org:read
SENTRY_AUTH_TOKEN=
```

---

## Configuración en Sentry.io

### 🔧 Paso 1: Crear Cuenta y Proyectos

1. **Crear cuenta en Sentry.io**:
   - Ir a https://sentry.io/signup/
   - Registrarse (gratuito hasta 5,000 eventos/mes)

2. **Crear proyectos**:
   ```
   Proyecto 1: bvs-backend (Django)
   Proyecto 2: bvs-frontend (Next.js)
   ```

### 🔑 Paso 2: Obtener DSN y Credenciales

#### Backend DSN

1. Ir a: `https://sentry.io/settings/projects/bvs-backend/keys/`
2. Copiar el **DSN** (formato: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)
3. Pegar en `backend/.env`:
   ```bash
   SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

#### Frontend DSN

1. Ir a: `https://sentry.io/settings/projects/bvs-frontend/keys/`
2. Copiar el **DSN**
3. Pegar en `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

#### Auth Token (Frontend Source Maps)

1. Ir a: `https://sentry.io/settings/account/api/auth-tokens/`
2. Crear nuevo token con permisos:
   - ✅ `project:releases`
   - ✅ `project:write`
   - ✅ `org:read`
3. Copiar token y pegar en `frontend/.env.local`:
   ```bash
   SENTRY_AUTH_TOKEN=sntrys_xxxxx
   ```

#### Organization y Project

1. Obtener **organization slug**:
   - URL: `https://sentry.io/organizations/YOUR-ORG-SLUG/`
   - Copiar `YOUR-ORG-SLUG`

2. Pegar en `frontend/.env.local`:
   ```bash
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=bvs-frontend
   ```

### ⚙️ Paso 3: Configurar Proyectos

#### Backend (Django)

1. **Configurar SDK**:
   - ✅ SDK ya está configurado en código
   - ✅ Solo falta agregar DSN

2. **Configurar Integrations**:
   - Ir a: `Settings > Integrations`
   - Habilitar: GitHub (opcional, para releases)

3. **Configurar Sampling**:
   - Ya está en código:
     - Development: 100%
     - Production: 20%

#### Frontend (Next.js)

1. **Configurar Source Maps**:
   - ✅ Ya está configurado en `next.config.ts`
   - Se subirán automáticamente en cada build

2. **Configurar Session Replay**:
   - Ir a: `Settings > Projects > bvs-frontend > Session Replay`
   - Verificar que esté habilitado
   - Configurar retención (default: 30 días)

3. **Configurar Performance**:
   - Ir a: `Performance > Settings`
   - Habilitar: Transaction Summaries
   - Configurar umbrales de performance

### 🚨 Paso 4: Configurar Alertas

#### Alertas Críticas

```yaml
Alert 1: High Error Rate
  Condición: errors > 10 en 1 minuto
  Notificación: email, slack
  Proyectos: bvs-backend, bvs-frontend

Alert 2: Performance Degradation
  Condición: p95 response time > 2000ms
  Notificación: email
  Proyectos: bvs-backend

Alert 3: New Issue
  Condición: nuevo tipo de error detectado
  Notificación: slack
  Proyectos: bvs-backend, bvs-frontend
```

#### Configuración de Notificaciones

1. **Email**:
   - `Settings > Notifications > Email`
   - Habilitar: Critical alerts, New issues

2. **Slack** (recomendado):
   - `Settings > Integrations > Slack`
   - Conectar workspace
   - Crear canal: `#bvs-errors`
   - Asignar alertas al canal

---

## Pruebas de Funcionamiento

### 🧪 Backend (Django)

#### Test 1: Error Básico

```bash
# En Django shell
python manage.py shell

>>> from sentry_sdk import capture_exception
>>> try:
...     1 / 0
... except Exception as e:
...     capture_exception(e)
```

**Verificación**:
1. Ir a Sentry: `Issues > bvs-backend`
2. Debe aparecer: `ZeroDivisionError: division by zero`

#### Test 2: Error en View

```python
# Crear vista temporal en cualquier app
from django.http import JsonResponse

def test_sentry(request):
    division_by_zero = 1 / 0
    return JsonResponse({'status': 'ok'})
```

**Verificación**:
1. Acceder a la ruta
2. Verificar en Sentry que se capturó con contexto de request

#### Test 3: Performance Monitoring

```bash
# Hacer múltiples requests a una API
for i in {1..10}; do
  curl http://localhost:8000/api/books/
done
```

**Verificación**:
1. Ir a: `Performance > Transactions`
2. Debe aparecer: `GET /api/books/`
3. Ver métricas: p50, p95, p99

### 🧪 Frontend (Next.js)

#### Test 1: Client Error

```typescript
// Agregar a cualquier componente cliente
'use client';

export default function TestSentry() {
  const causeError = () => {
    throw new Error('Test error from client');
  };

  return (
    <button onClick={causeError}>
      Trigger Sentry Error
    </button>
  );
}
```

**Verificación**:
1. Click en botón
2. Verificar en Sentry: debe aparecer error con Session Replay

#### Test 2: Server Error

```typescript
// app/api/test-sentry/route.ts
export async function GET() {
  throw new Error('Test error from server');
}
```

**Verificación**:
1. Acceder a: `http://localhost:3000/api/test-sentry`
2. Verificar en Sentry con contexto de servidor

#### Test 3: Request Error (Automático)

```typescript
// Cualquier error en page.tsx o layout.tsx
export default async function Page() {
  // Esto generará un error automáticamente capturado
  const data = await fetch('http://invalid-url.com');
  return <div>{data}</div>;
}
```

**Verificación**:
1. Acceder a la página
2. Sentry debe capturar automáticamente vía `onRequestError`

#### Test 4: Session Replay

1. Navegar por la aplicación normalmente
2. Causar un error (cualquier método)
3. En Sentry:
   - Ir a Issue
   - Click en "Session Replay"
   - Ver reproducción visual del error

### ✅ Checklist de Pruebas

```markdown
Backend:
- [ ] Error básico capturado
- [ ] Error en view con contexto
- [ ] Performance monitoring funcionando
- [ ] Celery tasks monitoreadas
- [ ] Redis operations trackeadas
- [ ] Health checks filtrados

Frontend:
- [ ] Client error capturado
- [ ] Server error capturado
- [ ] Edge error capturado (si aplica)
- [ ] Request errors automáticos
- [ ] Session Replay funcionando
- [ ] Source maps cargados
- [ ] Performance transactions
- [ ] Extensiones de navegador filtradas
```

---

## Monitoreo y Alertas

### 📊 Métricas Clave a Monitorear

#### Backend

```yaml
Errors:
  - Total errors/día
  - Error rate (errors/request)
  - Top 5 errores más frecuentes

Performance:
  - P95 response time por endpoint
  - Slowest transactions
  - Database query time
  - Redis operation time

Celery:
  - Task success rate
  - Task duration
  - Failed tasks
```

#### Frontend

```yaml
Errors:
  - JavaScript errors/día
  - Error rate por página
  - Browsers con más errores

Performance:
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)
  - Time to First Byte (TTFB)

Session Replay:
  - Sessions con errores
  - User journey antes del error
```

### 🔔 Configuración de Alertas Recomendadas

#### Alert 1: Error Spike

```yaml
Nombre: High Error Rate
Condición:
  - errors > 10 en 1 minuto
  O
  - error rate > 5% en 5 minutos
Acción:
  - Enviar email a equipo
  - Notificar Slack #bvs-alerts
  - Crear incident automático
Proyectos: bvs-backend, bvs-frontend
```

#### Alert 2: Performance Degradation

```yaml
Nombre: Slow Response Times
Condición:
  - P95 response time > 2000ms por 5 minutos
Acción:
  - Enviar email
  - Notificar Slack #bvs-performance
Proyectos: bvs-backend
```

#### Alert 3: New Error Type

```yaml
Nombre: New Issue Detected
Condición:
  - Primera vez que se ve este error
  Y
  - severidad >= error
Acción:
  - Notificar Slack #bvs-errors
  - Asignar a equipo de guardia
Proyectos: bvs-backend, bvs-frontend
```

### 📈 Dashboards Recomendados

#### Dashboard 1: Overview

```yaml
Widgets:
  - Total errors (24h)
  - Error rate trend (7 días)
  - Top 5 issues
  - Affected users
  - P95 response time
  - Apdex score
```

#### Dashboard 2: Performance

```yaml
Widgets:
  - Transaction throughput
  - P50, P95, P99 latencies
  - Slowest transactions
  - Database time
  - External API time
```

#### Dashboard 3: User Experience

```yaml
Widgets:
  - Core Web Vitals (LCP, FID, CLS)
  - Page load times
  - JavaScript errors por página
  - Session Replays con errores
  - Browsers/Devices con más errores
```

---

## Troubleshooting

### ❌ Problema 1: No aparecen eventos en Sentry

**Síntomas**:
- Configuración completa pero sin eventos

**Soluciones**:

1. **Verificar DSN**:
   ```bash
   # Backend
   python manage.py shell
   >>> import os
   >>> print(os.getenv('SENTRY_DSN'))

   # Frontend
   console.log(process.env.NEXT_PUBLIC_SENTRY_DSN)
   ```

2. **Verificar modo Debug** (desarrollo):
   ```python
   # Backend - settings.py
   sentry_sdk.init(
       debug=True,  # Ver logs de Sentry
   )
   ```

   ```typescript
   // Frontend - sentry.*.config.ts
   Sentry.init({
       debug: true,
   })
   ```

3. **Verificar filtros**:
   - Comentar temporalmente `beforeSend`
   - Comentar `ignoreErrors`
   - Verificar que no esté filtrando todo

4. **Verificar environment**:
   ```bash
   # Si DSN está vacío en desarrollo, no se envía
   # Asegurarse de que SENTRY_DSN esté definido
   ```

### ❌ Problema 2: Source maps no funcionan

**Síntomas**:
- Stack traces con código minificado
- No se ven nombres de archivos originales

**Soluciones**:

1. **Verificar Auth Token**:
   ```bash
   # .env.local
   SENTRY_AUTH_TOKEN=sntrys_xxxxx  # Debe estar definido
   ```

2. **Verificar permisos del token**:
   - `project:releases` ✅
   - `project:write` ✅
   - `org:read` ✅

3. **Verificar build logs**:
   ```bash
   npm run build
   # Debe mostrar:
   # ✓ Uploading source maps to Sentry
   ```

4. **Verificar en Sentry**:
   - `Settings > Projects > bvs-frontend > Source Maps`
   - Debe aparecer la release

### ❌ Problema 3: Demasiados eventos / Quota excedida

**Síntomas**:
- Sentry reporta quota excedida
- Emails de "quota exceeded"

**Soluciones**:

1. **Reducir sampling**:
   ```python
   # Backend
   traces_sample_rate=0.1  # Reducir a 10%
   profiles_sample_rate=0.05  # Reducir a 5%
   ```

   ```typescript
   // Frontend
   tracesSampleRate: 0.1,
   replaysSessionSampleRate: 0.05,
   ```

2. **Mejorar filtros**:
   ```python
   # Agregar más errores a ignorar
   ignore_errors=[
       'django.security.DisallowedHost',
       'OperationalError',  # Errores de DB temporales
   ]
   ```

3. **Filtrar por environment**:
   ```python
   # Solo enviar en staging/production
   if SENTRY_DSN and ENVIRONMENT != 'development':
       sentry_sdk.init(...)
   ```

### ❌ Problema 4: Session Replay no funciona

**Síntomas**:
- Errores capturados pero sin replay

**Soluciones**:

1. **Verificar sampling**:
   ```typescript
   replaysOnErrorSampleRate: 1.0,  // 100% cuando hay error
   ```

2. **Verificar en Sentry**:
   - `Settings > Projects > bvs-frontend > Session Replay`
   - Debe estar habilitado

3. **Verificar Content Security Policy**:
   - Si tienes CSP estricto, puede bloquear Sentry
   - Agregar a CSP headers:
     ```
     script-src 'self' https://*.sentry.io;
     connect-src 'self' https://*.sentry.io;
     ```

### ❌ Problema 5: Performance impactado

**Síntomas**:
- Aplicación más lenta después de Sentry

**Soluciones**:

1. **Reducir breadcrumbs**:
   ```python
   max_breadcrumbs=20,  # Reducir de 50
   ```

2. **Deshabilitar features costosos**:
   ```typescript
   // Frontend - deshabilitar Session Replay en producción
   replaysSessionSampleRate: 0,  // Solo capturar en errores
   replaysOnErrorSampleRate: 1.0,
   ```

3. **Usar async**:
   - Sentry ya usa async por defecto
   - No debería bloquear requests

### 📞 Soporte

- **Documentación oficial**: https://docs.sentry.io/
- **Discord Sentry**: https://discord.gg/sentry
- **GitHub Issues**: https://github.com/getsentry/sentry

---

## 📝 Notas Finales

### ✅ Completado

- ✅ Backend Django completamente configurado
- ✅ Frontend Next.js con 3 runtimes configurados
- ✅ Instrumentation hooks implementados
- ✅ Variables de entorno definidas
- ✅ Filtros de errores configurados
- ✅ Performance monitoring habilitado
- ✅ Session Replay configurado

### ⏳ Pendiente (requiere cuenta Sentry.io)

1. Crear cuenta en Sentry.io
2. Crear proyectos (bvs-backend, bvs-frontend)
3. Obtener DSNs y configurar en `.env`
4. Crear Auth Token para source maps
5. Configurar alertas y notificaciones
6. Ejecutar tests de funcionamiento
7. Configurar dashboards

### 🎯 Próximos Pasos

1. **Crear cuenta Sentry**: https://sentry.io/signup/
2. **Configurar proyectos** siguiendo sección "Configuración en Sentry.io"
3. **Ejecutar tests** de la sección "Pruebas de Funcionamiento"
4. **Configurar alertas** críticas
5. **Monitorear** durante 1 semana para ajustar sampling
6. **Optimizar** filtros según errores reales

---

## 📚 Referencias

- [Sentry Django Docs](https://docs.sentry.io/platforms/python/guides/django/)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Session Replay Docs](https://docs.sentry.io/platforms/javascript/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)

---

**Última actualización**: 2026-01-05
**Versión**: 1.0.0
**Sprint**: 7 - DevOps Crítico Parte 1
