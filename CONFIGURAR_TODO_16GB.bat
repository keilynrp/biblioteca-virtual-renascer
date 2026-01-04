@echo off
REM Script completo para configurar WSL y optimizar Docker para 16GB
REM Ejecuta TODO desde Windows

echo ========================================
echo   CONFIGURACION COMPLETA 16GB
echo ========================================
echo.
echo Este script hara TODO automaticamente:
echo   1. Configurar WSL para 16GB
echo   2. Instalar Docker Compose v2 en WSL
echo   3. Aplicar optimizaciones de Docker
echo   4. Verificar instalacion
echo.
echo Tiempo estimado: 25-30 minutos
echo.
pause

REM ============================================================
REM PARTE 1: CONFIGURAR WSL
REM ============================================================

echo.
echo ========================================
echo   PARTE 1: CONFIGURANDO WSL
echo ========================================
echo.

REM Verificar RAM
echo [1.1] Verificando RAM del sistema...
wmic computersystem get totalphysicalmemory /value | find "TotalPhysicalMemory"
echo.

REM Crear .wslconfig
echo [1.2] Creando configuracion WSL optimizada...
set WSLCONFIG=%USERPROFILE%\.wslconfig

REM Backup si existe
if exist "%WSLCONFIG%" (
    echo Haciendo backup del archivo existente...
    copy "%WSLCONFIG%" "%WSLCONFIG%.backup.%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%" >nul 2>&1
    echo Backup creado.
)

REM Crear nueva configuracion
echo [wsl2] > "%WSLCONFIG%"
echo memory=10GB >> "%WSLCONFIG%"
echo processors=4 >> "%WSLCONFIG%"
echo swap=4GB >> "%WSLCONFIG%"
echo localhostForwarding=true >> "%WSLCONFIG%"

echo.
echo Configuracion creada en: %WSLCONFIG%
echo.
echo Contenido:
type "%WSLCONFIG%"
echo.

REM Reiniciar WSL
echo [1.3] Reiniciando WSL para aplicar cambios...
wsl --shutdown
timeout /t 10 /nobreak >nul
echo OK!
echo.

REM Verificar WSL
echo [1.4] Verificando WSL...
wsl -e bash -c "echo 'WSL iniciado correctamente' && free -h | grep Mem"
echo.

echo ========================================
echo   PARTE 1 COMPLETADA
echo ========================================
echo.
pause

REM ============================================================
REM PARTE 2: INSTALAR Y OPTIMIZAR DOCKER
REM ============================================================

echo.
echo ========================================
echo   PARTE 2: INSTALANDO Y OPTIMIZANDO
echo ========================================
echo.

echo Ejecutando instalacion desde WSL...
echo Este proceso puede tardar 15-20 minutos.
echo.
pause

REM Cambiar a directorio del proyecto
cd /d d:\bvs_framework

REM Ejecutar script de instalacion completa desde WSL
wsl bash -c "cd /mnt/d/bvs_framework && chmod +x INSTALAR_Y_OPTIMIZAR.sh && ./INSTALAR_Y_OPTIMIZAR.sh"

if errorlevel 1 (
    echo.
    echo ERROR: La instalacion fallo.
    echo.
    echo Intenta ejecutar manualmente:
    echo   1. Abre WSL
    echo   2. cd /mnt/d/bvs_framework
    echo   3. ./INSTALAR_Y_OPTIMIZAR.sh
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   PARTE 2 COMPLETADA
echo ========================================
echo.

REM ============================================================
REM PARTE 3: VERIFICACION FINAL
REM ============================================================

echo.
echo ========================================
echo   PARTE 3: VERIFICACION FINAL
echo ========================================
echo.

echo [3.1] Estado de contenedores:
echo.
wsl bash -c "cd /mnt/d/bvs_framework && docker compose ps"
echo.

echo [3.2] Uso de recursos:
echo.
wsl bash -c "cd /mnt/d/bvs_framework && docker stats --no-stream"
echo.

echo [3.3] Memoria en WSL:
echo.
wsl -e free -h
echo.

REM ============================================================
REM RESUMEN FINAL
REM ============================================================

echo ========================================
echo   CONFIGURACION COMPLETADA CON EXITO
echo ========================================
echo.
echo Configuracion WSL:
echo   - Memoria: 10GB de 16GB totales
echo   - Procesadores: 4
echo   - Swap: 4GB
echo.
echo Configuracion Docker:
echo   - Frontend: 4GB
echo   - Elasticsearch: 2GB
echo   - Backend: 1GB
echo   - PostgreSQL: 512MB
echo   - Redis: 256MB
echo.
echo Servicios disponibles:
echo   - Frontend:       http://localhost:3000
echo   - Backend API:    http://localhost:8000
echo   - Backend Admin:  http://localhost:8000/admin
echo   - Elasticsearch:  http://localhost:9200
echo.
echo ========================================
echo   SIGUIENTES PASOS
echo ========================================
echo.
echo 1. Crear usuario administrador:
echo    - Ejecuta: crear-superusuario.sh
echo.
echo 2. Importar libros de prueba:
echo    - Ejecuta: importar-100-libros.sh
echo.
echo 3. Abrir aplicacion:
echo    - http://localhost:3000
echo.
echo Para ver logs:
echo    wsl bash -c "cd /mnt/d/bvs_framework && docker compose logs -f"
echo.
echo Para reiniciar servicios:
echo    wsl bash -c "cd /mnt/d/bvs_framework && docker compose restart"
echo.
pause
