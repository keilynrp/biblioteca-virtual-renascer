@echo off
echo ========================================
echo   FIX: Docker Compose Python 3.13
echo ========================================
echo.
echo This will fix the docker-compose compatibility issue with Python 3.13
echo by removing the old docker-compose v1 and using Docker Compose V2
echo.

echo [1] Checking current Docker Compose version...
wsl docker compose version
if %errorlevel% neq 0 (
    echo ✗ Docker Compose V2 not found
    echo Please install Docker Desktop for Windows
    pause
    exit /b 1
)

echo.
echo [2] Removing old docker-compose v1...
wsl sudo rm -f /usr/bin/docker-compose /usr/local/bin/docker-compose 2>nul
echo ✓ Removed old docker-compose

echo.
echo [3] Creating docker-compose wrapper for V2...
wsl bash -c "echo '#!/bin/bash' | sudo tee /usr/local/bin/docker-compose > /dev/null"
wsl bash -c "echo 'exec docker compose \"$@\"' | sudo tee -a /usr/local/bin/docker-compose > /dev/null"
wsl sudo chmod +x /usr/local/bin/docker-compose
echo ✓ Created docker-compose wrapper

echo.
echo [4] Verifying installation...
wsl docker-compose version
if %errorlevel% neq 0 (
    echo ✗ Verification failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ FIX APLICADO EXITOSAMENTE
echo ========================================
echo.
echo Ahora puedes ejecutar tus scripts normalmente.
echo El comando 'docker-compose' ahora usa Docker Compose V2
echo.
pause
