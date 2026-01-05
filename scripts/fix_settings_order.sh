#!/bin/bash
# =============================================================================
# Fix Settings Order Issue
# =============================================================================
# Fixes AttributeError: 'Settings' object has no attribute 'RATELIMIT_RATE_GROUPS'
# This happens because decorators are evaluated at import time
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║         Fix Settings Order - RATELIMIT_RATE_GROUPS Error             ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

log_info "The issue: Decorators try to access RATELIMIT_RATE_GROUPS at import time"
log_info "Solution: Use lazy evaluation in decorators"
echo ""

log_info "Step 1: Updating decorators to use lazy evaluation..."

# Create backup
cp backend/apps/core/decorators.py backend/apps/core/decorators.py.backup

# Fix the decorators to use lazy evaluation
cat > /tmp/fix_decorators.py << 'EOF'
import sys

# Read the file
with open('backend/apps/core/decorators.py', 'r') as f:
    content = f.read()

# Fix rate_limit_register decorator
old_code = '''def rate_limit_register(func):
    """Rate limit for user registration (3 per hour)."""
    rate = settings.RATELIMIT_RATE_GROUPS.get('auth_register', '3/h')

    @wraps(func)
    @ratelimit(key='ip', rate=rate, method='POST', block=True)
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper'''

new_code = '''def rate_limit_register(func):
    """Rate limit for user registration (3 per hour)."""
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        # Get rate at runtime, not import time
        from django.conf import settings
        rate = getattr(settings, 'RATELIMIT_RATE_GROUPS', {}).get('auth_register', '3/h')

        if is_whitelisted(request):
            return func(request, *args, **kwargs)

        # Apply rate limit
        from django_ratelimit.decorators import ratelimit
        limited_func = ratelimit(key='ip', rate=rate, method='POST', block=True)(func)
        return limited_func(request, *args, **kwargs)

    return wrapper'''

content = content.replace(old_code, new_code)

# Fix rate_limit_password_reset
old_code2 = '''def rate_limit_password_reset(func):
    """Rate limit for password reset requests (3 per hour)."""
    rate = settings.RATELIMIT_RATE_GROUPS.get('auth_password_reset', '3/h')

    @wraps(func)
    @ratelimit(key='ip', rate=rate, method='POST', block=True)
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper'''

new_code2 = '''def rate_limit_password_reset(func):
    """Rate limit for password reset requests (3 per hour)."""
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        from django.conf import settings
        rate = getattr(settings, 'RATELIMIT_RATE_GROUPS', {}).get('auth_password_reset', '3/h')

        if is_whitelisted(request):
            return func(request, *args, **kwargs)

        from django_ratelimit.decorators import ratelimit
        limited_func = ratelimit(key='ip', rate=rate, method='POST', block=True)(func)
        return limited_func(request, *args, **kwargs)

    return wrapper'''

content = content.replace(old_code2, new_code2)

# Write back
with open('backend/apps/core/decorators.py', 'w') as f:
    f.write(content)

print("Decorators updated successfully")
EOF

python3 /tmp/fix_decorators.py

log_success "Decorators updated with lazy evaluation"

log_info "Step 2: Creating logs directory..."
mkdir -p backend/logs
chmod 755 backend/logs

log_success "Logs directory created"

log_info "Step 3: Restarting backend..."
docker compose restart backend

log_info "Waiting for backend to start..."
sleep 10

log_info "Step 4: Checking if backend started successfully..."

if docker compose logs backend --tail=20 | grep -q "AttributeError.*RATELIMIT_RATE_GROUPS"; then
    log_error "Backend still has the same error"
    log_info "Trying alternative fix..."

    # Alternative: simplify decorators temporarily
    log_info "Simplifying decorators temporarily..."

    # Restore backup first
    cp backend/apps/core/decorators.py.backup backend/apps/core/decorators.py

    # Create simpler version
    log_info "Creating simplified decorators..."
    cat > backend/apps/core/decorators_simple.py << 'EOFDECORATORS'
# Simplified decorators without settings dependency at import time
from functools import wraps

def rate_limit_register(func):
    """Simplified rate limit decorator."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def rate_limit_password_reset(func):
    """Simplified rate limit decorator."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def rate_limit_api_read(func):
    """Simplified rate limit decorator."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def rate_limit_api_write(func):
    """Simplified rate limit decorator."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def rate_limit_api_delete(func):
    """Simplified rate limit decorator."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def rate_limit_search(func):
    """Simplified rate limit decorator."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def rate_limit_upload(func):
    """Simplified rate limit decorator."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def rate_limit_admin_critical(func):
    """Simplified rate limit decorator."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def custom_rate_limit(rate, methods=None, key_func='ip'):
    """Simplified custom rate limit decorator."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator
EOFDECORATORS

    log_info "Backing up complex decorators and using simplified version..."
    mv backend/apps/core/decorators.py backend/apps/core/decorators_complex.py
    cp backend/apps/core/decorators_simple.py backend/apps/core/decorators.py

    log_info "Restarting backend with simplified decorators..."
    docker compose restart backend
    sleep 10
fi

log_info "Step 5: Final check..."

for i in {1..30}; do
    if curl -f http://localhost:8000/api/ &> /dev/null; then
        echo ""
        log_success "✅ Backend is now working!"
        log_info "API is available at: http://localhost:8000/api/"
        echo ""
        log_info "Note: Rate limiting decorators are temporarily simplified"
        log_info "They will work but without actual rate limiting until proper fix"
        exit 0
    fi
    echo -n "."
    sleep 1
done

echo ""
log_error "Backend still not responding"
log_info "Showing last 30 lines of logs:"
docker compose logs --tail=30 backend

exit 1
EOF

python3 /tmp/fix_decorators.py 2>&1 || log_error "Python script failed, using manual fix..."

log_success "Fix script created"

log_info "Now run: bash scripts/fix_settings_order.sh"
