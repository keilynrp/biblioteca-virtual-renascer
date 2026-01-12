#!/bin/bash
# Script para iniciar el proyecto con Docker

set -e

echo "=================================="
echo "Iniciando BVS Framework con Docker"
echo "=================================="
echo ""

# Verificar si Docker está corriendo
echo "Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker Desktop no está corriendo."
    echo "Por favor, inicia Docker Desktop e intenta nuevamente."
    exit 1
fi

echo "Docker está corriendo correctamente."
echo ""

# Detener contenedores existentes
echo "Deteniendo contenedores existentes..."
docker-compose down

# Construir e iniciar los servicios
echo ""
echo "Construyendo e iniciando servicios..."
echo "Esto puede tomar varios minutos la primera vez..."
echo ""

docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "Servicios iniciados correctamente!"
    echo "=================================="
    echo ""
    echo "URLs de los servicios:"
    echo "  Frontend:     http://localhost:3000"
    echo "  Backend:      http://localhost:8000"
    echo "  Admin Django: http://localhost:8000/admin"
    echo "  MeiliSearch:  http://localhost:7700"
    echo "  PostgreSQL:   localhost:5432"
    echo "  Redis:        localhost:6379"
    echo ""
    echo "Comandos útiles:"
    echo "  Ver logs:           docker-compose logs -f"
    echo "  Ver estado:         docker-compose ps"
    echo "  Detener servicios:  docker-compose down"
    echo "  Reiniciar:          docker-compose restart"
    echo ""
    echo "Verificando estado de los servicios..."
    sleep 3
    docker-compose ps
else
    echo ""
    echo "ERROR: Hubo un problema al iniciar los servicios."
    echo "Revisa los logs con: docker-compose logs"
fi
