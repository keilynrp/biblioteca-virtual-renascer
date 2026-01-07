@echo off
REM ============================================================================
REM Backend Startup - Windows Wrapper
REM ============================================================================
REM This script provides easy access to backend scripts on Windows
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║           Backend Startup - Windows Helper              ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Git Bash is available
where bash >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git Bash not found. Please install Git for Windows.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Select an option:
echo.
echo  1. Start backend (normal)
echo  2. Start backend (skip build - faster)
echo  3. Start backend (fresh - clean start)
echo  4. Fix backend issues (diagnostic tool)
echo  5. View backend logs
echo  6. Stop all services
echo  7. Restart all services
echo  8. Create Django superuser
echo  9. Django shell
echo  0. Exit
echo.

set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" (
    echo Starting backend...
    bash scripts/start_backend_optimized.sh
) else if "%choice%"=="2" (
    echo Starting backend (skip build)...
    bash scripts/start_backend_optimized.sh --skip-build
) else if "%choice%"=="3" (
    echo Starting backend (fresh)...
    bash scripts/start_backend_optimized.sh --fresh
) else if "%choice%"=="4" (
    echo Launching diagnostic tool...
    bash scripts/fix_backend_issues.sh
) else if "%choice%"=="5" (
    echo Showing backend logs...
    docker-compose logs -f backend
) else if "%choice%"=="6" (
    echo Stopping all services...
    docker-compose down
    echo Done!
    pause
) else if "%choice%"=="7" (
    echo Restarting all services...
    docker-compose restart
    echo Done!
    pause
) else if "%choice%"=="8" (
    echo Creating superuser...
    docker-compose exec backend python manage.py createsuperuser
    pause
) else if "%choice%"=="9" (
    echo Opening Django shell...
    docker-compose exec backend python manage.py shell
) else if "%choice%"=="0" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid option!
    pause
    goto :eof
)

endlocal
