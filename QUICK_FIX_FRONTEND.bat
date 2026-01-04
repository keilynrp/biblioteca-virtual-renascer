@echo off
color 0A
echo.
echo ============================================================
echo    SOLUCION RAPIDA - FRONTEND LENTO
echo ============================================================
echo.

echo Reiniciando frontend (mantiene cache para ser mas rapido)...
echo.
docker compose restart frontend
echo.

echo Esperando 20 segundos a que compile...
echo.
timeout /t 20 /nobreak
echo.

echo ============================================================
echo ✅ LISTO!
echo ============================================================
echo.
echo Abre: http://localhost:3000/dashboard
echo.
echo Si aun es lento, ejecuta: FIX_SLOW_FRONTEND.bat
echo.
pause
