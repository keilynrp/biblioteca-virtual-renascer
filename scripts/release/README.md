# 🚀 Scripts de Release

Scripts para gestionar releases y versionamiento del proyecto usando Semantic Versioning.

## 📋 Scripts Disponibles

### `create-release.sh` / `create-release.ps1`

Crea un nuevo release con versionamiento semántico automático.

**Características:**
- Incrementa versión automáticamente (major, minor, patch)
- Actualiza archivos de versión (package.json, README, CHANGELOG)
- Crea tag de Git
- Push automático (opcional)

**Uso:**

```bash
# Linux/Mac/WSL
./scripts/release/create-release.sh

# Windows PowerShell
.\scripts\release\create-release.ps1
```

**Flujo:**
1. Verifica que estés en `main` con working tree limpio
2. Muestra versión actual
3. Pide seleccionar tipo de release (patch/minor/major/custom)
4. Actualiza archivos de versión
5. Pide editar CHANGELOG.md
6. Crea commit de release
7. Crea tag anotado
8. Opcionalmente pushea al remoto

## 📌 Semantic Versioning

El proyecto sigue [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

Ejemplo: 1.4.2
```

### Cuándo incrementar cada parte:

**MAJOR (X.0.0)** - Breaking Changes
- Cambios que rompen compatibilidad
- Requieren migración del usuario
- API incompatible con versión anterior

Ejemplos:
- Cambiar estructura de base de datos
- Remover endpoints de API
- Cambiar comportamiento existente de forma incompatible

**MINOR (0.X.0)** - New Features
- Nuevas funcionalidades
- Compatibles con versión anterior
- No rompen código existente

Ejemplos:
- Agregar nuevo endpoint de API
- Agregar nueva feature al frontend
- Nuevos modelos o apps

**PATCH (0.0.X)** - Bug Fixes
- Correcciones de bugs
- Mejoras de performance
- Refactorizaciones internas

Ejemplos:
- Corregir un bug
- Optimizar query
- Mejorar logging

## 🏷️ Convenciones de Tags

### Formato de Tags

```
v<MAJOR>.<MINOR>.<PATCH>

Ejemplos:
- v0.10.0
- v1.0.0
- v1.2.3
```

### Mensajes de Tag

Los tags deben tener mensajes descriptivos:

```bash
git tag -a v1.0.0 -m "Release 1.0.0 - First stable release"
```

## 📝 Actualización de CHANGELOG

El CHANGELOG sigue [Keep a Changelog](https://keepachangelog.com/):

### Estructura

```markdown
# Changelog

## [Unreleased]

### Added
- Nuevas features en desarrollo

### Changed
- Cambios en features existentes

### Fixed
- Bugs corregidos

## [1.0.0] - 2026-01-15

### Added
- Primera release estable

...
```

### Categorías

- **Added**: Nuevas features
- **Changed**: Cambios en features existentes
- **Deprecated**: Features que serán removidas
- **Removed**: Features removidas
- **Fixed**: Bug fixes
- **Security**: Vulnerabilidades de seguridad

## 🔄 Flujo de Release

### Release Normal (Planificado)

```bash
# 1. Asegúrate de estar en main actualizado
git checkout main
git pull origin main

# 2. Verifica que todos los tests pasen
npm run test:ci
pytest

# 3. Ejecuta el script de release
./scripts/release/create-release.sh

# 4. Sigue las instrucciones interactivas

# 5. Crea GitHub Release
# Ve a: https://github.com/tu-usuario/bvs_framework/releases/new
# - Tag: selecciona el tag recién creado
# - Title: Release v0.X.0
# - Description: copia sección del CHANGELOG
```

### Hotfix (Urgente)

```bash
# 1. Crear rama de hotfix desde main
git checkout -b hotfix/critical-bug main

# 2. Fix el bug
# ... hacer cambios ...

# 3. Commit y push
git commit -m "fix: critical bug in authentication"
git push origin hotfix/critical-bug

# 4. Merge a main (vía PR o directo)
git checkout main
git merge hotfix/critical-bug

# 5. Crear release patch
./scripts/release/create-release.sh
# Selecciona opción 1 (Patch)

# 6. Push y deploy
git push origin main --tags
```

## 📊 Historial de Versiones

Ver todas las versiones:

```bash
# Listar todos los tags
git tag

# Ver detalles de un tag
git show v0.10.0

# Ver commits entre versiones
git log v0.9.0..v0.10.0 --oneline
```

## 🔍 Verificación de Release

Antes de crear un release, verifica:

- [ ] Todos los tests pasan
- [ ] CI/CD está verde
- [ ] Documentación actualizada
- [ ] CHANGELOG completo
- [ ] Sin TODOs críticos
- [ ] Migracione probadas
- [ ] Performance aceptable

## 🚢 Deployment

Después de crear el release:

1. **Staging**
   ```bash
   # Deploy a staging
   ./scripts/deploy/deploy-staging.sh v0.10.0
   ```

2. **Testing en Staging**
   - Smoke tests
   - Verificación manual
   - Tests de regresión

3. **Producción**
   ```bash
   # Deploy a producción
   ./scripts/deploy/deploy-production.sh v0.10.0
   ```

4. **Monitoreo Post-Deploy**
   - Verificar logs
   - Monitorear errores en Sentry
   - Verificar métricas

## 🔙 Rollback

Si algo sale mal:

```bash
# Rollback a versión anterior
./scripts/deploy/rollback.sh v0.9.0

# O revertir el tag (solo si no pusheado)
git tag -d v0.10.0
```

## 📚 Recursos

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>
