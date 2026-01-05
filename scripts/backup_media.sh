#!/bin/bash
# =============================================================================
# Backup Script para Archivos Media - Biblioteca Virtual Renascer do Saber
# =============================================================================
# Descripción: Realiza backup de archivos media (PDFs, imágenes, etc.)
# Uso: ./backup_media.sh
# Autor: BVS Framework Team
# Fecha: 2026-01-05
# =============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de entorno
MEDIA_DIR="${MEDIA_DIR:-/app/media}"
BACKUP_DIR="${BACKUP_MEDIA_DIR:-/backups/media}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Crear directorios si no existen
mkdir -p "$BACKUP_DIR"

# Timestamp para el backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/media_${TIMESTAMP}.tar.gz"

# Log file
LOG_FILE="$BACKUP_DIR/backup_media.log"

# =============================================================================
# FUNCIONES
# =============================================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$LOG_FILE"
}

# Verificar que el directorio media existe
check_media_dir() {
    log "Verificando directorio de media..."

    if [ ! -d "$MEDIA_DIR" ]; then
        log_error "Directorio media no existe: $MEDIA_DIR"
        return 1
    fi

    if [ ! -r "$MEDIA_DIR" ]; then
        log_error "No se puede leer el directorio media: $MEDIA_DIR"
        return 1
    fi

    log_success "Directorio media encontrado: $MEDIA_DIR"
    return 0
}

# Obtener información del directorio media
get_media_info() {
    log "Analizando archivos media..."

    TOTAL_FILES=$(find "$MEDIA_DIR" -type f | wc -l)
    TOTAL_SIZE=$(du -sh "$MEDIA_DIR" 2>/dev/null | cut -f1 || echo "0")

    PDF_COUNT=$(find "$MEDIA_DIR" -type f -name "*.pdf" | wc -l)
    IMAGE_COUNT=$(find "$MEDIA_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | wc -l)

    log "Total de archivos: $TOTAL_FILES"
    log "Tamaño total: $TOTAL_SIZE"
    log "  - PDFs: $PDF_COUNT"
    log "  - Imágenes: $IMAGE_COUNT"
}

# Realizar backup de archivos media
perform_backup() {
    log "Iniciando backup de archivos media..."

    # Verificar si hay archivos para respaldar
    if [ "$TOTAL_FILES" -eq 0 ]; then
        log_warning "No hay archivos para respaldar"
        return 0
    fi

    # Crear backup tar.gz con compresión
    log "Comprimiendo archivos..."

    if tar -czf "$BACKUP_FILE" \
        -C "$(dirname "$MEDIA_DIR")" \
        "$(basename "$MEDIA_DIR")" \
        --exclude='*.tmp' \
        --exclude='*.temp' \
        --exclude='.DS_Store' \
        --exclude='Thumbs.db' \
        2>> "$LOG_FILE"; then

        # Verificar que el archivo se creó correctamente
        if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            log_success "Backup creado exitosamente: $(basename "$BACKUP_FILE")"
            log "Tamaño del backup: $BACKUP_SIZE"
            return 0
        else
            log_error "El archivo de backup está vacío o no se creó"
            return 1
        fi
    else
        log_error "Error al crear el backup"
        return 1
    fi
}

# Limpiar backups antiguos
cleanup_old_backups() {
    log "Limpiando backups antiguos (reteniendo últimos $RETENTION_DAYS días)..."

    # Contar backups antes de limpiar
    TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "media_*.tar.gz" | wc -l)

    # Eliminar archivos más antiguos que RETENTION_DAYS
    DELETED_COUNT=$(find "$BACKUP_DIR" \
        -name "media_*.tar.gz" \
        -type f \
        -mtime +${RETENTION_DAYS} \
        -delete \
        -print | wc -l)

    if [ "$DELETED_COUNT" -gt 0 ]; then
        log_success "Eliminados $DELETED_COUNT backups antiguos"
    else
        log "No hay backups antiguos para eliminar"
    fi

    # Contar backups después de limpiar
    REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "media_*.tar.gz" | wc -l)
    log "Backups en disco: $REMAINING_BACKUPS archivos"
}

# Mostrar estadísticas de backups
show_backup_stats() {
    log "Estadísticas de backups media:"

    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "media_*.tar.gz" | wc -l)

    log "  - Total de backups: $BACKUP_COUNT"
    log "  - Espacio utilizado: $TOTAL_SIZE"

    if [ "$BACKUP_COUNT" -gt 0 ]; then
        OLDEST=$(find "$BACKUP_DIR" -name "media_*.tar.gz" -type f -printf '%T+ %p\n' | sort | head -1 | awk '{print $1}')
        NEWEST=$(find "$BACKUP_DIR" -name "media_*.tar.gz" -type f -printf '%T+ %p\n' | sort | tail -1 | awk '{print $1}')

        log "  - Backup más antiguo: $OLDEST"
        log "  - Backup más reciente: $NEWEST"
    fi
}

# Crear metadata del backup
create_metadata() {
    log "Creando archivo de metadata..."

    METADATA_FILE="$BACKUP_DIR/media_${TIMESTAMP}.meta"

    cat > "$METADATA_FILE" <<EOF
# Metadata del Backup Media - Biblioteca Virtual Renascer do Saber
# =================================================================

Timestamp: $(date +'%Y-%m-%d %H:%M:%S')
Media Directory: $MEDIA_DIR
Total Files: $TOTAL_FILES
Total Size: $TOTAL_SIZE
PDF Count: $PDF_COUNT
Image Count: $IMAGE_COUNT

Backup File: $(basename "$BACKUP_FILE")
Backup Size: $BACKUP_SIZE

Retention Policy: $RETENTION_DAYS days

Restore Command:
  tar -xzf $(basename "$BACKUP_FILE") -C /restore/path/

List Contents:
  tar -tzf $(basename "$BACKUP_FILE")

EOF

    log_success "Metadata creada: $(basename "$METADATA_FILE")"
}

# Verificar integridad del backup (opcional)
verify_backup() {
    log "Verificando integridad del backup..."

    if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
        log_success "Backup verificado: integridad OK"
        return 0
    else
        log_error "Backup corrupto: verificación falló"
        return 1
    fi
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  Backup de Archivos Media - Biblioteca Virtual Renascer       ║"
    echo "║  Timestamp: $(date +'%Y-%m-%d %H:%M:%S')                             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    # 1. Verificar directorio media
    if ! check_media_dir; then
        log_error "No se puede realizar el backup: directorio media no accesible"
        exit 1
    fi

    # 2. Obtener información de archivos
    get_media_info

    # 3. Realizar backup
    if ! perform_backup; then
        log_error "Error durante el proceso de backup"
        exit 1
    fi

    # 4. Verificar integridad
    if ! verify_backup; then
        log_error "Backup creado pero verificación falló"
        exit 1
    fi

    # 5. Crear metadata
    create_metadata

    # 6. Limpiar backups antiguos
    cleanup_old_backups

    # 7. Mostrar estadísticas
    show_backup_stats

    echo ""
    log_success "==================== BACKUP MEDIA COMPLETADO ===================="
    echo ""

    exit 0
}

# Manejo de señales
trap 'log_error "Backup interrumpido"; exit 130' INT TERM

# Ejecutar script principal
main "$@"
