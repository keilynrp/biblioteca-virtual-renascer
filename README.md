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
- 🔍 **Búsqueda y Filtros** - Sistema avanzado de búsqueda con paginación
- 👤 **Gestión de Usuarios** - Perfiles, avatares y preferencias
- 📊 **Dashboard Interactivo** - Estadísticas en tiempo real
- 🎨 **UI Moderna** - Diseño responsive con TailwindCSS y shadcn/ui

### 🚀 Mejoras Implementadas (Sprint #4)
- ✅ Toast notifications con 6 variantes
- ✅ Skeleton loaders para mejor UX
- ✅ Manejo estandarizado de errores
- ✅ Paginación y filtros avanzados
- ✅ Tests unitarios con Jest + RTL
- ✅ Sistema de feedback visual consistente

## 🏗️ Arquitectura

### Backend (Django REST Framework)
```
backend/
├── apps/
│   ├── authentication/    # Sistema de auth con JWT
│   ├── content/          # Libros, categorías, autores
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
│   ├── components/       # Componentes reutilizables
│   │   └── ui/          # Componentes base (shadcn/ui)
│   ├── lib/             # Utilidades y configuración
│   ├── store/           # Estado global (Zustand)
│   └── __tests__/       # Tests unitarios
└── package.json
```

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Django 5.0.1 + Django REST Framework 3.14.0
- **Base de Datos**: PostgreSQL 16
- **Cache**: Redis 7
- **Autenticación**: JWT (djangorestframework-simplejwt)
- **Pagos**: Stripe Python SDK
- **CORS**: django-cors-headers
- **Tareas Asíncronas**: Celery (planificado)

### Frontend
- **Framework**: Next.js 16.1.0 (App Router)
- **UI Library**: React 19.2.3
- **Estilos**: TailwindCSS 4 + shadcn/ui
- **Gestión de Estado**: Zustand 5.0.9
- **Formularios**: React Hook Form 7.69.0 + Zod 4.2.1
- **HTTP Client**: Axios 1.13.2
- **Testing**: Jest 30.2.0 + React Testing Library 16.3.1
- **Iconos**: Lucide React 0.562.0

### DevOps
- **Containerización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (planificado)
- **Monitoreo**: Sentry (planificado)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.11+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker y Docker Compose (opcional)

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/bvs_framework.git
cd bvs_framework

# Copiar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Configurar variables de entorno
# Editar backend/.env y frontend/.env.local

# Iniciar con Docker Compose
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# La aplicación estará disponible en:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Django Admin: http://localhost:8000/admin
```

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

### Backend
```bash
python manage.py runserver          # Iniciar servidor de desarrollo
python manage.py migrate             # Ejecutar migraciones
python manage.py makemigrations      # Crear migraciones
python manage.py createsuperuser     # Crear superusuario
python manage.py test                # Ejecutar tests
python manage.py collectstatic       # Recolectar archivos estáticos
```

### Frontend
```bash
npm run dev              # Desarrollo
npm run build            # Build de producción
npm run start            # Iniciar en producción
npm run lint             # Linter
npm run test             # Tests en modo watch
npm run test:ci          # Tests con coverage para CI
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
- ✅ **Sprint 4**: Testing Frontend y Mejoras UX (95% completado)

### Próximos Sprints
- ⏳ **Sprint 5**: Sistema de Búsqueda Avanzada (Elasticsearch)
- ⏳ **Sprint 6**: Lector de Documentos - Fase 1
- ⏳ **Sprint 7**: Lector de Documentos - Fase 2
- ⏳ **Sprint 8**: Sistema de Recomendaciones

Ver [PLANNING_SPRINTS_DETALLADO.md](PLANNING_SPRINTS_DETALLADO.md) para más detalles.

## 📈 Progreso

```
Backend:   ████████████░░░░░░░░  60% completado
Frontend:  ██████████░░░░░░░░░░  50% completado
Tests:     ████░░░░░░░░░░░░░░░░  20% completado
Docs:      ████████░░░░░░░░░░░░  40% completado
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

## 📚 Documentación Adicional

- [Arquitectura Técnica](arquitectura_tecnica.md)
- [Roadmap del Proyecto](roadmap_biblioteca_virtual.md)
- [Planning de Sprints](PLANNING_SPRINTS_DETALLADO.md)
- [Mejoras Implementadas](MEJORAS_IMPLEMENTADAS.md)
- [Sprint 4 - Resumen](SPRINT_4_RESUMEN.md)
- [Integración de Stripe](STRIPE_INTEGRATION.md)

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
