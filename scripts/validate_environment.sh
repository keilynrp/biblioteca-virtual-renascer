#!/bin/bash

# ============================================================================
# ENVIRONMENT VALIDATOR
# ============================================================================
# Validates the environment before starting backend
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# ============================================================================
# Validation Functions
# ============================================================================

validate_docker() {
    echo -e "\n${CYAN}=== Validating Docker ===${NC}"

    # Check Docker installed
    if command -v docker &> /dev/null; then
        success "Docker is installed"
        docker --version
    else
        error "Docker is not installed"
        info "Install from: https://www.docker.com/get-started"
        return 1
    fi

    # Check Docker daemon
    if docker info &> /dev/null; then
        success "Docker daemon is running"
    else
        error "Docker daemon is not running"
        info "Start Docker Desktop or run: sudo systemctl start docker"
        return 1
    fi

    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        success "Docker Compose is installed"
        docker-compose --version
    else
        error "Docker Compose is not installed"
        return 1
    fi

    # Check Docker resources
    local total_memory=$(docker info --format '{{.MemTotal}}' 2>/dev/null)
    if [ ! -z "$total_memory" ]; then
        local memory_gb=$((total_memory / 1024 / 1024 / 1024))
        if [ $memory_gb -lt 4 ]; then
            warning "Docker has only ${memory_gb}GB memory. Recommended: 8GB+"
        else
            success "Docker has ${memory_gb}GB memory allocated"
        fi
    fi
}

validate_ports() {
    echo -e "\n${CYAN}=== Validating Ports ===${NC}"

    local required_ports=("8000" "5432" "6379" "7700")
    local port_ok=true

    for port in "${required_ports[@]}"; do
        if netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING > /dev/null 2>&1; then
            warning "Port $port is already in use"
            port_ok=false
        else
            success "Port $port is available"
        fi
    done

    if [ "$port_ok" = false ]; then
        info "Run './scripts/fix_backend_issues.sh' and select 'Check port conflicts' to fix"
    fi
}

validate_env_file() {
    echo -e "\n${CYAN}=== Validating .env File ===${NC}"

    if [ ! -f ".env" ]; then
        error ".env file not found"
        info "Create .env file from .env.example"
        return 1
    fi

    success ".env file exists"

    # Check required variables
    local required_vars=(
        "POSTGRES_DB"
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "SECRET_KEY"
        "DEBUG"
    )

    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            success "$var is set"
        else
            error "$var is not set in .env"
        fi
    done

    # Check for unsafe values
    if grep -q "SECRET_KEY=unsafe-development-key-change-in-production" .env; then
        if grep -q "DEBUG=False" .env; then
            error "Using unsafe SECRET_KEY in production mode"
        else
            warning "Using development SECRET_KEY (OK for development)"
        fi
    fi
}

validate_file_structure() {
    echo -e "\n${CYAN}=== Validating File Structure ===${NC}"

    local required_files=(
        "docker-compose.yml"
        "backend/Dockerfile"
        "backend/requirements.txt"
        "backend/manage.py"
        "backend/config/settings.py"
    )

    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            success "$file exists"
        else
            error "$file not found"
        fi
    done

    local required_dirs=(
        "backend"
        "backend/apps"
        "backend/config"
    )

    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            success "$dir/ exists"
        else
            error "$dir/ not found"
        fi
    done
}

validate_python_syntax() {
    echo -e "\n${CYAN}=== Validating Python Files ===${NC}"

    if [ ! -f "backend/manage.py" ]; then
        error "manage.py not found"
        return 1
    fi

    # Check for common syntax errors in settings
    if [ -f "backend/config/settings.py" ]; then
        if grep -q "DATABASES" backend/config/settings.py; then
            success "DATABASES configuration found"
        else
            error "DATABASES not configured in settings.py"
        fi

        if grep -q "INSTALLED_APPS" backend/config/settings.py; then
            success "INSTALLED_APPS found"
        else
            error "INSTALLED_APPS not found in settings.py"
        fi
    fi
}

validate_requirements() {
    echo -e "\n${CYAN}=== Validating Requirements ===${NC}"

    if [ ! -f "backend/requirements.txt" ]; then
        error "requirements.txt not found"
        return 1
    fi

    local critical_packages=(
        "Django"
        "djangorestframework"
        "psycopg2-binary"
        "redis"
    )

    for package in "${critical_packages[@]}"; do
        if grep -qi "^${package}" backend/requirements.txt; then
            success "$package is listed"
        else
            error "$package not found in requirements.txt"
        fi
    done

    # Check for conflicting versions
    if grep -q "Django==6.0" backend/requirements.txt && grep -q "djangorestframework<3.14" backend/requirements.txt; then
        warning "Potential version conflict between Django and DRF"
    fi
}

validate_docker_compose() {
    echo -e "\n${CYAN}=== Validating docker-compose.yml ===${NC}"

    if [ ! -f "docker-compose.yml" ]; then
        error "docker-compose.yml not found"
        return 1
    fi

    # Validate docker-compose file syntax
    if docker-compose config &> /dev/null; then
        success "docker-compose.yml syntax is valid"
    else
        error "docker-compose.yml has syntax errors"
        docker-compose config
        return 1
    fi

    # Check for required services
    local required_services=("backend" "db" "redis")
    for service in "${required_services[@]}"; do
        if docker-compose config --services | grep -q "^${service}$"; then
            success "Service '$service' is defined"
        else
            error "Service '$service' not found"
        fi
    done
}

validate_disk_space() {
    echo -e "\n${CYAN}=== Validating Disk Space ===${NC}"

    if command -v df &> /dev/null; then
        local available=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
        if [ "$available" -lt 5 ]; then
            error "Only ${available}GB disk space available. Need at least 5GB"
        elif [ "$available" -lt 10 ]; then
            warning "Only ${available}GB disk space available. Recommended: 10GB+"
        else
            success "${available}GB disk space available"
        fi
    fi
}

validate_network() {
    echo -e "\n${CYAN}=== Validating Network ===${NC}"

    # Check internet connectivity
    if ping -c 1 8.8.8.8 &> /dev/null; then
        success "Internet connectivity OK"
    else
        warning "No internet connection (may affect image pulls)"
    fi

    # Check Docker Hub connectivity
    if curl -s --max-time 5 https://hub.docker.com &> /dev/null; then
        success "Can reach Docker Hub"
    else
        warning "Cannot reach Docker Hub (may affect image pulls)"
    fi
}

validate_existing_containers() {
    echo -e "\n${CYAN}=== Checking Existing Containers ===${NC}"

    local running_containers=$(docker-compose ps -q 2>/dev/null)

    if [ -z "$running_containers" ]; then
        info "No containers currently running"
    else
        warning "Found running containers:"
        docker-compose ps
        info "Consider stopping them with: docker-compose down"
    fi
}

check_previous_errors() {
    echo -e "\n${CYAN}=== Checking for Previous Errors ===${NC}"

    if [ -d "logs" ]; then
        local recent_logs=$(find logs -name "backend_startup_*.log" -mtime -1 2>/dev/null | wc -l)
        if [ $recent_logs -gt 0 ]; then
            info "Found $recent_logs recent startup log(s)"
            info "Check logs/ directory for previous errors"
        fi
    fi
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║           ENVIRONMENT VALIDATOR                          ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    validate_docker
    validate_ports
    validate_env_file
    validate_file_structure
    validate_python_syntax
    validate_requirements
    validate_docker_compose
    validate_disk_space
    validate_network
    validate_existing_containers
    check_previous_errors

    # Summary
    echo -e "\n${CYAN}=== Validation Summary ===${NC}"
    echo ""

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ All checks passed! Environment is ready.${NC}"
        echo ""
        info "You can start the backend with:"
        echo "  ./scripts/start_backend_optimized.sh"
        exit 0
    elif [ $ERRORS -eq 0 ]; then
        echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
        echo ""
        info "Environment should work, but review warnings above"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        else
            exit 1
        fi
    else
        echo -e "${RED}✗ ${ERRORS} error(s) and ${WARNINGS} warning(s) found${NC}"
        echo ""
        error "Please fix the errors above before starting backend"
        echo ""
        info "For help, run:"
        echo "  ./scripts/fix_backend_issues.sh"
        exit 1
    fi
}

main "$@"
