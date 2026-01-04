@echo off
echo ================================================================================
echo    OTORGAR PERMISOS DE ADMINISTRADOR
echo ================================================================================
echo.
echo Este script te dara permisos de administrador para acceder al Panel Admin
echo.

set /p username="Introduce tu nombre de usuario: "

echo.
echo Otorgando permisos de administrador a: %username%
echo.

docker compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(username='%username%'); user.is_staff = True; user.is_superuser = True; user.save(); print(f'✅ Usuario {user.username} ahora es administrador'); print(f'   - is_staff: {user.is_staff}'); print(f'   - is_superuser: {user.is_superuser}')"

echo.
echo ================================================================================
echo    PERMISOS OTORGADOS EXITOSAMENTE
echo ================================================================================
echo.
echo Ahora puedes:
echo 1. Recargar la pagina web (F5)
echo 2. Ir al menu lateral y buscar "Panel Admin" (icono de escudo)
echo 3. Comenzar a importar libros
echo.
pause
