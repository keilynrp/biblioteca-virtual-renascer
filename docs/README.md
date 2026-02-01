# 📚 Documentación - Biblioteca Virtual Renascer do Saber

Bienvenido a la documentación completa del proyecto **Biblioteca Virtual Renascer do Saber**. Esta guía te ayudará a navegar por toda la documentación disponible, desde la instalación inicial hasta conceptos técnicos avanzados.

## 📖 Índice

- [Inicio Rápido](#-inicio-rápido)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Guías de Uso](#-guías-de-uso)
- [Arquitectura y Diseño](#-arquitectura-y-diseño)
- [Desarrollo de Features](#-desarrollo-de-features)
- [Planificación y Sprints](#-planificación-y-sprints)
- [Optimización y Performance](#-optimización-y-performance)
- [Solución de Problemas](#-solución-de-problemas)
- [Contribución](#-contribución)
- [Referencia Técnica](#-referencia-técnica)

---

## 🚀 Inicio Rápido

¿Primera vez aquí? Empieza por estos documentos:

| Documento | Descripción | Tiempo |
|-----------|-------------|--------|
| [START_HERE](guides/START_HERE.md) | Punto de entrada principal | 5 min |
| [LEEME_PRIMERO](guides/LEEME_PRIMERO.md) | Introducción al proyecto | 10 min |
| [Quick Start Backend](guides/QUICK_START_BACKEND.md) | Iniciar backend rápidamente | 15 min |
| [Inicio Rápido](guides/INICIO_RAPIDO.md) | Guía paso a paso completa | 20 min |

### Acceso Rápido

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/bvs_framework.git
cd bvs_framework

# 2. Iniciar con Docker
./scripts/docker/start_containers.sh  # Linux/Mac/WSL
# o
scripts\docker\start_containers.ps1   # Windows

# 3. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/api
# Admin: http://localhost:8000/admin
```

**Ver también:** [README principal](../README.md)

---

## 🔧 Instalación y Configuración

### Docker y Contenedores

#### Guías de Instalación

| Documento | Descripción |
|-----------|-------------|
| [Docker Setup](setup/DOCKER_SETUP.md) | Configuración completa de Docker |
| [Docker V2 Guide](setup/DOCKER_V2_GUIDE.md) | Guía actualizada de Docker |
| [Docker Start Guide](setup/DOCKER_START_GUIDE.md) | Inicio rápido con Docker |
| [Instalar Docker Fácil](setup/INSTALAR_DOCKER_FACIL.md) | Instalación simplificada |
| [Install Docker Windows](setup/install_docker_windows.md) | Instalación en Windows |

#### Configuración WSL (Windows)

| Documento | Descripción |
|-----------|-------------|
| [Configurar Docker WSL](setup/CONFIGURAR_DOCKER_WSL.md) | Setup de Docker en WSL |
| [Docker WSL Paso a Paso](setup/CONFIGURAR_DOCKER_WSL_PASO_A_PASO.md) | Guía detallada |
| [Configurar Memoria WSL](setup/CONFIGURAR_MEMORIA_WSL.md) | Optimizar memoria en WSL |
| [Configurar WSL 16GB](setup/CONFIGURAR_WSL_16GB.md) | Para sistemas con 16GB RAM |

#### Optimización y Alternativas

| Documento | Descripción |
|-----------|-------------|
| [Mejores Prácticas Docker](MEJORES_PRACTICAS_DOCKER.md) | Best practices para Docker |
| [Alternativas Docker](setup/ALTERNATIVAS_DOCKER.md) | Instalación sin Docker |
| [Guía Upgrade 16GB](setup/GUIA_UPGRADE_16GB.md) | Optimizar para 16GB RAM |
| [Guía Completa Configuración 16GB](setup/GUIA_COMPLETA_CONFIGURACION_16GB.md) | Configuración detallada |

### GitHub y Versionamiento

| Documento | Descripción |
|-----------|-------------|
| [GitHub Setup](setup/GITHUB_SETUP.md) | Configurar Git y GitHub |
| [GitHub Config Guide](setup/GITHUB_CONFIG_GUIDE.md) | Guía de configuración |

### SSL y Seguridad

| Documento | Descripción |
|-----------|-------------|
| [SSL Setup](SSL_SETUP.md) | Configurar certificados SSL |
| [SSL Files Summary](architecture/SSL_FILES_SUMMARY.md) | Resumen de archivos SSL |

### Python y Versiones

| Documento | Descripción |
|-----------|-------------|
| [Python Downgrade](setup/PYTHON_DOWNGRADE_README.md) | Cambiar versión de Python |

---

## 📖 Guías de Uso

### Primeros Pasos

| Documento | Descripción |
|-----------|-------------|
| [Checklist Instalación Fase 1](setup/CHECKLIST_INSTALACION_FASE1.md) | Verificar instalación |
| [Listo para Instalar](setup/LISTO_PARA_INSTALAR.md) | Pre-instalación |
| [Instrucciones Visuales](guides/INSTRUCCIONES_VISUALES.md) | Guía con screenshots |

### Autenticación y Usuarios

| Documento | Descripción |
|-----------|-------------|
| [Crear Usuario](guides/INSTRUCCIONES_CREAR_USUARIO.md) | Crear superusuario |
| [Credenciales Acceso](guides/CREDENCIALES_ACCESO.md) | Gestionar credenciales |
| [Cómo Hacer Login](guides/COMO_HACER_LOGIN.md) | Guía de login |
| [Autenticación Verificada](guides/AUTENTICACION_VERIFICADA.md) | Verificar autenticación |
| [Auth Redirect Fix](AUTH_REDIRECT_FIX.md) | Solucionar redirecciones |

### Gestión de Contenido

| Documento | Descripción |
|-----------|-------------|
| [Importar Libros](guides/EJECUTAR_IMPORTACION.md) | Importar desde OpenLibrary |
| [Instrucciones Importación Libros](guides/INSTRUCCIONES_IMPORTACION_LIBROS.md) | Guía detallada de importación |
| [Panel Admin Importación](guides/PANEL_ADMIN_IMPORTACION.md) | Usar panel de admin |
| [Book Card OpenLibrary Design](BOOK_CARD_OPENLIBRARY_DESIGN.md) | Diseño de tarjetas de libros |
| [Verify Book Cards](guides/VERIFY_BOOK_CARDS.md) | Verificar visualización |

### Migraciones y Actualizaciones

| Documento | Descripción |
|-----------|-------------|
| [Ejecutar Migraciones Fase 1](guides/EJECUTAR_MIGRACIONES_FASE1.md) | Aplicar migraciones |
| [Guía Rápida Migración](guides/GUIA_RAPIDA_MIGRACION.md) | Migración rápida |
| [Instrucciones Migración Docker](guides/INSTRUCCIONES_MIGRACION_DOCKER.md) | Migrar con Docker |
| [Instrucciones Actualización](guides/INSTRUCCIONES_ACTUALIZACION.md) | Actualizar el sistema |
| [Instrucciones Aplicar Cambios Fase 1](guides/INSTRUCCIONES_APLICAR_CAMBIOS_FASE1.md) | Aplicar cambios |

### Funcionalidades Específicas

| Documento | Descripción |
|-----------|-------------|
| [Test Flipbook Guide](guides/TEST_FLIPBOOK_GUIDE.md) | Probar visor flipbook |
| [Quick Start Flipbook](guides/QUICK_START_FLIPBOOK.md) | Inicio rápido flipbook |
| [Year Picker Guide](guides/YEAR_PICKER_GUIDE.md) | Selector de año |
| [Year Picker README](guides/YEAR_PICKER_README.md) | Documentación year picker |
| [Year Picker Index](guides/YEAR_PICKER_INDEX.md) | Índice year picker |
| [Test Year Picker](guides/TEST_YEAR_PICKER.md) | Probar selector de año |

### Scripts y Utilidades

| Documento | Descripción |
|-----------|-------------|
| [Guía Rápida Scripts](guides/GUIA_RAPIDA_SCRIPTS.md) | Usar scripts del proyecto |
| [Ejecutar Backups](guides/EJECUTAR_BACKUPS.md) | Realizar backups |
| [Pasos Rebuild](guides/PASOS_REBUILD.md) | Reconstruir contenedores |

### Validaciones y Verificaciones

| Documento | Descripción |
|-----------|-------------|
| [Instrucciones Verificación](guides/INSTRUCCIONES_VERIFICACION.md) | Verificar instalación |
| [Verificación Usuario](guides/VERIFICACION_USUARIO_README.md) | Verificar usuarios |
| [Validación PDF](guides/VALIDACION_PDF_DOCUMENTACION.md) | Validar PDFs |
| [Quick Start Validators](guides/QUICK_START_VALIDATORS.md) | Validadores rápidos |
| [Acceso Resuelto Verificación](guides/ACCESO_RESUELTO_VERIFICACION.md) | Verificar acceso |

### Logging y Monitoreo

| Documento | Descripción |
|-----------|-------------|
| [Logging Guide](guides/LOGGING_GUIDE.md) | Configurar logging |

---

## 🏗️ Arquitectura y Diseño

### Documentación Técnica

| Documento | Descripción |
|-----------|-------------|
| [Arquitectura Técnica](architecture/arquitectura_tecnica.md) | Visión general de la arquitectura |
| [Análisis Integración](architecture/ANALISIS_INTEGRACION.md) | Análisis de integraciones |
| [Integración Frontend-Backend](architecture/INTEGRACION_FRONTEND_BACKEND.md) | Comunicación F-B |
| [Implementación Completa](architecture/IMPLEMENTACION_COMPLETA.md) | Implementación general |

### Integraciones Externas

| Documento | Descripción |
|-----------|-------------|
| [Stripe Integration](architecture/STRIPE_INTEGRATION.md) | Integración con Stripe |
| [Stripe Setup Steps](architecture/STRIPE_SETUP_STEPS.md) | Pasos de configuración |
| [OpenLibrary Integration](architecture/INTEGRACION_OPENLIBRARY.md) | API de OpenLibrary |

### Búsqueda y Cache

| Documento | Descripción |
|-----------|-------------|
| [Meilisearch Migration](architecture/MEILISEARCH_MIGRATION.md) | Migración a Meilisearch |
| [Elasticsearch Search Feature](ELASTICSEARCH_SEARCH_FEATURE.md) | Feature de búsqueda (legacy) |
| [Cache Strategy](CACHE_STRATEGY.md) | Estrategia de cache |
| [Query Optimization](QUERY_OPTIMIZATION.md) | Optimización de queries |

### Sistemas de Backend

| Documento | Descripción |
|-----------|-------------|
| [Backup System](architecture/BACKUP_SYSTEM.md) | Sistema de backups |
| [Logging System](architecture/LOGGING_SYSTEM.md) | Sistema de logs |
| [Rate Limiting Configuration](architecture/RATE_LIMITING_CONFIGURATION.md) | Configurar rate limiting |
| [Sentry Configuración](architecture/SENTRY_CONFIGURACION_COMPLETA.md) | Monitoreo con Sentry |

### CI/CD

| Documento | Descripción |
|-----------|-------------|
| [CI/CD Documentation](architecture/CI_CD_DOCUMENTATION.md) | Pipeline de CI/CD |

---

## ⭐ Desarrollo de Features

### Mejoras y Features

| Documento | Descripción |
|-----------|-------------|
| [Mejoras Biblioteca](architecture/MEJORAS_BIBLIOTECA.md) | Mejoras del sistema |
| [Mejoras Implementadas](architecture/MEJORAS_IMPLEMENTADAS.md) | Features completadas |
| [Dashboard Improvements](DASHBOARD_IMPROVEMENTS.md) | Mejoras del dashboard |
| [Admin Panel Improvements](architecture/ADMIN_PANEL_IMPROVEMENTS.md) | Mejoras panel admin |

### UI/UX

| Documento | Descripción |
|-----------|-------------|
| [Frontend TailAdmin Update](architecture/FRONTEND_TAILADMIN_UPDATE.md) | Actualización de TailAdmin |
| [Temas y Colores](architecture/TEMAS_Y_COLORES.md) | Sistema de temas |
| [Comparación Temas](architecture/COMPARACION_TEMAS.md) | Análisis de temas |
| [Color Scheme Update](COLOR_SCHEME_UPDATE.md) | Actualización de colores |
| [Sidebar Collapse Feature](SIDEBAR_COLLAPSE_FEATURE.md) | Sidebar colapsable |
| [Landing Page Design](LANDING_PAGE_DESIGN.md) | Diseño de landing |

### Componentes

| Documento | Descripción |
|-----------|-------------|
| [Book Card Changes Summary](architecture/BOOK_CARD_CHANGES_SUMMARY.md) | Cambios en book cards |
| [Flipbook Preview Implementation](architecture/FLIPBOOK_PREVIEW_IMPLEMENTATION.md) | Implementación de flipbook |
| [Integración Componentes Fase 1](architecture/INTEGRACION_COMPONENTES_FASE1.md) | Integración de componentes |

### Actualizaciones Técnicas

| Documento | Descripción |
|-----------|-------------|
| [Node Version Upgrade](architecture/NODE_VERSION_UPGRADE.md) | Actualización de Node.js |

---

## 📋 Planificación y Sprints

### Roadmap y Planning

| Documento | Descripción |
|-----------|-------------|
| [Roadmap Biblioteca Virtual](sprint-docs/roadmap_biblioteca_virtual.md) | Roadmap completo |
| [Plan de Sprints](sprint-docs/plan_sprints.md) | Planificación de sprints |
| [Planning Sprints Detallado](sprint-docs/PLANNING_SPRINTS_DETALLADO.md) | Planning detallado |
| [Backlog Estratégico](sprint-docs/BACKLOG_ESTRATEGICO.md) | Backlog priorizado |
| [Estado Actual Proyecto](sprint-docs/ESTADO_ACTUAL_PROYECTO.md) | Estado actual |

### Sprints Completados

| Sprint | Documento | Tema |
|--------|-----------|------|
| Sprint 4 | [Sprint 4 Completado](sprint-docs/SPRINT_4_COMPLETADO.md) | Testing y UX |
| Sprint 4 | [Sprint 4 Optimizaciones](sprint-docs/SPRINT_4_OPTIMIZACIONES.md) | Optimizaciones |
| Sprint 4 | [Sprint 4 Resumen](sprint-docs/SPRINT_4_RESUMEN.md) | Resumen |
| Sprint 5 | [Sprint 5 Completado](sprint-docs/SPRINT_5_COMPLETADO.md) | Búsqueda avanzada |
| Sprint 5 | [Sprint 5 Plan](sprint-docs/SPRINT_5_PLAN.md) | Planificación |
| Sprint 6 | [Sprint 6 Complete](SPRINT_6_COMPLETE.md) | Lector PDF |
| Sprint 6 | [Sprint 6 Backend](SPRINT_6_BACKEND_COMPLETE.md) | Backend lector |
| Sprint 6 | [Sprint 6 Day 1](SPRINT_6_DAY1_FINAL.md) | Día 1 |
| Sprint 6 | [Sprint 6 Day 1 Summary](SPRINT_6_DAY1_SUMMARY.md) | Resumen día 1 |
| Sprint 6 | [Sprint 6 Progress](SPRINT_6_PROGRESS.md) | Progreso |
| Sprint 6 | [Sprint 6 PDF Reader Analysis](SPRINT_6_PDF_READER_ANALYSIS.md) | Análisis lector PDF |
| Sprint 7 | [Sprint 7 Backup Completado](sprint-docs/SPRINT_7_BACKUP_COMPLETADO.md) | Sistema de backups |
| Sprint 10 | [Sprint 10 Phase 1 Backend](sprint-docs/SPRINT_10_PHASE_1_BACKEND.md) | Anotaciones backend |
| Sprint 10 | [Sprint 10 Phase 2 Frontend](sprint-docs/SPRINT_10_PHASE_2_FRONTEND.md) | Anotaciones frontend |

### Planificación Futura

| Documento | Descripción |
|-----------|-------------|
| [Sprint 7-12 Planificación](sprint-docs/SPRINT_7_A_12_PLANIFICACION.md) | Planificación sprints 7-12 |
| [Roadmap Infraestructura](sprint-docs/ROADMAP_INFRAESTRUCTURA.md) | Roadmap de infraestructura |

### Fases y Validaciones

| Documento | Descripción |
|-----------|-------------|
| [Progreso Fase 1](sprint-docs/PROGRESO_FASE1.md) | Progreso primera fase |
| [Fase 1 Resumen Validaciones](sprint-docs/FASE1_RESUMEN_VALIDACIONES.md) | Validaciones fase 1 |

---

## ⚡ Optimización y Performance

### Performance

| Documento | Descripción |
|-----------|-------------|
| [Optimización Rendimiento](OPTIMIZACION_RENDIMIENTO.md) | Optimizaciones generales |
| [Frontend Performance Optimization](architecture/FRONTEND_PERFORMANCE_OPTIMIZATION.md) | Optimización frontend |
| [Query Optimization](QUERY_OPTIMIZATION.md) | Optimización de queries |
| [Comparación Optimizaciones](architecture/COMPARACION_OPTIMIZACIONES.md) | Análisis de optimizaciones |

### Correcciones Específicas

| Documento | Descripción |
|-----------|-------------|
| [Slow Frontend Explained](SLOW_FRONTEND_EXPLAINED.md) | Explicación lentitud frontend |
| [Frontend Pagination Fixes](FRONTEND_PAGINATION_FIXES.md) | Correcciones de paginación |
| [Fix Pagination 49 Books](FIX_PAGINATION_49_BOOKS.md) | Bug de paginación |
| [Comparación Admin Panel](architecture/COMPARACION_ADMIN_PANEL.md) | Optimización admin |

---

## 🔍 Solución de Problemas

### Guías Generales

| Documento | Descripción |
|-----------|-------------|
| [Troubleshooting](TROUBLESHOOTING.md) | Guía general de troubleshooting |
| [Índice Troubleshooting](INDICE_TROUBLESHOOTING.md) | Índice de problemas comunes |
| [Playbook Diagnóstico](PLAYBOOK_DIAGNOSTICO.md) | Playbook de diagnóstico |
| [Quick Decision Guide](QUICK_DECISION_GUIDE.md) | Guía rápida de decisiones |

### Problemas de Contenedores

| Documento | Descripción |
|-----------|-------------|
| [Troubleshooting Contenedores](TROUBLESHOOTING_CONTENEDORES.md) | Problemas con Docker |
| [Fix Summary](FIX_SUMMARY.md) | Resumen de correcciones |

### Problemas de Frontend

| Documento | Descripción |
|-----------|-------------|
| [Frontend Build Fix](FRONTEND_BUILD_FIX.md) | Corregir build de frontend |
| [Book Covers Troubleshooting](BOOK_COVERS_TROUBLESHOOTING.md) | Problemas con portadas |
| [Fix HTTP 400 Images](FIX_HTTP_400_IMAGES.md) | Error 400 en imágenes |
| [Filters Not Showing](FILTERS_NOT_SHOWING.md) | Filtros no visibles |

### Problemas de Backend

| Documento | Descripción |
|-----------|-------------|
| [Troubleshoot Search 500](TROUBLESHOOT_SEARCH_500.md) | Error 500 en búsqueda |
| [Corrección Rutas Dashboard](architecture/CORRECCION_RUTAS_DASHBOARD.md) | Rutas incorrectas |

### Acciones Rápidas

| Documento | Descripción |
|-----------|-------------|
| [Quick Fix](QUICK_FIX.md) | Correcciones rápidas |
| [Quick Start Actions](QUICK_START_ACTIONS.md) | Acciones rápidas de inicio |
| [Immediate Actions](IMMEDIATE_ACTIONS.md) | Acciones inmediatas |
| [Ejecuta Esto Ahora](guides/EJECUTA_ESTO_AHORA.md) | Comandos urgentes |

---

## 🤝 Contribución

### Guías de Contribución

| Documento | Descripción |
|-----------|-------------|
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Guía completa de contribución |
| [README principal](../README.md) | Información del proyecto |

### Para Desarrolladores

- Lee la [Guía de Contribución](../CONTRIBUTING.md) completa
- Revisa los [Estándares de Código](../CONTRIBUTING.md#-estándares-de-código)
- Sigue el [Flujo de Trabajo Git](../CONTRIBUTING.md#-flujo-de-trabajo-git)
- Escribe [Tests](../CONTRIBUTING.md#-testing) para tu código
- Actualiza la [Documentación](../CONTRIBUTING.md#-documentación)

---

## 📚 Referencia Técnica

### APIs y Endpoints

Documentación de API disponible en:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Tecnologías Principales

**Backend:**
- Python 3.13
- Django 6.0.1
- Django REST Framework 3.14.0
- PostgreSQL 16
- Meilisearch 0.31
- Redis 7

**Frontend:**
- Node.js 22
- Next.js 16.1.4
- React 19.2.3
- TypeScript 5.9.3
- TailwindCSS 4

**DevOps:**
- Docker & Docker Compose
- Nginx
- GitHub Actions (CI/CD)

### Estructura del Proyecto

```
bvs_framework/
├── backend/              # Django backend
│   ├── apps/            # Django apps
│   ├── config/          # Configuración
│   └── manage.py
├── frontend/            # Next.js frontend
│   └── src/
│       ├── app/         # Páginas (App Router)
│       ├── components/  # Componentes React
│       ├── hooks/       # Custom hooks
│       ├── store/       # Estado global
│       └── lib/         # Utilidades
├── docs/                # Esta documentación
├── scripts/             # Scripts de automatización
├── docker/              # Dockerfiles
├── nginx/               # Configuración Nginx
└── README.md            # Documentación principal
```

---

## 🗂️ Organización de la Documentación

### Por Categoría

```
docs/
├── setup/               # Instalación y configuración inicial
├── guides/              # Guías paso a paso de uso
├── architecture/        # Diseño técnico y arquitectura
├── sprint-docs/         # Planificación y sprints
├── optimization/        # Performance y optimizaciones
├── troubleshooting/     # Solución de problemas
├── features/            # Documentación de features específicas
└── fixes/               # Correcciones y patches
```

### Por Audiencia

**Para Usuarios Nuevos:**
1. [START_HERE](guides/START_HERE.md)
2. [LEEME_PRIMERO](guides/LEEME_PRIMERO.md)
3. [Inicio Rápido](guides/INICIO_RAPIDO.md)
4. [Instrucciones Visuales](guides/INSTRUCCIONES_VISUALES.md)

**Para Desarrolladores:**
1. [CONTRIBUTING.md](../CONTRIBUTING.md)
2. [Arquitectura Técnica](architecture/arquitectura_tecnica.md)
3. [Planning Sprints](sprint-docs/PLANNING_SPRINTS_DETALLADO.md)
4. [Estándares de Código](../CONTRIBUTING.md#-estándares-de-código)

**Para DevOps:**
1. [Docker Setup](setup/DOCKER_SETUP.md)
2. [CI/CD Documentation](architecture/CI_CD_DOCUMENTATION.md)
3. [Mejores Prácticas Docker](MEJORES_PRACTICAS_DOCKER.md)
4. [Backup System](architecture/BACKUP_SYSTEM.md)

**Para Troubleshooting:**
1. [Índice Troubleshooting](INDICE_TROUBLESHOOTING.md)
2. [Playbook Diagnóstico](PLAYBOOK_DIAGNOSTICO.md)
3. [Quick Fix](QUICK_FIX.md)
4. [Troubleshooting Contenedores](TROUBLESHOOTING_CONTENEDORES.md)

---

## 📞 Soporte y Ayuda

### ¿Necesitas Ayuda?

- 📖 **Documentación**: Revisa esta guía completa
- 🐛 **Bugs**: Abre un [Issue](https://github.com/tu-usuario/bvs_framework/issues)
- 💬 **Preguntas**: Usa [Discussions](https://github.com/tu-usuario/bvs_framework/discussions)
- 📧 **Contacto**: Email para asuntos privados

### Recursos Adicionales

- [README Principal](../README.md)
- [Guía de Contribución](../CONTRIBUTING.md)
- [CHANGELOG](../CHANGELOG.md)
- [Licencia MIT](../LICENSE)

---

## 🔄 Mantenimiento de Documentación

Esta documentación es mantenida activamente. Si encuentras:

- ❌ Documentación desactualizada
- ❌ Enlaces rotos
- ❌ Información incorrecta
- ❌ Typos o errores

Por favor:
1. Abre un [Issue](https://github.com/tu-usuario/bvs_framework/issues) describiendo el problema
2. O mejor aún, abre un [Pull Request](../CONTRIBUTING.md#-proceso-de-pull-request) con la corrección

---

## 📝 Convenciones

### Nomenclatura de Archivos

- `NOMBRE_EN_MAYUSCULAS.md` - Documentos principales e importantes
- `nombre_en_minusculas.md` - Documentos técnicos específicos
- `Nombre_Con_Mayusculas.md` - Guías y tutoriales

### Formato de Documentación

Toda la documentación sigue:
- **Markdown** estándar (CommonMark)
- Encabezados con emojis para navegación visual
- Tablas para comparaciones
- Bloques de código con syntax highlighting
- Enlaces relativos entre documentos

---

## 📊 Estadísticas de Documentación

```
Total de documentos:   150+ archivos
Categorías:            8 principales
Guías de usuario:      40+ guías
Docs técnicas:         30+ documentos
Sprints documentados:  10 sprints
Última actualización:  Enero 2026
```

---

<div align="center">

**¿Encontraste útil esta documentación?**

⭐ Dale una estrella al proyecto | 📖 Mejora la documentación | 🤝 Contribuye

[⬆ Volver arriba](#-documentación---biblioteca-virtual-renascer-do-saber)

---

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>
