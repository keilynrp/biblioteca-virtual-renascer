#!/bin/bash
# Script para crear un nuevo release con Semantic Versioning

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   🚀 Create Release - BVS Framework${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Verificar que estamos en main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: No estás en la rama main (estás en: $CURRENT_BRANCH)${NC}"
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar que el working tree esté limpio
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ Error: Tienes cambios sin commit${NC}"
    echo ""
    git status -s
    echo ""
    echo -e "${YELLOW}Por favor commit o stash tus cambios antes de crear un release${NC}"
    exit 1
fi

# Obtener el último tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo -e "${BLUE}📌 Último tag: ${LAST_TAG}${NC}"

# Extraer versión actual (sin la 'v')
CURRENT_VERSION=${LAST_TAG#v}

# Parsear versión
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

echo ""
echo -e "${BLUE}Versión actual: ${MAJOR}.${MINOR}.${PATCH}${NC}"
echo ""

# Mostrar opciones
echo "Selecciona el tipo de release:"
echo ""
echo "  1) 🐛 Patch   (${MAJOR}.${MINOR}.$((PATCH+1))) - Bug fixes"
echo "  2) ✨ Minor   (${MAJOR}.$((MINOR+1)).0) - New features"
echo "  3) 💥 Major   ($((MAJOR+1)).0.0) - Breaking changes"
echo "  4) 📝 Custom  - Especificar versión manualmente"
echo ""

read -p "Opción (1-4): " OPTION

case $OPTION in
    1)
        NEW_VERSION="${MAJOR}.${MINOR}.$((PATCH+1))"
        RELEASE_TYPE="patch"
        ;;
    2)
        NEW_VERSION="${MAJOR}.$((MINOR+1)).0"
        RELEASE_TYPE="minor"
        ;;
    3)
        NEW_VERSION="$((MAJOR+1)).0.0"
        RELEASE_TYPE="major"
        ;;
    4)
        read -p "Ingresa la nueva versión (formato: X.Y.Z): " CUSTOM_VERSION
        NEW_VERSION="$CUSTOM_VERSION"
        RELEASE_TYPE="custom"
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

NEW_TAG="v${NEW_VERSION}"

echo ""
echo -e "${GREEN}Nueva versión: ${NEW_VERSION}${NC}"
echo -e "${GREEN}Nuevo tag: ${NEW_TAG}${NC}"
echo ""

# Pedir mensaje de release
read -p "Mensaje del release (presiona Enter para mensaje por defecto): " RELEASE_MESSAGE

if [ -z "$RELEASE_MESSAGE" ]; then
    RELEASE_MESSAGE="Release ${NEW_TAG}"
fi

echo ""
echo -e "${YELLOW}═══════════════ Resumen ═══════════════${NC}"
echo -e "  Tag anterior:  ${LAST_TAG}"
echo -e "  Tag nuevo:     ${NEW_TAG}"
echo -e "  Tipo:          ${RELEASE_TYPE}"
echo -e "  Mensaje:       ${RELEASE_MESSAGE}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

read -p "¿Proceder con el release? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Release cancelado${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}📝 Actualizando archivos de versión...${NC}"

# Actualizar version en backend/config/settings.py (si existe)
if [ -f "backend/config/settings.py" ]; then
    sed -i.bak "s/VERSION = .*/VERSION = '${NEW_VERSION}'/" backend/config/settings.py
    rm backend/config/settings.py.bak
    echo -e "${GREEN}  ✅ backend/config/settings.py${NC}"
fi

# Actualizar version en frontend/package.json
if [ -f "frontend/package.json" ]; then
    # Usar jq si está disponible
    if command -v jq &> /dev/null; then
        jq ".version = \"${NEW_VERSION}\"" frontend/package.json > frontend/package.json.tmp
        mv frontend/package.json.tmp frontend/package.json
        echo -e "${GREEN}  ✅ frontend/package.json${NC}"
    else
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" frontend/package.json
        rm frontend/package.json.bak
        echo -e "${GREEN}  ✅ frontend/package.json${NC}"
    fi
fi

# Actualizar badge de versión en README.md
if [ -f "README.md" ]; then
    sed -i.bak "s/version-[0-9]*\.[0-9]*\.[0-9]*/version-${NEW_VERSION}/" README.md
    rm README.md.bak
    echo -e "${GREEN}  ✅ README.md${NC}"
fi

# Actualizar CHANGELOG.md
echo ""
echo -e "${BLUE}📄 Actualizando CHANGELOG.md...${NC}"

TODAY=$(date +%Y-%m-%d)
CHANGELOG_ENTRY="## [${NEW_VERSION}] - ${TODAY}"

# Crear backup
cp CHANGELOG.md CHANGELOG.md.bak

# Insertar nueva entrada después de [Unreleased]
awk -v entry="$CHANGELOG_ENTRY" '/## \[Unreleased\]/{print; print ""; print entry; print ""; print "### Added"; print "- "; print ""; print "### Changed"; print "- "; print ""; print "### Fixed"; print "- "; print ""; print "---"; print ""; next}1' CHANGELOG.md.bak > CHANGELOG.md

rm CHANGELOG.md.bak
echo -e "${GREEN}  ✅ CHANGELOG.md${NC}"

echo ""
echo -e "${YELLOW}⚠️  Por favor edita CHANGELOG.md y agrega los cambios de esta versión${NC}"
read -p "Presiona Enter cuando hayas editado CHANGELOG.md..."

# Commit cambios de versión
echo ""
echo -e "${BLUE}💾 Creando commit de release...${NC}"

git add backend/config/settings.py frontend/package.json README.md CHANGELOG.md 2>/dev/null || true
git commit -m "chore(release): bump version to ${NEW_VERSION}

- Update version in package.json
- Update version in settings.py
- Update README badge
- Update CHANGELOG.md

Release ${NEW_TAG}"

echo -e "${GREEN}  ✅ Commit creado${NC}"

# Crear tag
echo ""
echo -e "${BLUE}🏷️  Creando tag...${NC}"

git tag -a "$NEW_TAG" -m "$RELEASE_MESSAGE"

echo -e "${GREEN}  ✅ Tag ${NEW_TAG} creado${NC}"

# Mostrar log
echo ""
echo -e "${BLUE}📜 Commits desde ${LAST_TAG}:${NC}"
git log "$LAST_TAG"..HEAD --oneline --no-merges | head -10
echo ""

# Preguntar si push
read -p "¿Pushear cambios y tag al remoto? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}📤 Pusheando al remoto...${NC}"

    git push origin main
    git push origin "$NEW_TAG"

    echo -e "${GREEN}  ✅ Cambios pusheados${NC}"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Release ${NEW_TAG} creado exitosamente!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Próximos pasos:${NC}"
    echo "  1. Crea release notes en GitHub"
    echo "  2. Verifica que CI/CD pase"
    echo "  3. Deploy a producción si corresponde"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Cambios no pusheados. Ejecuta manualmente:${NC}"
    echo ""
    echo "  git push origin main"
    echo "  git push origin $NEW_TAG"
    echo ""
fi

# Instrucciones finales
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}📚 Información del Release${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo "Tag:     $NEW_TAG"
echo "Commit:  $(git rev-parse HEAD)"
echo "Branch:  $CURRENT_BRANCH"
echo ""
