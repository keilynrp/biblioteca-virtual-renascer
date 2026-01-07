# 🚨 QUICK FIX - AxiosError 500

## Problem
The frontend shows: `AxiosError: Request failed with status code 500`

## Root Cause
**Docker is not running**, so the backend cannot connect to:
- ✗ Redis (cache)
- ✗ PostgreSQL (database)

The backend is trying to use Redis for caching (configured in [backend/config/settings.py:697](backend/config/settings.py#L697)) but Redis is inside Docker containers that aren't started.

## Solution

### ✅ Option 1: Start Docker (RECOMMENDED)

```bash
# 1. Start Docker Desktop
# Look for Docker icon in system tray and open it
# Wait until the whale icon is steady (Docker is running)

# 2. Once Docker is running, start all services
docker compose up -d

# 3. Wait ~30 seconds, then check status
docker compose ps

# Expected output:
# NAME                 STATUS              PORTS
# backend              Up                  8000/tcp
# db                   Up                  5432/tcp
# redis                Up                  6379/tcp
# meilisearch          Up                  7700/tcp
# frontend             Up                  3000/tcp

# 4. Run diagnostic (now fixed!)
./scripts/diagnose.sh

# 5. Access the app
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/admin
```

### Option 2: Temporary Local Development (NOT RECOMMENDED)

If you absolutely need to run without Docker temporarily, you can disable Redis:

**Edit [backend/config/settings.py:695-712](backend/config/settings.py#L695-L712)**:

```python
# Comment out Redis configuration
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.redis.RedisCache',
#         'LOCATION': os.getenv('REDIS_URL', 'redis://redis:6379/1'),
#         ...
#     }
# }

# Use local memory cache instead
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
```

⚠️ **WARNING**:
- This is only for emergency local development
- Cache won't persist between restarts
- Performance will be degraded
- You'll still need a local PostgreSQL or SQLite
- **Always use Docker for proper development**

---

## Why Docker?

The BVS Framework (Sprint 8) requires multiple services:
- **PostgreSQL** - Main database
- **Redis** - Caching layer (new in Sprint 8)
- **Meilisearch** - Search engine
- **Backend** - Django API
- **Frontend** - Next.js app

Docker manages all these services with:
- ✅ Proper networking between services
- ✅ Correct environment variables
- ✅ Health checks and dependencies
- ✅ Consistent configuration

---

## Common Docker Issues

### "Docker is not running"
**Fix**: Open Docker Desktop from Start menu or system tray

### "docker: command not found"
**Fix**:
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Restart your terminal after installation

### Services fail to start
**Fix**:
```bash
# Stop everything
docker compose down

# Clean up
docker system prune -f

# Start fresh
docker compose up -d --build
```

### Port conflicts
**Fix**:
```bash
# Check what's using the ports
netstat -ano | findstr "8000"
netstat -ano | findstr "5432"
netstat -ano | findstr "6379"

# Kill the process or change ports in docker-compose.yml
```

---

## After Starting Docker Successfully

Once `docker compose ps` shows all services as "Up":

```bash
# 1. Apply database migrations
docker compose exec backend python manage.py migrate

# 2. Create superuser (if needed)
docker compose exec backend python manage.py createsuperuser

# 3. Check backend logs
docker compose logs backend --tail=50

# 4. Test Redis connection
docker compose exec redis redis-cli PING
# Should return: PONG

# 5. Test database connection
docker compose exec backend python manage.py check --database default

# 6. Access the application
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin
# API docs: http://localhost:8000/api/
```

---

## Verification Checklist

Your system is working correctly when:

- [ ] Docker Desktop is running
- [ ] `docker compose ps` shows all services "Up"
- [ ] `./scripts/diagnose.sh` shows all checks passed
- [ ] http://localhost:8000/api/health/ returns `{"status":"healthy"}`
- [ ] http://localhost:3000 loads without errors
- [ ] No AxiosError 500 in frontend console

---

## Other Common 500 Errors

### "AttributeError: 'Settings' object has no attribute 'CACHE_TTL'"

This means the backend container has old code. Fix:

```bash
# Restart backend to reload code
docker compose restart backend

# If that doesn't work, rebuild:
docker compose down
docker compose build backend --no-cache
docker compose up -d
```

### "Connection refused" to Redis

```bash
# Make sure Redis is running
docker compose up -d redis
docker compose restart backend
```

---

**See also**:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Detailed troubleshooting guide
- [QUICK_START_ACTIONS.md](QUICK_START_ACTIONS.md) - Step-by-step diagnostic resolution
- [scripts/diagnose.sh](scripts/diagnose.sh) - System diagnostic tool (now fixed!)
- [CACHE_STRATEGY.md](CACHE_STRATEGY.md) - Cache implementation details

**Last Updated**: 2026-01-06
**Sprint**: Sprint 8 - DevOps Critical Infrastructure Part 2
