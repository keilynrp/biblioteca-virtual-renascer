#!/bin/bash

# ============================================================================
# SCRIPTS TESTER
# ============================================================================
# Test all backend scripts to ensure they work correctly
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

success() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

error() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

test_header() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

# ============================================================================
# Tests
# ============================================================================

test_file_exists() {
    local file=$1
    if [ -f "$file" ]; then
        success "$file exists"
        return 0
    else
        error "$file not found"
        return 1
    fi
}

test_file_executable() {
    local file=$1
    if [ -x "$file" ]; then
        success "$file is executable"
        return 0
    else
        error "$file is not executable"
        return 1
    fi
}

test_script_syntax() {
    local file=$1
    if bash -n "$file" 2>/dev/null; then
        success "$file has valid syntax"
        return 0
    else
        error "$file has syntax errors"
        bash -n "$file"
        return 1
    fi
}

test_docker_available() {
    if command -v docker &> /dev/null; then
        success "Docker is available"
        return 0
    else
        error "Docker is not available"
        return 1
    fi
}

test_docker_compose_available() {
    if command -v docker-compose &> /dev/null; then
        success "Docker Compose is available"
        return 0
    else
        error "Docker Compose is not available"
        return 1
    fi
}

test_env_file() {
    if [ -f ".env" ]; then
        success ".env file exists"
        return 0
    else
        error ".env file not found"
        return 1
    fi
}

test_docker_compose_syntax() {
    if docker-compose config &> /dev/null; then
        success "docker-compose.yml syntax is valid"
        return 0
    else
        error "docker-compose.yml has syntax errors"
        return 1
    fi
}

test_required_directories() {
    local dirs=("backend" "scripts" "logs")
    local all_ok=true

    for dir in "${dirs[@]}"; do
        if [ -d "$dir" ]; then
            success "Directory $dir exists"
        else
            error "Directory $dir not found"
            all_ok=false
        fi
    done

    return $([ "$all_ok" = true ] && echo 0 || echo 1)
}

# ============================================================================
# Main Tests
# ============================================================================

main() {
    clear
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              BACKEND SCRIPTS TESTER                      ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Test script files exist
    test_header "Testing Script Files"
    test_file_exists "scripts/start_backend_optimized.sh"
    test_file_exists "scripts/fix_backend_issues.sh"
    test_file_exists "scripts/validate_environment.sh"
    test_file_exists "start-backend.bat"
    test_file_exists "Start-Backend.ps1"

    # Test script permissions (Linux/Mac only)
    if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
        test_header "Testing Script Permissions"
        test_file_executable "scripts/start_backend_optimized.sh"
        test_file_executable "scripts/fix_backend_issues.sh"
        test_file_executable "scripts/validate_environment.sh"
    fi

    # Test script syntax
    test_header "Testing Script Syntax"
    test_script_syntax "scripts/start_backend_optimized.sh"
    test_script_syntax "scripts/fix_backend_issues.sh"
    test_script_syntax "scripts/validate_environment.sh"

    # Test environment
    test_header "Testing Environment"
    test_docker_available
    test_docker_compose_available
    test_env_file
    test_required_directories

    # Test Docker Compose
    test_header "Testing Docker Configuration"
    test_docker_compose_syntax

    # Test documentation
    test_header "Testing Documentation"
    test_file_exists "QUICK_START_BACKEND.md"
    test_file_exists "scripts/BACKEND_SCRIPTS_README.md"
    test_file_exists "BACKEND_OPTIMIZATION_SUMMARY.md"

    # Summary
    echo -e "\n${CYAN}=== Test Summary ===${NC}"
    echo ""
    echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed!${NC}"
        echo ""
        info "Scripts are ready to use:"
        echo "  ./scripts/start_backend_optimized.sh"
        echo "  ./scripts/fix_backend_issues.sh"
        echo "  ./scripts/validate_environment.sh"
        echo ""
        return 0
    else
        echo -e "${RED}✗ Some tests failed${NC}"
        echo ""
        info "Please fix the issues above before using the scripts"
        echo ""
        return 1
    fi
}

# Run tests
main "$@"
exit $?
