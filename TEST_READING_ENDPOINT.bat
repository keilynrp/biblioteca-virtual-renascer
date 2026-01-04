@echo off
echo ========================================
echo Testing Reading Endpoint
echo ========================================
echo.

echo Step 1: Checking if Reading table exists...
docker compose exec -T backend python manage.py shell -c "from apps.content.models import Reading; print(f'Reading table exists: {Reading._meta.db_table}')"

echo.
echo Step 2: Checking migrations status...
docker compose exec -T backend python manage.py showmigrations content

echo.
echo Step 3: Checking if there are any unapplied migrations...
docker compose exec -T backend python manage.py migrate --plan

echo.
echo Step 4: Get admin token and test endpoint...
echo Creating test token...
docker compose exec -T backend python manage.py shell -c "from django.contrib.auth import get_user_model; from rest_framework.authtoken.models import Token; User = get_user_model(); user = User.objects.filter(is_superuser=True).first(); token, _ = Token.objects.get_or_create(user=user); print(f'Token: {token.key}'); print(f'User: {user.username}')"

echo.
echo ========================================
echo NEXT STEPS:
echo 1. Copy the token above
echo 2. Test the endpoint with:
echo    curl -X POST http://localhost:8000/api/user/readings/start/1/ ^
echo         -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
echo         -H "Content-Type: application/json"
echo ========================================
pause
