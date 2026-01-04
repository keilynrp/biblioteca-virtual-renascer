#!/bin/bash

echo "============================================================"
echo "Diagnóstico de Docker"
echo "============================================================"
echo ""

echo "1. Verificando terminal actual:"
echo "   PWD: $(pwd)"
echo "   SHELL: $SHELL"
echo "   OS: $(uname -s 2>/dev/null || echo 'Unknown')"
echo ""

echo "2. Buscando Docker en PATH:"
if command -v docker &> /dev/null; then
    echo "   ✓ Docker encontrado: $(which docker)"
    docker --version
else
    echo "   ✗ Docker NO encontrado en PATH"
fi
echo ""

echo "3. Buscando Docker Compose en PATH:"
if command -v docker &> /dev/null; then
    if docker compose version &> /dev/null; then
        echo "   ✓ Docker Compose V2 disponible"
        docker compose version
    else
        echo "   ✗ Docker Compose V2 NO disponible"
    fi
else
    echo "   ✗ Docker no disponible, no se puede verificar compose"
fi
echo ""

echo "4. Verificando ubicaciones comunes de Docker Desktop:"
docker_paths=(
    "/c/Program Files/Docker/Docker/resources/bin/docker.exe"
    "/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
    "$HOME/AppData/Local/Docker/resources/bin/docker.exe"
)

for path in "${docker_paths[@]}"; do
    if [ -f "$path" ]; then
        echo "   ✓ Encontrado en: $path"
        "$path" --version 2>/dev/null || echo "      (no ejecutable)"
    fi
done
echo ""

echo "============================================================"
echo "Recomendaciones:"
echo "============================================================"
echo ""

if ! command -v docker &> /dev/null; then
    echo "Docker no está disponible en esta terminal."
    echo ""
    echo "Opciones:"
    echo ""
    echo "1. Usar PowerShell (RECOMENDADO):"
    echo "   - Abre PowerShell"
    echo "   - cd d:\\bvs_framework"
    echo "   - .\\iniciar-sprint6.ps1"
    echo ""
    echo "2. Instalar/Iniciar Docker Desktop:"
    echo "   - Descarga: https://www.docker.com/products/docker-desktop"
    echo "   - Asegúrate de que esté corriendo (ícono verde)"
    echo "   - Reinicia esta terminal"
    echo ""
    echo "3. Configurar PATH para Git Bash:"
    echo "   - Agrega Docker al PATH de Windows"
    echo "   - Reinicia Git Bash"
else
    echo "✓ Docker está disponible. Puedes ejecutar:"
    echo "  ./iniciar-sprint6.sh"
fi
echo ""
