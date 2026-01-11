# Restart Backend Container
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reiniciando Backend Container" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    $dockerVersion = docker --version
    Write-Host "Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop o agrégalo al PATH" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Change to project directory
Set-Location -Path "d:\bvs_framework"

Write-Host ""
Write-Host "Reiniciando contenedor del backend..." -ForegroundColor Yellow

# Try docker compose (new syntax)
try {
    docker compose restart backend
    Write-Host ""
    Write-Host "✓ Backend reiniciado exitosamente!" -ForegroundColor Green
    Write-Host "El cambio de X-Frame-Options ya debería estar activo." -ForegroundColor Green
} catch {
    # Try docker-compose (old syntax) as fallback
    try {
        docker-compose restart backend
        Write-Host ""
        Write-Host "✓ Backend reiniciado exitosamente!" -ForegroundColor Green
        Write-Host "El cambio de X-Frame-Options ya debería estar activo." -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "ERROR: No se pudo reiniciar el backend" -ForegroundColor Red
        Write-Host "Por favor reinicia manualmente desde Docker Desktop" -ForegroundColor Yellow
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

Write-Host ""
Write-Host "Puedes cerrar esta ventana y recargar la página del visor PDF" -ForegroundColor Cyan
Write-Host ""

Read-Host "Presiona Enter para salir"
