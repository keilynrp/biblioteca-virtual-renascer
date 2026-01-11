@echo off
echo ============================================================
echo Inicio Rapido - Sprint 6
echo ============================================================
echo.

echo Iniciando todos los servicios...
docker compose up -d

echo.
echo Esperando 20 segundos para que inicien...
timeout /t 20 /nobreak >nul

echo.
echo Ejecutando migraciones...
docker compose exec backend python manage.py migrate

echo.
echo ============================================================
echo Estado:
echo ============================================================
docker compose ps

echo.
echo Accede a: http://localhost:3000
echo.
echo Ver logs del frontend:
echo   docker compose logs -f frontend
echo.

pause
