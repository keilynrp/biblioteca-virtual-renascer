# 🔧 Guía de Configuración de GitHub

Esta guía te ayudará a configurar correctamente el repositorio en GitHub para aprovechar todas las funcionalidades.

## 📋 Checklist de Configuración

### ✅ 1. Configurar Topics/Tags

Los topics ayudan a que otros descubran tu proyecto.

**Pasos:**
1. Ve a tu repositorio: https://github.com/keilynrp/biblioteca-virtual-renascer
2. Haz clic en ⚙️ (settings) junto a "About" en la parte derecha
3. En "Topics", agrega los siguientes tags:

```
django
django-rest-framework
nextjs
react
typescript
tailwindcss
shadcn-ui
stripe
postgresql
redis
digital-library
e-learning
subscription-platform
jwt-authentication
python
rest-api
docker
docker-compose
payment-integration
virtual-library
```

4. Haz clic en "Save changes"

### ✅ 2. Configurar Descripción del Repositorio

**Pasos:**
1. En la misma sección "About"
2. Agrega la descripción:
   ```
   📚 Plataforma moderna de biblioteca virtual con gestión de suscripciones, pagos integrados con Stripe y sistema de lectura en línea | Django + Next.js + PostgreSQL
   ```
3. Si tienes un sitio web o demo: Agrégalo en "Website"

### ✅ 3. Configurar GitHub Pages

**Pasos:**
1. Ve a **Settings** → **Pages**
2. En "Build and deployment":
   - **Source**: GitHub Actions
3. Ve a la pestaña **Actions**
4. Habilita GitHub Actions si no está habilitado
5. El workflow `deploy-docs.yml` se ejecutará automáticamente al hacer push

**URL de GitHub Pages:**
```
https://keilynrp.github.io/biblioteca-virtual-renascer/
```

### ✅ 4. Configurar GitHub Projects

El proyecto usa GitHub Projects para organización Kanban.

**Pasos:**
1. Ve a la pestaña **Projects**
2. Haz clic en **New project**
3. Selecciona **Board** template
4. Nombra el proyecto: "Biblioteca Virtual - Desarrollo"
5. Haz clic en **Create project**

**Configurar Columnas:**
1. Renombra las columnas existentes:
   - `Backlog` - Tareas pendientes
   - `En Progreso` - Tareas en desarrollo
   - `En Revisión` - PRs abiertos
   - `Completado` - Tareas terminadas

2. Agrega etiquetas de prioridad:
   - 🔴 Alta
   - 🟡 Media
   - 🟢 Baja

**Agregar Issues al Project:**
1. Crea issues desde la pestaña **Issues**
2. Asígnalos al Project
3. Muévelos entre columnas según su estado

### ✅ 5. Configurar Branch Protection Rules

Protege la rama `main` de cambios directos.

**Pasos:**
1. Ve a **Settings** → **Branches**
2. En "Branch protection rules", haz clic en **Add rule**
3. En "Branch name pattern", escribe: `main`
4. Marca las siguientes opciones:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
   - ✅ **Require status checks to pass before merging**
     - Si tienes CI configurado, selecciona los checks
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require linear history**
   - ✅ **Include administrators** (opcional, para mayor seguridad)
5. Haz clic en **Create**

### ✅ 6. Configurar Labels

Los labels ya están incluidos en los templates, pero puedes personalizarlos.

**Pasos:**
1. Ve a **Issues** → **Labels**
2. Verifica que existan estos labels (créalos si no):

**Por Tipo:**
- `bug` 🐛 - Rojo (#d73a4a)
- `enhancement` ✨ - Azul (#a2eeef)
- `documentation` 📚 - Azul oscuro (#0075ca)
- `performance` ⚡ - Naranja (#fb9a19)
- `security` 🔒 - Rojo oscuro (#ee0701)

**Por Prioridad:**
- `priority: critical` 🔥 - Rojo (#b60205)
- `priority: high` 🔴 - Naranja (#d93f0b)
- `priority: medium` 🟡 - Amarillo (#fbca04)
- `priority: low` 🟢 - Verde (#0e8a16)

**Por Estado:**
- `good first issue` 👍 - Verde (#7057ff)
- `help wanted` 🙏 - Verde (#008672)
- `wip` 🚧 - Amarillo (#f9d0c4)
- `needs review` 👀 - Morado (#5319e7)

### ✅ 7. Configurar Secrets (para CI/CD)

Si planeas usar GitHub Actions para CI/CD:

**Pasos:**
1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Haz clic en **New repository secret**
3. Agrega los siguientes secrets (cuando los necesites):
   - `STRIPE_SECRET_KEY` - Para tests de Stripe
   - `DB_PASSWORD` - Para tests con BD
   - Otros según necesites

### ✅ 8. Configurar Dependabot

Mantén dependencias actualizadas automáticamente.

**Pasos:**
1. Ve a **Settings** → **Code security and analysis**
2. Habilita **Dependabot alerts**
3. Habilita **Dependabot security updates**
4. Para Dependabot version updates, crea `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # Backend - Python
  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  # Frontend - npm
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

### ✅ 9. Configurar Discussions (Opcional)

Para comunidad y soporte.

**Pasos:**
1. Ve a **Settings**
2. En "Features", marca **Discussions**
3. Configura categorías:
   - 💬 General
   - 💡 Ideas
   - 🙏 Q&A
   - 📢 Announcements

### ✅ 10. Configurar Wiki (Opcional)

Para documentación extendida.

**Pasos:**
1. Ve a **Settings**
2. En "Features", marca **Wikis**
3. Ve a la pestaña **Wiki**
4. Crea páginas:
   - Home
   - Installation Guide
   - API Documentation
   - Deployment Guide
   - FAQ

### ✅ 11. Configurar Insights

Para analizar actividad del proyecto.

**Pasos:**
1. Ve a **Insights**
2. Explora las secciones:
   - **Pulse** - Actividad reciente
   - **Contributors** - Contribuidores
   - **Traffic** - Visitas y clones
   - **Dependency graph** - Dependencias
   - **Network** - Forks y branches

### ✅ 12. Badges en README

Actualiza el README con badges personalizados.

**Agregar al inicio del README.md:**

```markdown
[![GitHub stars](https://img.shields.io/github/stars/keilynrp/biblioteca-virtual-renascer?style=social)](https://github.com/keilynrp/biblioteca-virtual-renascer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/keilynrp/biblioteca-virtual-renascer?style=social)](https://github.com/keilynrp/biblioteca-virtual-renascer/network)
[![GitHub issues](https://img.shields.io/github/issues/keilynrp/biblioteca-virtual-renascer)](https://github.com/keilynrp/biblioteca-virtual-renascer/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/keilynrp/biblioteca-virtual-renascer)](https://github.com/keilynrp/biblioteca-virtual-renascer/pulls)
[![License](https://img.shields.io/github/license/keilynrp/biblioteca-virtual-renascer)](https://github.com/keilynrp/biblioteca-virtual-renascer/blob/main/LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://keilynrp.github.io/biblioteca-virtual-renascer/)
```

## 🎯 Configuración Recomendada para Equipos

### Roles y Permisos

Si trabajas en equipo:

1. **Admin** - Propietarios del proyecto
2. **Maintainer** - Pueden merge PRs
3. **Write** - Pueden hacer push a ramas
4. **Triage** - Pueden gestionar issues
5. **Read** - Solo lectura

**Configurar en:** Settings → Collaborators

### Code Owners

Crea `.github/CODEOWNERS`:

```
# Backend
/backend/ @keilynrp @backend-team

# Frontend
/frontend/ @keilynrp @frontend-team

# Documentation
*.md @keilynrp @docs-team

# CI/CD
/.github/ @keilynrp @devops-team
```

## 🔄 Mantenimiento Regular

### Semanal
- [ ] Revisar nuevos issues
- [ ] Responder preguntas en Discussions
- [ ] Revisar PRs pendientes
- [ ] Actualizar Project board

### Mensual
- [ ] Revisar y cerrar issues inactivos
- [ ] Actualizar dependencias con Dependabot
- [ ] Revisar analytics y métricas
- [ ] Actualizar documentación si es necesario

### Trimestral
- [ ] Auditoría de seguridad
- [ ] Revisión de permisos y accesos
- [ ] Backup de configuraciones importantes
- [ ] Planificación de próximos sprints

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa la [documentación oficial de GitHub](https://docs.github.com/)
2. Abre un issue en el repositorio
3. Contacta a los maintainers

---

**¡Tu repositorio ahora está completamente configurado!** 🎉
