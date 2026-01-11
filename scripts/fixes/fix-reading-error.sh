#!/bin/bash

echo "========================================"
echo "Fix Reading Session Error"
echo "========================================"
echo ""
echo "Este script va a:"
echo "1. Verificar si las migraciones están aplicadas"
echo "2. Aplicar migraciones faltantes"
echo "3. Reiniciar backend para recargar código"
echo "4. Probar el endpoint"
echo ""
read -p "Presiona Enter para continuar..."

echo ""
echo "Paso 1: Verificando estado actual de migraciones..."
docker compose exec -T backend python manage.py showmigrations content

echo ""
echo "Paso 2: Aplicando todas las migraciones..."
docker compose exec -T backend python manage.py migrate

echo ""
echo "Paso 3: Verificando que la tabla Reading existe..."
docker compose exec -T backend python manage.py shell -c "
from apps.content.models import Reading
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT COUNT(*) FROM readings')
print(f'Tabla readings existe. Records: {cursor.fetchone()[0]}')
"

echo ""
echo "Paso 4: Reiniciando backend para recargar código..."
docker compose restart backend

echo ""
echo "Esperando a que el backend esté listo..."
sleep 10

echo ""
echo "Paso 5: Verificando logs del backend por errores..."
docker compose logs backend --tail=30

echo ""
echo "========================================"
echo "MIGRACIÓN COMPLETADA"
echo "========================================"
echo ""
echo "Siguiente, necesitas reiniciar el frontend:"
echo "1. Ejecuta: docker compose restart frontend"
echo "2. Espera 10 segundos"
echo "3. Abre navegador y haz hard refresh (Ctrl+Shift+R)"
echo "4. Intenta acceder a la página del reader"
echo ""
read -p "Presiona Enter para salir..."
