#!/bin/bash

# Detectar si usar docker-compose o docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "Error: Ni docker-compose ni docker compose estan disponibles"
    exit 1
fi

echo "========================================"
echo "   APLICANDO OPTIMIZACIONES DE DOCKER"
echo "========================================"
echo "Usando: $DOCKER_COMPOSE"
echo ""

echo "[1/6] Deteniendo contenedores actuales..."
$DOCKER_COMPOSE down
if [ $? -ne 0 ]; then
    echo "Error al detener contenedores"
    exit 1
fi
echo "OK!"
echo ""

echo "[2/6] Limpiando imagenes antiguas..."
docker image prune -f
echo "OK!"
echo ""

echo "[3/6] Construyendo nuevas imagenes con optimizaciones..."
$DOCKER_COMPOSE build --no-cache
if [ $? -ne 0 ]; then
    echo "Error al construir imagenes"
    exit 1
fi
echo "OK!"
echo ""

echo "[4/6] Creando volumenes persistentes..."
docker volume create bvs_framework_postgres_data 2>/dev/null || true
docker volume create bvs_framework_elasticsearch_data 2>/dev/null || true
docker volume create bvs_framework_redis_data 2>/dev/null || true
docker volume create bvs_framework_frontend_cache 2>/dev/null || true
echo "OK!"
echo ""

echo "[5/6] Iniciando servicios optimizados..."
$DOCKER_COMPOSE up -d
if [ $? -ne 0 ]; then
    echo "Error al iniciar servicios"
    exit 1
fi
echo "OK!"
echo ""

echo "[6/6] Esperando que los servicios esten saludables..."
sleep 30
echo ""

echo "========================================"
echo "     VERIFICANDO ESTADO DE SERVICIOS"
echo "========================================"
$DOCKER_COMPOSE ps
echo ""

echo "========================================"
echo "     USO DE RECURSOS"
echo "========================================"
docker stats --no-stream
echo ""

echo "========================================"
echo "   OPTIMIZACIONES APLICADAS CON EXITO"
echo "========================================"
echo ""
echo "Para ver los logs en tiempo real:"
echo "  $DOCKER_COMPOSE logs -f"
echo ""
echo "Para ver el uso de recursos:"
echo "  docker stats"
echo ""
echo "Para detener los servicios:"
echo "  $DOCKER_COMPOSE down"
echo ""
echo "Documentacion completa: DOCKER_OPTIMIZATIONS.md"
echo ""
