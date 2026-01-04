@echo off
echo ==================================================
echo Aplicando Cambios de Dashboard - Correccion Completa
echo ==================================================
echo.

echo 1. Deteniendo frontend...
docker compose stop frontend

echo.
echo 2. Reconstruyendo frontend con los cambios...
docker compose build frontend

echo.
echo 3. Iniciando frontend...
docker compose up -d frontend

echo.
echo 4. Esperando a que el frontend esté listo...
timeout /t 15 /nobreak > nul

echo.
echo 5. Mostrando logs del frontend...
docker compose logs --tail=40 frontend

echo.
echo ==================================================
echo COMPLETADO - Dashboard Corregido
echo ==================================================
echo.
echo IMPORTANTE: Los cambios de diseño ahora se reflejan correctamente
echo.
echo Accede al dashboard en las siguientes URLs:
echo.
echo   - Dashboard Principal:  http://localhost:3000/home
echo   - Login:                http://localhost:3000/login
echo   - Biblioteca:           http://localhost:3000/library
echo.
echo Nota: /dashboard redirige automaticamente a /home
echo.
echo Si no ves cambios en el navegador:
echo   1. Presiona Ctrl+Shift+R para limpiar cache
echo   2. Abre las DevTools (F12) y verifica errores en la consola
echo.
pause
