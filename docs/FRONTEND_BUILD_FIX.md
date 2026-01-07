# 🔧 Frontend Build Fix - npm ci Error

**Last Updated**: 2026-01-06
**Error**: `ERROR [frontend 5/7] RUN npm ci --prefer-offline --no-audit --progress=false && npm cache clean --force`
**Priority**: HIGH

---

## Problem

The frontend Docker image is failing to build during the `npm ci` step. This prevents the frontend container from starting.

**Error Location**: [frontend/Dockerfile:27-28](frontend/Dockerfile#L27-L28)

```dockerfile
RUN npm ci --prefer-offline --no-audit --progress=false \
    && npm cache clean --force
```

---

## Root Causes

The `npm ci` error can occur due to:

1. **Corrupted package-lock.json** - Lock file is out of sync with package.json
2. **Network/Registry issues** - npm registry connectivity problems during build
3. **Package version conflicts** - Incompatible dependency versions
4. **Cache issues** - Stale Docker build cache
5. **Node version mismatch** - Using Node 22 which may have compatibility issues with some packages

---

## Solution Options

### Option 1: Regenerate package-lock.json (RECOMMENDED)

The package-lock.json may be corrupted or out of sync.

```bash
# Navigate to frontend directory
cd frontend

# Delete existing lock file and node_modules
rm -rf package-lock.json node_modules

# Regenerate package-lock.json
npm install

# Commit the new lock file
git add package-lock.json
git commit -m "fix: Regenerate package-lock.json for Docker build"

# Try building again
cd ..
docker compose build frontend --no-cache
docker compose up -d frontend
```

### Option 2: Use npm install instead of npm ci

If regenerating doesn't work, modify the Dockerfile to use `npm install`:

**Edit [frontend/Dockerfile:27-28](frontend/Dockerfile#L27-L28)**:

```dockerfile
# Change from npm ci to npm install
RUN npm install --prefer-offline --no-audit --progress=false \
    && npm cache clean --force
```

**Note**: `npm install` is more forgiving but slower. It's a good temporary fix.

### Option 3: Disable prefer-offline

The `--prefer-offline` flag might be causing issues. Try removing it:

**Edit [frontend/Dockerfile:27-28](frontend/Dockerfile#L27-L28)**:

```dockerfile
# Remove --prefer-offline flag
RUN npm ci --no-audit --progress=false \
    && npm cache clean --force
```

### Option 4: Add retry logic

Add retry logic to handle transient network issues:

**Edit [frontend/Dockerfile:27-28](frontend/Dockerfile#L27-L28)**:

```dockerfile
# Add retries for npm ci
RUN npm ci --no-audit --progress=false --prefer-offline || \
    npm ci --no-audit --progress=false || \
    npm install --no-audit --progress=false \
    && npm cache clean --force
```

### Option 5: Downgrade Node version

Node 22 is very recent and may have compatibility issues. Try Node 20 LTS:

**Edit [frontend/Dockerfile:1](frontend/Dockerfile#L1)**:

```dockerfile
# Change from Node 22 to Node 20 LTS
FROM node:20-alpine
```

Then rebuild:

```bash
docker compose build frontend --no-cache
docker compose up -d frontend
```

---

## Step-by-Step Fix Procedure

### Step 1: Clean Docker Build Cache

```bash
# Stop all containers
docker compose down

# Remove frontend image and build cache
docker rmi bvs_framework-frontend -f
docker builder prune -f

# Clean Docker system (OPTIONAL - removes all unused data)
# docker system prune -a -f
```

### Step 2: Check package.json and package-lock.json

```bash
cd frontend

# Verify package.json is valid JSON
cat package.json | python -m json.tool > /dev/null && echo "✓ package.json is valid" || echo "✗ package.json is INVALID"

# Check if package-lock.json exists
test -f package-lock.json && echo "✓ package-lock.json exists" || echo "✗ package-lock.json MISSING"

# Verify package-lock.json is valid JSON (if exists)
test -f package-lock.json && cat package-lock.json | python -m json.tool > /dev/null && echo "✓ package-lock.json is valid" || echo "✗ package-lock.json is INVALID"

cd ..
```

### Step 3: Try Building with Detailed Output

```bash
# Build with verbose output to see the exact error
docker compose build frontend --no-cache --progress=plain
```

**Look for**:
- Specific package causing the error
- Network timeout errors
- Permission errors
- Version conflict messages

### Step 4: Apply Appropriate Fix

Based on the error from Step 3, choose one of the solutions above:

- **If "checksum mismatch"** → Option 1 (regenerate package-lock.json)
- **If "network timeout"** → Option 3 or 4 (disable prefer-offline or add retries)
- **If "package not compatible"** → Option 5 (downgrade Node version)
- **If "EINTEGRITY error"** → Option 1 (regenerate package-lock.json)

### Step 5: Rebuild and Verify

```bash
# Rebuild frontend
docker compose build frontend --no-cache

# Start services
docker compose up -d

# Check frontend logs
docker compose logs frontend --tail=50

# Verify frontend is running
docker compose ps frontend
# Should show "Up"

# Test frontend
curl http://localhost:3000
# Should return HTML (not connection refused)
```

---

## Quick Fix (Emergency)

If you need the system running ASAP, use this workaround:

**1. Skip Docker build for frontend - run locally**:

```bash
# Stop Docker frontend
docker compose stop frontend

# Navigate to frontend
cd frontend

# Install dependencies locally
npm install

# Run frontend locally
npm run dev
```

Frontend will run on http://localhost:3000 and connect to the Dockerized backend on http://localhost:8000.

**2. Or use simpler Dockerfile temporarily**:

Create `frontend/Dockerfile.simple`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Update [docker-compose.yml:45](docker-compose.yml#L45):

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.simple  # Use simple Dockerfile
```

Then rebuild:

```bash
docker compose build frontend --no-cache
docker compose up -d frontend
```

---

## Common npm ci Errors & Solutions

### Error: "Checksum mismatch"

```
npm ERR! sha512-... integrity checksum failed
```

**Fix**: Regenerate package-lock.json (Option 1)

### Error: "EINTEGRITY"

```
npm ERR! code EINTEGRITY
npm ERR! Verification failed while extracting...
```

**Fix**: Clear npm cache and regenerate lock file:

```bash
cd frontend
rm -rf package-lock.json node_modules
npm cache clean --force
npm install
cd ..
docker compose build frontend --no-cache
```

### Error: "Network timeout"

```
npm ERR! network request to https://registry.npmjs.org/... failed
```

**Fix**:
1. Check internet connection
2. Try again (network issues are often transient)
3. Use Option 4 (add retry logic)

### Error: "Package not compatible with node version"

```
npm ERR! engine Unsupported engine
npm ERR! Not compatible with your version of node/npm
```

**Fix**: Downgrade to Node 20 LTS (Option 5)

### Error: "Permission denied"

```
npm ERR! code EACCES
npm ERR! syscall mkdir
```

**Fix**: Already handled in Dockerfile with `USER root`, but you can add:

```dockerfile
RUN npm config set unsafe-perm true
```

---

## Prevention

To prevent this issue in the future:

1. **Always commit package-lock.json**:
   ```bash
   git add package-lock.json
   git commit -m "chore: Update package-lock.json"
   ```

2. **Use exact versions in package.json** instead of `^` or `~`:
   ```json
   "dependencies": {
     "next": "16.1.0",  // ✓ Good - exact version
     "react": "^19.2.3"  // ⚠️ Risky - allows patch updates
   }
   ```

3. **Test Docker builds before committing**:
   ```bash
   docker compose build frontend --no-cache
   ```

4. **Use Node LTS versions** (20.x) instead of bleeding edge (22.x)

5. **Regularly update dependencies**:
   ```bash
   npm outdated
   npm update
   npm audit fix
   ```

---

## Verification Checklist

After fixing, verify:

- [ ] `docker compose build frontend --no-cache` completes successfully
- [ ] `docker compose up -d frontend` starts without errors
- [ ] `docker compose ps frontend` shows "Up" status
- [ ] `docker compose logs frontend` shows "ready started server on 0.0.0.0:3000"
- [ ] `curl http://localhost:3000` returns HTML
- [ ] Frontend accessible in browser at http://localhost:3000
- [ ] No "AxiosError 500" in browser console

---

## Related Issues

If frontend builds but still has errors:

1. **Backend connection issues** → See [IMMEDIATE_ACTIONS.md](IMMEDIATE_ACTIONS.md)
2. **Environment variables** → Check `.env` file and [docker-compose.yml:56-65](docker-compose.yml#L56-L65)
3. **API errors** → See [QUICK_FIX.md](QUICK_FIX.md)
4. **Performance issues** → Check memory limits in [docker-compose.yml:69-74](docker-compose.yml#L69-L74)

---

## Summary

**Most Common Fix** (90% of cases):
```bash
cd frontend
rm -rf package-lock.json node_modules
npm install
cd ..
docker compose build frontend --no-cache
docker compose up -d
```

**Quick Workaround** (if build still fails):
```bash
# Run frontend locally instead of in Docker
cd frontend
npm install
npm run dev
```

**Last Resort** (if nothing works):
- Downgrade to Node 20 LTS in Dockerfile
- Use `npm install` instead of `npm ci`
- Report the issue with full build logs

---

**Need help?** Capture the full build output:
```bash
docker compose build frontend --no-cache --progress=plain > frontend_build_log.txt 2>&1
```

Then review the log to identify the exact error.
