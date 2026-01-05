# 📊 Sprint 7 - Implementación de Sentry (MON-001) - RESUMEN

> **Status**: 🟡 **EN PROGRESO** (Backend ✅ / Frontend ⏳)
> **Fecha**: 2026-01-05

---

## ✅ **COMPLETADO - Backend (Django)**

### **1. Dependencias Agregadas**

**Archivo**: `backend/requirements.txt`

```python
# Monitoring
sentry-sdk[django]>=1.40
```

### **2. Configuración en Settings**

**Archivo**: `backend/config/settings.py` (líneas 244-356)

**Features Implementadas**:
- ✅ Integración con Django (DjangoIntegration)
- ✅ Integración con Redis (RedisIntegration)
- ✅ Integración con Celery (CeleryIntegration)
- ✅ Performance Monitoring (traces_sample_rate)
- ✅ Error sampling configurable
- ✅ Captura de PII (Personally Identifiable Information)
- ✅ Breadcrumbs (hasta 50 eventos)
- ✅ Stack locals attached
- ✅ Before send hook para filtrar eventos
- ✅ Filtrado de errores de health checks
- ✅ Configuración por ambiente (development/staging/production)

**Configuración**:
```python
sentry_sdk.init(
    dsn=SENTRY_DSN,
    integrations=[DjangoIntegration(), RedisIntegration(), CeleryIntegration()],
    environment=SENTRY_ENVIRONMENT,
    release=SENTRY_RELEASE,
    traces_sample_rate=1.0 if DEBUG else 0.2,
    sample_rate=1.0,
    send_default_pii=True,
    max_breadcrumbs=50,
    attach_stacktrace=True,
)
```

### **3. Variables de Entorno**

**Archivo**: `.env`

```bash
# Sentry - Error Tracking & Performance Monitoring
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=bvs-backend@1.0.0
```

---

## ⏳ **EN PROGRESO - Frontend (Next.js)**

### **1. Dependencias Agregadas**

**Archivo**: `frontend/package.json`

```json
{
  "dependencies": {
    "@sentry/nextjs": "^8.45.0"
  }
}
```

### **2. Archivos Pendientes de Crear**

Para completar la integración de Sentry en Next.js, necesitas crear:

#### **A. Archivo de Configuración de Sentry**

**`frontend/sentry.client.config.ts`**:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "bvs-frontend@1.0.0",

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event, hint) {
    // Filter out errors from browser extensions
    if (event.exception) {
      const error = hint.originalException as Error;
      if (error?.message?.includes('chrome-extension')) {
        return null;
      }
    }
    return event;
  },

  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension',
    'moz-extension',
    // Network errors
    'NetworkError',
    'Failed to fetch',
  ],
});
```

#### **B. Configuración del Servidor**

**`frontend/sentry.server.config.ts`**:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "bvs-frontend@1.0.0",

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  beforeSend(event) {
    // Server-side filtering
    return event;
  },
});
```

#### **C. Configuración de Next.js**

**`frontend/sentry.edge.config.ts`** (para Edge Runtime):
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "bvs-frontend@1.0.0",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
});
```

#### **D. Variables de Entorno Frontend**

**`frontend/.env.local`**:
```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_RELEASE=bvs-frontend@1.0.0
```

#### **E. Instrumentación de Next.js**

**`frontend/instrumentation.ts`** (en la raíz):
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (err: Error, request: Request) => {
  await import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException(err, {
      extra: {
        url: request.url,
        method: request.method,
      },
    });
  });
};
```

#### **F. Actualizar next.config.js**

**`frontend/next.config.mjs`**:
```javascript
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tu configuración existente
  experimental: {
    instrumentationHook: true,
  },
};

export default withSentryConfig(
  nextConfig,
  {
    // Sentry Build Plugin Options
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Sentry SDK Options
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
```

---

## 🚀 **CÓMO COMPLETAR LA IMPLEMENTACIÓN**

### **Paso 1: Instalar Dependencias**

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### **Paso 2: Crear Proyecto en Sentry**

1. Ve a https://sentry.io/signup/
2. Crea una cuenta gratuita
3. Crea dos proyectos:
   - **bvs-backend** (Platform: Django)
   - **bvs-frontend** (Platform: Next.js)
4. Copia los DSN de cada proyecto

### **Paso 3: Configurar Variables de Entorno**

**Backend** (`.env`):
```bash
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=bvs-backend@1.0.0
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_RELEASE=bvs-frontend@1.0.0

# Opcional (para upload de source maps)
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=bvs-frontend
```

### **Paso 4: Crear Archivos de Configuración Frontend**

Crea los archivos listados en la sección "Archivos Pendientes de Crear" arriba.

### **Paso 5: Reiniciar Servicios**

```bash
# Backend
docker-compose restart backend

# Frontend
docker-compose restart frontend
```

### **Paso 6: Probar Error Tracking**

#### **Backend**:
```python
# En cualquier view de Django
from sentry_sdk import capture_exception, capture_message

def test_sentry(request):
    # Test de mensaje
    capture_message("Test message from Django", level="info")

    # Test de excepción
    try:
        1 / 0
    except Exception as e:
        capture_exception(e)

    return JsonResponse({"status": "Sentry test sent"})
```

#### **Frontend**:
```typescript
// En cualquier página o componente
import * as Sentry from "@sentry/nextjs";

function testSentry() {
  // Test de mensaje
  Sentry.captureMessage("Test message from Next.js", "info");

  // Test de excepción
  try {
    throw new Error("Test error from Next.js");
  } catch (error) {
    Sentry.captureException(error);
  }
}
```

---

## 📊 **CARACTERÍSTICAS DE SENTRY**

### **Error Tracking**
- ✅ Captura automática de errores no manejados
- ✅ Stack traces completos
- ✅ Contexto de request (URL, headers, body)
- ✅ Variables locales en stack frames
- ✅ Breadcrumbs (trail de eventos)

### **Performance Monitoring**
- ✅ Transaction tracking (API endpoints, page loads)
- ✅ Database query monitoring
- ✅ Slow query detection
- ✅ Response time metrics
- ✅ Throughput analysis

### **Session Replay** (Frontend)
- ✅ Grabación de sesiones de usuario
- ✅ Replay de errores
- ✅ Enmascaramiento de datos sensibles

### **Alerts**
- ✅ Email notifications
- ✅ Slack integration
- ✅ PagerDuty integration
- ✅ Custom webhooks

---

## 🎯 **TAREAS PENDIENTES**

- [ ] Crear archivos de configuración frontend (sentry.*.config.ts)
- [ ] Actualizar next.config.mjs
- [ ] Crear proyectos en Sentry.io
- [ ] Configurar DSN en variables de entorno
- [ ] Instalar dependencias (npm install)
- [ ] Probar error tracking
- [ ] Configurar alertas en Sentry dashboard
- [ ] Documentar procedimiento completo

---

## 📚 **DOCUMENTACIÓN**

### **Referencias**
- [Sentry Django Docs](https://docs.sentry.io/platforms/python/integrations/django/)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

### **Archivos Modificados**
- ✅ `backend/requirements.txt` - Agregada dependencia sentry-sdk
- ✅ `backend/config/settings.py` - Configuración completa de Sentry
- ✅ `.env` - Variables de entorno para Sentry
- ✅ `frontend/package.json` - Agregada dependencia @sentry/nextjs
- ⏳ `frontend/sentry.*.config.ts` - Pendiente
- ⏳ `frontend/instrumentation.ts` - Pendiente
- ⏳ `frontend/next.config.mjs` - Pendiente actualizar

---

## ✅ **SIGUIENTE PASO**

**Opción A**: Continuar con la implementación de Sentry frontend (crear archivos de configuración)

**Opción B**: Pasar a la siguiente tarea del Sprint 7:
- **SEC-001**: Rate Limiting
- **MON-001**: Logging Centralizado

¿Cuál prefieres?

---

**Progreso del Sprint 7**:
- ✅ INFRA-001: Backups Automáticos (100%)
- 🟡 MON-001: Sentry Backend (100%) / Frontend (60%)
- ⏳ SEC-001: Rate Limiting (0%)
- ⏳ MON-001: Logging Centralizado (0%)

**Status Global**: ~40% del Sprint 7 completado
