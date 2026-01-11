@echo off
echo ========================================
echo Reiniciando Frontend
echo ========================================
echo.

echo Deteniendo frontend...
docker compose stop frontend

echo.
echo Reiniciando frontend...
docker compose up -d frontend

echo.
echo Esperando 20 segundos para que compile...
timeout /t 20

echo.
echo Ver logs del frontend:
docker compose logs frontend --tail=30

echo.
echo ========================================
echo FRONTEND REINICIADO
echo ========================================
echo.
echo IMPORTANTE:
echo 1. Abre tu navegador
echo 2. Presiona Ctrl+Shift+R (hard refresh)
echo 3. Accede a http://localhost:3000/reader/[BOOK_ID]
echo.
pause
