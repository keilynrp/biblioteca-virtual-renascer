@echo off
chcp 65001 >nul
cls

echo ================================================================
echo     VERIFICACION COMPLETA DE ACCESO
echo ================================================================
echo.

echo [1] Estado de contenedores:
echo ================================================================
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=bvs_framework"
echo.

echo [2] Test de puerto 3000 (Frontend):
echo ================================================================
powershell -Command "$result = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue; if ($result) { Write-Host '[OK] Puerto 3000 ABIERTO - Frontend accesible' -ForegroundColor Green } else { Write-Host '[ERROR] Puerto 3000 CERRADO' -ForegroundColor Red }"
echo.

echo [3] Test de puerto 8000 (Backend):
echo ================================================================
powershell -Command "$result = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue; if ($result) { Write-Host '[OK] Puerto 8000 ABIERTO - Backend accesible' -ForegroundColor Green } else { Write-Host '[ERROR] Puerto 8000 CERRADO' -ForegroundColor Red }"
echo.

echo [4] Test HTTP al Backend (Admin):
echo ================================================================
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/admin/' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; Write-Host '[OK] Backend responde HTTP - Status:' $response.StatusCode -ForegroundColor Green } catch { Write-Host '[ERROR] Backend no responde HTTP:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [5] Test HTTP al Frontend:
echo ================================================================
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; Write-Host '[OK] Frontend responde HTTP - Status:' $response.StatusCode -ForegroundColor Green } catch { Write-Host '[ERROR] Frontend no responde HTTP:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [6] Últimos logs del Backend (10 líneas):
echo ================================================================
docker logs --tail 10 bvs_framework-backend-1 2>&1
echo.

echo [7] Últimos logs del Frontend (10 líneas):
echo ================================================================
docker logs --tail 10 bvs_framework-frontend-1 2>&1
echo.

echo ================================================================
echo     RESUMEN
echo ================================================================
echo.
echo URLs para abrir en tu navegador:
echo.
echo   Frontend:      http://localhost:3000
echo   Backend Admin: http://localhost:8000/admin/
echo   API Docs:      http://localhost:8000/api/docs/
echo.
echo Si ambos puertos muestran [OK] arriba, ya puedes acceder.
echo Si alguno muestra [ERROR], revisa los logs arriba.
echo ================================================================
echo.
pause
