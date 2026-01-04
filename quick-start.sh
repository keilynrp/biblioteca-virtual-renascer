#!/bin/bash

echo "============================================================"
echo "Inicio Rapido - Sprint 6"
echo "============================================================"
echo ""

# Verificar que Docker este corriendo
if ! docker ps &> /dev/null; then
    echo "Iniciando Docker..."
    sudo service docker start
    sleep 3
fi

echo "Iniciando todos los servicios..."
docker compose up -d

echo ""
echo "Esperando 20 segundos para que inicien..."
sleep 20

echo ""
echo "Ejecutando migraciones..."
docker compose exec backend python manage.py migrate

echo ""
echo "============================================================"
echo "Estado:"
echo "============================================================"
docker compose ps

echo ""
echo "Accede a: http://localhost:3000"
echo ""
echo "Ver logs del frontend:"
echo "  docker compose logs -f frontend"
echo ""
