# 🚨 IMMEDIATE ACTIONS - Fix System Errors

**Last Updated**: 2026-01-06

**Status**:

- Backend has 12 errors, health checks failing
- Frontend build failing with npm ci error

**Priority**: HIGH

---

## Frontend Build Fix

The frontend Docker build is failing. A comprehensive fix guide is available at [FRONTEND_BUILD_FIX.md](FRONTEND_BUILD_FIX.md).

**Quick Fix Applied**: The [frontend/Dockerfile](frontend/Dockerfile#L28) has been updated to add fallback logic:

```dockerfile
RUN npm ci --no-audit --progress=false || \
    npm install --no-audit --progress=false
```

**Next Steps**:

1. Rebuild frontend with no cache:

   ```bash
   docker compose build frontend --no-cache
   docker compose up -d
   ```

2. If still failing, see [FRONTEND_BUILD_FIX.md](FRONTEND_BUILD_FIX.md) for detailed solutions.

---

## Current Status (Backend)

Based on diagnostics from `./scripts/diagnose.sh`:

✓ **Working**:
- Docker services are running (backend, redis, postgres)
- Redis is responding
- Database connection OK
- Migrations check shows 0 unapplied (but this seems suspicious)

✗ **Failing**:
- Basic health check returns `"status": "error"` instead of `"healthy"`
- Database health check failed
- Cache (Redis) health check failed
- Backend logs show 12 errors

---

## Root Cause Analysis

The backend service is running but encountering errors when:

1. **Trying to access Redis cache** during request processing
2. **Health checks** are executing but returning error status
3. **Database queries** may be failing in some views

**Key Observation**: The basic health check at [backend/apps/core/views.py:67-79](backend/apps/core/views.py#L67-L79) should return `{"status": "healthy"}` but diagnostics show `"status": "error"`. This suggests the health endpoint itself is not executing properly.

---

## Immediate Fix Steps

### Step 1: Check Backend Container Logs

```bash
# See full backend logs (last 100 lines)
docker compose logs backend --tail=100

# See only errors
docker compose logs backend | grep -i error

# See errors with context
docker compose logs backend | grep -B 3 -A 3 -i error

# Follow logs in real-time
docker compose logs -f backend
```

**What to Look For**:
- `ConnectionError` or `ConnectionRefusedError` to Redis
- `AttributeError` about missing settings (e.g., `CACHE_TTL`)
- Import errors from `apps.core.cache_utils`
- Database connection errors
- Traceback showing which view/code is failing

### Step 2: Restart Backend with Fresh Code

The backend container might have stale code or cached imports:

```bash
# Option A: Simple restart (fastest)
docker compose restart backend

# Wait 10 seconds, then check
docker compose logs backend --tail=50

# Option B: Full rebuild if restart doesn't work
docker compose down
docker compose build backend --no-cache
docker compose up -d

# Wait 30 seconds for services to start
docker compose ps
```

### Step 3: Verify Redis Connection

```bash
# Test Redis from backend container
docker compose exec backend python -c "
from django.core.cache import cache
try:
    cache.set('test', 'ok', 10)
    result = cache.get('test')
    print(f'✓ Redis working: {result}')
except Exception as e:
    print(f'✗ Redis error: {e}')
"
```

**Expected Output**: `✓ Redis working: ok`
**If Error**: Check if Redis is really running and accessible

### Step 4: Verify Database Connection

```bash
# Test database from backend container
docker compose exec backend python manage.py check --database default

# Should show: "System check identified no issues"
```

### Step 5: Check for Missing Migrations

```bash
# Show all migrations and their status
docker compose exec backend python manage.py showmigrations

# Apply any pending migrations
docker compose exec backend python manage.py migrate

# Create the query optimization indexes migration if missing
docker compose exec backend python manage.py makemigrations content --name add_query_optimization_indexes
```

### Step 6: Test Health Endpoints Directly

```bash
# Test from within the container (bypasses network issues)
docker compose exec backend python -c "
import requests
try:
    resp = requests.get('http://localhost:8000/api/health/')
    print(f'Status: {resp.status_code}')
    print(f'Response: {resp.json()}')
except Exception as e:
    print(f'Error: {e}')
"

# If that fails, test the Django shell directly
docker compose exec backend python manage.py shell
```

In Django shell:
```python
from apps.core.views import health_check
from django.test import RequestFactory

factory = RequestFactory()
request = factory.get('/api/health/')
response = health_check(request)
print(response.content)
# Should print: b'{"status": "healthy", "service": "bvs-backend", "version": "1.0.0"}'
```

### Step 7: Check Environment Variables

```bash
# Verify environment variables are set correctly
docker compose exec backend env | grep -E "REDIS_URL|DATABASE_URL|DJANGO_SETTINGS"

# Expected:
# REDIS_URL=redis://redis:6379/1
# DATABASE_URL=postgresql://...
```

---

## Common Error Patterns & Fixes

### Error: "AttributeError: 'Settings' object has no attribute 'CACHE_TTL'"

**Fix**:
```bash
# Backend has old code, rebuild it
docker compose down
docker compose build backend --no-cache
docker compose up -d
```

### Error: "Connection refused" to Redis

**Fix**:
```bash
# Check Redis is running
docker compose ps redis

# Restart Redis
docker compose restart redis

# Restart backend to reconnect
docker compose restart backend
```

### Error: "relation does not exist" (Database)

**Fix**:
```bash
# Apply migrations
docker compose exec backend python manage.py migrate

# If specific table is missing, create migration
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

### Error: ImportError or ModuleNotFoundError

**Fix**:
```bash
# Rebuild backend to reinstall dependencies
docker compose build backend
docker compose up -d backend
```

### Error: Health check returns {"status": "error"}

This is unusual since the basic health check at [backend/apps/core/views.py:75-79](backend/apps/core/views.py#L75-L79) should always return `{"status": "healthy"}`.

**Possible Causes**:
1. URL routing is broken (check [backend/config/urls.py:24](backend/config/urls.py#L24))
2. The request is hitting a different endpoint
3. Middleware is intercepting and modifying the response

**Fix**:
```bash
# Check URL configuration
docker compose exec backend python manage.py show_urls | grep health

# Or manually test in Django shell
docker compose exec backend python manage.py shell
```

In shell:
```python
from django.urls import reverse
print(reverse('core:health_check'))  # Should print: /api/health/
```

---

## Nuclear Option: Complete Reset

If all else fails:

```bash
# CAUTION: This will delete all data!
docker compose down -v  # -v removes volumes (database data)

# Remove old images
docker compose build --no-cache

# Start fresh
docker compose up -d

# Wait for services to be ready
sleep 30

# Apply migrations
docker compose exec backend python manage.py migrate

# Create superuser (optional)
docker compose exec backend python manage.py createsuperuser

# Run diagnostics
./scripts/diagnose.sh
```

---

## Verification Checklist

After fixes, verify:

```bash
# 1. All services running
docker compose ps
# All should show "Up"

# 2. No errors in backend logs
docker compose logs backend --tail=50
# Should not see ERROR or Traceback

# 3. Health checks pass
curl http://localhost:8000/api/health/
# Should return: {"status":"healthy","service":"bvs-backend","version":"1.0.0"}

curl http://localhost:8000/api/health/detailed/
# Should return: {"status":"healthy","checks":{"database":{"status":"healthy"},"cache":{"status":"healthy"}}}

# 4. Run full diagnostics
./scripts/diagnose.sh
# All checks should pass (✓)

# 5. Test frontend
# Open http://localhost:3000
# Should load without AxiosError 500
```

---

## Next Steps After Fix

Once the backend is working:

1. **Monitor logs** for a few minutes to ensure no recurring errors
2. **Test key endpoints**:
   - `/api/content/dashboard/stats/` - Dashboard statistics
   - `/api/content/books/` - Book list
   - `/api/content/categories/` - Categories
3. **Check cache is working**:
   ```bash
   docker compose exec redis redis-cli KEYS "bvs_cache:*"
   # Should show cache keys after making requests
   ```
4. **Review recent changes** in modified files:
   - [backend/config/settings.py](backend/config/settings.py#L695-L723) - Cache configuration
   - [backend/apps/core/cache_utils.py](backend/apps/core/cache_utils.py) - Cache utilities
   - [backend/apps/content/signals.py](backend/apps/content/signals.py) - Cache invalidation
   - [backend/apps/content/views.py](backend/apps/content/views.py) - Views using cache

---

## Getting Help

If issues persist:

1. **Capture full diagnostic output**:
   ```bash
   ./scripts/diagnose.sh > diagnostic_output.txt
   docker compose logs > all_logs.txt
   docker compose logs backend > backend_logs.txt
   ```

2. **Review documentation**:
   - [QUICK_FIX.md](QUICK_FIX.md) - Quick fixes for common issues
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Detailed troubleshooting
   - [CACHE_STRATEGY.md](CACHE_STRATEGY.md) - Cache implementation details
   - [SPRINT_8_PROGRESS.md](SPRINT_8_PROGRESS.md) - Recent changes

3. **Check system resources**:
   ```bash
   docker stats
   # Make sure containers aren't running out of memory
   ```

---

## Expected Timeline

- **Step 1-3**: 5 minutes (identify the error)
- **Step 4-7**: 10 minutes (apply fixes)
- **Verification**: 5 minutes (confirm fixes work)
- **Total**: ~20 minutes

---

**Priority Order**:
1. ⚡ Step 1: Check logs (MUST DO FIRST)
2. ⚡ Step 2: Restart backend (Quick fix, often solves it)
3. 🔍 Step 3-7: Deeper investigation if needed
4. 🔨 Nuclear option: Only if nothing else works

**Remember**: The diagnostic shows services are running, so this is likely a **configuration or code loading issue**, not a Docker problem. Focus on Steps 1-2 first.
