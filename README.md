# 📚 Biblioteca Virtual Renascer do Saber

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/django-5.0+-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/next.js-16.1.0-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-19.2.3-blue.svg)](https://reactjs.org/)

Una plataforma moderna de biblioteca virtual con gestión de suscripciones, pagos integrados y sistema de lectura en línea.

## 🌟 Características

### ✨ Core Features
- 🔐 **Autenticación JWT** - Sistema seguro de login/registro con refresh tokens
- 💳 **Pagos con Stripe** - Integración completa para suscripciones y pagos
- 📖 **Catálogo de Libros** - Gestión completa de libros, autores y categorías
- 🔍 **Búsqueda Avanzada** - Sistema de búsqueda con Elasticsearch y filtros
- 👤 **Gestión de Usuarios** - Perfiles, avatares y preferencias
- 📊 **Dashboard Interactivo** - Estadísticas en tiempo real
- 🎨 **UI Moderna** - Diseño responsive con TailwindCSS y shadcn/ui

### 🎯 Funcionalidades de Engagement
- ⭐ **Sistema de Reseñas** - Los usuarios pueden calificar y comentar libros
- ❤️ **Favoritos** - Marca libros como favoritos para acceso rápido
- 📚 **Historial de Lectura** - Rastrea el progreso de lectura (leyendo, completado, en pausa, abandonado)
- 👍 **Reseñas Útiles** - Sistema de votos para reseñas (helpful/not helpful)
- 🔒 **Permisos Granulares** - Los usuarios solo pueden editar su propio contenido

### 🚀 Mejoras Técnicas Recientes
- ✅ Toast notifications con 6 variantes
- ✅ Skeleton loaders para mejor UX
- ✅ Manejo estandarizado de errores
- ✅ Paginación y filtros avanzados
- ✅ Tests unitarios con Jest + RTL
- ✅ Sistema de feedback visual consistente
- ✅ Actualización a Python 3.13 y Node.js 22
- ✅ Componentes UI reutilizables (Tabs, Favorite Button, Review Form)

## 🏗️ Arquitectura

### Backend (Django REST Framework)
```
backend/
├── apps/
│   ├── authentication/    # Sistema de auth con JWT
│   ├── content/          # Libros, categorías, autores
│   │   ├── models/       # Review, Favorite, ReadingHistory
│   │   ├── permissions.py # IsOwnerOrReadOnly
│   │   └── management/   # Comandos (import_openlibrary)
│   ├── core/             # Utilidades y excepciones
│   ├── payments/         # Integración con Stripe
│   └── users/            # Gestión de usuarios
├── config/
│   └── settings/         # Configuración por entornos
│       ├── base.py
│       ├── development.py
│       ├── production.py
│       └── staging.py
└── manage.py
```

### Frontend (Next.js 16 + React 19)
```
frontend/
├── src/
│   ├── app/              # App Router de Next.js
│   │   ├── (auth)/       # Páginas de autenticación
│   │   └── (dashboard)/  # Páginas del dashboard
│   │       ├── favorites/        # Libros favoritos
│   │       ├── reading-history/  # Historial de lectura
│   │       ├── library/          # Biblioteca
│   │       └── profile/          # Perfil de usuario
│   ├── components/       # Componentes reutilizables
│   │   ├── ui/          # Componentes base (shadcn/ui + Tabs)
│   │   ├── favorite-button.tsx    # Botón de favoritos
│   │   ├── review-form.tsx        # Formulario de reseñas
│   │   ├── review-list.tsx        # Lista de reseñas
│   │   └── reading-status-selector.tsx
│   ├── lib/             # Utilidades y configuración
│   ├── store/           # Estado global (Zustand)
│   │   └── bookStore.ts # Store con funciones de engagement
│   └── __tests__/       # Tests unitarios
└── package.json
```

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Django 5.0.1 + Django REST Framework 3.14.0
- **Python**: 3.13 (actualizado desde 3.12)
- **Base de Datos**: PostgreSQL 16
- **Búsqueda**: Elasticsearch 8.x
- **Cache**: Redis 7
- **Autenticación**: JWT (djangorestframework-simplejwt)
- **Pagos**: Stripe Python SDK
- **CORS**: django-cors-headers
- **Tareas Asíncronas**: Celery (planificado)

### Frontend
- **Framework**: Next.js 16.1.0 (App Router)
- **Node.js**: 22 (actualizado desde 20)
- **UI Library**: React 19.2.3
- **Estilos**: TailwindCSS 4 + shadcn/ui
- **Gestión de Estado**: Zustand 5.0.9
- **Formularios**: React Hook Form 7.69.0 + Zod 4.2.1
- **HTTP Client**: Axios 1.13.2
- **Testing**: Jest 30.2.0 + React Testing Library 16.3.1
- **Iconos**: Lucide React 0.562.0
- **Utilidades**: date-fns 4.1.0 (manejo de fechas)
- **Componentes UI**: @radix-ui/react-tabs (componente Tabs)

### DevOps
- **Containerización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (planificado)
- **Monitoreo**: Sentry (planificado)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.13 (recomendado 3.12+)
- Node.js 22 (recomendado 20+)
- PostgreSQL 16+
- Elasticsearch 8.x
- Redis 7+
- Docker y Docker Compose (opcional)

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/bvs_framework.git
cd bvs_framework

# Copiar variables de entorno
cp .env.example .env

# Usar el script de inicio rápido
./scripts/docker/start_containers.sh  # Linux/Mac/WSL
# o
scripts\docker\start_containers.bat   # Windows

# La aplicación estará disponible en:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Django Admin: http://localhost:8000/admin
```

**Ver [docs/setup/](docs/setup/) para guías detalladas de instalación.**

#### 🔒 Con SSL/HTTPS (Opcional)

Para desarrollo local con HTTPS:

```bash
# Usar el script de setup SSL
./scripts/setup/setup-ssl.sh  # Linux/Mac/WSL
# o
scripts\setup\setup-ssl.bat   # Windows

# La aplicación estará disponible en:
# Frontend: https://localhost
# Backend API: https://localhost/api
# Django Admin: https://localhost/admin
```

**Ver [docs/setup/](docs/setup/) para instrucciones detalladas de configuración SSL.**

### Opción 2: Instalación Local

#### Backend

```bash
# Navegar al directorio del backend
cd backend

# Crear y activar entorno virtual
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar y configurar .env
cp .env.example .env

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver
```

#### Frontend

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Copiar y configurar .env.local
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno Backend

```env
# Django
DJANGO_ENV=development
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=biblioteca_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Variables de Entorno Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📝 Scripts Disponibles

El proyecto incluye una colección completa de scripts automatizados organizados en la carpeta [scripts/](scripts/).

### Scripts Principales

```bash
# Docker
./scripts/docker/start_containers.sh    # Iniciar todos los contenedores
./scripts/docker/check_docker.sh        # Verificar estado de Docker

# Mantenimiento
./scripts/maintenance/crear-superusuario.sh     # Crear usuario admin
./scripts/maintenance/importar-libros-custom.sh # Importar libros

# Utilidades
./scripts/utils/diagnostico-completo.sh # Diagnóstico del sistema
./scripts/utils/verificar-acceso.sh     # Verificar acceso
```

**Ver [scripts/README.md](scripts/README.md) para la lista completa de scripts disponibles.**

### Comandos Backend

```bash
python manage.py runserver              # Iniciar servidor de desarrollo
python manage.py migrate                # Ejecutar migraciones
python manage.py createsuperuser        # Crear superusuario
python manage.py test                   # Ejecutar tests
python manage.py import_openlibrary     # Importar libros desde OpenLibrary
```

### Comandos Frontend

```bash
npm run dev              # Desarrollo
npm run build            # Build de producción
npm run test             # Tests en modo watch
npm run test:coverage    # Tests con reporte de coverage
```

## 🧪 Testing

### Backend
```bash
# Ejecutar todos los tests
python manage.py test

# Ejecutar tests de una app específica
python manage.py test apps.authentication

# Con coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend
```bash
# Modo watch (desarrollo)
npm run test

# Single run con coverage
npm run test:coverage

# CI mode
npm run test:ci
```

## 📊 Estado del Proyecto

### Sprints Completados
- ✅ **Sprint 0**: Setup y Preparación
- ✅ **Sprint 1**: Autenticación Básica
- ✅ **Sprint 2**: Perfiles de Usuario
- ✅ **Sprint 3**: Sistema de Suscripciones
- ✅ **Sprint 4**: Testing Frontend y Mejoras UX
- ✅ **Sprint 5**: Sistema de Búsqueda Avanzada (Elasticsearch)
- ✅ **Engagement Features**: Reseñas, Favoritos e Historial de Lectura

### Próximos Sprints
- ⏳ **Sprint 6**: Lector de Documentos - Fase 1
- ⏳ **Sprint 7**: Lector de Documentos - Fase 2
- ⏳ **Sprint 8**: Sistema de Recomendaciones

Ver [PLANNING_SPRINTS_DETALLADO.md](PLANNING_SPRINTS_DETALLADO.md) para más detalles.

### 🆕 Últimas Actualizaciones (Diciembre 2024)

#### Funcionalidades de Usuario
- Sistema completo de reseñas con calificaciones por estrellas
- Botón de favoritos con animaciones y feedback visual
- Historial de lectura con estados (leyendo, completado, en pausa, abandonado)
- Votación en reseñas (helpful/not helpful)
- Páginas dedicadas para favoritos y historial de lectura

#### Mejoras Técnicas
- Actualización a Python 3.13 y Node.js 22
- Migración completa de datos con nuevos modelos
- Componente Tabs reutilizable (@radix-ui/react-tabs)
- Sistema de permisos granulares (IsOwnerOrReadOnly)
- Integración de date-fns para manejo de fechas
- Store de Zustand extendido con funciones de engagement

#### Importación de Datos
- Comando de management para importar libros desde OpenLibrary API
- Scripts de automatización para setup y verificación
- Datos de prueba disponibles para desarrollo

## 📈 Progreso

```
Backend:   ██████████████░░░░░░  70% completado
Frontend:  ████████████░░░░░░░░  60% completado
Tests:     ██████░░░░░░░░░░░░░░  30% completado
Docs:      ██████████░░░░░░░░░░  50% completado
Search:    ████████████████░░░░  80% completado (Elasticsearch)
Engagement: ████████████████████  100% completado (Reviews, Favorites, History)
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo**: Claude AI + Equipo Renascer do Saber
- **Arquitectura**: Basada en mejores prácticas de Django y Next.js
- **Diseño**: TailAdmin + shadcn/ui

## 📚 Documentación

Toda la documentación está organizada en la carpeta [docs/](docs/).

### 📂 Categorías de Documentación

- **[🚀 Setup](docs/setup/)** - Guías de instalación y configuración
- **[📖 Guides](docs/guides/)** - Tutoriales y guías de uso
- **[🔧 Fixes](docs/fixes/)** - Soluciones y correcciones
- **[📋 Sprint Docs](docs/sprint-docs/)** - Documentación de sprints
- **[🏗️ Architecture](docs/architecture/)** - Arquitectura técnica
- **[🔍 Troubleshooting](docs/troubleshooting/)** - Diagnóstico y soluciones

### 🔗 Enlaces Rápidos

- **[📖 Índice de Documentación](docs/README.md)** - Punto de entrada a toda la documentación
- **[🔧 Scripts Disponibles](scripts/README.md)** - Guía completa de scripts
- **[🤝 Guía de Contribución](CONTRIBUTING.md)** - Cómo contribuir al proyecto

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor abre un issue con:
- Descripción detallada del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots (si aplica)
- Información del ambiente (OS, versión de navegador, etc.)

## 💬 Soporte

Para soporte, por favor abre un issue en GitHub o contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**
