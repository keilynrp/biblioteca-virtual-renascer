@echo off
REM Quick Frontend Access Diagnostic
REM Tests if frontend is reachable from Windows

echo ============================================
echo   FRONTEND ACCESS TEST (Windows)
echo ============================================
echo.

echo [1/4] Testing localhost:3000...
curl -s -o nul -w "HTTP Status: %%{http_code} | Time: %%{time_total}s\n" http://localhost:3000
echo.

echo [2/4] Testing 127.0.0.1:3000...
curl -s -o nul -w "HTTP Status: %%{http_code} | Time: %%{time_total}s\n" http://127.0.0.1:3000
echo.

echo [3/4] Getting actual HTML content...
curl -s http://localhost:3000 | findstr /C:"<!DOCTYPE" /C:"<html" /C:"<title"
echo.

echo [4/4] Checking if browser can be opened...
echo Opening frontend in default browser...
start http://127.0.0.1:3000
echo.

echo ============================================
echo   RESULTS
echo ============================================
echo.
echo If curl shows HTTP 200 but browser doesn't work:
echo   - Clear browser cache (Ctrl+Shift+Del)
echo   - Try incognito mode (Ctrl+Shift+N/P)
echo   - Disable browser extensions
echo   - Try URL: http://127.0.0.1:3000
echo.
echo If curl shows errors:
echo   - Run: wsl docker compose restart frontend
echo   - Check: wsl docker compose ps
echo.
pause
