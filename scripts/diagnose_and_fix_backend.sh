#!/bin/bash
# =============================================================================
# Backend Diagnosis and Fix Script
# =============================================================================
# This script diagnoses and fixes common backend issues
# Usage: ./scripts/diagnose_and_fix_backend.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

separator() {
    echo ""
    echo "============================================================================="
    echo "$1"
    echo "============================================================================="
    echo ""
}

# =============================================================================
# DIAGNOSIS FUNCTIONS
# =============================================================================

check_docker() {
    separator "1. Checking Docker Installation"

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        log_info "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    log_success "Docker is installed: $(docker --version)"

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        log_info "Please start Docker Desktop"
        exit 1
    fi

    log_success "Docker daemon is running"
}

check_containers() {
    separator "2. Checking Container Status"

    log_info "Current container status:"
    docker compose ps

    # Check if backend is running
    if docker compose ps backend | grep -q "Up"; then
        log_success "Backend container is running"
    else
        log_error "Backend container is not running"
        return 1
    fi

    # Check if database is running
    if docker compose ps db | grep -q "Up"; then
        log_success "Database container is running"
    else
        log_error "Database container is not running"
        return 1
    fi

    return 0
}

check_backend_logs() {
    separator "3. Checking Backend Logs"

    log_info "Last 30 lines of backend logs:"
    docker compose logs --tail=30 backend

    # Check for common errors
    if docker compose logs backend | grep -q "Error\|Exception\|Failed"; then
        log_warning "Found errors in backend logs"

        # Check specific error types
        if docker compose logs backend | grep -q "ModuleNotFoundError"; then
            log_error "Missing Python dependencies detected"
            return 2
        fi

        if docker compose logs backend | grep -q "django.db.utils.*DatabaseError\|psycopg2"; then
            log_error "Database connection error detected"
            return 3
        fi

        if docker compose logs backend | grep -q "CSRF\|CORS"; then
            log_error "CSRF/CORS configuration error detected"
            return 4
        fi

        if docker compose logs backend | grep -q "ImportError\|cannot import"; then
            log_error "Import error detected"
            return 5
        fi

        return 1
    fi

    log_success "No critical errors found in logs"
    return 0
}

check_database_connection() {
    separator "4. Checking Database Connection"

    if docker compose exec -T db pg_isready -U postgres &> /dev/null; then
        log_success "PostgreSQL is ready"
    else
        log_error "PostgreSQL is not ready"
        return 1
    fi

    # Test connection from backend
    log_info "Testing database connection from backend..."
    if docker compose exec -T backend python manage.py showmigrations &> /dev/null; then
        log_success "Backend can connect to database"
    else
        log_error "Backend cannot connect to database"
        return 1
    fi

    return 0
}

check_migrations() {
    separator "5. Checking Database Migrations"

    log_info "Checking migration status..."

    if docker compose exec -T backend python manage.py showmigrations | grep -q "\[ \]"; then
        log_warning "Unapplied migrations found"
        return 1
    else
        log_success "All migrations are applied"
        return 0
    fi
}

check_environment() {
    separator "6. Checking Environment Configuration"

    if [ ! -f "backend/.env" ]; then
        log_error "backend/.env file not found"
        return 1
    fi

    log_success "backend/.env exists"

    # Check critical env vars
    log_info "Checking critical environment variables..."

    required_vars=("POSTGRES_DB" "POSTGRES_USER" "POSTGRES_PASSWORD" "SECRET_KEY" "REDIS_URL")

    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" backend/.env && ! grep -q "^${var}=$" backend/.env; then
            log_success "$var is set"
        else
            log_error "$var is not set or empty"
            return 1
        fi
    done

    return 0
}

check_redis() {
    separator "7. Checking Redis Connection"

    if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis is responding"
    else
        log_error "Redis is not responding"
        return 1
    fi

    return 0
}

# =============================================================================
# FIX FUNCTIONS
# =============================================================================

fix_dependencies() {
    separator "FIX: Installing/Updating Dependencies"

    log_info "Rebuilding backend container with fresh dependencies..."
    docker compose build --no-cache backend

    log_success "Dependencies reinstalled"
}

fix_database() {
    separator "FIX: Database Issues"

    log_info "Restarting database container..."
    docker compose restart db

    log_info "Waiting for database to be ready..."
    sleep 5

    # Wait for PostgreSQL to be ready
    for i in {1..30}; do
        if docker compose exec -T db pg_isready -U postgres &> /dev/null; then
            log_success "Database is ready"
            break
        fi
        echo -n "."
        sleep 1
    done

    log_info "Running migrations..."
    docker compose exec -T backend python manage.py migrate --noinput

    log_success "Database fixed and migrations applied"
}

fix_migrations() {
    separator "FIX: Applying Pending Migrations"

    log_info "Running migrations..."
    docker compose exec -T backend python manage.py migrate --noinput

    log_success "Migrations applied"
}

fix_redis() {
    separator "FIX: Redis Issues"

    log_info "Restarting Redis container..."
    docker compose restart redis

    sleep 3

    if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis restarted successfully"
    else
        log_error "Redis still not responding"
        return 1
    fi
}

fix_permissions() {
    separator "FIX: File Permissions"

    log_info "Creating logs directory if not exists..."
    mkdir -p backend/logs

    log_info "Setting permissions..."
    chmod -R 755 backend/logs 2>/dev/null || true

    log_success "Permissions fixed"
}

restart_all() {
    separator "FIX: Full Restart"

    log_info "Stopping all containers..."
    docker compose down

    log_info "Starting containers..."
    docker compose up -d

    log_info "Waiting for containers to be ready..."
    sleep 10

    log_success "All containers restarted"
}

# =============================================================================
# COMPREHENSIVE FIX
# =============================================================================

comprehensive_fix() {
    separator "COMPREHENSIVE FIX - Attempting to resolve all issues"

    log_info "Step 1: Stopping containers..."
    docker compose down

    log_info "Step 2: Cleaning up volumes (keeping database data)..."
    # Don't remove db volume to preserve data
    docker compose down -v --remove-orphans 2>/dev/null || true

    log_info "Step 3: Creating necessary directories..."
    mkdir -p backend/logs
    mkdir -p backend/media
    mkdir -p backend/static_root
    mkdir -p backups

    log_info "Step 4: Rebuilding containers..."
    docker compose build --no-cache

    log_info "Step 5: Starting services..."
    docker compose up -d db redis elasticsearch

    log_info "Step 6: Waiting for database..."
    sleep 10
    for i in {1..30}; do
        if docker compose exec -T db pg_isready -U postgres &> /dev/null; then
            log_success "Database ready"
            break
        fi
        echo -n "."
        sleep 1
    done

    log_info "Step 7: Starting backend..."
    docker compose up -d backend

    log_info "Step 8: Waiting for backend to initialize..."
    sleep 5

    log_info "Step 9: Running migrations..."
    docker compose exec -T backend python manage.py migrate --noinput

    log_info "Step 10: Collecting static files..."
    docker compose exec -T backend python manage.py collectstatic --noinput

    log_info "Step 11: Starting remaining services..."
    docker compose up -d

    log_success "Comprehensive fix completed"
}

# =============================================================================
# HEALTH CHECK
# =============================================================================

health_check() {
    separator "HEALTH CHECK - Verifying System Status"

    local all_healthy=true

    # Check backend health
    log_info "Checking backend health endpoint..."
    if curl -f http://localhost:8000/api/ &> /dev/null; then
        log_success "Backend API is responding"
    else
        log_error "Backend API is not responding"
        all_healthy=false
    fi

    # Check database
    if docker compose exec -T db pg_isready -U postgres &> /dev/null; then
        log_success "Database is healthy"
    else
        log_error "Database is unhealthy"
        all_healthy=false
    fi

    # Check Redis
    if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis is healthy"
    else
        log_error "Redis is unhealthy"
        all_healthy=false
    fi

    if [ "$all_healthy" = true ]; then
        log_success "All services are healthy!"
        return 0
    else
        log_error "Some services are unhealthy"
        return 1
    fi
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

main() {
    clear
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║         BVS Framework - Backend Diagnosis & Fix Script               ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo ""

    # Check Docker
    check_docker

    # Run diagnosis
    local issues_found=false
    local error_code=0

    if ! check_containers; then
        issues_found=true
        log_warning "Container issues detected"
    fi

    check_backend_logs
    error_code=$?

    if [ $error_code -ne 0 ]; then
        issues_found=true

        case $error_code in
            2)
                log_warning "Dependency issues detected - will rebuild"
                fix_dependencies
                restart_all
                ;;
            3)
                log_warning "Database issues detected - will fix"
                fix_database
                ;;
            4)
                log_warning "Configuration issues detected - please check settings"
                ;;
            5)
                log_warning "Import errors detected - will rebuild"
                fix_dependencies
                restart_all
                ;;
            *)
                log_warning "General errors detected"
                ;;
        esac
    fi

    if ! check_database_connection; then
        issues_found=true
        fix_database
    fi

    if ! check_migrations; then
        issues_found=true
        fix_migrations
    fi

    check_environment || true

    if ! check_redis; then
        issues_found=true
        fix_redis
    fi

    fix_permissions

    # If critical issues found, offer comprehensive fix
    if [ "$issues_found" = true ]; then
        separator "ISSUES DETECTED"
        log_warning "Multiple issues were detected. Do you want to run a comprehensive fix?"
        echo -n "This will restart all containers and rebuild if needed. Continue? [y/N]: "
        read -r response

        if [[ "$response" =~ ^[Yy]$ ]]; then
            comprehensive_fix
        else
            log_info "Skipping comprehensive fix. Running basic restart..."
            restart_all
        fi
    fi

    # Final health check
    sleep 5
    if health_check; then
        separator "✓ DIAGNOSIS COMPLETE - SYSTEM HEALTHY"
        log_success "Backend is now running correctly"
        log_info "You can access the API at: http://localhost:8000/api/"
        exit 0
    else
        separator "✗ DIAGNOSIS COMPLETE - ISSUES REMAIN"
        log_error "Some issues could not be automatically resolved"
        log_info "Please check the logs above for details"
        log_info "Manual intervention may be required"

        echo ""
        log_info "Useful commands for debugging:"
        echo "  - View backend logs: docker compose logs -f backend"
        echo "  - View database logs: docker compose logs -f db"
        echo "  - Enter backend shell: docker compose exec backend bash"
        echo "  - Check migrations: docker compose exec backend python manage.py showmigrations"
        exit 1
    fi
}

# Run main script
main
