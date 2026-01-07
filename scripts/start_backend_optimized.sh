#!/bin/bash

# ============================================================================
# BACKEND STARTUP OPTIMIZER - Super Script
# ============================================================================
# This script handles all backend initialization with error recovery
# and dependency management
# ============================================================================

set -e  # Exit on error
trap 'handle_error $? $LINENO' ERR

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
MAX_RETRIES=3
WAIT_TIME=5
LOG_FILE="logs/backend_startup_$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="backups"

# ============================================================================
# Utility Functions
# ============================================================================

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

handle_error() {
    local exit_code=$1
    local line_number=$2
    error "Script failed at line $line_number with exit code $exit_code"
    cleanup_on_error
    exit $exit_code
}

cleanup_on_error() {
    warning "Cleaning up after error..."
    docker-compose down 2>/dev/null || true
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

preflight_checks() {
    log "=== Running Pre-flight Checks ==="

    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    success "Docker found"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        exit 1
    fi
    success "Docker Compose found"

    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi
    success "Docker daemon is running"

    # Create necessary directories
    mkdir -p logs backups backend/media backend/static
    success "Required directories created"

    # Check .env file
    if [ ! -f ".env" ]; then
        error ".env file not found"
        exit 1
    fi
    success ".env file found"
}

# ============================================================================
# Docker Cleanup
# ============================================================================

docker_cleanup() {
    log "=== Cleaning Up Docker Environment ==="

    info "Stopping existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    success "Containers stopped"

    info "Removing dangling images..."
    docker image prune -f &> /dev/null || true
    success "Dangling images removed"

    info "Removing unused volumes (keeping data)..."
    docker volume ls -qf dangling=true | xargs -r docker volume rm 2>/dev/null || true
    success "Unused volumes removed"
}

# ============================================================================
# Build Backend Image
# ============================================================================

build_backend() {
    log "=== Building Backend Image ==="

    local retry=0
    while [ $retry -lt $MAX_RETRIES ]; do
        info "Build attempt $((retry + 1)) of $MAX_RETRIES..."

        if docker-compose build --no-cache backend 2>&1 | tee -a "$LOG_FILE"; then
            success "Backend image built successfully"
            return 0
        else
            warning "Build failed, retrying in $WAIT_TIME seconds..."
            sleep $WAIT_TIME
            ((retry++))
        fi
    done

    error "Failed to build backend after $MAX_RETRIES attempts"
    return 1
}

# ============================================================================
# Start Database Services
# ============================================================================

start_database_services() {
    log "=== Starting Database Services ==="

    info "Starting PostgreSQL..."
    docker-compose up -d db

    info "Waiting for PostgreSQL to be healthy..."
    local retry=0
    while [ $retry -lt 30 ]; do
        if docker-compose exec -T db pg_isready -U postgres -d biblioteca &> /dev/null; then
            success "PostgreSQL is ready"
            break
        fi
        echo -n "."
        sleep 2
        ((retry++))
    done

    if [ $retry -eq 30 ]; then
        error "PostgreSQL failed to start"
        return 1
    fi

    info "Starting Redis..."
    docker-compose up -d redis

    info "Waiting for Redis..."
    retry=0
    while [ $retry -lt 20 ]; do
        if docker-compose exec -T redis redis-cli ping &> /dev/null; then
            success "Redis is ready"
            break
        fi
        echo -n "."
        sleep 1
        ((retry++))
    done

    if [ $retry -eq 20 ]; then
        error "Redis failed to start"
        return 1
    fi

    info "Starting Meilisearch..."
    docker-compose up -d meilisearch

    info "Waiting for Meilisearch..."
    retry=0
    while [ $retry -lt 20 ]; do
        if curl -f http://localhost:7700/health &> /dev/null; then
            success "Meilisearch is ready"
            break
        fi
        echo -n "."
        sleep 1
        ((retry++))
    done

    if [ $retry -eq 20 ]; then
        warning "Meilisearch may not be fully ready, continuing..."
    fi
}

# ============================================================================
# Initialize Database
# ============================================================================

initialize_database() {
    log "=== Initializing Database ==="

    # Check if database needs initialization
    info "Checking database state..."

    local tables_count=$(docker-compose exec -T db psql -U postgres -d biblioteca -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs || echo "0")

    if [ "$tables_count" -eq "0" ]; then
        info "Database is empty, running full initialization..."

        info "Running migrations..."
        docker-compose run --rm backend python manage.py migrate --noinput 2>&1 | tee -a "$LOG_FILE"
        success "Migrations completed"

        info "Creating cache tables..."
        docker-compose run --rm backend python manage.py createcachetable 2>&1 | tee -a "$LOG_FILE" || true
        success "Cache tables created"

        info "Collecting static files..."
        docker-compose run --rm backend python manage.py collectstatic --noinput 2>&1 | tee -a "$LOG_FILE" || true
        success "Static files collected"

        # Check if superuser exists
        info "Checking for superuser..."
        local has_superuser=$(docker-compose run --rm backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.filter(is_superuser=True).exists())" 2>/dev/null | tail -n 1)

        if [ "$has_superuser" != "True" ]; then
            warning "No superuser found. Create one with:"
            warning "  docker-compose run --rm backend python manage.py createsuperuser"
        fi
    else
        info "Database already initialized with $tables_count tables"

        info "Running migrations (if any)..."
        docker-compose run --rm backend python manage.py migrate --noinput 2>&1 | tee -a "$LOG_FILE" || true
        success "Migrations checked"
    fi
}

# ============================================================================
# Install/Update Dependencies
# ============================================================================

update_dependencies() {
    log "=== Checking Dependencies ==="

    info "Installing/updating Python dependencies in container..."
    docker-compose run --rm backend pip install --no-cache-dir -r requirements.txt 2>&1 | tee -a "$LOG_FILE"
    success "Dependencies updated"
}

# ============================================================================
# Health Checks
# ============================================================================

run_health_checks() {
    log "=== Running Health Checks ==="

    info "Testing database connection..."
    if docker-compose run --rm backend python manage.py check --database default 2>&1 | tee -a "$LOG_FILE"; then
        success "Database connection OK"
    else
        error "Database connection failed"
        return 1
    fi

    info "Running Django system checks..."
    if docker-compose run --rm backend python manage.py check 2>&1 | tee -a "$LOG_FILE"; then
        success "Django system checks passed"
    else
        warning "Some system checks failed (non-critical)"
    fi

    info "Testing cache connection..."
    docker-compose run --rm backend python manage.py shell -c "from django.core.cache import cache; cache.set('test', 'ok'); print('Cache OK' if cache.get('test') == 'ok' else 'Cache Failed')" 2>&1 | tee -a "$LOG_FILE" || true
}

# ============================================================================
# Start Backend Service
# ============================================================================

start_backend() {
    log "=== Starting Backend Service ==="

    info "Starting backend container..."
    docker-compose up -d backend

    info "Waiting for backend to be healthy..."
    local retry=0
    while [ $retry -lt 60 ]; do
        if curl -f http://localhost:8000/admin/ &> /dev/null; then
            success "Backend is responding"
            return 0
        fi
        echo -n "."
        sleep 2
        ((retry++))
    done

    error "Backend failed to start properly"
    warning "Check logs with: docker-compose logs backend"
    return 1
}

# ============================================================================
# Show Status
# ============================================================================

show_status() {
    log "=== System Status ==="

    echo ""
    docker-compose ps
    echo ""

    info "Service URLs:"
    echo -e "  ${CYAN}Backend:${NC}      http://localhost:8000"
    echo -e "  ${CYAN}Admin:${NC}        http://localhost:8000/admin/"
    echo -e "  ${CYAN}API:${NC}          http://localhost:8000/api/"
    echo -e "  ${CYAN}Meilisearch:${NC}  http://localhost:7700"
    echo ""

    info "Useful commands:"
    echo -e "  ${YELLOW}View logs:${NC}        docker-compose logs -f backend"
    echo -e "  ${YELLOW}Django shell:${NC}     docker-compose exec backend python manage.py shell"
    echo -e "  ${YELLOW}Create superuser:${NC} docker-compose exec backend python manage.py createsuperuser"
    echo -e "  ${YELLOW}Run tests:${NC}        docker-compose exec backend pytest"
    echo -e "  ${YELLOW}Stop all:${NC}         docker-compose down"
    echo ""
}

# ============================================================================
# Main Execution Flow
# ============================================================================

main() {
    clear
    echo -e "${MAGENTA}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║        BACKEND STARTUP OPTIMIZER - Super Script           ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    log "Starting backend optimization process..."

    # Parse arguments
    SKIP_BUILD=false
    SKIP_CLEANUP=false
    FRESH_START=false
    SKIP_VALIDATION=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-cleanup)
                SKIP_CLEANUP=true
                shift
                ;;
            --fresh)
                FRESH_START=true
                shift
                ;;
            --skip-validation)
                SKIP_VALIDATION=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-build       Skip Docker image rebuild"
                echo "  --skip-cleanup     Skip Docker cleanup"
                echo "  --skip-validation  Skip environment validation"
                echo "  --fresh            Fresh start (remove volumes)"
                echo "  --help             Show this help"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Execute steps

    # Run environment validation first (unless skipped)
    if [ "$SKIP_VALIDATION" = false ]; then
        log "Running environment validation..."
        if [ -f "scripts/validate_environment.sh" ]; then
            bash scripts/validate_environment.sh || {
                error "Environment validation failed"
                read -p "Continue anyway? (y/n) " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    exit 1
                fi
            }
        fi
    fi

    preflight_checks

    if [ "$SKIP_CLEANUP" = false ]; then
        docker_cleanup
    fi

    if [ "$FRESH_START" = true ]; then
        warning "Fresh start requested - removing all volumes"
        docker-compose down -v
    fi

    if [ "$SKIP_BUILD" = false ]; then
        build_backend
    fi

    start_database_services

    update_dependencies

    initialize_database

    run_health_checks

    start_backend

    show_status

    success "Backend is ready! 🚀"
    log "Startup completed successfully"

    info "Log file saved to: $LOG_FILE"
}

# Run main function
main "$@"
