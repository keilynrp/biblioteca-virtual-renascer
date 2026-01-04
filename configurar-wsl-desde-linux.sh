#!/bin/bash
# Script para Configurar WSL2 desde Linux
# Ejecutar en tu terminal de WSL

echo "========================================================"
echo "Configuración de Memoria WSL2 desde Linux"
echo "========================================================"
echo ""

# Verificar que estamos en WSL
if ! grep -qi microsoft /proc/version; then
    echo "[ERROR] Este script debe ejecutarse en WSL, no en Linux nativo"
    exit 1
fi

echo "[OK] Ejecutando en WSL"
echo ""

# Detectar usuario de Windows
WIN_USER=$(whoami)
echo "Usuario actual: $WIN_USER"
echo ""

# Ruta del archivo .wslconfig en Windows
WSLCONFIG_PATH="/mnt/c/Users/$WIN_USER/.wslconfig"

# Verificar memoria actual
echo "[1/4] Verificando memoria actual..."
echo ""
free -h
echo ""
CURRENT_MEM=$(free -g | awk '/^Mem:/{print $2}')
echo "Memoria actual disponible en WSL: ${CURRENT_MEM}GB"
echo ""

# Crear contenido del archivo .wslconfig
echo "[2/4] Configurando archivo .wslconfig..."
echo ""

# Detectar memoria del sistema Windows
TOTAL_RAM=$(wmic ComputerSystem get TotalPhysicalMemory 2>/dev/null | grep -E '^[0-9]' | awk '{print int($1/1024/1024/1024)}')

if [ -z "$TOTAL_RAM" ]; then
    echo "[ADVERTENCIA] No se pudo detectar RAM total. Usando 6GB por defecto."
    WSL_MEMORY=6
else
    echo "RAM total del sistema: ${TOTAL_RAM}GB"
    # Asignar 75% de la RAM, máximo 8GB
    WSL_MEMORY=$(( TOTAL_RAM * 75 / 100 ))
    if [ $WSL_MEMORY -gt 8 ]; then
        WSL_MEMORY=8
    fi
    if [ $WSL_MEMORY -lt 4 ]; then
        WSL_MEMORY=4
    fi
fi

echo "Memoria a asignar a WSL: ${WSL_MEMORY}GB"
echo ""

# Crear archivo .wslconfig
cat > "$WSLCONFIG_PATH" << EOF
[wsl2]
memory=${WSL_MEMORY}GB
processors=4
swap=2GB
localhostForwarding=true

# Límites adicionales para mejor rendimiento
pageReporting=true
kernelCommandLine=cgroup_memory=1 cgroup_enable=memory swapaccount=1
EOF

if [ $? -eq 0 ]; then
    echo "[OK] Archivo .wslconfig creado exitosamente"
    echo ""
    echo "Contenido del archivo:"
    echo "----------------------------------------"
    cat "$WSLCONFIG_PATH"
    echo "----------------------------------------"
    echo ""
else
    echo "[ERROR] No se pudo crear el archivo .wslconfig"
    echo "Verifica que tienes permisos de escritura en /mnt/c/Users/$WIN_USER/"
    exit 1
fi

# Instrucciones para reiniciar WSL
echo "[3/4] WSL necesita reiniciarse para aplicar los cambios"
echo ""
echo "========================================================"
echo "IMPORTANTE - SIGUE ESTOS PASOS:"
echo "========================================================"
echo ""
echo "1. Sal de esta terminal WSL escribiendo:"
echo "   exit"
echo ""
echo "2. Abre PowerShell (Windows) y ejecuta:"
echo "   wsl --shutdown"
echo ""
echo "3. Espera 8 segundos"
echo ""
echo "4. Vuelve a abrir WSL (Ubuntu, Debian, etc.)"
echo ""
echo "5. Verifica la nueva configuración con:"
echo "   free -h"
echo ""
echo "6. Reinicia Docker:"
echo "   cd /mnt/d/bvs_framework"
echo "   docker compose down"
echo "   docker compose up -d"
echo ""
echo "========================================================"
echo ""

# Opción para crear script de reinicio automático
echo "[4/4] Creando scripts auxiliares..."
echo ""

# Script para ejecutar después de reiniciar WSL
RESTART_SCRIPT="/tmp/restart-docker-after-wsl.sh"
cat > "$RESTART_SCRIPT" << 'EOFSCRIPT'
#!/bin/bash
echo "========================================"
echo "Reiniciando Docker después de WSL"
echo "========================================"
echo ""

# Verificar memoria
echo "Memoria disponible:"
free -h
echo ""

# Ir al proyecto
if [ -d "/mnt/d/bvs_framework" ]; then
    cd /mnt/d/bvs_framework
elif [ -d "/mnt/c/bvs_framework" ]; then
    cd /mnt/c/bvs_framework
elif [ -d "$HOME/bvs_framework" ]; then
    cd "$HOME/bvs_framework"
else
    echo "[ERROR] No se encontró el directorio bvs_framework"
    exit 1
fi

echo "Directorio actual: $(pwd)"
echo ""

# Detener servicios
echo "Deteniendo servicios..."
docker compose down
echo ""

# Iniciar servicios
echo "Iniciando servicios con nueva configuración..."
docker compose up -d
echo ""

# Esperar un poco
echo "Esperando a que los servicios inicien..."
sleep 10
echo ""

# Verificar estado
echo "Estado de los servicios:"
docker compose ps
echo ""

# Probar backend
echo "Probando conectividad al backend..."
curl -s -I http://localhost:8000/api/ | head -1
echo ""

echo "========================================"
echo "Completado!"
echo "========================================"
echo ""
echo "Accede a:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:8000/api"
echo "  - Dashboard: http://localhost:3000/home"
echo ""
EOFSCRIPT

chmod +x "$RESTART_SCRIPT"
echo "[OK] Script de reinicio creado en: $RESTART_SCRIPT"
echo ""
echo "Después de reiniciar WSL, ejecuta:"
echo "  bash $RESTART_SCRIPT"
echo ""

# Script de PowerShell para reiniciar WSL
PS_SCRIPT="/mnt/c/Users/$WIN_USER/reiniciar-wsl.ps1"
cat > "$PS_SCRIPT" << 'EOFPS'
# Script para reiniciar WSL
Write-Host "Reiniciando WSL..." -ForegroundColor Green
wsl --shutdown
Write-Host "Esperando 8 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
Write-Host "WSL detenido. Abre una nueva terminal WSL para continuar." -ForegroundColor Green
Write-Host ""
Write-Host "Después de abrir WSL, ejecuta:" -ForegroundColor Cyan
Write-Host "  bash /tmp/restart-docker-after-wsl.sh" -ForegroundColor Yellow
EOFPS

echo "[OK] Script de PowerShell creado en: $PS_SCRIPT"
echo ""

echo "========================================================"
echo "TODO LISTO!"
echo "========================================================"
echo ""
echo "Ejecuta en PowerShell (Windows):"
echo "  powershell -ExecutionPolicy Bypass -File \"C:\\Users\\$WIN_USER\\reiniciar-wsl.ps1\""
echo ""
echo "O manualmente:"
echo "  1. Escribe 'exit' para salir de WSL"
echo "  2. En PowerShell: wsl --shutdown"
echo "  3. Espera 8 segundos"
echo "  4. Abre WSL de nuevo"
echo "  5. Ejecuta: bash /tmp/restart-docker-after-wsl.sh"
echo ""
