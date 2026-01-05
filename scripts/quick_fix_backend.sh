#!/bin/bash
# =============================================================================
# Quick Backend Fix Script
# =============================================================================
# Fast fixes for common backend issues
# Usage: ./scripts/quick_fix_backend.sh [option]
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# QUICK FIXES
# =============================================================================

fix_restart() {
    log_info "Quick restart of backend..."
    docker compose restart backend
    sleep 3
    log_success "Backend restarted"
}

fix_rebuild() {
    log_info "Rebuilding backend container..."
    docker compose build backend
    docker compose up -d backend
    sleep 5
    log_success "Backend rebuilt and started"
}

fix_migrations() {
    log_info "Running migrations..."
    docker compose exec -T backend python manage.py migrate --noinput
    log_success "Migrations completed"
}

fix_logs_dir() {
    log_info "Creating logs directory..."
    mkdir -p backend/logs
    chmod 755 backend/logs
    log_success "Logs directory created"
}

fix_full_reset() {
    log_info "Full reset (keeps database data)..."
    docker compose down
    docker compose build --no-cache backend
    docker compose up -d
    sleep 10
    docker compose exec -T backend python manage.py migrate --noinput
    log_success "Full reset completed"
}

fix_database() {
    log_info "Restarting database and running migrations..."
    docker compose restart db
    sleep 5
    docker compose exec -T backend python manage.py migrate --noinput
    log_success "Database fixed"
}

show_logs() {
    log_info "Showing last 50 lines of backend logs..."
    docker compose logs --tail=50 backend
}

check_status() {
    log_info "Checking status..."
    echo ""
    docker compose ps
    echo ""

    if curl -f http://localhost:8000/api/ &> /dev/null; then
        log_success "Backend API is responding at http://localhost:8000/api/"
    else
        log_error "Backend API is NOT responding"
    fi
}

# =============================================================================
# MENU
# =============================================================================

show_menu() {
    clear
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║         Quick Backend Fix Menu                        ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""
    echo "1) Quick restart backend"
    echo "2) Rebuild backend container"
    echo "3) Run migrations"
    echo "4) Fix logs directory"
    echo "5) Fix database connection"
    echo "6) Full reset (keeps data)"
    echo "7) Show backend logs"
    echo "8) Check status"
    echo "9) Run comprehensive diagnosis"
    echo "0) Exit"
    echo ""
}

# =============================================================================
# MAIN
# =============================================================================

if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        read -p "Select option: " choice

        case $choice in
            1) fix_restart ;;
            2) fix_rebuild ;;
            3) fix_migrations ;;
            4) fix_logs_dir ;;
            5) fix_database ;;
            6) fix_full_reset ;;
            7) show_logs ;;
            8) check_status ;;
            9) bash ./scripts/diagnose_and_fix_backend.sh ;;
            0) log_info "Exiting..."; exit 0 ;;
            *) log_error "Invalid option" ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
else
    # Command line mode
    case "$1" in
        restart) fix_restart ;;
        rebuild) fix_rebuild ;;
        migrate) fix_migrations ;;
        logs) fix_logs_dir ;;
        database) fix_database ;;
        reset) fix_full_reset ;;
        show) show_logs ;;
        status) check_status ;;
        diagnose) bash ./scripts/diagnose_and_fix_backend.sh ;;
        *)
            echo "Usage: $0 [restart|rebuild|migrate|logs|database|reset|show|status|diagnose]"
            exit 1
            ;;
    esac
fi
