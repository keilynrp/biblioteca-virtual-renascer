#!/bin/bash

# Quick fix para error de lectura PDF

set -e  # Salir si hay error

echo "🔧 Arreglando error de sesión de lectura..."
echo ""

# Aplicar migraciones
echo "1️⃣ Aplicando migraciones..."
docker compose exec -T backend python manage.py migrate --noinput

# Verificar tabla
echo ""
echo "2️⃣ Verificando tabla readings..."
if docker compose exec -T db psql -U postgres -d bvs_db -c "\d readings" >/dev/null 2>&1; then
    echo "✓ Tabla readings existe"
else
    echo "✗ ERROR: Tabla readings no existe"
    echo "Intentando forzar migración..."
    docker compose exec -T backend python manage.py migrate content 0005
fi

# Reiniciar servicios
echo ""
echo "3️⃣ Reiniciando servicios..."
docker compose restart backend frontend

echo ""
echo "✓ Completado!"
echo ""
echo "Espera 10 segundos y prueba el lector PDF de nuevo."
