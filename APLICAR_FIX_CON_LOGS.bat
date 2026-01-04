@echo off
cls
echo ========================================
echo Aplicando Fix con Manejo de Errores
echo ========================================
echo.

echo Se agrego manejo de errores al endpoint dashboard_stats
echo para identificar exactamente que esta fallando.
echo.

echo [1/4] Reiniciando backend...
docker compose restart backend
echo Esperando 10 segundos...
timeout /t 10 /nobreak > nul
echo [OK] Backend reiniciado
echo.

echo [2/4] Probando endpoint...
curl http://localhost:8000/api/content/dashboard/stats/
echo.
echo.

echo [3/4] Mostrando logs del backend (ultimas 50 lineas)...
docker compose logs --tail=50 backend
echo.

echo [4/4] Buscando errores especificos...
docker compose logs --tail=100 backend | findstr /i "Error fetching dashboard_stats"
echo.

echo ========================================
echo Analisis Completado
echo ========================================
echo.
echo Si ves un error en el JSON arriba, los logs mostraran la causa exacta.
echo.
echo Posibles causas y soluciones:
echo.
echo 1. "No such table" o "relation does not exist"
echo    Solucion: docker compose exec backend python manage.py migrate
echo.
echo 2. "Cannot assign None" o "NoneType"
echo    Solucion: Hay datos null en la base de datos
echo.
echo 3. Error con serializer
echo    Solucion: Verificar BookListSerializer
echo.
pause
