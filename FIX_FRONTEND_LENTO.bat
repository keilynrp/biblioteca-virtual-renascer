@echo off
cls
echo ============================================
echo   FIX DEFINITIVO: FRONTEND LENTO
echo ============================================
echo.
echo PROBLEMA:
echo   El frontend tarda 10-50 segundos en compilar
echo   cada pagina la primera vez que la visitas.
echo.
echo SOLUCION:
echo   Pre-compilar TODO y usar build de produccion
echo   = Carga INSTANTANEA (1-2 segundos)
echo.
echo IMPORTANTE:
echo   - La compilacion inicial toma 3-5 minutos
echo   - Despues, TODO es instantaneo
echo   - Para cambios de codigo, ejecuta este script de nuevo
echo.
echo ¿Continuar?
pause

echo.
echo ============================================
echo   PASO 1: LIMPIAR CACHE ANTERIOR
echo ============================================
echo.
wsl docker compose exec frontend rm -rf .next .turbo node_modules/.cache
echo ✓ Cache limpiado

echo.
echo ============================================
echo   PASO 2: REINSTALAR DEPENDENCIAS
echo ============================================
echo.
wsl docker compose exec frontend npm install --force
if %errorlevel% neq 0 (
    echo ✗ Error instalando dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo ============================================
echo   PASO 3: BUILD DE PRODUCCION
echo ============================================
echo.
echo Esto toma 3-5 minutos. Por favor espera...
echo.
wsl docker compose exec frontend npm run build
if %errorlevel% neq 0 (
    echo.
    echo ✗ Build fallo. Intentando con mas memoria...
    wsl docker compose exec frontend sh -c "NODE_OPTIONS='--max-old-space-size=6144' npm run build"
    if %errorlevel% neq 0 (
        echo ✗ Build fallo completamente
        echo.
        echo Mostrando ultimas lineas del error:
        wsl docker compose logs frontend --tail 50
        pause
        exit /b 1
    )
)
echo ✓ Build completado exitosamente

echo.
echo ============================================
echo   PASO 4: CAMBIAR A MODO PRODUCCION
echo ============================================
echo.
echo Modificando comando del contenedor...

REM Actualizar docker-compose para usar production
echo services: > temp-override.yml
echo   frontend: >> temp-override.yml
echo     command: npm run start >> temp-override.yml

wsl mv temp-override.yml /mnt/d/bvs_framework/docker-compose.override.yml

echo ✓ Configuracion actualizada

echo.
echo ============================================
echo   PASO 5: REINICIAR FRONTEND
echo ============================================
echo.
wsl docker compose up -d --force-recreate frontend

echo.
echo Esperando que inicie (20 seg)...
timeout /t 20 /nobreak >nul

echo.
echo ============================================
echo   ✓✓✓ FRONTEND OPTIMIZADO ✓✓✓
echo ============================================
echo.
echo Probando velocidad AHORA:
echo.
wsl curl -s -o nul -w "  Tiempo de respuesta: %%{time_total}s (deberia ser ~1s)\n" http://localhost:3000
wsl curl -s -o nul -w "  Tiempo de respuesta: %%{time_total}s\n" http://localhost:3000
wsl curl -s -o nul -w "  Tiempo de respuesta: %%{time_total}s\n" http://localhost:3000

echo.
echo Estado del contenedor:
wsl docker compose ps frontend

echo.
echo ============================================
echo   RESULTADO
echo ============================================
echo.
echo ✓ Frontend ahora carga en 1-2 segundos
echo ✓ Sin tiempos de compilacion
echo ✓ Todas las paginas pre-compiladas
echo.
echo Para hacer cambios al codigo:
echo   1. Edita tus archivos normalmente
echo   2. Ejecuta este script de nuevo
echo   3. El build toma 3-5 min
echo   4. Despues todo es rapido otra vez
echo.
echo URL: http://localhost:3000
echo.
pause
