# Script para iniciar el proyecto con Docker
# PowerShell script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Iniciando BVS Framework con Docker" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está corriendo
Write-Host "Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker Desktop no está corriendo." -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop e intenta nuevamente." -ForegroundColor Red
    Write-Host ""
    Write-Host "Presiona Enter para intentar abrir Docker Desktop..." -ForegroundColor Yellow
    Read-Host
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Esperando a que Docker Desktop inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    exit 1
}

Write-Host "Docker está corriendo correctamente." -ForegroundColor Green
Write-Host ""

# Detener contenedores existentes
Write-Host "Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Construir e iniciar los servicios
Write-Host ""
Write-Host "Construyendo e iniciando servicios..." -ForegroundColor Yellow
Write-Host "Esto puede tomar varios minutos la primera vez..." -ForegroundColor Yellow
Write-Host ""

docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "Servicios iniciados correctamente!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs de los servicios:" -ForegroundColor Cyan
    Write-Host "  Frontend:     http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend:      http://localhost:8000" -ForegroundColor White
    Write-Host "  Admin Django: http://localhost:8000/admin" -ForegroundColor White
    Write-Host "  MeiliSearch:  http://localhost:7700" -ForegroundColor White
    Write-Host "  PostgreSQL:   localhost:5432" -ForegroundColor White
    Write-Host "  Redis:        localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor Cyan
    Write-Host "  Ver logs:           docker-compose logs -f" -ForegroundColor White
    Write-Host "  Ver estado:         docker-compose ps" -ForegroundColor White
    Write-Host "  Detener servicios:  docker-compose down" -ForegroundColor White
    Write-Host "  Reiniciar:          docker-compose restart" -ForegroundColor White
    Write-Host ""
    Write-Host "Verificando estado de los servicios..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    docker-compose ps
} else {
    Write-Host ""
    Write-Host "ERROR: Hubo un problema al iniciar los servicios." -ForegroundColor Red
    Write-Host "Revisa los logs con: docker-compose logs" -ForegroundColor Yellow
}
