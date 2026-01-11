@echo off
color 0C
echo.
echo ============================================================
echo    FIX - FRONTEND LENTO
echo ============================================================
echo.
echo PROBLEMA: Frontend tarda mucho en cargar
echo.
echo SOLUCIONES QUE APLICAREMOS:
echo   1. Reiniciar frontend (limpiar cache)
echo   2. Verificar que no haya errores de compilacion
echo   3. Optimizar configuracion de Next.js
echo.
echo ============================================================
echo.
pause

echo.
echo [1/5] Deteniendo frontend...
echo.
docker compose stop frontend
echo ✅ Frontend detenido
echo.

echo [2/5] Limpiando cache de Next.js...
echo.
docker compose run --rm frontend rm -rf .next
echo ✅ Cache limpiado
echo.

echo [3/5] Reiniciando frontend...
echo.
docker compose up -d frontend
echo ✅ Frontend iniciado
echo.

echo [4/5] Esperando a que el frontend compile (esto puede tardar 30-60 segundos)...
echo.
timeout /t 45 /nobreak
echo.

echo [5/5] Verificando logs...
echo.
docker compose logs --tail=20 frontend
echo.

echo ============================================================
echo    VERIFICACION
echo ============================================================
echo.

echo Probando tiempo de respuesta...
curl -s -o nul -w "Tiempo: %%{time_total}s\n" http://localhost:3000
echo.

echo ============================================================
echo    FIX COMPLETADO
echo ============================================================
echo.
echo AHORA DEBES:
echo.
echo   1. Abrir: http://localhost:3000/dashboard
echo.
echo   2. Si aun es lento (>10 segundos):
echo      - Verificar recursos de Docker Desktop
echo      - Settings → Resources
echo      - Aumentar CPU: minimo 4 cores
echo      - Aumentar RAM: minimo 4GB
echo.
echo   3. Si persiste:
echo      - Reiniciar Docker Desktop completamente
echo      - docker compose down
echo      - docker compose up -d
echo.
echo ============================================================
echo.
echo Informacion tecnica:
echo.
echo   Next.js usa Turbopack en desarrollo
echo   Primera carga: 30-60 segundos (normal)
echo   Cargas posteriores: 2-5 segundos (normal)
echo   Hot reload: 1-3 segundos (normal)
echo.
echo   Si tarda mas de 10 segundos consistentemente:
echo   - Verificar logs: docker compose logs frontend
echo   - Verificar recursos: docker stats frontend
echo   - Verificar errores de compilacion
echo.
echo ============================================================
echo.
pause
