# 🚀 Quick Start - Action Steps

## Current Issues Detected

Based on the diagnostic output, here are the issues and how to fix them:

### Issue #1: Service Name Mismatch ✅ FIXED
The diagnostic script was looking for `postgres` but the service is named `db` in docker-compose.yml.
**Status**: Fixed in [scripts/diagnose.sh](scripts/diagnose.sh)

### Issue #2: Backend Errors (4 errors found)
**Action Required**: Check what errors are occurring in the backend

```bash
docker compose logs backend | grep -i error
```

### Issue #3: Health Check Failures
The API health checks are failing for database and cache.

### Issue #4: Migration Count Issue
The migration check is showing `0\n0` instead of a proper count.
**Status**: Fixed in [scripts/diagnose.sh](scripts/diagnose.sh)

---

## Step-by-Step Resolution

### Step 1: Start All Services

```bash
# Make sure you're in the project root
cd d:\bvs_framework

# Start all services
docker compose up -d

# Wait a moment for services to initialize
sleep 10

# Check status
docker compose ps
```

**Expected Output**: All services should show "Up" status
- ✓ backend
- ✓ db (PostgreSQL)
- ✓ redis
- ✓ meilisearch
- ✓ frontend

---

### Step 2: Check Backend Errors

```bash
# View recent backend logs
docker compose logs backend --tail=50

# Filter for errors specifically
docker compose logs backend | grep -i error

# Look for specific issues:
# - Redis connection errors
# - Database connection errors
# - Missing dependencies
# - Configuration errors
```

**Common Errors & Fixes**:

1. **"Settings object has no attribute 'CACHE_TTL'"**
   ```bash
   docker compose restart backend
   ```

2. **"Connection refused" to Redis**
   ```bash
   docker compose up -d redis
   docker compose restart backend
   ```

3. **"No module named 'magic'"**
   ```bash
   docker compose exec backend pip install python-magic
   # OR rebuild:
   docker compose build backend
   docker compose up -d backend
   ```

---

### Step 3: Apply Pending Migrations

```bash
# Check for unapplied migrations
docker compose exec backend python manage.py showmigrations

# Apply all migrations
docker compose exec backend python manage.py migrate

# Verify migrations are applied
docker compose exec backend python manage.py showmigrations | grep "\[ \]"
# (Should return nothing if all applied)
```

---

### Step 4: Verify Health Endpoints

```bash
# Basic health check
curl http://localhost:8000/api/health/

# Expected response:
# {"status":"healthy"}

# Detailed health check (includes DB and Redis)
curl http://localhost:8000/api/health/detailed/

# Expected response:
# {
#   "status": "healthy",
#   "checks": {
#     "database": {"status": "healthy", "type": "postgresql"},
#     "cache": {"status": "healthy", "type": "redis"}
#   }
# }
```

---

### Step 5: Test Redis Connection

```bash
# Connect to Redis CLI
docker compose exec redis redis-cli

# Inside Redis CLI:
127.0.0.1:6379> PING
# Should return: PONG

127.0.0.1:6379> INFO stats
# Should show statistics

127.0.0.1:6379> KEYS bvs_cache:*
# Should show cache keys (might be empty initially)

127.0.0.1:6379> exit
```

---

### Step 6: Test Database Connection

```bash
# Run Django database check
docker compose exec backend python manage.py check --database default

# Connect to PostgreSQL
docker compose exec db psql -U postgres -d biblioteca

# Inside psql:
\dt
# Should show Django tables

\q
```

---

### Step 7: Run Diagnostic Script Again

```bash
# The diagnostic script has been fixed
./scripts/diagnose.sh
```

**Expected Output**:
- ✓ Docker is running
- ✓ Docker Compose available
- ✓ All containers running
- ✓ Backend is running
- ✓ Redis is running and responding
- ✓ PostgreSQL is running
- ✓ Health checks passed
- ✓ All migrations applied

---

## Quick Commands Reference

```bash
# View all services status
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f redis

# Restart a service
docker compose restart backend

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Start fresh (⚠️ WARNING: deletes data!)
docker compose down -v
docker compose up -d

# Rebuild backend from scratch
docker compose build backend --no-cache
docker compose up -d backend

# Clear Redis cache
docker compose exec redis redis-cli FLUSHDB

# Run migrations
docker compose exec backend python manage.py migrate

# Access Django shell
docker compose exec backend python manage.py shell

# Create superuser
docker compose exec backend python manage.py createsuperuser
```

---

## Verification Checklist

After completing the steps above, verify:

- [ ] All Docker services are running (`docker compose ps`)
- [ ] No errors in backend logs
- [ ] Health endpoint returns "healthy"
- [ ] All migrations applied
- [ ] Redis is responding to PING
- [ ] Database connection working
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend admin accessible at http://localhost:8000/admin
- [ ] API docs accessible at http://localhost:8000/api/

---

## If Problems Persist

1. **Check Environment Variables**
   ```bash
   # Make sure .env file exists with correct values
   cat .env | grep -E "POSTGRES|REDIS"
   ```

2. **Check Docker Resources**
   ```bash
   docker stats
   # Make sure containers have enough memory
   ```

3. **Full System Reset** (last resort)
   ```bash
   # Stop everything
   docker compose down -v

   # Clean Docker system
   docker system prune -f

   # Rebuild and start
   docker compose build --no-cache
   docker compose up -d

   # Apply migrations
   docker compose exec backend python manage.py migrate
   ```

4. **Review Documentation**
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Detailed troubleshooting guide
   - [CACHE_STRATEGY.md](CACHE_STRATEGY.md) - Cache implementation details
   - [QUERY_OPTIMIZATION.md](QUERY_OPTIMIZATION.md) - Database optimization
   - [SPRINT_8_PROGRESS.md](SPRINT_8_PROGRESS.md) - Recent changes

---

## Next Steps After Resolution

Once all services are healthy:

1. **Access the application**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:8000/admin
   - API: http://localhost:8000/api/

2. **Create superuser** (if needed)
   ```bash
   docker compose exec backend python manage.py createsuperuser
   ```

3. **Load test data** (if needed)
   ```bash
   docker compose exec backend python manage.py loaddata initial_data
   ```

4. **Monitor performance**
   ```bash
   # Watch logs in real-time
   docker compose logs -f

   # Check cache statistics
   docker compose exec backend python manage.py shell
   >>> from apps.core.cache_utils import get_cache_stats
   >>> print(get_cache_stats())
   ```

---

**Created**: 2026-01-06
**Sprint**: Sprint 8 - DevOps Critical Infrastructure Part 2
