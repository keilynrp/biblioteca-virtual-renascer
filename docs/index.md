---
layout: home

hero:
  name: "Biblioteca Virtual"
  text: "Renascer do Saber"
  tagline: Plataforma moderna de biblioteca virtual con gestión integral de suscripciones, lectura y comunidad
  image:
    src: /logo.svg
    alt: BVS Logo
  actions:
    - theme: brand
      text: Comenzar
      link: /guides/START_HERE
    - theme: alt
      text: Ver en GitHub
      link: https://github.com/tu-usuario/bvs_framework

features:
  - icon: 🔐
    title: Autenticación Segura
    details: Sistema JWT con refresh tokens, múltiples tipos de usuario y soporte 2FA preparado

  - icon: 📖
    title: Lector PDF Avanzado
    details: Visor nativo con bookmarks, highlights, anotaciones y tracking de progreso

  - icon: 🔍
    title: Búsqueda Potente
    details: Motor de búsqueda con Meilisearch, autocompletado y filtros avanzados

  - icon: ⭐
    title: Sistema de Engagement
    details: Reseñas, favoritos, historial de lectura y comunidades activas

  - icon: 💳
    title: Suscripciones
    details: Integración completa con Stripe, múltiples planes y auto-renovación

  - icon: 🎨
    title: Personalizable
    details: 6 temas predefinidos, modo oscuro y totalmente responsive

  - icon: 📚
    title: Préstamos Físicos
    details: Gestión de ejemplares físicos, renovaciones y multas automáticas

  - icon: 👥
    title: Clubes de Lectura
    details: Comunidades con roles, discusiones y publicaciones con likes

  - icon: 📱
    title: PWA
    details: Progressive Web App instalable con funcionalidad offline
---

## 🚀 Quick Start

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/bvs_framework.git
cd bvs_framework

# Iniciar con Docker
./scripts/docker/start_containers.sh

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/api
# Admin: http://localhost:8000/admin
```

## 📚 Documentación

<div class="vp-doc">

- **[Inicio Rápido](/guides/START_HERE)** - Primeros pasos con el proyecto
- **[Instalación](/guides/INICIO_RAPIDO)** - Guía completa de instalación
- **[API Reference](/api/)** - Documentación de API
- **[Guía de Contribución](https://github.com/tu-usuario/bvs_framework/blob/main/CONTRIBUTING.md)** - Cómo contribuir

</div>

## 🛠️ Stack Tecnológico

<div class="vp-doc">

### Backend
- Python 3.13 + Django 6.0
- Django REST Framework 3.14
- PostgreSQL 16
- Meilisearch 0.31
- Redis 7

### Frontend
- Next.js 16.1 + React 19.2
- TypeScript 5.9
- TailwindCSS 4
- Zustand 5.0

</div>

## 📊 Estado del Proyecto

```
Backend:       ████████████████░░░░  80%
Frontend:      ██████████████░░░░░░  70%
Tests:         ██████░░░░░░░░░░░░░░  30%
Docs:          ████████████░░░░░░░░  60%
```

## 🤝 Contribuir

Las contribuciones son bienvenidas! Lee la [guía de contribución](https://github.com/tu-usuario/bvs_framework/blob/main/CONTRIBUTING.md).

## 📄 Licencia

MIT License - ver [LICENSE](https://github.com/tu-usuario/bvs_framework/blob/main/LICENSE) para detalles.

---

<div class="vp-doc" align="center">

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>
