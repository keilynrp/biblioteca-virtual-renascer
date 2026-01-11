@echo off
REM Script to disable SSL and return to HTTP configuration

echo ================================================
echo Disabling SSL and reverting to HTTP
echo ================================================
echo.

echo [1/3] Stopping SSL-enabled containers...
docker compose -f docker-compose.ssl.yml down
echo.

echo [2/3] Restoring HTTP configuration...
copy /Y frontend\.env.local.backup frontend\.env.local >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend configuration restored
) else (
    echo ⚠️  No backup found. Manually update NEXT_PUBLIC_API_URL to http://localhost:8000/api
)
echo.

echo [3/3] Starting containers with HTTP...
docker compose up -d
echo.

echo ================================================
echo SSL Disabled Successfully
echo ================================================
echo.
echo Services are now running with HTTP:
echo   - Frontend:     http://localhost:3000
echo   - Backend API:  http://localhost:8000/api
echo   - Django Admin: http://localhost:8000/admin
echo.
echo ================================================

pause
