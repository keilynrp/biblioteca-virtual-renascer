# CI/CD Documentation - BVS Framework

> **Sprint 8**: DevOps Crítico - Parte 2
> **Last Updated**: 2026-01-05
> **Status**: ✅ Implemented

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Configuration](#configuration)
4. [Deployment Process](#deployment-process)
5. [Rollback Procedures](#rollback-procedures)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The BVS Framework uses **GitHub Actions** for continuous integration and continuous deployment (CI/CD).

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       GitHub Repository                      │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
              ▼                           ▼
    ┌─────────────────┐        ┌─────────────────┐
    │   Pull Request  │        │  Push to main   │
    └────────┬────────┘        └────────┬────────┘
             │                          │
             ▼                          ▼
    ┌─────────────────┐        ┌─────────────────┐
    │  CI Workflow    │        │  CI Workflow    │
    │  - Tests        │        │  - Tests        │
    │  - Linting      │        │  - Linting      │
    │  - Build        │        │  - Build        │
    │  - Security     │        │  - Security     │
    └─────────────────┘        └────────┬────────┘
                                        │
                                        ▼
                              ┌─────────────────┐
                              │ Deploy Staging  │
                              │ - Build images  │
                              │ - Push to reg.  │
                              │ - Deploy        │
                              │ - Health check  │
                              └─────────────────┘
```

### Environments

| Environment | Trigger | Approval | Auto-Rollback |
|-------------|---------|----------|---------------|
| **Staging** | Push to `main` | No | Yes |
| **Production** | Manual workflow | Yes | Yes |

---

## 🔄 Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs**:

#### Backend Tests
- Sets up PostgreSQL and Redis
- Installs Python dependencies
- Runs flake8 linting
- Executes pytest with coverage
- Uploads coverage to Codecov
- Fails if coverage < 70%

#### Frontend Tests
- Sets up Node.js
- Runs ESLint
- Runs TypeScript type checking
- Executes Jest tests (if configured)
- Builds Next.js application

#### Docker Build
- Tests building both backend and frontend Docker images
- Uses layer caching for faster builds

#### Security Scan
- Runs Trivy vulnerability scanner
- Checks for CRITICAL and HIGH severity issues
- Uploads results to GitHub Security tab

#### Status Check
- Aggregates results from all jobs
- Required to pass before merging PRs

**Duration**: ~5-8 minutes

---

### 2. Deploy to Staging (`.github/workflows/deploy-staging.yml`)

**Triggers**:
- Automatic on push to `main`
- Manual trigger via workflow_dispatch

**Jobs**:

#### Build
1. Builds Docker images for backend and frontend
2. Tags images with:
   - Branch name
   - Commit SHA
   - `staging` tag
3. Pushes to GitHub Container Registry (ghcr.io)

#### Deploy
1. Connects to staging server via SSH
2. Pulls latest images
3. Stops and restarts services
4. Runs database migrations
5. Collects static files
6. Cleans up old images

#### Health Check
- Waits up to 5 minutes for service
- Tests `/api/health/` endpoint
- Runs smoke tests on critical endpoints

#### Rollback (on failure)
- Automatically rolls back to previous version
- Sends Slack notification

**Duration**: ~8-12 minutes

---

### 3. Deploy to Production (`.github/workflows/deploy-production.yml`)

**Triggers**:
- Manual only via workflow_dispatch
- Requires version tag (e.g., `v1.0.0`)

**Jobs**:

#### Pre-deployment Checks
- Verifies version tag exists
- Checks CI status for that commit

#### Backup
- Creates database backup
- Stores with timestamp

#### Build
- Builds production images
- Tags with version, `production`, and `latest`
- Pushes to registry

#### Deploy (Requires Approval)
- **Zero-downtime deployment**:
  1. Scales backend to 2 instances
  2. Starts new instance
  3. Waits for health check
  4. Removes old instance
  5. Updates frontend
- Runs migrations
- Collects static files

#### Health Check
- Comprehensive checks for 60 attempts (5 minutes)
- Tests database connectivity
- Tests Redis connectivity
- Runs smoke tests

#### Post-deployment Monitoring
- Monitors health for 5 minutes
- Makes 10 checks at 30-second intervals

#### Rollback (on failure)
- Automatically restores previous version
- Restores database from backup
- Sends critical alert

**Duration**: ~15-20 minutes

---

## ⚙️ Configuration

### Required GitHub Secrets

See [`.github/GITHUB_SECRETS_SETUP.md`](.github/GITHUB_SECRETS_SETUP.md) for detailed setup instructions.

**Staging**:
```
STAGING_HOST
STAGING_USER
STAGING_SSH_KEY
STAGING_PORT
STAGING_DEPLOY_PATH
STAGING_URL
STAGING_API_URL
```

**Production**:
```
PROD_HOST
PROD_USER
PROD_SSH_KEY
PROD_PORT
PROD_DEPLOY_PATH
PROD_URL
PROD_API_URL
```

**Notifications** (optional):
```
SLACK_WEBHOOK
```

### GitHub Environments

Configure in **Settings → Environments**:

#### Staging
- No protection rules
- Automatic deployment

#### Production
- **Required reviewers**: 1-2 team members
- **Deployment branches**: `main` and tags matching `v*`
- **Wait timer**: 5 minutes (optional)

---

## 🚀 Deployment Process

### Deploying to Staging

Staging deploys automatically on merge to `main`:

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feature/my-feature

# 4. Wait for CI to pass

# 5. Merge PR to main
# Staging deployment triggers automatically
```

**Monitor deployment**:
- Go to **Actions** tab
- Click on "Deploy to Staging" workflow
- Watch real-time logs

### Deploying to Production

Production deployment requires manual trigger and approval:

```bash
# 1. Ensure all changes are merged to main
git checkout main
git pull origin main

# 2. Create version tag
git tag v1.0.0
git push origin v1.0.0

# 3. Go to Actions → "Deploy to Production"

# 4. Click "Run workflow"

# 5. Enter inputs:
#    - Version: v1.0.0
#    - Skip backup: false (unchecked)

# 6. Wait for approval notification

# 7. Approve deployment (if you're a reviewer)

# 8. Monitor deployment progress
```

**Post-deployment**:
1. Verify health checks pass
2. Test critical user flows manually
3. Monitor Sentry for errors
4. Check logs: `docker compose logs -f backend`

---

## 🔙 Rollback Procedures

### Automatic Rollback

Both staging and production have automatic rollback on failure:

- **Health check fails**: System reverts to previous version
- **Smoke tests fail**: Automatic rollback triggered
- **Database restored** (production only)

### Manual Rollback

If you need to manually roll back:

#### Quick Rollback (Use Previous Docker Images)

```bash
# SSH to server
ssh deploy@your-server

# Navigate to deployment directory
cd /var/www/bvs

# Stop services
docker compose down

# Revert to previous commit
git checkout HEAD~1

# Start services
docker compose up -d

# Verify
docker compose ps
curl https://your-domain.com/api/health/
```

#### Rollback to Specific Version

```bash
# List available tags
git tag -l

# Checkout specific version
git checkout v1.0.0

# Restart services
docker compose down
docker compose up -d
```

#### Restore Database Backup

```bash
# List available backups
ls -lh backups/

# Restore specific backup
gunzip < backups/pre-deploy-20260105-120000.sql.gz | \
  docker compose exec -T db psql -U bvs_user bvs_db
```

---

## 🐛 Troubleshooting

### CI Workflow Failures

#### Backend Tests Fail

**Problem**: Pytest tests fail

**Solution**:
```bash
# Run tests locally first
cd backend
pytest --verbose

# Check specific test
pytest apps/authentication/tests/test_views.py::TestLoginView -v

# Ensure all dependencies are in requirements.txt
```

#### Frontend Build Fails

**Problem**: Next.js build error

**Solution**:
```bash
# Build locally
cd frontend
npm run build

# Check environment variables
cat .env.local

# Verify TypeScript types
npx tsc --noEmit
```

#### Docker Build Fails

**Problem**: "ERROR [backend 3/5] RUN pip install -r requirements.txt"

**Solution**:
- Check `requirements.txt` for typos
- Verify package versions exist on PyPI
- Test build locally: `docker build -t test-backend ./backend`

---

### Deployment Failures

#### SSH Connection Failed

**Problem**: "Permission denied (publickey)"

**Solutions**:
1. Verify SSH key is correct in GitHub Secrets
2. Ensure public key is in server's `~/.ssh/authorized_keys`
3. Check SSH key permissions: `chmod 600 ~/.ssh/id_rsa`

#### Health Check Timeout

**Problem**: "Health check failed after 30 attempts"

**Solutions**:
1. SSH to server and check logs:
   ```bash
   docker compose logs backend
   ```
2. Verify services are running:
   ```bash
   docker compose ps
   ```
3. Test health endpoint manually:
   ```bash
   curl http://localhost:8000/api/health/detailed/
   ```

#### Migration Errors

**Problem**: "django.db.utils.OperationalError: relation does not exist"

**Solutions**:
1. Check if migrations are applied:
   ```bash
   docker compose exec backend python manage.py showmigrations
   ```
2. Apply migrations manually:
   ```bash
   docker compose exec backend python manage.py migrate
   ```
3. If database is corrupted, restore from backup

---

### Rollback Issues

#### Rollback Failed

**Problem**: Rollback triggered but services still unhealthy

**Solutions**:
1. Check Docker status:
   ```bash
   docker compose ps
   docker compose logs --tail=100
   ```
2. Manually restore previous version:
   ```bash
   git log --oneline  # Find previous working commit
   git checkout <commit-hash>
   docker compose down
   docker compose up -d
   ```
3. Check database integrity:
   ```bash
   docker compose exec db psql -U bvs_user bvs_db -c "SELECT version();"
   ```

---

## 📊 Monitoring Deployments

### Real-time Monitoring

```bash
# Watch logs during deployment
ssh deploy@server
cd /var/www/bvs
docker compose logs -f backend
```

### Health Checks

```bash
# Basic health
curl https://your-domain.com/api/health/

# Detailed health (with DB and Redis)
curl https://your-domain.com/api/health/detailed/
```

### Check Deployment Version

```bash
# Check current Git commit
ssh deploy@server
cd /var/www/bvs
git log -1 --oneline

# Check Docker image tags
docker compose images
```

---

## 🎓 Best Practices

1. **Always test locally before pushing**
   ```bash
   pytest
   npm run build
   docker compose up --build
   ```

2. **Use feature flags for risky changes**
   ```python
   if settings.FEATURE_NEW_ALGORITHM:
       # New code
   else:
       # Old code
   ```

3. **Deploy during low-traffic hours**
   - Best times: Early morning or late night
   - Avoid: Business hours, weekends with high activity

4. **Monitor after deployment**
   - Watch Sentry for errors
   - Check analytics for anomalies
   - Review logs for warnings

5. **Communicate deployments**
   - Notify team in Slack
   - Update deployment log
   - Document any issues

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Zero-Downtime Deployment Strategies](https://martinfowler.com/bliki/BlueGreenDeployment.html)

---

**Version**: 1.0
**Last Updated**: 2026-01-05
**Maintainer**: BVS DevOps Team
