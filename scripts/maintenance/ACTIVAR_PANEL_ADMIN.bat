@echo off
echo ================================================================================
echo    ACTIVACION COMPLETA DEL PANEL DE ADMINISTRACION
echo ================================================================================
echo.
echo Este script hara TODO lo necesario para activar el Panel Admin:
echo   1. Otorgar permisos de administrador
echo   2. Reiniciar el frontend
echo   3. Verificar que todo este funcionando
echo.
pause

echo.
echo ================================================================================
echo [PASO 1/3] OTORGAR PERMISOS DE ADMINISTRADOR
echo ================================================================================
echo.

set /p username="Introduce tu nombre de usuario: "

echo.
echo Otorgando permisos a %username%...
echo.

docker compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(username='%username%'); user.is_staff = True; user.is_superuser = True; user.save(); print('✓ Usuario %username% ahora es administrador')"

if errorlevel 1 (
    echo.
    echo ✗ Error: No se pudieron otorgar los permisos
    echo   Verifica que el usuario exista ejecutando: LISTAR_USUARIOS.bat
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo [PASO 2/3] REINICIAR FRONTEND
echo ================================================================================
echo.

echo Reiniciando contenedor del frontend...
docker compose restart frontend

echo.
echo Esperando a que el frontend este listo (15 segundos)...
timeout /t 15 /nobreak > nul

echo.
echo ================================================================================
echo [PASO 3/3] VERIFICACION
echo ================================================================================
echo.

echo Verificando que los archivos existan...
if exist "frontend\src\app\(dashboard)\admin\page.tsx" (
    echo ✓ Pagina de admin: OK
) else (
    echo ✗ Pagina de admin: FALTA
)

if exist "frontend\src\components\admin\book-import-panel.tsx" (
    echo ✓ Componente de importacion: OK
) else (
    echo ✗ Componente de importacion: FALTA
)

echo.
echo ================================================================================
echo    ACTIVACION COMPLETADA
echo ================================================================================
echo.
echo ✓ Permisos de administrador otorgados a: %username%
echo ✓ Frontend reiniciado
echo.
echo PASOS SIGUIENTES:
echo.
echo 1. Abre tu navegador y ve a: http://localhost:3000
echo.
echo 2. IMPORTANTE: Haz una RECARGA FUERTE de la pagina:
echo    - Chrome/Edge: Ctrl + Shift + R
echo    - Firefox: Ctrl + F5
echo.
echo 3. Si ya estas logueado, CIERRA SESION y vuelve a INICIAR SESION
echo    (Esto es necesario para que se carguen tus nuevos permisos)
echo.
echo 4. En el menu lateral, busca "Panel Admin" con el icono de escudo
echo.
echo 5. Click en "Panel Admin" para comenzar a importar libros
echo.
echo ================================================================================
echo.
echo Si aun no ves el "Panel Admin", intenta:
echo   - Borrar cache del navegador
echo   - Abrir en modo incognito
echo   - Revisar la consola del navegador (F12) por errores
echo.
pause
