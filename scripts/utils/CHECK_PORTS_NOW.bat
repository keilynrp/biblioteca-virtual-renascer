@echo off
chcp 65001 >nul
cls
echo ============================================================
echo DIAGNÓSTICO RÁPIDO DE PUERTOS
echo ============================================================
echo.

echo [Estado de Contenedores]
docker ps --format "table {{.Names}}\t{{.Status}}"
echo.

echo [Puertos Expuestos]
docker ps --format "table {{.Names}}\t{{.Ports}}"
echo.

echo [Health Status]
echo Frontend:
docker inspect bvs_framework-frontend-1 -f "{{.State.Health.Status}}" 2>nul || echo NO DISPONIBLE
echo Backend:
docker inspect bvs_framework-backend-1 -f "{{.State.Health.Status}}" 2>nul || echo NO DISPONIBLE
echo.

echo [Últimos Logs - FRONTEND]
echo ============================================================
docker logs --tail 20 bvs_framework-frontend-1 2>&1
echo.

echo [Últimos Logs - BACKEND]
echo ============================================================
docker logs --tail 20 bvs_framework-backend-1 2>&1
echo.

echo [Test de Puertos en Windows]
powershell -Command "Write-Host 'Puerto 3000:' -NoNewline; if (Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue) { Write-Host ' ABIERTO' -ForegroundColor Green } else { Write-Host ' CERRADO' -ForegroundColor Red }"
powershell -Command "Write-Host 'Puerto 8000:' -NoNewline; if (Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue) { Write-Host ' ABIERTO' -ForegroundColor Green } else { Write-Host ' CERRADO' -ForegroundColor Red }"
echo.

pause
