# Script PowerShell para configurar WSL para 16GB RAM
# Ejecutar desde PowerShell con privilegios de administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURANDO WSL PARA 16GB DE RAM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar RAM del sistema
Write-Host "[1/5] Verificando RAM del sistema..." -ForegroundColor Yellow
$totalRAM = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB
Write-Host "RAM Total: $([math]::Round($totalRAM, 2)) GB" -ForegroundColor Green

if ($totalRAM -lt 15) {
    Write-Host "ADVERTENCIA: Tienes menos de 16GB. Ajustando configuración..." -ForegroundColor Yellow
    $wslMemory = "8GB"
} else {
    Write-Host "OK: Sistema con 16GB o más detectado" -ForegroundColor Green
    $wslMemory = "10GB"
}
Write-Host ""

# Paso 2: Verificar si existe .wslconfig
Write-Host "[2/5] Verificando archivo .wslconfig..." -ForegroundColor Yellow
$wslConfigPath = "$env:USERPROFILE\.wslconfig"

if (Test-Path $wslConfigPath) {
    Write-Host "Archivo existente encontrado en: $wslConfigPath" -ForegroundColor Yellow

    # Hacer backup
    $backupPath = "$env:USERPROFILE\.wslconfig.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $wslConfigPath $backupPath
    Write-Host "Backup creado en: $backupPath" -ForegroundColor Green
} else {
    Write-Host "No existe .wslconfig, se creará uno nuevo" -ForegroundColor Green
}
Write-Host ""

# Paso 3: Crear nueva configuración
Write-Host "[3/5] Creando configuración optimizada..." -ForegroundColor Yellow

$configContent = @"
[wsl2]
memory=$wslMemory
processors=4
swap=4GB
localhostForwarding=true
"@

Set-Content -Path $wslConfigPath -Value $configContent -Force
Write-Host "Archivo creado/actualizado en: $wslConfigPath" -ForegroundColor Green
Write-Host ""
Write-Host "Contenido:" -ForegroundColor Cyan
Get-Content $wslConfigPath | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
Write-Host ""

# Paso 4: Apagar WSL
Write-Host "[4/5] Apagando WSL para aplicar cambios..." -ForegroundColor Yellow
wsl --shutdown

Write-Host "Esperando 10 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "OK!" -ForegroundColor Green
Write-Host ""

# Paso 5: Verificar
Write-Host "[5/5] Verificando configuración..." -ForegroundColor Yellow
Write-Host "Iniciando WSL..." -ForegroundColor Yellow

$wslTest = wsl -e bash -c "echo 'WSL iniciado correctamente' && free -h | grep Mem"

if ($LASTEXITCODE -eq 0) {
    Write-Host "WSL iniciado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Memoria en WSL:" -ForegroundColor Cyan
    wsl -e free -h
} else {
    Write-Host "Error al iniciar WSL" -ForegroundColor Red
    Write-Host "Intenta reiniciar manualmente: wsl" -ForegroundColor Yellow
}
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION APLICADA CON EXITO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuración WSL:" -ForegroundColor Green
Write-Host "  - Memoria: $wslMemory (de $([math]::Round($totalRAM, 0))GB totales)" -ForegroundColor White
Write-Host "  - Procesadores: 4" -ForegroundColor White
Write-Host "  - Swap: 4GB" -ForegroundColor White
Write-Host ""
Write-Host "Docker ahora puede usar hasta ~8GB de RAM" -ForegroundColor Green
Write-Host "para contenedores sin problemas." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SIGUIENTE PASO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ejecuta desde WSL:" -ForegroundColor Yellow
Write-Host "  wsl" -ForegroundColor White
Write-Host "  cd /mnt/d/bvs_framework" -ForegroundColor White
Write-Host "  chmod +x INSTALAR_Y_OPTIMIZAR.sh" -ForegroundColor White
Write-Host "  ./INSTALAR_Y_OPTIMIZAR.sh" -ForegroundColor White
Write-Host ""
Write-Host "O directamente desde PowerShell:" -ForegroundColor Yellow
Write-Host '  wsl bash -c "cd /mnt/d/bvs_framework && chmod +x INSTALAR_Y_OPTIMIZAR.sh && ./INSTALAR_Y_OPTIMIZAR.sh"' -ForegroundColor White
Write-Host ""

Write-Host "Presiona Enter para continuar..." -ForegroundColor Cyan
Read-Host
