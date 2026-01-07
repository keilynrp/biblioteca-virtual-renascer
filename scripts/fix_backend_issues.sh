#!/bin/bash

# ============================================================================
# BACKEND ISSUES FIXER - Automatic Problem Resolution
# ============================================================================
# This script diagnoses and fixes common backend issues
# ============================================================================

set -e
trap 'echo -e "\n${RED}Script interrupted${NC}"' INT

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# Diagnostic Functions
# ============================================================================

check_port_conflicts() {
    echo -e "${BLUE}Checking port conflicts...${NC}"

    local ports=("8000" "5432" "6379" "7700")
    local conflicts=false

    for port in "${ports[@]}"; do
        if netstat -ano | grep ":$port " | grep LISTENING > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠ Port $port is in use${NC}"
            netstat -ano | grep ":$port " | grep LISTENING
            conflicts=true
        fi
    done

    if [ "$conflicts" = true ]; then
        read -p "Kill processes on these ports? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for port in "${ports[@]}"; do
                netstat -ano | grep ":$port " | grep LISTENING | awk '{print $5}' | xargs -r taskkill //PID //F 2>/dev/null || true
            done
            echo -e "${GREEN}✓ Ports cleared${NC}"
        fi
    else
        echo -e "${GREEN}✓ No port conflicts${NC}"
    fi
}

check_docker_resources() {
    echo -e "${BLUE}Checking Docker resources...${NC}"

    # Check if Docker has enough resources
    docker system df

    local disk_usage=$(docker system df --format "{{.Reclaimable}}" | head -n 1)
    echo -e "Reclaimable space: ${YELLOW}$disk_usage${NC}"

    read -p "Clean up Docker resources? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Cleaning Docker system..."
        docker system prune -f
        echo -e "${GREEN}✓ Docker cleaned${NC}"
    fi
}

check_dependencies() {
    echo -e "${BLUE}Checking Python dependencies...${NC}"

    if [ -f "backend/requirements.txt" ]; then
        echo "Rebuilding backend with fresh dependencies..."
        docker-compose build --no-cache backend
        echo -e "${GREEN}✓ Dependencies rebuilt${NC}"
    else
        echo -e "${RED}✗ requirements.txt not found${NC}"
    fi
}

check_database_connection() {
    echo -e "${BLUE}Checking database connection...${NC}"

    if docker-compose exec -T db pg_isready -U postgres -d biblioteca > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is accessible${NC}"

        # Check database size
        local db_size=$(docker-compose exec -T db psql -U postgres -d biblioteca -t -c "SELECT pg_size_pretty(pg_database_size('biblioteca'));" 2>/dev/null | xargs)
        echo -e "Database size: ${CYAN}$db_size${NC}"

        # Check number of tables
        local table_count=$(docker-compose exec -T db psql -U postgres -d biblioteca -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
        echo -e "Tables: ${CYAN}$table_count${NC}"
    else
        echo -e "${RED}✗ Cannot connect to database${NC}"
        echo "Restarting database..."
        docker-compose restart db
        sleep 5
    fi
}

check_migrations() {
    echo -e "${BLUE}Checking migrations status...${NC}"

    docker-compose run --rm backend python manage.py showmigrations 2>&1 || {
        echo -e "${YELLOW}⚠ Migration check failed${NC}"
        read -p "Reset migrations? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            fix_migrations
        fi
    }
}

fix_migrations() {
    echo -e "${BLUE}Fixing migrations...${NC}"

    echo "1. Faking initial migrations..."
    docker-compose run --rm backend python manage.py migrate --fake-initial

    echo "2. Running pending migrations..."
    docker-compose run --rm backend python manage.py migrate

    echo -e "${GREEN}✓ Migrations fixed${NC}"
}

check_static_files() {
    echo -e "${BLUE}Checking static files...${NC}"

    if [ -d "backend/static" ]; then
        local file_count=$(find backend/static -type f 2>/dev/null | wc -l)
        echo -e "Static files: ${CYAN}$file_count${NC}"
    else
        echo -e "${YELLOW}⚠ Static directory missing${NC}"
        mkdir -p backend/static
    fi

    echo "Collecting static files..."
    docker-compose run --rm backend python manage.py collectstatic --noinput
    echo -e "${GREEN}✓ Static files collected${NC}"
}

check_permissions() {
    echo -e "${BLUE}Checking file permissions...${NC}"

    # Fix common permission issues
    if [ -d "backend/media" ]; then
        chmod -R 755 backend/media 2>/dev/null || true
    fi

    if [ -d "backend/static" ]; then
        chmod -R 755 backend/static 2>/dev/null || true
    fi

    echo -e "${GREEN}✓ Permissions checked${NC}"
}

analyze_logs() {
    echo -e "${BLUE}Analyzing backend logs...${NC}"

    echo "Recent errors:"
    docker-compose logs backend --tail=50 2>&1 | grep -i "error\|exception\|traceback" || echo "No recent errors found"

    echo ""
    echo "Full logs saved to: backend_logs_$(date +%Y%m%d_%H%M%S).log"
    docker-compose logs backend > "backend_logs_$(date +%Y%m%d_%H%M%S).log"
}

# ============================================================================
# Fix Functions
# ============================================================================

fix_dependency_conflicts() {
    echo -e "${BLUE}Fixing dependency conflicts...${NC}"

    echo "1. Clearing pip cache..."
    docker-compose run --rm backend pip cache purge || true

    echo "2. Reinstalling dependencies..."
    docker-compose run --rm backend pip install --no-cache-dir --force-reinstall -r requirements.txt

    echo -e "${GREEN}✓ Dependencies reinstalled${NC}"
}

fix_database_issues() {
    echo -e "${BLUE}Fixing database issues...${NC}"

    echo "1. Restarting database..."
    docker-compose restart db
    sleep 5

    echo "2. Running vacuum..."
    docker-compose exec -T db psql -U postgres -d biblioteca -c "VACUUM ANALYZE;" || true

    echo "3. Checking for locks..."
    docker-compose exec -T db psql -U postgres -d biblioteca -c "SELECT pid, query FROM pg_stat_activity WHERE state = 'active';" || true

    echo -e "${GREEN}✓ Database maintenance completed${NC}"
}

fix_redis_issues() {
    echo -e "${BLUE}Fixing Redis issues...${NC}"

    echo "1. Flushing Redis cache..."
    docker-compose exec -T redis redis-cli FLUSHALL || true

    echo "2. Restarting Redis..."
    docker-compose restart redis
    sleep 3

    echo -e "${GREEN}✓ Redis reset${NC}"
}

fix_meilisearch_issues() {
    echo -e "${BLUE}Fixing Meilisearch issues...${NC}"

    echo "1. Restarting Meilisearch..."
    docker-compose restart meilisearch
    sleep 5

    echo "2. Reindexing books..."
    docker-compose exec backend python manage.py index_books || true

    echo -e "${GREEN}✓ Meilisearch reindexed${NC}"
}

nuclear_option() {
    echo -e "${RED}╔═══════════════════════════════════════╗${NC}"
    echo -e "${RED}║   NUCLEAR OPTION - COMPLETE RESET    ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}This will:${NC}"
    echo "  • Stop all containers"
    echo "  • Remove all volumes (DATABASE WILL BE LOST)"
    echo "  • Remove all images"
    echo "  • Rebuild everything from scratch"
    echo ""
    read -p "Are you ABSOLUTELY sure? (type 'yes' to confirm) " -r
    echo

    if [[ $REPLY == "yes" ]]; then
        echo "Stopping all services..."
        docker-compose down -v --remove-orphans

        echo "Removing images..."
        docker-compose rm -f
        docker rmi $(docker images -q bvs_framework*) 2>/dev/null || true

        echo "Cleaning Docker system..."
        docker system prune -af --volumes

        echo "Rebuilding..."
        docker-compose build --no-cache

        echo -e "${GREEN}✓ Nuclear reset complete${NC}"
        echo "Run './scripts/start_backend_optimized.sh --fresh' to start fresh"
    else
        echo "Cancelled"
    fi
}

# ============================================================================
# Interactive Menu
# ============================================================================

show_menu() {
    clear
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║        BACKEND ISSUES FIXER - Diagnostic Tool            ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Diagnostic Options:"
    echo "  1) Full system check"
    echo "  2) Check port conflicts"
    echo "  3) Check Docker resources"
    echo "  4) Check database connection"
    echo "  5) Check migrations"
    echo "  6) Analyze logs"
    echo ""
    echo "Fix Options:"
    echo "  7) Fix dependency conflicts"
    echo "  8) Fix database issues"
    echo "  9) Fix Redis issues"
    echo " 10) Fix Meilisearch issues"
    echo " 11) Fix migrations"
    echo " 12) Collect static files"
    echo ""
    echo "Advanced:"
    echo " 13) Restart all services"
    echo " 14) Rebuild backend only"
    echo " 15) NUCLEAR OPTION (complete reset)"
    echo ""
    echo "  0) Exit"
    echo ""
}

full_system_check() {
    echo -e "${CYAN}=== Running Full System Check ===${NC}"
    echo ""

    check_port_conflicts
    echo ""

    check_docker_resources
    echo ""

    check_database_connection
    echo ""

    check_migrations
    echo ""

    check_static_files
    echo ""

    check_permissions
    echo ""

    analyze_logs
    echo ""

    echo -e "${GREEN}✓ Full system check complete${NC}"
}

restart_all_services() {
    echo -e "${BLUE}Restarting all services...${NC}"
    docker-compose restart
    echo -e "${GREEN}✓ All services restarted${NC}"
}

rebuild_backend_only() {
    echo -e "${BLUE}Rebuilding backend...${NC}"
    docker-compose build --no-cache backend
    docker-compose up -d backend
    echo -e "${GREEN}✓ Backend rebuilt${NC}"
}

# ============================================================================
# Main Loop
# ============================================================================

main() {
    while true; do
        show_menu
        read -p "Select an option: " choice
        echo ""

        case $choice in
            1) full_system_check ;;
            2) check_port_conflicts ;;
            3) check_docker_resources ;;
            4) check_database_connection ;;
            5) check_migrations ;;
            6) analyze_logs ;;
            7) fix_dependency_conflicts ;;
            8) fix_database_issues ;;
            9) fix_redis_issues ;;
            10) fix_meilisearch_issues ;;
            11) fix_migrations ;;
            12) check_static_files ;;
            13) restart_all_services ;;
            14) rebuild_backend_only ;;
            15) nuclear_option ;;
            0) echo "Exiting..."; exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    main "$@"
fi
