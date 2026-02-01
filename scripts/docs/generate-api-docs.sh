#!/bin/bash
# Script para generar documentación de API desde código Django

set -e

echo "🚀 Generando documentación de API..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
DOCS_API_DIR="$PROJECT_ROOT/docs/api"

echo -e "${BLUE}📂 Directorio del proyecto: $PROJECT_ROOT${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: No se encuentra el directorio backend"
    exit 1
fi

# Crear directorio de documentación si no existe
mkdir -p "$DOCS_API_DIR"

# Activar entorno virtual si existe
if [ -f "$BACKEND_DIR/.venv/bin/activate" ]; then
    echo -e "${YELLOW}🔧 Activando entorno virtual...${NC}"
    source "$BACKEND_DIR/.venv/bin/activate"
elif [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
    source "$BACKEND_DIR/venv/bin/activate"
fi

# Cambiar al directorio backend
cd "$BACKEND_DIR"

# Instalar dependencias necesarias para documentación
echo -e "${YELLOW}📦 Verificando dependencias...${NC}"
pip install -q drf-spectacular pyyaml

# Generar schema OpenAPI
echo -e "${BLUE}📄 Generando schema OpenAPI...${NC}"
python manage.py spectacular --color --file "$DOCS_API_DIR/openapi-schema.yml"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema OpenAPI generado: docs/api/openapi-schema.yml${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo generar schema OpenAPI. ¿Está drf-spectacular configurado?${NC}"
fi

# Generar documentación en formato JSON también
echo -e "${BLUE}📄 Generando schema en formato JSON...${NC}"
python manage.py spectacular --color --format openapi-json --file "$DOCS_API_DIR/openapi-schema.json"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema JSON generado: docs/api/openapi-schema.json${NC}"
fi

# Generar documentación de modelos
echo -e "${BLUE}📊 Generando documentación de modelos...${NC}"

cat > "$DOCS_API_DIR/models-generated.md" <<'EOF'
# Modelos de Datos (Auto-generado)

> **Nota**: Este archivo es generado automáticamente. No editar manualmente.

## Modelos del Backend

EOF

# Función para extraer modelos de una app
extract_models() {
    local app_name=$1
    echo "## App: $app_name" >> "$DOCS_API_DIR/models-generated.md"
    echo "" >> "$DOCS_API_DIR/models-generated.md"

    # Usar inspectdb para obtener estructura (si es posible)
    # O parsear los archivos models.py

    echo "<!-- TODO: Implementar extracción automática de modelos -->" >> "$DOCS_API_DIR/models-generated.md"
    echo "" >> "$DOCS_API_DIR/models-generated.md"
}

# Listar apps
APPS=(authentication content subscriptions payments loans communities notifications)

for app in "${APPS[@]}"; do
    if [ -d "apps/$app" ]; then
        extract_models "$app"
    fi
done

echo -e "${GREEN}✅ Documentación de modelos generada: docs/api/models-generated.md${NC}"

# Generar índice de endpoints
echo -e "${BLUE}📋 Generando índice de endpoints...${NC}"

cat > "$DOCS_API_DIR/endpoints-generated.md" <<'EOF'
# Endpoints de API (Auto-generado)

> **Nota**: Este archivo es generado automáticamente desde el schema OpenAPI.
>
> Para la documentación interactiva completa, visita:
> - Swagger UI: http://localhost:8000/api/docs/
> - ReDoc: http://localhost:8000/api/redoc/

## Endpoints Disponibles

EOF

# Parsear el schema YAML para extraer endpoints (requiere yq o python)
if command -v yq &> /dev/null; then
    yq eval '.paths | keys | .[]' "$DOCS_API_DIR/openapi-schema.yml" >> "$DOCS_API_DIR/endpoints-generated.md"
    echo -e "${GREEN}✅ Índice de endpoints generado${NC}"
else
    echo -e "${YELLOW}⚠️  yq no está instalado. Instala yq para generar índice completo de endpoints.${NC}"
fi

# Generar estadísticas
echo -e "${BLUE}📊 Generando estadísticas...${NC}"

TOTAL_ENDPOINTS=$(grep -c "^/api" "$DOCS_API_DIR/openapi-schema.yml" 2>/dev/null || echo "N/A")
TOTAL_MODELS=$(find apps -name "models.py" -exec grep -c "class.*models.Model" {} + 2>/dev/null | awk '{s+=$1} END {print s}' || echo "N/A")

cat > "$DOCS_API_DIR/stats.md" <<EOF
# Estadísticas de API

**Generado:** $(date)

## Métricas

- **Total de Endpoints**: $TOTAL_ENDPOINTS
- **Total de Modelos**: $TOTAL_MODELS
- **Apps de Backend**: ${#APPS[@]}

## Distribución por Método

<!-- TODO: Extraer del schema OpenAPI -->

## Coverage de Documentación

<!-- TODO: Calcular porcentaje de endpoints documentados -->

EOF

echo -e "${GREEN}✅ Estadísticas generadas: docs/api/stats.md${NC}"

# Resumen
echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Documentación de API generada exitosamente!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Archivos generados:${NC}"
echo "  📄 openapi-schema.yml"
echo "  📄 openapi-schema.json"
echo "  📄 models-generated.md"
echo "  📄 endpoints-generated.md"
echo "  📄 stats.md"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "  1. Revisa los archivos generados en docs/api/"
echo "  2. Actualiza README.md si es necesario"
echo "  3. Commit los cambios: git add docs/api/ && git commit"
echo ""
