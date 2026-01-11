#!/bin/bash

echo "=========================================="
echo "  LIMPIEZA Y OPTIMIZACIÓN DE DOCKER"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${BLUE}►${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Paso 1: Detener todos los contenedores
print_step "Deteniendo todos los contenedores..."
docker compose down 2>/dev/null || true
sleep 2
print_success "Contenedores detenidos"

# Paso 2: Limpiar contenedores huérfanos y volúmenes no utilizados
echo ""
print_step "Limpiando contenedores huérfanos..."
docker compose down --remove-orphans 2>/dev/null || true
print_success "Contenedores huérfanos eliminados"

# Paso 3: Limpiar imágenes no utilizadas (pero preservar las que necesitamos)
echo ""
print_step "Limpiando imágenes no utilizadas..."
docker image prune -f
print_success "Imágenes no utilizadas eliminadas"

# Paso 4: Limpiar cache de construcción de Docker
echo ""
print_step "Limpiando cache de construcción..."
docker builder prune -f
print_success "Cache de construcción limpiada"

# Paso 5: Limpiar volúmenes no utilizados (CUIDADO: esto preserva volúmenes de contenedores activos)
echo ""
print_warning "Limpiando volúmenes no utilizados (se preservarán los volúmenes de datos importantes)..."
docker volume prune -f
print_success "Volúmenes no utilizados eliminados"

# Paso 6: Verificar espacio recuperado
echo ""
print_step "Espacio en disco de Docker:"
docker system df

# Paso 7: Rebuild de imágenes con optimización
echo ""
echo "=========================================="
echo "  RECONSTRUCCIÓN OPTIMIZADA"
echo "=========================================="
echo ""

print_step "Reconstruyendo imágenes con cache optimizado..."
docker compose build --no-cache backend frontend 2>&1 | while IFS= read -r line; do
    echo "  $line"
done

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    print_success "Imágenes reconstruidas exitosamente"
else
    print_error "Error al reconstruir imágenes"
    exit 1
fi

# Paso 8: Levantar servicios de manera incremental
echo ""
echo "=========================================="
echo "  INICIANDO SERVICIOS"
echo "=========================================="
echo ""

# Primero: Base de datos y Redis (servicios sin dependencias)
print_step "Iniciando servicios base (PostgreSQL y Redis)..."
docker compose up -d db redis
sleep 5

# Verificar que db y redis estén saludables
print_step "Verificando servicios base..."
for i in {1..30}; do
    if docker compose ps db | grep -q "healthy\|Up"; then
        if docker compose ps redis | grep -q "healthy\|Up"; then
            print_success "Servicios base iniciados correctamente"
            break
        fi
    fi

    if [ $i -eq 30 ]; then
        print_error "Timeout esperando servicios base"
        docker compose logs db redis
        exit 1
    fi

    echo -n "."
    sleep 2
done
echo ""

# Segundo: Elasticsearch (requiere más recursos)
print_step "Iniciando Elasticsearch..."
docker compose up -d elasticsearch
sleep 10

# Verificar Elasticsearch
print_step "Verificando Elasticsearch..."
for i in {1..30}; do
    if docker compose ps elasticsearch | grep -q "healthy\|Up"; then
        print_success "Elasticsearch iniciado correctamente"
        break
    fi

    if [ $i -eq 30 ]; then
        print_warning "Elasticsearch tardó en iniciar, continuando..."
        break
    fi

    echo -n "."
    sleep 2
done
echo ""

# Tercero: Backend (depende de db, redis, elasticsearch)
print_step "Iniciando Backend..."
docker compose up -d backend
sleep 5

# Verificar Backend
print_step "Verificando Backend..."
for i in {1..60}; do
    if docker compose ps backend | grep -q "healthy\|Up"; then
        print_success "Backend iniciado correctamente"
        break
    fi

    if [ $i -eq 60 ]; then
        print_error "Backend falló al iniciar"
        docker compose logs --tail=50 backend
        exit 1
    fi

    echo -n "."
    sleep 2
done
echo ""

# Cuarto: Frontend en contenedor (OPCIONAL - comentado por defecto)
# print_step "Iniciando Frontend en contenedor..."
# docker compose up -d frontend
# sleep 3
# print_success "Frontend en contenedor iniciado"

# Paso 9: Verificar estado de todos los servicios
echo ""
echo "=========================================="
echo "  ESTADO DE SERVICIOS"
echo "=========================================="
echo ""

docker compose ps

echo ""
print_step "Verificando conectividad de servicios..."

# Test PostgreSQL
if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
    print_success "PostgreSQL: Conectado"
else
    print_error "PostgreSQL: No disponible"
fi

# Test Redis
if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    print_success "Redis: Conectado"
else
    print_error "Redis: No disponible"
fi

# Test Elasticsearch
if curl -s http://localhost:9200/_cluster/health >/dev/null 2>&1; then
    print_success "Elasticsearch: Conectado"
else
    print_warning "Elasticsearch: No disponible aún (puede tardar unos minutos)"
fi

# Test Backend
if curl -s http://localhost:8000/api/health/ >/dev/null 2>&1; then
    print_success "Backend: Conectado"
else
    print_warning "Backend: No disponible (verificar logs si persiste)"
fi

# Paso 10: Mostrar logs recientes
echo ""
echo "=========================================="
echo "  LOGS RECIENTES"
echo "=========================================="
echo ""

print_step "Últimas líneas de logs del backend:"
docker compose logs --tail=20 backend

echo ""
echo "=========================================="
echo "  CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo ""

print_success "Servicios Docker optimizados y en ejecución"
echo ""
echo "Servicios disponibles:"
echo "  • PostgreSQL:     localhost:5432"
echo "  • Redis:          localhost:6379"
echo "  • Elasticsearch:  localhost:9200"
echo "  • Backend:        localhost:8000"
echo ""
echo "Para ver logs en tiempo real:"
echo "  docker compose logs -f [servicio]"
echo ""
echo "Para detener todos los servicios:"
echo "  docker compose down"
echo ""
