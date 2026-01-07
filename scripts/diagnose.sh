#!/bin/bash

# =============================================================================
# BVS Framework - Diagnostic Script
# =============================================================================
# This script checks the health of all services and helps identify issues
#
# Usage:
#   ./scripts/diagnose.sh
#
# Requirements:
#   - Docker and Docker Compose installed
#   - Script must be run from project root
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}BVS Framework - System Diagnostics${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Docker is running
echo -e "${YELLOW}[1/8] Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo -e "  Please start Docker Desktop and try again"
    exit 1
else
    echo -e "${GREEN}✓ Docker is running${NC}\n"
fi

# Check if Docker Compose is available
echo -e "${YELLOW}[2/8] Checking Docker Compose...${NC}"
if ! docker compose version > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker Compose is not available${NC}"
    exit 1
else
    COMPOSE_VERSION=$(docker compose version --short)
    echo -e "${GREEN}✓ Docker Compose ${COMPOSE_VERSION} is available${NC}\n"
fi

# Check running containers
echo -e "${YELLOW}[3/8] Checking running containers...${NC}"
if ! docker compose ps --format json > /dev/null 2>&1; then
    echo -e "${RED}✗ No containers running${NC}"
    echo -e "  Run: ${BLUE}docker compose up -d${NC}"
else
    docker compose ps
    echo ""
fi

# Check backend service
echo -e "${YELLOW}[4/8] Checking backend service...${NC}"
if docker compose ps backend | grep -q "Up"; then
    echo -e "${GREEN}✓ Backend is running${NC}"

    # Check backend logs for errors
    BACKEND_ERRORS=$(docker compose logs backend --tail=50 | grep -i "error" | wc -l)
    if [ "$BACKEND_ERRORS" -gt 0 ]; then
        echo -e "${RED}  ⚠ Found ${BACKEND_ERRORS} error(s) in backend logs${NC}"
        echo -e "  Run: ${BLUE}docker compose logs backend | grep -i error${NC}"
    fi
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo -e "  Run: ${BLUE}docker compose up -d backend${NC}"
fi
echo ""

# Check Redis service
echo -e "${YELLOW}[5/8] Checking Redis service...${NC}"
if docker compose ps redis | grep -q "Up"; then
    echo -e "${GREEN}✓ Redis is running${NC}"

    # Test Redis connection
    if docker compose exec -T redis redis-cli PING > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is responding${NC}"

        # Get Redis stats
        REDIS_KEYS=$(docker compose exec -T redis redis-cli DBSIZE | grep -oE '[0-9]+')
        echo -e "  Cache keys: ${REDIS_KEYS}"
    else
        echo -e "${RED}✗ Redis is not responding${NC}"
    fi
else
    echo -e "${RED}✗ Redis is not running${NC}"
    echo -e "  Run: ${BLUE}docker compose up -d redis${NC}"
fi
echo ""

# Check PostgreSQL service
echo -e "${YELLOW}[6/8] Checking PostgreSQL service...${NC}"
if docker compose ps db | grep -q "Up"; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"

    # Test database connection
    if docker compose exec -T backend python manage.py check --database default > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database connection OK${NC}"
    else
        echo -e "${RED}✗ Database connection failed${NC}"
    fi
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo -e "  Run: ${BLUE}docker compose up -d db${NC}"
fi
echo ""

# Check health endpoints
echo -e "${YELLOW}[7/8] Checking API health endpoints...${NC}"
if docker compose ps backend | grep -q "Up"; then
    # Wait a bit for backend to be ready
    sleep 2

    # Basic health check
    HEALTH_STATUS=$(curl -s http://localhost:8000/api/health/ | jq -r '.status' 2>/dev/null || echo "error")
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo -e "${GREEN}✓ Basic health check passed${NC}"
    else
        echo -e "${RED}✗ Basic health check failed${NC}"
        echo -e "  Status: ${HEALTH_STATUS}"
    fi

    # Detailed health check
    DETAILED_HEALTH=$(curl -s http://localhost:8000/api/health/detailed/ 2>/dev/null)
    DB_STATUS=$(echo "$DETAILED_HEALTH" | jq -r '.checks.database.status' 2>/dev/null || echo "error")
    CACHE_STATUS=$(echo "$DETAILED_HEALTH" | jq -r '.checks.cache.status' 2>/dev/null || echo "error")

    if [ "$DB_STATUS" = "healthy" ]; then
        echo -e "${GREEN}✓ Database health check passed${NC}"
    else
        echo -e "${RED}✗ Database health check failed${NC}"
    fi

    if [ "$CACHE_STATUS" = "healthy" ]; then
        echo -e "${GREEN}✓ Cache (Redis) health check passed${NC}"
    else
        echo -e "${RED}✗ Cache (Redis) health check failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Backend not running, skipping health checks${NC}"
fi
echo ""

# Check migrations
echo -e "${YELLOW}[8/8] Checking database migrations...${NC}"
if docker compose ps backend | grep -q "Up"; then
    UNAPPLIED=$(docker compose exec -T backend python manage.py showmigrations --plan 2>/dev/null | grep -c "\[ \]" || echo "0")
    if [ "$UNAPPLIED" = "0" ]; then
        echo -e "${GREEN}✓ All migrations applied${NC}"
    else
        echo -e "${RED}✗ ${UNAPPLIED} unapplied migration(s)${NC}"
        echo -e "  Run: ${BLUE}docker compose exec backend python manage.py migrate${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Backend not running, skipping migration check${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Diagnostic Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

ISSUES_FOUND=0

# Check if all critical services are running
for service in backend db redis; do
    if ! docker compose ps $service | grep -q "Up"; then
        echo -e "${RED}✗ $service is not running${NC}"
        ((ISSUES_FOUND++))
    fi
done

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ All critical services are running${NC}"
    echo -e "\n${GREEN}System appears to be healthy!${NC}\n"

    echo -e "Next steps:"
    echo -e "  1. Visit ${BLUE}http://localhost:3000${NC} for the frontend"
    echo -e "  2. Visit ${BLUE}http://localhost:8000/admin${NC} for the admin panel"
    echo -e "  3. Check API docs at ${BLUE}http://localhost:8000/api/${NC}"
else
    echo -e "\n${RED}Found ${ISSUES_FOUND} issue(s)${NC}\n"

    echo -e "Recommended actions:"
    echo -e "  1. Start all services: ${BLUE}docker compose up -d${NC}"
    echo -e "  2. View logs: ${BLUE}docker compose logs -f${NC}"
    echo -e "  3. Check troubleshooting guide: ${BLUE}TROUBLESHOOTING.md${NC}"
fi

echo ""
echo -e "${BLUE}For more help, see:${NC}"
echo -e "  - ${BLUE}TROUBLESHOOTING.md${NC}"
echo -e "  - ${BLUE}SPRINT_8_PROGRESS.md${NC}"
echo -e "  - ${BLUE}docker compose logs <service>${NC}"
echo ""
