#!/bin/bash

# ============================================================================
# BVS Framework - Container Fix Script (Optimized)
# ============================================================================
# Purpose: Fix all Docker container issues and get the system running
# Compatible: Git Bash (Windows), Linux, macOS
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado o no está en el PATH"
        print_info "Por favor, inicia Docker Desktop y vuelve a intentar"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker no está corriendo"
        print_info "Por favor, inicia Docker Desktop y vuelve a intentar"
        exit 1
    fi

    print_success "Docker está disponible y corriendo"
}

check_compose() {
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose no está disponible"
        exit 1
    fi
    print_success "Docker Compose está disponible"
}

# ============================================================================
# Main Fix Functions
# ============================================================================

stop_all_containers() {
    print_header "Paso 1: Deteniendo todos los contenedores"

    if docker compose ps -q 2>/dev/null | grep -q .; then
        print_info "Deteniendo contenedores existentes..."
        docker compose down 2>/dev/null || true
        print_success "Contenedores detenidos"
    else
        print_info "No hay contenedores corriendo"
    fi
}

clean_docker_resources() {
    print_header "Paso 2: Limpiando recursos de Docker (opcional)"

    read -p "¿Deseas limpiar volúmenes y caché? (s/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_warning "Esto eliminará TODOS los datos (base de datos, caché, etc.)"
        read -p "¿Estás seguro? (s/N): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Ss]$ ]]; then
            print_info "Eliminando volúmenes..."
            docker compose down -v 2>/dev/null || true

            print_info "Limpiando caché de Docker..."
            docker system prune -f

            print_success "Recursos limpiados"
        else
            print_info "Limpieza cancelada"
        fi
    else
        print_info "Omitiendo limpieza de volúmenes"
    fi
}

build_containers() {
    print_header "Paso 3: Construyendo contenedores"

    print_info "Construyendo backend..."
    docker compose build backend --no-cache || {
        print_error "Error al construir backend"
        exit 1
    }
    print_success "Backend construido"

    print_info "Construyendo frontend..."
    docker compose build frontend --no-cache || {
        print_error "Error al construir frontend"
        print_warning "Intentando con caché..."
        docker compose build frontend || {
            print_error "Error crítico al construir frontend"
            exit 1
        }
    }
    print_success "Frontend construido"

    print_info "Construyendo backup..."
    docker compose build backup --no-cache || {
        print_warning "Error al construir backup (no crítico)"
    }
    print_success "Backup construido"
}

start_core_services() {
    print_header "Paso 4: Iniciando servicios core (DB, Redis, Meilisearch)"

    print_info "Iniciando PostgreSQL..."
    docker compose up -d db
    sleep 5

    if docker compose ps db | grep -q "Up"; then
        print_success "PostgreSQL iniciado"
    else
        print_error "PostgreSQL falló al iniciar"
        docker compose logs db --tail=20
        exit 1
    fi

    print_info "Iniciando Redis..."
    docker compose up -d redis
    sleep 3

    if docker compose ps redis | grep -q "Up"; then
        print_success "Redis iniciado"
    else
        print_error "Redis falló al iniciar"
        docker compose logs redis --tail=20
        exit 1
    fi

    print_info "Iniciando Meilisearch..."
    docker compose up -d meilisearch
    sleep 3

    if docker compose ps meilisearch | grep -q "Up"; then
        print_success "Meilisearch iniciado"
    else
        print_warning "Meilisearch falló al iniciar (no crítico)"
    fi
}

wait_for_db() {
    print_header "Paso 5: Esperando a que la base de datos esté lista"

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T db pg_isready -U postgres -d biblioteca &>/dev/null; then
            print_success "Base de datos está lista"
            return 0
        fi

        echo -ne "\rEsperando la base de datos... (intento $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done

    print_error "Timeout esperando la base de datos"
    return 1
}

run_migrations() {
    print_header "Paso 6: Ejecutando migraciones"

    print_info "Iniciando backend temporalmente..."
    docker compose up -d backend
    sleep 10

    print_info "Verificando migraciones..."
    docker compose exec -T backend python manage.py showmigrations || true

    print_info "Ejecutando migraciones..."
    docker compose exec -T backend python manage.py migrate || {
        print_error "Error al ejecutar migraciones"
        docker compose logs backend --tail=30
        exit 1
    }

    print_success "Migraciones ejecutadas correctamente"
}

start_all_services() {
    print_header "Paso 7: Iniciando todos los servicios"

    print_info "Iniciando backend..."
    docker compose up -d backend
    sleep 10

    print_info "Iniciando frontend..."
    docker compose up -d frontend
    sleep 5

    print_info "Iniciando backup..."
    docker compose up -d backup || print_warning "Backup no pudo iniciar (no crítico)"

    print_success "Todos los servicios iniciados"
}

verify_services() {
    print_header "Paso 8: Verificando servicios"

    echo -e "\n${BLUE}Estado de contenedores:${NC}"
    docker compose ps

    echo -e "\n${BLUE}Verificando salud de los servicios...${NC}\n"

    # Check backend
    local max_attempts=20
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost:8000/admin/ &>/dev/null; then
            print_success "Backend está respondiendo (http://localhost:8000)"
            break
        fi

        if [ $attempt -eq $max_attempts ]; then
            print_warning "Backend no responde después de $max_attempts intentos"
            print_info "Verificando logs del backend..."
            docker compose logs backend --tail=30
        else
            echo -ne "\rEsperando backend... (intento $attempt/$max_attempts)"
            sleep 3
        fi
        ((attempt++))
    done

    # Check frontend
    attempt=1
    echo
    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost:3000 &>/dev/null; then
            print_success "Frontend está respondiendo (http://localhost:3000)"
            break
        fi

        if [ $attempt -eq $max_attempts ]; then
            print_warning "Frontend no responde después de $max_attempts intentos"
            print_info "Verificando logs del frontend..."
            docker compose logs frontend --tail=30
        else
            echo -ne "\rEsperando frontend... (intento $attempt/$max_attempts)"
            sleep 5
        fi
        ((attempt++))
    done

    # Check health endpoints
    echo -e "\n${BLUE}Verificando endpoints de salud...${NC}\n"

    if curl -sf http://localhost:8000/api/health/ | grep -q "healthy"; then
        print_success "Health check básico: OK"
    else
        print_warning "Health check básico: FAILED"
    fi

    if curl -sf http://localhost:8000/api/health/detailed/ | grep -q "healthy"; then
        print_success "Health check detallado: OK"
    else
        print_warning "Health check detallado: FAILED"
    fi
}

show_logs() {
    print_header "Paso 9: Mostrando logs recientes"

    echo -e "${BLUE}Últimos logs del backend:${NC}"
    docker compose logs backend --tail=20

    echo -e "\n${BLUE}Últimos logs del frontend:${NC}"
    docker compose logs frontend --tail=20
}

final_summary() {
    print_header "Resumen Final"

    echo -e "${GREEN}✓ Proceso completado${NC}\n"

    echo -e "${BLUE}URLs disponibles:${NC}"
    echo "  • Frontend:  http://localhost:3000"
    echo "  • Backend:   http://localhost:8000"
    echo "  • Admin:     http://localhost:8000/admin/"
    echo "  • API:       http://localhost:8000/api/"
    echo "  • Health:    http://localhost:8000/api/health/detailed/"

    echo -e "\n${BLUE}Comandos útiles:${NC}"
    echo "  • Ver logs:           docker compose logs -f"
    echo "  • Ver logs backend:   docker compose logs -f backend"
    echo "  • Ver logs frontend:  docker compose logs -f frontend"
    echo "  • Reiniciar:          docker compose restart"
    echo "  • Detener:            docker compose down"
    echo "  • Estado:             docker compose ps"

    echo -e "\n${BLUE}Siguiente paso:${NC}"
    echo "  Abre http://localhost:3000 en tu navegador"

    echo -e "\n${YELLOW}Si hay errores:${NC}"
    echo "  1. Revisa los logs: docker compose logs -f backend"
    echo "  2. Ejecuta diagnóstico: ./scripts/diagnose.sh"
    echo "  3. Lee la documentación:"
    echo "     - FIX_SUMMARY.md"
    echo "     - TROUBLESHOOTING.md"
    echo "     - IMMEDIATE_ACTIONS.md"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear

    print_header "🔧 BVS Framework - Fix All Containers"

    echo -e "${BLUE}Este script va a:${NC}"
    echo "  1. Detener todos los contenedores"
    echo "  2. Limpiar recursos (opcional)"
    echo "  3. Reconstruir todos los contenedores"
    echo "  4. Iniciar servicios en orden correcto"
    echo "  5. Ejecutar migraciones"
    echo "  6. Verificar que todo funcione"
    echo

    read -p "¿Continuar? (S/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Operación cancelada"
        exit 0
    fi

    # Pre-checks
    check_docker
    check_compose

    # Main workflow
    stop_all_containers
    clean_docker_resources
    build_containers
    start_core_services
    wait_for_db
    run_migrations
    start_all_services
    verify_services
    show_logs
    final_summary
}

# ============================================================================
# Script Entry Point
# ============================================================================

main "$@"
