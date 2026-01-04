Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO DE PUERTOS - Backend y Frontend" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] Estado de contenedores Docker:" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

Write-Host "[2] Verificando puertos en Windows:" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "Puerto 3000 (Frontend):" -ForegroundColor White
netstat -ano | Select-String ":3000"
Write-Host ""
Write-Host "Puerto 8000 (Backend):" -ForegroundColor White
netstat -ano | Select-String ":8000"
Write-Host ""

Write-Host "[3] Probando conexion TCP a los puertos:" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "Frontend (localhost:3000):" -ForegroundColor White
Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet
Write-Host "Backend (localhost:8000):" -ForegroundColor White
Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet
Write-Host ""

Write-Host "[4] Logs del Frontend (ultimas 50 lineas):" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
docker logs --tail 50 bvs_framework-frontend-1 2>&1
Write-Host ""

Write-Host "[5] Logs del Backend (ultimas 50 lineas):" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
docker logs --tail 50 bvs_framework-backend-1 2>&1
Write-Host ""

Write-Host "[6] Configuracion de puertos del Frontend:" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
docker inspect bvs_framework-frontend-1 --format="{{json .NetworkSettings.Ports}}" 2>&1 | ConvertFrom-Json | Format-List
Write-Host ""

Write-Host "[7] Configuracion de puertos del Backend:" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
docker inspect bvs_framework-backend-1 --format="{{json .NetworkSettings.Ports}}" 2>&1 | ConvertFrom-Json | Format-List
Write-Host ""

Write-Host "[8] Estado de salud (Health) de los contenedores:" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "Frontend:" -ForegroundColor White
docker inspect bvs_framework-frontend-1 --format="{{.State.Health.Status}}" 2>&1
Write-Host "Backend:" -ForegroundColor White
docker inspect bvs_framework-backend-1 --format="{{.State.Health.Status}}" 2>&1
Write-Host ""

Write-Host "[9] Verificando procesos DENTRO de los contenedores:" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "Procesos en Frontend:" -ForegroundColor White
docker exec bvs_framework-frontend-1 ps aux 2>&1 | Select-String -Pattern "node|npm" -Context 0,2
Write-Host ""
Write-Host "Procesos en Backend:" -ForegroundColor White
docker exec bvs_framework-backend-1 ps aux 2>&1 | Select-String -Pattern "python|gunicorn" -Context 0,2
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "RESUMEN DEL DIAGNOSTICO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "POSIBLES CAUSAS si los puertos no responden:" -ForegroundColor Red
Write-Host "1. Los servicios dentro del contenedor no iniciaron correctamente" -ForegroundColor White
Write-Host "2. El healthcheck esta fallando" -ForegroundColor White
Write-Host "3. Error en las dependencias (db, redis, elasticsearch)" -ForegroundColor White
Write-Host "4. Memoria insuficiente - contenedor reiniciandose constantemente" -ForegroundColor White
Write-Host "5. Error en el codigo que impide que el servidor inicie" -ForegroundColor White
Write-Host ""
Write-Host "Revisa los logs arriba para identificar el error especifico." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
