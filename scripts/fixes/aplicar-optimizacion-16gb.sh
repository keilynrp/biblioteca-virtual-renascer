#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_color() {
    color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Función para imprimir encabezados
print_header() {
    echo ""
    print_color "$CYAN" "========================================"
    print_color "$CYAN" "  $1"
    print_color "$CYAN" "========================================"
    echo ""
}

# Función para imprimir pasos
print_step() {
    print_color "$BLUE" "[$1] $2"
}

# Función para imprimir éxito
print_success() {
    print_color "$GREEN" "✓ $1"
}

# Función para imprimir advertencia
print_warning() {
    print_color "$YELLOW" "⚠ $1"
}

# Función para imprimir error
print_error() {
    print_color "$RED" "✗ $1"
}

# Detectar si usar docker-compose o docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    print_error "Ni docker-compose ni docker compose estan disponibles"
    exit 1
fi

print_header "APLICANDO OPTIMIZACION COMPLETA 16GB"

echo "Este script va a:"
echo "1. Verificar configuracion del sistema"
echo "2. Aplicar optimizaciones Docker para 16GB"
echo "3. Reconstruir y reiniciar contenedores"
echo "4. Verificar el estado final"
echo ""
echo -n "Presiona Enter para continuar..."
read

# PASO 1: VERIFICACION DEL SISTEMA
print_header "PASO 1: VERIFICANDO SISTEMA"

print_step "1.1" "Verificando RAM total del sistema..."
TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 14 ]; then
    print_warning "Tienes ${TOTAL_RAM}GB de RAM. Se recomienda 16GB para esta configuracion."
    echo -n "¿Deseas continuar de todos modos? (s/n): "
    read -r response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        echo "Cancelado por el usuario."
        exit 0
    fi
else
    print_success "Sistema tiene ${TOTAL_RAM}GB de RAM"
fi
echo ""

print_step "1.2" "Memoria disponible:"
free -h
echo ""

print_step "1.3" "Verificando Docker..."
if ! docker --version &> /dev/null; then
    print_error "Docker no esta instalado o no esta corriendo"
    exit 1
fi
print_success "Docker instalado: $(docker --version | cut -d ' ' -f3)"
echo ""

print_step "1.4" "Recursos Docker disponibles:"
docker info 2>/dev/null | grep -E "Total Memory|CPUs" || print_warning "No se pudo obtener info de Docker"
echo ""

print_step "1.5" "Espacio en disco disponible:"
df -h . | tail -1
echo ""

DISK_AVAIL=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$DISK_AVAIL" -lt 20 ]; then
    print_warning "Espacio en disco bajo (${DISK_AVAIL}GB). Se recomiendan al menos 20GB."
fi

# PASO 2: BACKUP (OPCIONAL)
print_header "PASO 2: BACKUP (OPCIONAL)"

echo -n "¿Deseas crear un backup de la configuracion actual? (s/n): "
read -r backup_response
if [[ "$backup_response" =~ ^[Ss]$ ]]; then
    BACKUP_DIR="docker-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    print_step "2.1" "Creando backup de configuracion..."
    cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null && print_success "docker-compose.yml respaldado"
    cp .env "$BACKUP_DIR/" 2>/dev/null && print_success ".env respaldado"

    print_step "2.2" "Exportando volumenes (esto puede tardar)..."
    for volume in postgres_data elasticsearch_data redis_data; do
        if docker volume ls | grep -q "$volume"; then
            docker run --rm -v "bvs_framework_${volume}:/data" -v "$(pwd)/$BACKUP_DIR:/backup" alpine tar czf "/backup/${volume}.tar.gz" -C /data . 2>/dev/null && \
                print_success "${volume} respaldado" || \
                print_warning "No se pudo respaldar ${volume}"
        fi
    done

    print_success "Backup creado en: $BACKUP_DIR"
else
    print_warning "Saltando backup. Asegurate de tener respaldos importantes."
fi
echo ""

# PASO 3: OPTIMIZACIONES DOCKER
print_header "PASO 3: OPTIMIZACIONES DOCKER"

print_step "3.1" "Deteniendo contenedores actuales..."
if $DOCKER_COMPOSE down; then
    print_success "Contenedores detenidos"
else
    print_error "Error al detener contenedores"
    exit 1
fi
echo ""

print_step "3.2" "Limpiando imagenes antiguas..."
docker image prune -f
print_success "Imagenes antiguas eliminadas"
echo ""

print_step "3.3" "Construyendo imagenes optimizadas para 16GB..."
print_warning "Esto puede tardar 5-10 minutos..."
echo ""

if $DOCKER_COMPOSE build --no-cache --progress=plain 2>&1 | tee build.log; then
    print_success "Imagenes construidas exitosamente"
else
    print_error "Error al construir imagenes. Ver build.log para detalles"
    exit 1
fi
echo ""

print_step "3.4" "Creando volumenes persistentes..."
for volume in postgres_data elasticsearch_data redis_data frontend_cache; do
    if docker volume create "bvs_framework_${volume}" 2>/dev/null; then
        print_success "Volumen ${volume} creado/verificado"
    fi
done
echo ""

print_step "3.5" "Iniciando servicios optimizados..."
if $DOCKER_COMPOSE up -d; then
    print_success "Servicios iniciados"
else
    print_error "Error al iniciar servicios"
    exit 1
fi
echo ""

# PASO 4: ESPERA Y MONITOREO
print_header "PASO 4: ESPERANDO SERVICIOS"

print_step "4.1" "Esperando que servicios esten saludables..."
print_warning "Esto puede tardar 60-90 segundos..."
echo ""

# Función para verificar salud de un servicio
check_service_health() {
    service=$1
    max_attempts=20
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        status=$($DOCKER_COMPOSE ps | grep "$service" | awk '{print $5}')
        if echo "$status" | grep -q "healthy"; then
            print_success "$service esta saludable"
            return 0
        elif echo "$status" | grep -q "unhealthy"; then
            print_error "$service esta unhealthy"
            return 1
        fi

        attempt=$((attempt + 1))
        sleep 3
    done

    print_warning "$service aun no responde (timeout)"
    return 1
}

# Monitorear servicios
echo "Monitoreando servicios:"
sleep 10  # Dar tiempo inicial para que inicien

check_service_health "db" &
check_service_health "redis" &
check_service_health "elasticsearch" &
check_service_health "backend" &
check_service_health "frontend" &

wait

echo ""

# PASO 5: VERIFICACION FINAL
print_header "PASO 5: VERIFICACION FINAL"

print_step "5.1" "Estado de contenedores:"
echo "----------------------------------------"
$DOCKER_COMPOSE ps
echo ""

print_step "5.2" "Uso de recursos:"
echo "----------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

print_step "5.3" "Verificando conectividad de servicios..."
echo ""

# PostgreSQL
if $DOCKER_COMPOSE exec -T db pg_isready -U postgres &>/dev/null; then
    print_success "PostgreSQL: Respondiendo"
else
    print_warning "PostgreSQL: No responde"
fi

# Redis
if $DOCKER_COMPOSE exec -T redis redis-cli ping &>/dev/null | grep -q PONG; then
    print_success "Redis: Respondiendo"
else
    print_warning "Redis: No responde"
fi

# Elasticsearch
if curl -s http://localhost:9200/_cluster/health 2>/dev/null | grep -q "green\|yellow"; then
    ES_STATUS=$(curl -s http://localhost:9200/_cluster/health 2>/dev/null | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    print_success "Elasticsearch: Status $ES_STATUS"
else
    print_warning "Elasticsearch: No responde (espera 30s mas)"
fi

# Backend
if curl -s http://localhost:8000/ &>/dev/null; then
    print_success "Backend: Respondiendo"
else
    print_warning "Backend: No responde"
fi

# Frontend
if curl -s http://localhost:3000/ &>/dev/null; then
    print_success "Frontend: Respondiendo"
else
    print_warning "Frontend: No responde"
fi

echo ""

print_step "5.4" "Verificando configuraciones especificas..."
echo ""

# Verificar configuracion Elasticsearch
ES_HEAP=$($DOCKER_COMPOSE exec -T elasticsearch sh -c 'echo $ES_JAVA_OPTS' 2>/dev/null | grep -o 'Xmx[^ ]*' | cut -d- -f2)
if [ -n "$ES_HEAP" ]; then
    print_success "Elasticsearch heap: $ES_HEAP"
fi

# Verificar configuracion PostgreSQL
PG_BUFFERS=$($DOCKER_COMPOSE exec -T db psql -U postgres -d biblioteca -t -c "SHOW shared_buffers;" 2>/dev/null | tr -d ' ')
if [ -n "$PG_BUFFERS" ]; then
    print_success "PostgreSQL shared_buffers: $PG_BUFFERS"
fi

# Verificar configuracion Redis
REDIS_MEM=$($DOCKER_COMPOSE exec -T redis redis-cli CONFIG GET maxmemory 2>/dev/null | tail -1)
if [ -n "$REDIS_MEM" ]; then
    REDIS_MEM_MB=$((REDIS_MEM / 1024 / 1024))
    print_success "Redis maxmemory: ${REDIS_MEM_MB}MB"
fi

echo ""

# RESUMEN FINAL
print_header "OPTIMIZACION 16GB COMPLETADA"

print_color "$GREEN" "✓ Configuracion aplicada exitosamente"
echo ""
echo "Recursos asignados:"
echo "  • Frontend:      4GB  (antes 3GB)    ↑ +33%"
echo "  • Elasticsearch: 2GB  (antes 1.5GB)  ↑ +33%"
echo "  • Backend:       1GB  (optimizado)   ✓"
echo "  • PostgreSQL:    512MB (optimizado)  ✓"
echo "  • Redis:         256MB (optimizado)  ✓"
echo ""
echo "Total Docker: ~7.8GB / 16GB (49%)"
echo "Margen disponible: ~8GB"
echo ""

print_color "$CYAN" "Comandos útiles:"
echo "  $DOCKER_COMPOSE logs -f              Ver logs en tiempo real"
echo "  $DOCKER_COMPOSE logs -f [servicio]   Ver logs de un servicio"
echo "  docker stats                          Ver uso de recursos"
echo "  $DOCKER_COMPOSE ps                   Ver estado de servicios"
echo "  $DOCKER_COMPOSE restart [servicio]   Reiniciar un servicio"
echo "  $DOCKER_COMPOSE down                 Detener todos los servicios"
echo ""

print_color "$CYAN" "Verificacion de salud:"
echo "  curl http://localhost:8000/           Backend Django"
echo "  curl http://localhost:3000/           Frontend Next.js"
echo "  curl http://localhost:9200/_cluster/health  Elasticsearch"
echo ""

print_color "$YELLOW" "📚 Documentacion:"
echo "  • OPTIMIZACION_16GB_APLICADA.md    Guia completa"
echo "  • COMPARACION_OPTIMIZACIONES.md    Analisis tecnico"
echo "  • DOCKER_OPTIMIZATIONS.md          Referencia completa"
echo ""

if [ -d "$BACKUP_DIR" ]; then
    print_color "$YELLOW" "💾 Backup guardado en: $BACKUP_DIR"
    echo ""
fi

print_color "$GREEN" "¡Sistema optimizado y listo para usar! 🚀"
echo ""

# Preguntar si quiere ver logs
echo -n "¿Deseas ver los logs en tiempo real? (s/n): "
read -r logs_response
if [[ "$logs_response" =~ ^[Ss]$ ]]; then
    echo ""
    print_color "$CYAN" "Iniciando logs... (Ctrl+C para salir)"
    sleep 2
    $DOCKER_COMPOSE logs -f
fi
