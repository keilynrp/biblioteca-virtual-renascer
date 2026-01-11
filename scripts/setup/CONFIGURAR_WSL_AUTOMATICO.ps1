# Script para Configurar Memoria de WSL2 Automáticamente
# Ejecutar en PowerShell como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuración Automática de WSL2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ADVERTENCIA] No se está ejecutando como Administrador" -ForegroundColor Yellow
    Write-Host "Algunas operaciones pueden fallar. Presiona Ctrl+C para cancelar" -ForegroundColor Yellow
    Write-Host "o presiona Enter para continuar de todos modos..." -ForegroundColor Yellow
    Read-Host
}

# Paso 1: Detectar memoria del sistema
Write-Host "[1/5] Detectando memoria del sistema..." -ForegroundColor Green
$totalRAM = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB
$totalRAM = [math]::Round($totalRAM, 2)
Write-Host "RAM Total: $totalRAM GB" -ForegroundColor White

# Calcular memoria para WSL (75% de la RAM total, máximo 8GB)
$wslMemory = [math]::Min([math]::Floor($totalRAM * 0.75), 8)
Write-Host "Memoria asignada a WSL: $wslMemory GB" -ForegroundColor White
Write-Host ""

# Paso 2: Crear archivo .wslconfig
Write-Host "[2/5] Creando archivo .wslconfig..." -ForegroundColor Green
$wslConfigPath = "$env:USERPROFILE\.wslconfig"

$wslConfigContent = @"
[wsl2]
memory=${wslMemory}GB
processors=4
swap=2GB
localhostForwarding=true

# Límites adicionales para mejor rendimiento
pageReporting=true
kernelCommandLine=cgroup_memory=1 cgroup_enable=memory swapaccount=1
"@

try {
    $wslConfigContent | Out-File -FilePath $wslConfigPath -Encoding ASCII -Force
    Write-Host "[OK] Archivo .wslconfig creado en: $wslConfigPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contenido del archivo:" -ForegroundColor Cyan
    Get-Content $wslConfigPath | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""
} catch {
    Write-Host "[ERROR] No se pudo crear .wslconfig: $_" -ForegroundColor Red
    exit 1
}

# Paso 3: Verificar WSL instalado
Write-Host "[3/5] Verificando instalación de WSL..." -ForegroundColor Green
try {
    $wslList = wsl --list --verbose 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] WSL no está instalado o no está configurado correctamente" -ForegroundColor Red
        Write-Host "Instala WSL con: wsl --install" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] WSL está instalado" -ForegroundColor Green
    Write-Host ""
    Write-Host "Distribuciones WSL instaladas:" -ForegroundColor Cyan
    Write-Host $wslList -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "[ERROR] No se pudo verificar WSL: $_" -ForegroundColor Red
    exit 1
}

# Paso 4: Detener WSL
Write-Host "[4/5] Reiniciando WSL para aplicar cambios..." -ForegroundColor Green
Write-Host "Deteniendo todas las instancias de WSL..." -ForegroundColor Yellow

try {
    wsl --shutdown
    Write-Host "[OK] WSL detenido" -ForegroundColor Green

    # Esperar a que WSL se detenga completamente
    Write-Host "Esperando 8 segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8

    Write-Host "[OK] WSL listo para reiniciar" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] No se pudo detener WSL: $_" -ForegroundColor Red
    Write-Host "Intenta manualmente con: wsl --shutdown" -ForegroundColor Yellow
    Write-Host ""
}

# Paso 5: Verificar configuración
Write-Host "[5/5] Configuración completada" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Abre una nueva terminal de WSL (Ubuntu, Debian, etc.)" -ForegroundColor White
Write-Host ""
Write-Host "2. Verifica la memoria disponible:" -ForegroundColor White
Write-Host "   free -h" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Ve a tu proyecto:" -ForegroundColor White
Write-Host "   cd /mnt/d/bvs_framework" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Reinicia Docker:" -ForegroundColor White
Write-Host "   docker compose down" -ForegroundColor Gray
Write-Host "   docker compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Verifica que todo funciona:" -ForegroundColor White
Write-Host "   docker compose ps" -ForegroundColor Gray
Write-Host "   curl http://localhost:8000/api/" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuración guardada en:" -ForegroundColor Cyan
Write-Host $wslConfigPath -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Preguntar si desea abrir WSL ahora
$openWSL = Read-Host "¿Deseas abrir WSL ahora? (s/n)"
if ($openWSL -eq 's' -or $openWSL -eq 'S') {
    Write-Host "Abriendo WSL..." -ForegroundColor Green
    wsl
} else {
    Write-Host ""
    Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
