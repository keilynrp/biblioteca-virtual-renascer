@echo off
REM Script to fix book covers not showing

echo ================================================
echo Book Covers Fix - Diagnostic and Repair
echo ================================================
echo.

echo [1/5] Testing backend API...
curl -s http://localhost:8000/api/content/books/?page_size=1 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend API is responding
) else (
    echo ❌ Backend API is not responding
    echo    Start backend: docker compose up -d backend
    pause
    exit /b 1
)
echo.

echo [2/5] Testing image URL directly...
curl -I http://localhost:8000/media/books/covers/also-sprach-zarathustra.jpg 2>nul | findstr "200 OK" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Images are accessible from backend
) else (
    echo ⚠️  Sample image not found or backend not serving media files
)
echo.

echo [3/5] Checking Next.js configuration...
findstr "localhost" frontend\next.config.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Next.js image configuration found
) else (
    echo ❌ Next.js image configuration missing
)
echo.

echo [4/5] Restarting services to apply configuration...
echo    This will restart backend and frontend containers
echo.
docker compose restart backend frontend
echo.
echo    Waiting 15 seconds for services to start...
timeout /t 15 /nobreak >nul
echo.

echo [5/5] Verifying services are running...
docker compose ps | findstr "backend.*Up" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend is running
) else (
    echo ⚠️  Backend may not be running properly
)

docker compose ps | findstr "frontend.*Up" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend is running
) else (
    echo ⚠️  Frontend may not be running properly
)
echo.

echo ================================================
echo Fix Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Open your browser to: http://localhost:3000
echo 2. Clear browser cache: Ctrl + Shift + R (hard refresh)
echo 3. Navigate to the library page
echo.
echo If images still don't appear:
echo   - Check browser console (F12) for errors
echo   - Verify the URL format in Network tab
echo   - Try opening an image URL directly in browser
echo.
echo ================================================

pause
