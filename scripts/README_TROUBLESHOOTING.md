# Backend Troubleshooting Scripts

## 🚨 Backend Unhealthy? Use These Scripts

### Quick Start

```bash
# For recent Sprint 7 changes issues
bash scripts/fix_recent_changes.sh

# For general backend issues
bash scripts/diagnose_and_fix_backend.sh

# For quick fixes (interactive menu)
bash scripts/quick_fix_backend.sh
```

---

## 📋 Available Scripts

### 1. `fix_recent_changes.sh` ⭐ RECOMMENDED FOR CURRENT ISSUES

**When to use**: After Sprint 7 implementation (logging, rate limiting, middleware changes)

**What it fixes**:
- Creates logs directory
- Installs new dependencies (python-json-logger, django-ratelimit)
- Validates middleware configuration
- Tests logging system
- Tests correlation ID middleware
- Checks Redis connection
- Runs migrations
- Restarts backend with clean state

**Usage**:
```bash
bash scripts/fix_recent_changes.sh
```

**Expected output**:
```
✓ Logs directory created
✓ python-json-logger is installed
✓ Django configuration is valid
✓ Correlation ID middleware is working
✓ Backend API is responding
```

---

### 2. `diagnose_and_fix_backend.sh` - Comprehensive Diagnosis

**When to use**: Unknown backend issues, comprehensive troubleshooting needed

**What it does**:
1. Checks Docker installation
2. Checks container status
3. Analyzes backend logs for specific errors
4. Tests database connection
5. Checks migrations status
6. Validates environment configuration
7. Tests Redis connection
8. Automatically fixes detected issues
9. Runs final health check

**Usage**:
```bash
bash scripts/diagnose_and_fix_backend.sh
```

**Features**:
- Automatic error detection (dependencies, database, imports, etc.)
- Targeted fixes based on error type
- Comprehensive fix option for multiple issues
- Color-coded output
- Final health report

---

### 3. `quick_fix_backend.sh` - Quick Fixes Menu

**When to use**: Quick specific fixes, testing changes

**Usage**:

**Interactive mode**:
```bash
bash scripts/quick_fix_backend.sh
```

**Command line mode**:
```bash
# Quick restart
bash scripts/quick_fix_backend.sh restart

# Rebuild container
bash scripts/quick_fix_backend.sh rebuild

# Run migrations
bash scripts/quick_fix_backend.sh migrate

# Fix logs directory
bash scripts/quick_fix_backend.sh logs

# Fix database
bash scripts/quick_fix_backend.sh database

# Full reset (keeps data)
bash scripts/quick_fix_backend.sh reset

# Show logs
bash scripts/quick_fix_backend.sh show

# Check status
bash scripts/quick_fix_backend.sh status

# Run comprehensive diagnosis
bash scripts/quick_fix_backend.sh diagnose
```

---

## 🔧 Common Issues and Solutions

### Issue 1: "Backend container is unhealthy"

**Symptoms**:
- `docker compose ps` shows backend as "unhealthy"
- API not responding at http://localhost:8000

**Solution**:
```bash
bash scripts/fix_recent_changes.sh
```

**Manual check**:
```bash
# Check logs
docker compose logs --tail=50 backend

# Check if dependencies are installed
docker compose exec backend pip list | grep -E "python-json-logger|django-ratelimit"
```

---

### Issue 2: "ModuleNotFoundError: No module named 'pythonjsonlogger'"

**Cause**: New dependencies from Sprint 7 not installed

**Solution**:
```bash
# Rebuild container
docker compose build backend
docker compose up -d backend

# Or use quick fix
bash scripts/quick_fix_backend.sh rebuild
```

---

### Issue 3: "No such file or directory: 'logs/django.log'"

**Cause**: Logs directory doesn't exist

**Solution**:
```bash
# Create logs directory
mkdir -p backend/logs
chmod 755 backend/logs

# Restart backend
docker compose restart backend

# Or use script
bash scripts/fix_recent_changes.sh
```

---

### Issue 4: "django.core.exceptions.ImproperlyConfigured"

**Cause**: Middleware or settings configuration issue

**Solution**:
```bash
# Check Django configuration
docker compose exec backend python manage.py check

# If errors, check settings.py for typos in:
# - MIDDLEWARE list
# - LOGGING configuration

# Restart backend
docker compose restart backend
```

---

### Issue 5: "Connection refused to Redis"

**Cause**: Redis not running or not accessible

**Solution**:
```bash
# Check Redis
docker compose ps redis

# Restart Redis
docker compose restart redis

# Test connection
docker compose exec redis redis-cli ping
# Should return: PONG

# Or use script
bash scripts/quick_fix_backend.sh database
```

---

### Issue 6: "Database migration issues"

**Cause**: Pending migrations or migration conflicts

**Solution**:
```bash
# Show migration status
docker compose exec backend python manage.py showmigrations

# Run migrations
docker compose exec backend python manage.py migrate

# Or use script
bash scripts/quick_fix_backend.sh migrate
```

---

## 🐞 Debugging Tips

### View Real-Time Logs

```bash
# All backend logs
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend

# Filter for errors
docker compose logs backend | grep -i error

# Filter by timestamp
docker compose logs --since 30m backend
```

### Check Log Files

```bash
# Django logs (all logs)
tail -f backend/logs/django.log

# Error logs only
tail -f backend/logs/errors.log

# Security logs
tail -f backend/logs/security.log

# Performance logs
tail -f backend/logs/performance.log

# Parse JSON logs
tail -1 backend/logs/django.log | python -m json.tool
```

### Test Endpoints

```bash
# Test API health
curl http://localhost:8000/api/

# Test with correlation ID
curl -H "X-Correlation-ID: test-123" http://localhost:8000/api/

# Check response headers
curl -I http://localhost:8000/api/
# Should see: X-Correlation-ID
```

### Check Container Health

```bash
# Container status
docker compose ps

# Container resource usage
docker stats backend db redis

# Enter backend shell
docker compose exec backend bash

# Run Django shell
docker compose exec backend python manage.py shell
```

### Test Rate Limiting

```bash
# Make multiple requests quickly
for i in {1..10}; do
  curl http://localhost:8000/api/books/
done

# Should eventually get 429 Too Many Requests
```

---

## 🆘 If Scripts Don't Work

### 1. Make scripts executable

```bash
chmod +x scripts/*.sh
```

### 2. Run with bash explicitly

```bash
bash scripts/fix_recent_changes.sh
```

### 3. Check Docker is running

```bash
# Check Docker
docker --version
docker info

# Start Docker Desktop if not running
```

### 4. Full manual reset

```bash
# Stop everything
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild
docker compose build --no-cache

# Start
docker compose up -d

# Wait and migrate
sleep 10
docker compose exec backend python manage.py migrate
```

---

## 📞 Still Having Issues?

1. **Check Docker Desktop**: Ensure it's running and has enough resources
   - Recommended: 4GB RAM, 2 CPUs

2. **Check .env file**: Ensure `backend/.env` has all required variables
   ```bash
   cat backend/.env | grep -E "POSTGRES|REDIS|SECRET_KEY"
   ```

3. **Check disk space**: Ensure you have enough space for logs
   ```bash
   df -h
   ```

4. **Review recent changes**: Check if any manual edits broke configuration
   - `backend/config/settings.py` (MIDDLEWARE, LOGGING)
   - `backend/apps/core/middleware.py`
   - `backend/requirements.txt`

5. **Check logs for specific error messages**:
   ```bash
   docker compose logs backend | grep -i "error\|exception\|failed"
   ```

---

## 📚 Additional Resources

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Django Logging Docs](https://docs.djangoproject.com/en/stable/topics/logging/)
- [Sprint 7 Documentation](../SPRINT_7_BACKUP_COMPLETADO.md)
- [Logging System Docs](../LOGGING_SYSTEM.md)
- [Rate Limiting Docs](../RATE_LIMITING_CONFIGURATION.md)

---

**Last Updated**: 2026-01-05
**Sprint**: 7 - DevOps Crítico Parte 1
