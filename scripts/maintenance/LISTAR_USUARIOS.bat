@echo off
echo ================================================================================
echo    LISTADO DE USUARIOS
echo ================================================================================
echo.

docker compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('Usuarios registrados:\n'); [print(f'  {i+1}. Usuario: {u.username:20} Email: {u.email:30} Admin: {\"SI\" if u.is_staff else \"NO\"}') for i, u in enumerate(User.objects.all())]"

echo.
echo ================================================================================
echo.
pause
