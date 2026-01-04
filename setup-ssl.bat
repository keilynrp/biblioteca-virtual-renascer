@echo off
REM Script to setup and start services with SSL

echo ================================================
echo SSL Setup for BVS Framework
echo ================================================
echo.

REM Step 1: Check if certificates exist
if not exist "ssl\localhost.crt" (
    echo [1/4] SSL certificates not found. Generating...
    cd ssl
    call generate-certs.bat
    cd ..
) else (
    echo [1/4] SSL certificates already exist. Skipping generation.
)

echo.
echo ================================================
echo Certificate Information:
echo ================================================
openssl x509 -in ssl\localhost.crt -noout -subject -dates 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not read certificate. Please regenerate.
    pause
    exit /b 1
)
echo.

REM Step 2: Stop existing containers
echo [2/4] Stopping existing containers...
docker compose down 2>nul
echo.

REM Step 3: Copy SSL environment file
echo [3/4] Configuring frontend for HTTPS...
copy /Y frontend\.env.ssl frontend\.env.local >nul 2>&1
echo Frontend configured for HTTPS
echo.

REM Step 4: Start containers with SSL configuration
echo [4/4] Starting containers with SSL...
docker compose -f docker-compose.ssl.yml up -d
echo.

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ================================================
echo SSL Setup Complete!
echo ================================================
echo.
echo Services are now running with HTTPS:
echo.
echo   - Frontend:       https://localhost
echo   - Backend API:    https://localhost/api
echo   - Django Admin:   https://localhost/admin
echo   - Elasticsearch:  https://localhost:9201 (optional)
echo.
echo IMPORTANT:
echo   1. You must trust the SSL certificate in your browser
echo   2. On first visit, you'll see a security warning
echo   3. Click "Advanced" and "Proceed to localhost"
echo.
echo To trust the certificate permanently:
echo   1. Double-click ssl\localhost.crt
echo   2. Install to "Trusted Root Certification Authorities"
echo.
echo To view logs: docker compose -f docker-compose.ssl.yml logs -f
echo To stop: docker compose -f docker-compose.ssl.yml down
echo.
echo ================================================

pause
