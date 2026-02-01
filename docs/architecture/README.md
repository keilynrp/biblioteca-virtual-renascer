# 🏗️ Arquitectura y Diseño Técnico

Documentación de la arquitectura, diseño técnico e integraciones del proyecto Biblioteca Virtual Renascer do Saber.

## 📖 Índice

- [Visión General](#-visión-general)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Integraciones](#-integraciones)
- [Migraciones y Actualizaciones](#-migraciones-y-actualizaciones)
- [Infraestructura](#-infraestructura)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [Decisiones de Diseño](#-decisiones-de-diseño)

---

## 🌐 Visión General

### Documentos Principales

| Documento | Descripción |
|-----------|-------------|
| [Arquitectura Técnica](arquitectura_tecnica.md) | Visión general de la arquitectura del sistema |
| [Análisis de Integración](ANALISIS_INTEGRACION.md) | Análisis completo de integraciones |
| [Implementación Completa](IMPLEMENTACION_COMPLETA.md) | Documentación de implementación general |
| [Integración Frontend-Backend](INTEGRACION_FRONTEND_BACKEND.md) | Comunicación entre capas |

---

## 🏛️ Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────────────────────────┐
│      Frontend (Next.js 16)          │
│  React 19 + TypeScript + TailwindCSS│
└────────────┬────────────────────────┘
             │
             │ REST API (HTTPS)
             │
┌────────────▼────────────────────────┐
│      Backend (Django 6.0)           │
│   Django REST Framework + Python 3.13│
└────────────┬────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
┌───▼───┐ ┌─▼──┐ ┌──▼───┐
│ PostgreSQL│Redis│Meilise│
│    16   │  7  │ arch  │
└─────────┘ └────┘ └──────┘
```

---

## 🔌 Integraciones

### Externas

| Integración | Documento | Descripción |
|-------------|-----------|-------------|
| **Stripe** | [Stripe Integration](STRIPE_INTEGRATION.md) | Integración completa de pagos |
| **Stripe** | [Stripe Setup Steps](STRIPE_SETUP_STEPS.md) | Pasos de configuración |
| **OpenLibrary** | [OpenLibrary Integration](INTEGRACION_OPENLIBRARY.md) | Importación de libros |

### Internas

| Sistema | Documento | Descripción |
|---------|-----------|-------------|
| **Componentes** | [Integración Componentes Fase 1](INTEGRACION_COMPONENTES_FASE1.md) | Integración de componentes |

---

## 🔄 Migraciones y Actualizaciones

### Búsqueda

| Documento | Descripción |
|-----------|-------------|
| [Meilisearch Migration](MEILISEARCH_MIGRATION.md) | Migración de Elasticsearch a Meilisearch |

### Versiones

| Documento | Descripción |
|-----------|-------------|
| [Node Version Upgrade](NODE_VERSION_UPGRADE.md) | Actualización de Node.js a v22 |

---

## 🖥️ Infraestructura

### Sistemas Core

| Sistema | Documento | Descripción |
|---------|-----------|-------------|
| **Backup** | [Backup System](BACKUP_SYSTEM.md) | Sistema automático de backups |
| **Logging** | [Logging System](LOGGING_SYSTEM.md) | Sistema centralizado de logs |
| **Monitoring** | [Sentry Configuración](SENTRY_CONFIGURACION_COMPLETA.md) | Monitoreo con Sentry |
| **Rate Limiting** | [Rate Limiting Configuration](RATE_LIMITING_CONFIGURATION.md) | Control de tráfico |
| **SSL** | [SSL Files Summary](SSL_FILES_SUMMARY.md) | Certificados SSL/TLS |

### CI/CD

| Documento | Descripción |
|-----------|-------------|
| [CI/CD Documentation](CI_CD_DOCUMENTATION.md) | Pipeline de integración y deployment |

---

## 🎨 Frontend

### Diseño y UI/UX

| Documento | Descripción |
|-----------|-------------|
| [Frontend TailAdmin Update](FRONTEND_TAILADMIN_UPDATE.md) | Actualización a TailAdmin |
| [Temas y Colores](TEMAS_Y_COLORES.md) | Sistema de temas personalizables |
| [Comparación Temas](COMPARACION_TEMAS.md) | Análisis de temas disponibles |
| [Frontend Performance Optimization](FRONTEND_PERFORMANCE_OPTIMIZATION.md) | Optimizaciones de performance |

### Componentes

| Documento | Descripción |
|-----------|-------------|
| [Book Card Changes Summary](BOOK_CARD_CHANGES_SUMMARY.md) | Cambios en componente BookCard |
| [Flipbook Preview Implementation](FLIPBOOK_PREVIEW_IMPLEMENTATION.md) | Visor de libros estilo flipbook |

### Mejoras y Features

| Documento | Descripción |
|-----------|-------------|
| [Mejoras Biblioteca](MEJORAS_BIBLIOTECA.md) | Mejoras generales del sistema |
| [Mejoras Implementadas](MEJORAS_IMPLEMENTADAS.md) | Features completadas |

---

## ⚙️ Backend

### Admin Panel

| Documento | Descripción |
|-----------|-------------|
| [Admin Panel Improvements](ADMIN_PANEL_IMPROVEMENTS.md) | Mejoras del panel de administración |
| [Comparación Admin Panel](COMPARACION_ADMIN_PANEL.md) | Análisis de mejoras |

### Optimizaciones

| Documento | Descripción |
|-----------|-------------|
| [Comparación Optimizaciones](COMPARACION_OPTIMIZACIONES.md) | Análisis de optimizaciones aplicadas |

---

## 🔧 Decisiones de Diseño

### Correcciones Arquitectónicas

| Documento | Descripción |
|-----------|-------------|
| [Corrección Rutas Dashboard](CORRECCION_RUTAS_DASHBOARD.md) | Reestructuración de rutas |

---

## 📊 Diagramas

### Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente (Navegador)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTPS
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      Nginx (Reverse Proxy)                  │
│                      - SSL Termination                      │
│                      - Load Balancing                       │
│                      - Static Files                         │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               │                          │
    ┌──────────▼─────────┐    ┌──────────▼────────┐
    │  Frontend (Next.js)│    │ Backend (Django)  │
    │  - Server Side     │    │ - REST API        │
    │  - Client Side     │    │ - Admin Panel     │
    │  - Static Assets   │    │ - Business Logic  │
    └────────────────────┘    └─────────┬─────────┘
                                        │
                       ┌────────────────┼────────────────┐
                       │                │                │
              ┌────────▼─────┐  ┌──────▼──────┐  ┌─────▼────┐
              │  PostgreSQL  │  │   Redis     │  │Meilisearch│
              │  - Main DB   │  │   - Cache   │  │  - Search │
              │  - Auth      │  │   - Sessions│  │  - Filters│
              └──────────────┘  └─────────────┘  └──────────┘
```

### Flujo de Datos

```
┌─────────┐
│ Usuario │
└────┬────┘
     │
     │ 1. Request
     ▼
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└────┬────────┘
     │
     │ 2. API Call (JWT)
     ▼
┌─────────────┐
│   Backend   │
│  (Django)   │
└────┬────────┘
     │
     │ 3. Query
     ▼
┌─────────────┐
│  Database   │
│ (PostgreSQL)│
└────┬────────┘
     │
     │ 4. Data
     ▼
┌─────────────┐
│   Backend   │
│  Serialize  │
└────┬────────┘
     │
     │ 5. JSON Response
     ▼
┌─────────────┐
│   Frontend  │
│   Render    │
└────┬────────┘
     │
     │ 6. Display
     ▼
┌─────────┐
│ Usuario │
└─────────┘
```

### Autenticación JWT

```
┌──────────┐              ┌──────────┐
│  Client  │              │  Server  │
└────┬─────┘              └────┬─────┘
     │                         │
     │ 1. POST /auth/login/    │
     ├────────────────────────>│
     │   {email, password}     │
     │                         │
     │                         │ 2. Validate
     │                         │    Credentials
     │                         │
     │ 3. JWT Tokens           │
     │<────────────────────────┤
     │   {access, refresh}     │
     │                         │
     │ 4. GET /api/data/       │
     ├────────────────────────>│
     │   Auth: Bearer {token}  │
     │                         │
     │                         │ 5. Validate
     │                         │    Token
     │                         │
     │ 6. Protected Data       │
     │<────────────────────────┤
     │                         │
```

---

## 🔗 Enlaces Relacionados

- [Documentación Principal](../README.md)
- [Documentación de API](../api/README.md)
- [Guías de Setup](../setup/)
- [Guías de Uso](../guides/)
- [Roadmap](../roadmap/)

---

## 📞 Soporte

¿Preguntas sobre la arquitectura?

- 💬 [Discussions](https://github.com/tu-usuario/bvs_framework/discussions)
- 📧 Contacta al equipo técnico

---

<div align="center">

[⬆ Volver arriba](#-arquitectura-y-diseño-técnico)

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>
