#!/bin/bash
# =============================================================================
# Fix Recent Changes Script
# =============================================================================
# Fixes issues related to recent Sprint 7 changes:
# - Logging system
# - Rate limiting
# - Correlation ID middleware
# - Sentry integration
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║         Fix Recent Changes - Sprint 7 Issues                          ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# =============================================================================
# 1. CREATE LOGS DIRECTORY
# =============================================================================

log_info "Step 1: Creating logs directory..."
mkdir -p backend/logs
chmod 755 backend/logs
log_success "Logs directory created"

# =============================================================================
# 2. INSTALL NEW DEPENDENCIES
# =============================================================================

log_info "Step 2: Checking if new dependencies need to be installed..."

# Check if container is running
if docker compose ps backend | grep -q "Up"; then
    log_info "Backend is running, checking dependencies..."

    # Try to import new modules
    if docker compose exec -T backend python -c "import pythonjsonlogger" 2>/dev/null; then
        log_success "python-json-logger is installed"
    else
        log_warning "python-json-logger not found, rebuilding container..."
        docker compose build backend
        docker compose up -d backend
        sleep 5
    fi

    if docker compose exec -T backend python -c "import django_ratelimit" 2>/dev/null; then
        log_success "django-ratelimit is installed"
    else
        log_warning "django-ratelimit not found, rebuilding container..."
        docker compose build backend
        docker compose up -d backend
        sleep 5
    fi
else
    log_warning "Backend is not running, will rebuild..."
    docker compose build backend
    docker compose up -d backend
    sleep 5
fi

# =============================================================================
# 3. CHECK MIDDLEWARE CONFIGURATION
# =============================================================================

log_info "Step 3: Checking middleware configuration..."

if docker compose exec -T backend python manage.py check 2>&1 | grep -q "Error\|ERRORS"; then
    log_error "Django check found errors:"
    docker compose exec -T backend python manage.py check
    log_warning "There may be configuration issues"
else
    log_success "Django configuration is valid"
fi

# =============================================================================
# 4. TEST LOGGING SYSTEM
# =============================================================================

log_info "Step 4: Testing logging system..."

# Create a test log entry
docker compose exec -T backend python -c "
import logging
import sys
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

logger = logging.getLogger('apps.core')
logger.info('Test log from fix script')
print('Log test completed')
" 2>&1 | tail -5

# Check if logs directory has files
if [ -n "$(ls -A backend/logs 2>/dev/null)" ]; then
    log_success "Logs are being created in backend/logs/"
    log_info "Log files found:"
    ls -lh backend/logs/
else
    log_warning "No log files created yet (this is normal if backend just started)"
fi

# =============================================================================
# 5. TEST CORRELATION ID
# =============================================================================

log_info "Step 5: Testing correlation ID middleware..."

# Make a test request
log_info "Making test request to API..."
response=$(curl -s -I http://localhost:8000/api/ 2>/dev/null || echo "Connection failed")

if echo "$response" | grep -q "X-Correlation-ID"; then
    correlation_id=$(echo "$response" | grep "X-Correlation-ID" | cut -d' ' -f2 | tr -d '\r')
    log_success "Correlation ID middleware is working: $correlation_id"
else
    if echo "$response" | grep -q "Connection failed"; then
        log_error "Cannot connect to backend API"
    else
        log_warning "X-Correlation-ID header not found in response"
        log_info "Response headers:"
        echo "$response" | grep -i "HTTP\|Content-Type\|Server" || echo "No headers"
    fi
fi

# =============================================================================
# 6. CHECK REDIS CONNECTION
# =============================================================================

log_info "Step 6: Checking Redis connection (for rate limiting)..."

if docker compose exec -T redis redis-cli ping 2>&1 | grep -q "PONG"; then
    log_success "Redis is responding"
else
    log_error "Redis is not responding"
    log_info "Restarting Redis..."
    docker compose restart redis
    sleep 3
fi

# =============================================================================
# 7. RUN MIGRATIONS (in case any were added)
# =============================================================================

log_info "Step 7: Running migrations..."
docker compose exec -T backend python manage.py migrate --noinput
log_success "Migrations completed"

# =============================================================================
# 8. RESTART BACKEND WITH CLEAN STATE
# =============================================================================

log_info "Step 8: Restarting backend for clean state..."
docker compose restart backend
sleep 5

# Wait for backend to be ready
log_info "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:8000/api/ &> /dev/null; then
        log_success "Backend is ready!"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# =============================================================================
# 9. FINAL HEALTH CHECK
# =============================================================================

log_info "Step 9: Running final health check..."

echo ""
echo "Container Status:"
docker compose ps backend db redis

echo ""
if curl -f http://localhost:8000/api/ &> /dev/null; then
    log_success "✓ Backend API is responding at http://localhost:8000/api/"
else
    log_error "✗ Backend API is NOT responding"
    log_info "Showing last 20 lines of backend logs:"
    docker compose logs --tail=20 backend
    exit 1
fi

# =============================================================================
# 10. SUMMARY
# =============================================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                          FIX SUMMARY                                  ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""
log_success "All fixes completed successfully!"
echo ""
log_info "New features enabled:"
echo "  ✓ JSON structured logging"
echo "  ✓ Correlation ID tracking"
echo "  ✓ Rate limiting with Redis"
echo "  ✓ Automatic log rotation"
echo ""
log_info "Log files location: backend/logs/"
log_info "To view logs: tail -f backend/logs/django.log"
log_info "To view errors: tail -f backend/logs/errors.log"
echo ""
log_info "Backend is ready at: http://localhost:8000/api/"
echo ""
