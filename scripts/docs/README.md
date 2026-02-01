# 📚 Scripts de Documentación

Scripts para automatizar la generación y mantenimiento de documentación del proyecto.

## 📋 Scripts Disponibles

### `generate-api-docs.sh` / `generate-api-docs.ps1`

Genera documentación de API desde el código Django usando drf-spectacular.

**Requisitos:**
- Backend en funcionamiento
- `drf-spectacular` instalado
- Entorno virtual activado

**Uso:**

```bash
# Linux/Mac/WSL
./scripts/docs/generate-api-docs.sh

# Windows PowerShell
.\scripts\docs\generate-api-docs.ps1
```

**Genera:**
- `docs/api/openapi-schema.yml` - Schema OpenAPI en YAML
- `docs/api/openapi-schema.json` - Schema OpenAPI en JSON
- `docs/api/models-generated.md` - Documentación de modelos
- `docs/api/endpoints-generated.md` - Lista de endpoints
- `docs/api/stats.md` - Estadísticas de la API

### `update-changelog.sh` / `update-changelog.ps1`

Actualiza el CHANGELOG.md con commits recientes.

**Uso:**

```bash
# Linux/Mac/WSL
./scripts/docs/update-changelog.sh

# Windows PowerShell
.\scripts\docs\update-changelog.ps1
```

### `generate-badges.sh` / `generate-badges.ps1`

Genera badges dinámicos basados en métricas del proyecto.

**Uso:**

```bash
# Linux/Mac/WSL
./scripts/docs/generate-badges.sh

# Windows PowerShell
.\scripts\docs\generate-badges.ps1
```

### `validate-docs.sh` / `validate-docs.ps1`

Valida que toda la documentación esté actualizada y sin enlaces rotos.

**Uso:**

```bash
# Linux/Mac/WSL
./scripts/docs/validate-docs.sh

# Windows PowerShell
.\scripts\docs\validate-docs.ps1
```

## 🔄 Flujo de Trabajo

### Actualización Regular de Docs

```bash
# 1. Generar documentación de API
./scripts/docs/generate-api-docs.sh

# 2. Actualizar CHANGELOG
./scripts/docs/update-changelog.sh

# 3. Validar documentación
./scripts/docs/validate-docs.sh

# 4. Commit cambios
git add docs/
git commit -m "docs: update API documentation"
git push
```

### Antes de un Release

```bash
# 1. Actualizar todo
./scripts/docs/generate-api-docs.sh
./scripts/docs/update-changelog.sh
./scripts/docs/generate-badges.sh

# 2. Validar
./scripts/docs/validate-docs.sh

# 3. Review manual
# Revisa CHANGELOG.md
# Revisa README.md
# Revisa docs/api/

# 4. Commit
git add .
git commit -m "docs: prepare for release v0.x.0"
git push
```

## 📝 Configuración

### drf-spectacular

Para que `generate-api-docs` funcione, asegúrate de tener en `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'drf_spectacular',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Biblioteca Virtual API',
    'DESCRIPTION': 'API REST para la plataforma de biblioteca virtual',
    'VERSION': '0.10.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
```

Y en `urls.py`:

```python
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # ...
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

## 🛠️ Desarrollo de Nuevos Scripts

Cuando agregues nuevos scripts de documentación:

1. Crea versión `.sh` (Linux/Mac) y `.ps1` (Windows)
2. Agrega descripción en este README
3. Asegura que sean idempotentes (pueden ejecutarse múltiples veces)
4. Agrega manejo de errores apropiado
5. Incluye mensajes informativos de progreso

## 📊 Métricas de Documentación

El proyecto mantiene las siguientes métricas de documentación:

- **Coverage de Documentación**: % de código documentado
- **Enlaces Rotos**: Links que no funcionan
- **Documentos Desactualizados**: Docs que necesitan actualización
- **Completitud de API**: % de endpoints documentados

Ejecuta `validate-docs` para ver el reporte completo.

## 🤝 Contribuir

¿Tienes ideas para mejorar la documentación o automatización?

- Abre un [Issue](https://github.com/tu-usuario/bvs_framework/issues)
- Propón mejoras en [Discussions](https://github.com/tu-usuario/bvs_framework/discussions)
- Envía un PR con nuevos scripts

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>
