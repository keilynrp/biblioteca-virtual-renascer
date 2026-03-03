<div align="center">

# Biblioteca Virtual Renascer do Saber

**Plataforma de biblioteca virtual para instituciones educativas**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/keilynrp/biblioteca-virtual-renascer/releases/tag/v1.0.0)
[![Django](https://img.shields.io/badge/Django-6.0-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-Dokploy-orange.svg)](https://dokploy.com)

[Demo en vivo](https://bibliotecavirtual.renascerdosaber.com) · [Documentación](docs/README.md) · [Roadmap](docs/roadmap/README.md) · [Reportar bug](https://github.com/keilynrp/biblioteca-virtual-renascer/issues)

</div>

---

## Descripción

BVS es una plataforma de biblioteca digital orientada a instituciones educativas que combina gestión de catálogo, lector PDF con anotaciones, clubes de lectura, sistema de suscripciones con Stripe y herramientas de administración de contenido.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Python 3.13 · Django 6 · Django REST Framework · Celery 5 |
| **Frontend** | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui |
| **Base de datos** | PostgreSQL 16 |
| **Búsqueda** | Meilisearch 0.31 |
| **Cache / Cola** | Redis 7 |
| **Pagos** | Stripe |
| **Storage** | MinIO (S3-compatible) |
| **Notificaciones** | Sonner |
| **Deploy** | Docker Compose · Nginx · Dokploy |

---

## Inicio rápido

### Requisitos

- Docker ≥ 24 y Docker Compose v2
- Git

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/keilynrp/biblioteca-virtual-renascer.git
cd biblioteca-virtual-renascer

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores (DB, Stripe, Meilisearch, etc.)

# 3. Levantar los contenedores
docker compose up -d

# 4. Aplicar migraciones
docker exec -it bvs_framework-backend-1 python manage.py migrate

# 5. Crear superusuario
docker exec -it bvs_framework-backend-1 python manage.py createsuperuser
```

### Accesos locales

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |
| Meilisearch | http://localhost:7700 |

---

## Módulos principales

### Autenticación y usuarios
- JWT con refresh tokens
- Tipos de usuario: `student`, `employee`, `professor`, `librarian`, `moderator`
- Onboarding paso a paso
- Recuperación de contraseña

### Biblioteca digital
- Catálogo con búsqueda full-text (Meilisearch) y filtros facetados
- Importación masiva desde **OpenLibrary**, **DOAB** (Open Access) y **CSV/XLSX**
- Plantilla de importación descargable con todos los campos y ejemplo pre-poblado
- Reset completo del catálogo con confirmación de seguridad
- Lector PDF integrado con zoom, progreso y navegación por páginas
- Sistema de anotaciones: bookmarks, highlights y notas privadas
- Favoritos e historial de lectura con estados

### Préstamos físicos
- Solicitud y gestión de préstamos con códigos de barras
- Control de fechas y estados

### Clubes de lectura
- Creación de clubes con tablero de discusión
- Roles de miembro y moderación

### Suscripciones y facturación
- Planes individuales e institucionales
- Integración Stripe completa (webhooks, reembolsos, métodos de pago)
- Portal de facturación con historial de facturas

### Administración
- Dashboard con métricas en tiempo real
- Gestión de libros, autores y categorías
- Constructor de formularios dinámicos con protección CAPTCHA y honeypot
- Gestión de noticias/blog
- Configuración global del sitio
- Exportación de catálogo a CSV/XLSX

### Infraestructura
- PWA con soporte offline
- Multiidioma (i18n) con next-intl
- Notificaciones en tiempo real
- Sistema de backup automatizado
- Rate limiting por endpoint
- Sincronización offline con cola de reintentos

---

## Comandos útiles

```bash
# Importar libros desde OpenLibrary
docker exec -it bvs_framework-backend-1 python manage.py import_openlibrary --query "educacion" --limit 50

# Importar libros Open Access desde DOAB
docker exec -it bvs_framework-backend-1 python manage.py import_doab --subject "library science" --limit 50

# Resetear catálogo completo (requiere confirmación)
docker exec -it bvs_framework-backend-1 python manage.py reset_catalog --confirm

# Reconstruir índice de búsqueda
docker exec -it bvs_framework-backend-1 python manage.py rebuild_search_index

# Migraciones
docker exec -it bvs_framework-backend-1 python manage.py migrate

# Logs en tiempo real
docker logs -f bvs_framework-backend-1
```

---

## Estructura del proyecto

```
bvs_framework/
├── backend/
│   ├── apps/
│   │   ├── authentication/   # JWT, tipos de usuario
│   │   ├── content/          # Libros, autores, búsqueda, importación
│   │   ├── subscriptions/    # Planes de suscripción
│   │   ├── payments/         # Stripe, webhooks
│   │   ├── loans/            # Préstamos físicos
│   │   ├── communities/      # Clubes de lectura
│   │   ├── notifications/    # Notificaciones en tiempo real
│   │   ├── forms/            # Constructor de formularios dinámicos
│   │   ├── mailer/           # Email con SMTP configurable
│   │   └── core/             # Utilidades compartidas
│   └── config/
├── frontend/
│   └── src/
│       ├── app/[locale]/
│       │   ├── (auth)/       # Login, registro, onboarding
│       │   ├── (marketing)/  # Landing, precios, blog
│       │   └── (dashboard)/  # App principal (protegida)
│       ├── components/
│       │   ├── ui/           # shadcn/ui base
│       │   └── reader/       # Lector PDF
│       ├── hooks/
│       ├── store/            # Zustand
│       └── services/         # API clients (axios)
├── docker/
├── nginx/
├── scripts/
└── docs/
```

---

## Releases

### v1.0.0 — Primera release estable (Marzo 2026)

Primera versión estable con todos los módulos core operativos en producción:

- Autenticación, onboarding y gestión de usuarios
- Biblioteca con lector PDF, anotaciones y búsqueda full-text
- Sistema de préstamos físicos
- Clubes de lectura con discusión
- Facturación completa con Stripe
- Panel de administración con analytics
- Constructor de formularios dinámicos con reCAPTCHA y Turnstile
- Blog y sistema de noticias
- PWA e i18n

---

## Roadmap

### Completado

| Sprint | Tema | Estado |
|---|---|---|
| 0 | Setup, Docker, CI/CD | ✅ |
| 1–2 | Autenticación y perfiles | ✅ |
| 3 | Suscripciones Stripe | ✅ |
| 4 | Testing y mejoras UX | ✅ |
| 5 | Búsqueda Meilisearch | ✅ |
| 6–7 | Lector PDF y backups | ✅ |
| 8 | Préstamos físicos | ✅ |
| 9 | Clubes de lectura | ✅ |
| 10 | Anotaciones PDF (bookmarks, highlights, notas) | ✅ |
| — | v1.0.0 · Formularios dinámicos · Importación DOAB · Reset de catálogo | ✅ |

### Próximos sprints

| Sprint | Mes | Tema |
|---|---|---|
| **11** | Mar 2026 | **Recomendaciones** — algoritmo basado en historial, reseñas y favoritos |
| **12** | Mar 2026 | **Analytics y reporting** — dashboards con Recharts, exportación PDF/CSV |
| **13** | Abr 2026 | **Búsqueda avanzada** — full-text en PDFs, historial de búsquedas guardadas |
| **14** | Abr–May 2026 | **Gamificación** — logros, badges, puntos, leaderboards y desafíos mensuales |
| **15** | May–Jun 2026 | **App móvil** — iOS y Android con sincronización y lectura offline |

---

## Contribución

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feat/nombre-feature`
3. Haz commit siguiendo la convención: `feat:`, `fix:`, `docs:`, `refactor:`
4. Abre un Pull Request hacia `main`

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para estándares de código, flujo Git y guía de tests.

---

## Licencia

[MIT](LICENSE) © 2026 Renascer do Saber
