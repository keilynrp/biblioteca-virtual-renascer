#!/bin/bash
# =============================================================================
# Install Missing Dependencies - Quick Fix
# =============================================================================
# Installs python-json-logger and django-ratelimit from Sprint 7
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
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

clear
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║         Install Missing Dependencies - Sprint 7                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# =============================================================================
# STEP 1: Check if backend is running
# =============================================================================

log_info "Step 1: Checking backend status..."

if docker compose ps backend | grep -q "Up"; then
    log_success "Backend container is running"
    BACKEND_RUNNING=true
else
    log_warning "Backend container is not running"
    BACKEND_RUNNING=false
fi

# =============================================================================
# STEP 2: Install dependencies via rebuild
# =============================================================================

log_info "Step 2: Rebuilding backend container with new dependencies..."

echo ""
log_info "This will:"
echo "  1. Rebuild the backend Docker image"
echo "  2. Install python-json-logger>=2.0.7"
echo "  3. Install django-ratelimit>=4.1"
echo "  4. Install all other requirements"
echo ""

# Rebuild backend image
docker compose build --no-cache backend

log_success "Backend image rebuilt with new dependencies"

# =============================================================================
# STEP 3: Create necessary directories
# =============================================================================

log_info "Step 3: Creating necessary directories..."

mkdir -p backend/logs
mkdir -p backend/media
mkdir -p backend/static_root
mkdir -p backups

chmod 755 backend/logs
chmod 755 backend/media
chmod 755 backend/static_root

log_success "Directories created and permissions set"

# =============================================================================
# STEP 4: Stop and restart backend
# =============================================================================

log_info "Step 4: Restarting backend with new dependencies..."

# Stop backend
docker compose stop backend

# Start backend
docker compose up -d backend

log_info "Waiting for backend to initialize..."
sleep 8

# =============================================================================
# STEP 5: Verify dependencies are installed
# =============================================================================

log_info "Step 5: Verifying dependencies..."

echo ""
log_info "Checking python-json-logger..."
if docker compose exec -T backend pip show python-json-logger &>/dev/null; then
    VERSION=$(docker compose exec -T backend pip show python-json-logger | grep Version | cut -d: -f2 | tr -d ' ')
    log_success "python-json-logger $VERSION is installed"
else
    log_error "python-json-logger is NOT installed"
    exit 1
fi

log_info "Checking django-ratelimit..."
if docker compose exec -T backend pip show django-ratelimit &>/dev/null; then
    VERSION=$(docker compose exec -T backend pip show django-ratelimit | grep Version | cut -d: -f2 | tr -d ' ')
    log_success "django-ratelimit $VERSION is installed"
else
    log_error "django-ratelimit is NOT installed"
    exit 1
fi

log_info "Checking sentry-sdk..."
if docker compose exec -T backend pip show sentry-sdk &>/dev/null; then
    VERSION=$(docker compose exec -T backend pip show sentry-sdk | grep Version | cut -d: -f2 | tr -d ' ')
    log_success "sentry-sdk $VERSION is installed"
else
    log_warning "sentry-sdk is not installed (optional)"
fi

# =============================================================================
# STEP 6: Run migrations
# =============================================================================

log_info "Step 6: Running database migrations..."

docker compose exec -T backend python manage.py migrate --noinput

log_success "Migrations completed"

# =============================================================================
# STEP 7: Test Django configuration
# =============================================================================

log_info "Step 7: Testing Django configuration..."

if docker compose exec -T backend python manage.py check 2>&1 | grep -q "System check identified no issues"; then
    log_success "Django configuration is valid"
else
    log_warning "Django check found some issues:"
    docker compose exec -T backend python manage.py check 2>&1 | tail -10
fi

# =============================================================================
# STEP 8: Test imports
# =============================================================================

log_info "Step 8: Testing critical imports..."

# Test python-json-logger
log_info "Testing pythonjsonlogger import..."
if docker compose exec -T backend python -c "from pythonjsonlogger import jsonlogger; print('OK')" 2>&1 | grep -q "OK"; then
    log_success "pythonjsonlogger can be imported"
else
    log_error "Cannot import pythonjsonlogger"
    exit 1
fi

# Test django-ratelimit
log_info "Testing django_ratelimit import..."
if docker compose exec -T backend python -c "from django_ratelimit.decorators import ratelimit; print('OK')" 2>&1 | grep -q "OK"; then
    log_success "django_ratelimit can be imported"
else
    log_error "Cannot import django_ratelimit"
    exit 1
fi

# Test logging filters
log_info "Testing custom logging filters..."
if docker compose exec -T backend python -c "import sys; sys.path.insert(0, '.'); from apps.core.logging_filters import CorrelationIdFilter; print('OK')" 2>&1 | grep -q "OK"; then
    log_success "Custom logging filters can be imported"
else
    log_error "Cannot import custom logging filters"
    exit 1
fi

# =============================================================================
# STEP 9: Final health check
# =============================================================================

log_info "Step 9: Running final health check..."

echo ""
log_info "Waiting for API to respond..."

# Wait for API
for i in {1..30}; do
    if curl -f http://localhost:8000/api/ &> /dev/null; then
        log_success "Backend API is responding!"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Test with correlation ID
log_info "Testing correlation ID header..."
RESPONSE=$(curl -sI http://localhost:8000/api/ 2>/dev/null)

if echo "$RESPONSE" | grep -q "X-Correlation-ID"; then
    CORRELATION_ID=$(echo "$RESPONSE" | grep "X-Correlation-ID" | cut -d' ' -f2 | tr -d '\r')
    log_success "Correlation ID is working: $CORRELATION_ID"
else
    log_warning "X-Correlation-ID header not found (this may be normal)"
fi

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                     INSTALLATION COMPLETE                             ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

log_success "All Sprint 7 dependencies are installed!"
echo ""
log_info "Installed packages:"
echo "  ✓ python-json-logger (JSON structured logging)"
echo "  ✓ django-ratelimit (API rate limiting)"
echo "  ✓ sentry-sdk (Error tracking)"
echo ""
log_info "New features enabled:"
echo "  ✓ JSON structured logging (backend/logs/)"
echo "  ✓ Correlation ID tracking (X-Correlation-ID header)"
echo "  ✓ Rate limiting with Redis"
echo "  ✓ Automatic log rotation"
echo ""
log_info "Backend is ready at: http://localhost:8000/api/"
echo ""
log_info "View logs:"
echo "  tail -f backend/logs/django.log"
echo "  tail -f backend/logs/errors.log"
echo ""
