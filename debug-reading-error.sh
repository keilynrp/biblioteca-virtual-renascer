#!/bin/bash

# Script de depuración rápida para error de lectura

echo "=========================================="
echo "Debug: Error de sesión de lectura"
echo "=========================================="
echo ""

# 1. Ver logs del backend en tiempo real
echo "=== LOGS DEL BACKEND (últimas 100 líneas) ==="
docker compose logs backend --tail=100 | grep -i "error\|reading\|exception\|traceback" --color=always
echo ""

# 2. Verificar tabla readings
echo "=== ESTRUCTURA DE TABLA READINGS ==="
docker compose exec -T db psql -U postgres -d bvs_db -c "\d+ readings"
echo ""

# 3. Contar registros
echo "=== REGISTROS EN TABLA READINGS ==="
docker compose exec -T db psql -U postgres -d bvs_db -c "SELECT COUNT(*) as total_readings FROM readings;"
echo ""

# 4. Ver últimas sesiones de lectura
echo "=== ÚLTIMAS SESIONES DE LECTURA ==="
docker compose exec -T db psql -U postgres -d bvs_db -c "SELECT r.id, u.username, b.title, r.current_page, r.last_read_at FROM readings r JOIN auth_user u ON r.user_id = u.id JOIN books b ON r.book_id = b.id ORDER BY r.last_read_at DESC LIMIT 5;"
echo ""

# 5. Verificar migraciones
echo "=== ESTADO DE MIGRACIONES ==="
docker compose exec -T backend python manage.py showmigrations content | grep reading
echo ""

# 6. Probar importación del modelo
echo "=== PRUEBA DE IMPORTACIÓN DEL MODELO ==="
docker compose exec -T backend python manage.py shell -c "
from apps.content.models import Reading
from apps.content.serializers import ReadingSerializer
print('✓ Reading model importado')
print('✓ ReadingSerializer importado')
print(f'Tabla: {Reading._meta.db_table}')
print(f'Campos: {[f.name for f in Reading._meta.fields]}')
"
echo ""

# 7. Verificar endpoint en URLs
echo "=== VERIFICAR ENDPOINT EN URLS ==="
docker compose exec -T backend python manage.py shell -c "
from apps.content.urls import urlpatterns
reading_urls = [p for p in urlpatterns if 'reading' in str(p.pattern)]
for url in reading_urls:
    print(f'  {url.pattern}')
"
echo ""

# 8. Estado de contenedores
echo "=== ESTADO DE CONTENEDORES ==="
docker compose ps
echo ""

echo "=========================================="
echo "Para ver logs en tiempo real:"
echo "  docker compose logs -f backend"
echo ""
echo "Para reiniciar servicios:"
echo "  docker compose restart backend frontend"
echo "=========================================="
