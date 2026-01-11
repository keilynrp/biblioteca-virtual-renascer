@echo off
echo ========================================
echo Rebuilding Frontend Docker Container
echo ========================================
echo.
echo This will rebuild the frontend container with Node.js 22
echo to fix the Node.js version compatibility issue.
echo.

docker compose build --no-cache frontend

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Frontend container rebuilt successfully!
    echo ========================================
    echo.
    echo Now restart your containers with:
    echo docker compose up -d frontend
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to rebuild frontend container
    echo ========================================
    echo.
)

pause
