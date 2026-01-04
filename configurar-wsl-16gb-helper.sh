#!/bin/bash

# Script helper para configurar WSL desde Linux
# Este script genera el contenido que debes aplicar desde Windows

# Colores
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  CONFIGURAR WSL PARA 16GB${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "El archivo .wslconfig DEBE crearse desde Windows,"
echo "no desde dentro de WSL."
echo ""
echo "Este script te ayudará a hacerlo."
echo ""

# Verificar memoria actual
echo -e "${GREEN}Memoria actual en WSL:${NC}"
free -h
echo ""

# Generar contenido del archivo
echo -e "${GREEN}[1/3] Contenido para .wslconfig:${NC}"
echo ""
cat <<'EOF'
[wsl2]
memory=10GB
processors=4
swap=4GB
localhostForwarding=true
EOF
echo ""

# Instrucciones para Windows
echo -e "${GREEN}[2/3] Instrucciones desde Windows:${NC}"
echo ""
echo "OPCIÓN A: Usando el script batch"
echo "  1. Abre CMD o PowerShell en Windows"
echo "  2. Navega a: d:\\bvs_framework"
echo "  3. Ejecuta: CONFIGURAR_WSL_16GB.bat"
echo ""
echo "OPCIÓN B: Manualmente"
echo "  1. Abre PowerShell en Windows"
echo "  2. Copia y pega este comando:"
echo ""
cat <<'EOF'
$content = @"
[wsl2]
memory=10GB
processors=4
swap=4GB
localhostForwarding=true
"@

Set-Content -Path "$env:USERPROFILE\.wslconfig" -Value $content
Write-Host "Archivo creado en: $env:USERPROFILE\.wslconfig" -ForegroundColor Green
type "$env:USERPROFILE\.wslconfig"
Write-Host ""
Write-Host "Aplicando cambios..." -ForegroundColor Yellow
wsl --shutdown
EOF
echo ""

# Verificación
echo -e "${GREEN}[3/3] Después de aplicar:${NC}"
echo ""
echo "  1. Sal de WSL completamente"
echo "  2. Espera 10 segundos"
echo "  3. Vuelve a entrar a WSL"
echo "  4. Ejecuta: free -h"
echo "  5. Deberías ver ~10GB de memoria"
echo ""

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  SIGUIENTE PASO${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "Una vez aplicada la configuración WSL, ejecuta:"
echo ""
echo "  chmod +x INSTALAR_Y_OPTIMIZAR.sh"
echo "  ./INSTALAR_Y_OPTIMIZAR.sh"
echo ""

# Crear archivo de referencia
cat > /tmp/wslconfig-16gb.txt <<'EOF'
[wsl2]
memory=10GB
processors=4
swap=4GB
localhostForwarding=true
EOF

echo -e "${GREEN}✓ Archivo de referencia creado en: /tmp/wslconfig-16gb.txt${NC}"
echo ""
echo "Puedes verlo con: cat /tmp/wslconfig-16gb.txt"
echo ""
