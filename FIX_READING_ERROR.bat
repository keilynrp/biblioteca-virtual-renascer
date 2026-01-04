@echo off
echo ========================================
echo Fix Reading Session Error
echo ========================================
echo.
echo This script will:
echo 1. Check if migrations are applied
echo 2. Apply missing migrations
echo 3. Restart backend to reload code
echo 4. Test the endpoint
echo.
pause

echo.
echo Step 1: Checking current migration status...
docker compose exec -T backend python manage.py showmigrations content

echo.
echo Step 2: Applying all migrations...
docker compose exec -T backend python manage.py migrate

echo.
echo Step 3: Verifying Reading table exists...
docker compose exec -T backend python manage.py shell -c "from apps.content.models import Reading; from django.db import connection; cursor = connection.cursor(); cursor.execute('SELECT COUNT(*) FROM readings'); print(f'Reading table exists. Records: {cursor.fetchone()[0]}')"

echo.
echo Step 4: Restarting backend to reload code...
docker compose restart backend

echo.
echo Waiting for backend to be ready...
timeout /t 10

echo.
echo Step 5: Checking backend logs for errors...
docker compose logs backend --tail=30

echo.
echo ========================================
echo MIGRATION COMPLETED
echo ========================================
echo.
echo Next, you need to restart the frontend:
echo 1. Run: docker compose restart frontend
echo 2. Wait 10 seconds
echo 3. Open browser and hard refresh (Ctrl+Shift+R)
echo 4. Try accessing a book's reader page
echo.
pause
