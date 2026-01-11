@echo off
echo ============================================================
echo CREAR/VERIFICAR SUPERUSUARIO DEL BACKEND
echo ============================================================
echo.
echo Este script creara un superusuario si no existe.
echo.
echo Credenciales por defecto:
echo   Usuario: admin
echo   Email: admin@biblioteca.com
echo   Password: admin123
echo.
echo IMPORTANTE: Cambia la contrasena despues del primer login!
echo.

echo Ejecutando script de creacion...
echo.
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose exec -T backend python create_superuser.py"

echo.
echo ============================================================
echo ACCESO AL SISTEMA
echo ============================================================
echo.
echo Panel de Administracion:
echo   URL: http://localhost:8000/admin
echo   Usuario: admin
echo   Password: admin123
echo.
echo API Backend:
echo   URL: http://localhost:8000/api
echo.
echo Frontend:
echo   URL: http://localhost:3000
echo.
echo ============================================================
echo SIGUIENTE PASO
echo ============================================================
echo.
echo 1. Accede a http://localhost:8000/admin
echo 2. Inicia sesion con admin / admin123
echo 3. Cambia la contrasena en "Cambiar contrasena"
echo 4. Explora el panel de administracion
echo.

pause
