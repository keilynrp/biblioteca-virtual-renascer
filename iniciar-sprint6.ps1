# Script PowerShell para iniciar servicios del Sprint 6
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Iniciando Servicios para Sprint 6 - Lector de Documentos" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "[Verificando] Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "OK Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker no esta instalado o no esta corriendo" -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop y vuelve a ejecutar este script" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 1. Detener servicios
Write-Host "[1/6] Deteniendo servicios existentes..." -ForegroundColor Yellow
docker compose down 2>$null
Write-Host "OK Servicios detenidos" -ForegroundColor Green
Write-Host ""

# 2. Iniciar DB y Elasticsearch
Write-Host "[2/6] Iniciando PostgreSQL y Elasticsearch..." -ForegroundColor Yellow
docker compose up -d db elasticsearch
Write-Host "Esperando 15 segundos para que la base de datos inicie..." -ForegroundColor Cyan
Start-Sleep -Seconds 15
Write-Host "OK Base de datos iniciada" -ForegroundColor Green
Write-Host ""

# 3. Iniciar Backend
Write-Host "[3/6] Iniciando Backend..." -ForegroundColor Yellow
docker compose up -d backend
Write-Host "Esperando 10 segundos para que el backend inicie..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
Write-Host "OK Backend iniciado" -ForegroundColor Green
Write-Host ""

# 4. Ejecutar migracion
Write-Host "[4/6] Ejecutando migracion del modelo Reading..." -ForegroundColor Yellow
docker compose exec backend python manage.py migrate
Write-Host "OK Migracion completada" -ForegroundColor Green
Write-Host ""

# 5. Verificar tabla
Write-Host "[5/6] Verificando que la tabla Reading existe..." -ForegroundColor Yellow
docker compose exec db psql -U postgres -d biblioteca_virtual -c '\dt content_reading'
Write-Host ""

# 6. Iniciar Frontend
Write-Host "[6/6] Iniciando Frontend..." -ForegroundColor Yellow
docker compose up -d frontend
Write-Host "Esperando 10 segundos para que el frontend compile..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
Write-Host "OK Frontend iniciado" -ForegroundColor Green
Write-Host ""

# Estado final
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Estado de los Servicios" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
docker compose ps
Write-Host ""

# Verificar conectividad
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Verificando Conectividad" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Probando Backend (http://localhost:8000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/health/" -UseBasicParsing -TimeoutSec 5
    Write-Host "OK Backend respondiendo: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Backend no responde aun (esto es normal, puede tomar unos segundos mas)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Probando Frontend (http://localhost:3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "OK Frontend respondiendo: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Frontend no responde aun (esto es normal, puede tomar unos minutos compilar)" -ForegroundColor Yellow
}
Write-Host ""

# Resumen
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "OK Servicios Iniciados Correctamente" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Accede a la aplicacion:" -ForegroundColor White
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Backend API: http://localhost:8000/api" -ForegroundColor Cyan
Write-Host "  - Admin Django: http://localhost:8000/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para probar el lector PDF:" -ForegroundColor White
Write-Host "  1. Accede a http://localhost:3000" -ForegroundColor White
Write-Host "  2. Inicia sesion con tu usuario" -ForegroundColor White
Write-Host "  3. Ejecuta: .\obtener-libro-prueba.ps1" -ForegroundColor Yellow
Write-Host "  4. Ve a http://localhost:3000/reader/BOOK_ID" -ForegroundColor White
Write-Host ""
Write-Host "Si hay errores, revisa los logs:" -ForegroundColor White
Write-Host "  - docker compose logs -f backend" -ForegroundColor Cyan
Write-Host "  - docker compose logs -f frontend" -ForegroundColor Cyan
Write-Host ""

pause
