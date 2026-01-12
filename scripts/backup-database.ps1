# =============================================================================
# Script de Backup para PostgreSQL - Biblioteca Virtual Renascer do Saber
# =============================================================================
# Descripción: Ejecuta backup de la base de datos desde Windows
# Uso: .\backup-database.ps1 [-Manual] [-Restore <archivo>]
# Autor: BVS Framework Team
# Fecha: 2026-01-12
# =============================================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Manual,

    [Parameter(Mandatory=$false)]
    [string]$Restore
)

# Colores para output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

# Función para logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR"   { $ErrorColor }
        "SUCCESS" { $SuccessColor }
        "WARNING" { $WarningColor }
        default   { $InfoColor }
    }

    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Banner
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Backup de Base de Datos - Biblioteca Virtual Renascer        ║" -ForegroundColor Cyan
Write-Host "║  PowerShell Script para Windows                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker está corriendo
Write-Log "Verificando Docker..." "INFO"
try {
    $dockerStatus = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Docker no está corriendo. Por favor inicia Docker Desktop." "ERROR"
        exit 1
    }
    Write-Log "Docker está disponible" "SUCCESS"
} catch {
    Write-Log "Error al verificar Docker: $_" "ERROR"
    exit 1
}

# Verificar que el contenedor de backup está corriendo
Write-Log "Verificando contenedor de backup..." "INFO"
$backupContainer = docker ps --filter "name=backup" --format "{{.Names}}" 2>&1
if ($LASTEXITCODE -ne 0 -or -not $backupContainer) {
    Write-Log "El contenedor de backup no está corriendo." "ERROR"
    Write-Log "Ejecuta: docker-compose up -d backup" "INFO"
    exit 1
}
Write-Log "Contenedor de backup disponible: $backupContainer" "SUCCESS"

# Modo Restauración
if ($Restore) {
    Write-Log "Modo restauración activado" "WARNING"
    Write-Log "Archivo a restaurar: $Restore" "INFO"

    # Verificar que el archivo existe
    $backupFile = Join-Path "backups\database" $Restore
    if (-not (Test-Path $backupFile)) {
        Write-Log "Archivo no encontrado: $backupFile" "ERROR"
        Write-Log "Archivos disponibles:" "INFO"
        Get-ChildItem "backups\database\*.sql.gz" | ForEach-Object {
            Write-Host "  - $($_.Name)" -ForegroundColor Yellow
        }
        exit 1
    }

    Write-Log "¿Estás seguro de restaurar? Esto SOBRESCRIBIRÁ la base de datos actual." "WARNING"
    $confirmation = Read-Host "Escribe 'SI' para confirmar"

    if ($confirmation -ne "SI") {
        Write-Log "Restauración cancelada" "INFO"
        exit 0
    }

    Write-Log "Ejecutando restauración..." "INFO"
    docker exec $backupContainer /scripts/restore_database.sh $Restore

    if ($LASTEXITCODE -eq 0) {
        Write-Log "Restauración completada exitosamente" "SUCCESS"
    } else {
        Write-Log "Error durante la restauración" "ERROR"
        exit 1
    }

    exit 0
}

# Modo Backup Manual
if ($Manual) {
    Write-Log "Ejecutando backup manual..." "INFO"
    docker exec $backupContainer /scripts/backup_database.sh
} else {
    # Mostrar información de backups automáticos
    Write-Log "Sistema de backups automáticos activo" "INFO"
    Write-Host ""
    Write-Host "Configuración:" -ForegroundColor Cyan
    Write-Host "  - Backup automático: Diario a las 2:00 AM" -ForegroundColor White
    Write-Host "  - Retención: 7 días" -ForegroundColor White
    Write-Host "  - Ubicación: .\backups\database\" -ForegroundColor White
    Write-Host ""

    # Listar backups recientes
    Write-Log "Backups recientes:" "INFO"
    $backups = Get-ChildItem "backups\database\*.sql.gz" -ErrorAction SilentlyContinue |
               Sort-Object LastWriteTime -Descending |
               Select-Object -First 10

    if ($backups) {
        foreach ($backup in $backups) {
            $size = "{0:N2} MB" -f ($backup.Length / 1MB)
            $age = (Get-Date) - $backup.LastWriteTime
            $ageStr = if ($age.Days -gt 0) { "$($age.Days)d $($age.Hours)h" } else { "$($age.Hours)h $($age.Minutes)m" }
            Write-Host "  ✓ $($backup.Name) - $size - hace $ageStr" -ForegroundColor Green
        }

        Write-Host ""
        Write-Host "Total de backups: $($backups.Count)" -ForegroundColor Cyan
        $totalSize = ($backups | Measure-Object -Property Length -Sum).Sum
        Write-Host "Espacio total: $("{0:N2} MB" -f ($totalSize / 1MB))" -ForegroundColor Cyan
    } else {
        Write-Log "No se encontraron backups" "WARNING"
    }

    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Yellow
    Write-Host "  .\backup-database.ps1 -Manual           # Ejecutar backup manual" -ForegroundColor White
    Write-Host "  .\backup-database.ps1 -Restore <archivo> # Restaurar desde backup" -ForegroundColor White
    Write-Host ""
}

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 141) {
    Write-Log "Operación completada" "SUCCESS"
    exit 0
} else {
    Write-Log "Error durante la operación" "ERROR"
    exit 1
}
