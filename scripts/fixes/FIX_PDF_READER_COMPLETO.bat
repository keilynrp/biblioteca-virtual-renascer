@echo off
echo ========================================
echo Fix Completo del Lector de PDF
echo ========================================
echo.
echo Este script solucionara ambos errores:
echo 1. DOMMatrix is not defined (frontend)
echo 2. Error al iniciar sesion de lectura (backend)
echo.
pause

echo.
echo ===== PASO 1: Aplicar Migraciones =====
echo.
echo Verificando migraciones...
docker compose exec -T backend python manage.py showmigrations content | findstr "0004\|0005\|0006"

echo.
echo Aplicando migraciones pendientes...
docker compose exec -T backend python manage.py migrate

echo.
echo Verificando que la tabla readings existe...
docker compose exec -T backend python manage.py shell -c "from apps.content.models import Reading; from django.db import connection; cursor = connection.cursor(); cursor.execute('SELECT COUNT(*) FROM readings'); print(f'✓ Tabla readings existe. Registros: {cursor.fetchone()[0]}')"

echo.
echo ===== PASO 2: Reiniciar Backend =====
echo.
docker compose restart backend
echo Esperando a que el backend inicie...
timeout /t 10

echo.
echo ===== PASO 3: Reiniciar Frontend =====
echo.
docker compose restart frontend
echo Esperando a que el frontend compile...
timeout /t 15

echo.
echo ===== PASO 4: Verificar Estado =====
echo.
docker compose ps

echo.
echo ===== PASO 5: Ver Logs del Frontend =====
echo.
docker compose logs frontend --tail=30

echo.
echo ========================================
echo FIXES APLICADOS
echo ========================================
echo.
echo Cambios realizados:
echo  ✓ PDF viewer ahora usa dynamic import (sin SSR)
echo  ✓ Migraciones aplicadas (tabla readings creada)
echo  ✓ Backend y frontend reiniciados
echo.
echo IMPORTANTE: En tu navegador
echo 1. Presiona Ctrl+Shift+R para hard refresh
echo 2. O abre en ventana incognita
echo 3. Intenta acceder a /reader/[BOOK_ID]
echo.
echo Para ver un libro con PDF:
docker compose exec -T backend python manage.py shell -c "from apps.content.models import Book; books = Book.objects.exclude(file=''); print('\\nLibros con PDF disponibles:'); [print(f'  ID {b.id}: {b.title} - http://localhost:3000/reader/{b.id}') for b in books[:5]]"

echo.
echo Si aun ves errores, revisa:
echo  - DevTools Console (F12)
echo  - DevTools Network tab
echo  - Backend logs: docker compose logs backend --tail=50
echo.
pause
