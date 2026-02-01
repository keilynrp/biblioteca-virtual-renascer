# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Planned
- Sistema de recomendaciones basado en ML
- Analytics y reporting avanzado
- Búsqueda dentro de contenido de PDFs
- Sistema de gamificación con badges y puntos
- Aplicación móvil nativa (iOS/Android)

---

## [0.10.0] - 2026-01-23

### Added
- **Sistema completo de anotaciones en PDF**
  - Bookmarks: Marcadores de páginas con títulos y notas
  - Highlights: Resaltado de texto con 5 colores
  - Annotations: Notas asociadas a posiciones específicas
  - Privacidad configurable para anotaciones
- **Backend**
  - Modelos: Bookmark, Highlight, Annotation
  - Endpoints para gestión de anotaciones
  - Permisos granulares IsOwner
- **Frontend**
  - Componentes: AnnotationsSidebar, BookmarksList, HighlightsList
  - Integración en lector PDF
  - UI para crear y gestionar anotaciones

### Changed
- Mejorada navegación del lector PDF
- Optimizado rendimiento de carga de anotaciones

### Documentation
- Documentación completa de anotaciones
- Guías de uso de bookmarks y highlights

---

## [0.9.0] - 2026-01-22

### Added
- **Personalizador de temas**
  - 6 temas predefinidos (Teal, Ocean Blue, Forest Green, Royal Purple, Sunset Orange, Rose Red)
  - Modo oscuro/claro toggleable
  - Preview en vivo de colores
  - Persistencia en localStorage
- **PWA (Progressive Web App)**
  - Manifest completo
  - Service Worker
  - Instalación en dispositivos
  - Shortcuts: Mi Biblioteca, Mis Préstamos
  - Iconos optimizados (72-512px)

### Changed
- Mejorado cursor pointer en elementos interactivos
- Rediseñado página de perfil de usuario

### Fixed
- Valores HSL inválidos en modo oscuro
- CSS optimizado para mejor performance

---

## [0.8.0] - 2026-01-15

### Added
- **Sistema de Préstamos Físicos**
  - Modelo BookCopy para ejemplares físicos
  - Gestión de préstamos con estados
  - Cola de espera para libros no disponibles
  - Sistema de renovación con límites
  - Cálculo automático de multas por retraso
  - Notificaciones de vencimiento

### Changed
- Mejorada estructura de base de datos para préstamos

---

## [0.7.0] - 2026-01-10

### Added
- **Clubes de Lectura y Comunidades**
  - Modelo ReadingClub con privacidad configurable
  - Roles de miembro (Admin, Moderador, Miembro)
  - Sistema de discusiones con threads
  - Publicaciones con sistema de likes
  - Enlace de discusiones a libros específicos

### Documentation
- Guías de uso de clubes de lectura
- Documentación de API de comunidades

---

## [0.6.0] - 2026-01-05

### Added
- **Sistema de Notificaciones**
  - 8 tipos de notificaciones
  - Centro de notificaciones unificado
  - Envío opcional por email
  - Metadata personalizable
  - Marcado como leída con timestamp

### Changed
- Mejorado sistema de eventos para notificaciones

---

## [0.5.0] - 2025-12-30

### Added
- **Lector PDF Completo**
  - Visor nativo de PDF en navegador
  - Control de zoom (1.00 = 100%)
  - Navegación por páginas
  - Tracking automático de progreso
  - Registro de tiempo total de lectura
  - Sesiones de lectura detalladas

### Changed
- Optimizado rendimiento del visor PDF
- Mejorada experiencia de usuario en lectura

### Documentation
- Guías de uso del lector PDF
- Sprint 6 completo documentado

---

## [0.4.0] - 2025-12-27

### Added
- **Búsqueda Avanzada con Meilisearch**
  - Migración desde Elasticsearch
  - Búsqueda full-text optimizada
  - Autocompletado inteligente
  - Filtros por categoría, autor, premium
  - Facetas de búsqueda
  - Rate limiting específico para búsqueda

### Changed
- Motor de búsqueda completamente reemplazado
- Mejorado performance de búsquedas

### Removed
- Elasticsearch (migrado a Meilisearch)

### Documentation
- Documentación de migración a Meilisearch
- Guías de configuración de búsqueda

---

## [0.3.0] - 2025-12-20

### Added
- **Sistema de Engagement Completo**
  - Reseñas con calificaciones 1-5 estrellas
  - Sistema de votación helpful/not helpful en reseñas
  - Favoritos con notas personales
  - Historial de lectura con estados (leyendo, completado, en pausa, abandonado)
  - Contador de reseñas y favoritos por libro
- **Testing Frontend**
  - Tests unitarios con Jest
  - React Testing Library
  - Coverage reporting
  - Tests para componentes críticos

### Changed
- Mejorada UX/UI general
- Optimizadas animaciones y transiciones

### Documentation
- Sprint 4 completado
- Guías de testing frontend

---

## [0.2.0] - 2025-12-15

### Added
- **Sistema de Suscripciones y Pagos**
  - Múltiples planes configurables
  - Suscripciones individuales e institucionales
  - Integración completa con Stripe
  - PaymentIntent y webhooks
  - Auto-renovación de suscripciones
  - Manejo de transacciones (PENDING, COMPLETED, FAILED)
- **Perfiles de Usuario**
  - CRUD completo de usuarios
  - Avatares personalizables
  - Biografía y preferencias
  - 6 tipos de usuario (Student, Employee, Teacher, Librarian, Moderator, Content Manager)

### Changed
- Mejorado diseño UI de planes de suscripción
- Optimizado flujo de checkout

### Documentation
- Documentación de integración con Stripe
- Guías de configuración de pagos

---

## [0.1.0] - 2025-12-10

### Added
- **Autenticación y Autorización**
  - Sistema JWT con access y refresh tokens
  - Login y registro de usuarios
  - Gestión de sesiones
  - Rate limiting en endpoints de autenticación
- **Gestión de Contenido**
  - Modelos: Book, Author, Category
  - CRUD completo de libros
  - Importación desde OpenLibrary API
  - Gestión de archivos PDF (hasta 50MB)
  - Imágenes de portada (hasta 5MB)
- **Setup Inicial**
  - Configuración de Docker y Docker Compose
  - PostgreSQL 16
  - Redis 7
  - Setup de CI/CD básico
  - Nginx como reverse proxy

### Infrastructure
- Docker containerization
- PostgreSQL database
- Redis caching
- Nginx reverse proxy
- WSL optimization guides

### Documentation
- README completo
- Guías de instalación
- Documentación de Docker
- Configuración de GitHub

---

## [0.0.1] - 2025-12-01

### Added
- Estructura inicial del proyecto
- Setup de repositorio
- Configuración de entornos
- Primera versión de README

---

## Tipos de Cambios

- `Added`: para funcionalidades nuevas
- `Changed`: para cambios en funcionalidades existentes
- `Deprecated`: para funcionalidades que serán removidas
- `Removed`: para funcionalidades removidas
- `Fixed`: para correcciones de bugs
- `Security`: para vulnerabilidades de seguridad
- `Documentation`: para cambios en documentación
- `Infrastructure`: para cambios en infraestructura
- `Performance`: para mejoras de performance

---

## Links

- [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
- [Semantic Versioning](https://semver.org/lang/es/)
- [Roadmap](docs/roadmap/README.md)
- [Contributing](CONTRIBUTING.md)

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>
