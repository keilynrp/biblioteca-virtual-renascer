#!/bin/bash
# =============================================================================
# Backup Script para PostgreSQL - Biblioteca Virtual Renascer do Saber
# =============================================================================
# Descripción: Realiza backup automático de la base de datos PostgreSQL
# Uso: ./backup_database.sh
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

# Variables de entorno (override con .env si existe)
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-biblioteca}"
BACKUP_DIR="${BACKUP_DIR:-/backups/database}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Directorio de backups
mkdir -p "$BACKUP_DIR"

# Timestamp para el backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
BACKUP_CUSTOM_FILE="$BACKUP_DIR/${POSTGRES_DB}_${TIMESTAMP}.custom"

# Log file
LOG_FILE="$BACKUP_DIR/backup.log"

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

# Función para verificar si PostgreSQL está disponible
check_postgres() {
    log "Verificando disponibilidad de PostgreSQL..."

    if pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q; then
        log_success "PostgreSQL está disponible"
        return 0
    else
        log_error "PostgreSQL no está disponible"
        return 1
    fi
}

# Función para obtener información de la base de datos
get_db_info() {
    log "Obteniendo información de la base de datos..."

    DB_SIZE=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT pg_size_pretty(pg_database_size('$POSTGRES_DB'));" 2>/dev/null | xargs || echo "unknown")
    TABLE_COUNT=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs || echo "0")

    log "Tamaño de la base de datos: $DB_SIZE"
    log "Número de tablas: $TABLE_COUNT"
}

# Función para realizar el backup
perform_backup() {
    log "Iniciando backup de la base de datos '$POSTGRES_DB'..."

    # Backup en formato SQL comprimido (para inspección manual)
    log "Creando backup SQL comprimido..."
    if pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --verbose \
        --no-owner \
        --no-acl \
        --format=plain \
        2>> "$LOG_FILE" | gzip > "$BACKUP_FILE"; then
        log_success "Backup SQL creado: $(basename "$BACKUP_FILE")"
    else
        log_error "Error al crear backup SQL"
        return 1
    fi

    # Backup en formato custom (para restauración más rápida)
    log "Creando backup en formato custom..."
    if pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --verbose \
        --no-owner \
        --no-acl \
        --format=custom \
        --file="$BACKUP_CUSTOM_FILE" \
        2>> "$LOG_FILE"; then
        log_success "Backup custom creado: $(basename "$BACKUP_CUSTOM_FILE")"
    else
        log_error "Error al crear backup custom"
        return 1
    fi

    # Verificar que los archivos se crearon correctamente
    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ] && \
       [ -f "$BACKUP_CUSTOM_FILE" ] && [ -s "$BACKUP_CUSTOM_FILE" ]; then

        SQL_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        CUSTOM_SIZE=$(du -h "$BACKUP_CUSTOM_FILE" | cut -f1)

        log_success "Backup completado exitosamente"
        log "  - SQL comprimido: $SQL_SIZE"
        log "  - Custom format: $CUSTOM_SIZE"

        return 0
    else
        log_error "Los archivos de backup están vacíos o no se crearon"
        return 1
    fi
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    log "Limpiando backups antiguos (reteniendo últimos $RETENTION_DAYS días)..."

    # Contar backups antes de limpiar
    TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "*.sql.gz" -o -name "*.custom" | wc -l)

    # Eliminar archivos más antiguos que RETENTION_DAYS
    DELETED_COUNT=$(find "$BACKUP_DIR" \
        \( -name "*.sql.gz" -o -name "*.custom" \) \
        -type f \
        -mtime +${RETENTION_DAYS} \
        -delete \
        -print | wc -l)

    if [ "$DELETED_COUNT" -gt 0 ]; then
        log_success "Eliminados $DELETED_COUNT archivos antiguos"
    else
        log "No hay backups antiguos para eliminar"
    fi

    # Contar backups después de limpiar
    REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "*.sql.gz" -o -name "*.custom" | wc -l)
    log "Backups en disco: $REMAINING_BACKUPS archivos"
}

# Función para calcular estadísticas de backups
show_backup_stats() {
    log "Estadísticas de backups:"

    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.sql.gz" | wc -l)

    log "  - Total de backups SQL: $BACKUP_COUNT"
    log "  - Espacio utilizado: $TOTAL_SIZE"

    if [ "$BACKUP_COUNT" -gt 0 ]; then
        OLDEST=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f -printf '%T+ %p\n' | sort | head -1 | awk '{print $1}')
        NEWEST=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f -printf '%T+ %p\n' | sort | tail -1 | awk '{print $1}')

        log "  - Backup más antiguo: $OLDEST"
        log "  - Backup más reciente: $NEWEST"
    fi
}

# Función para crear snapshot de metadata
create_metadata() {
    log "Creando archivo de metadata..."

    METADATA_FILE="$BACKUP_DIR/${POSTGRES_DB}_${TIMESTAMP}.meta"

    cat > "$METADATA_FILE" <<EOF
# Metadata del Backup - Biblioteca Virtual Renascer do Saber
# ============================================================

Timestamp: $(date +'%Y-%m-%d %H:%M:%S')
Database: $POSTGRES_DB
User: $POSTGRES_USER
Database Size: $DB_SIZE
Table Count: $TABLE_COUNT

Backup Files:
  - SQL: $(basename "$BACKUP_FILE") ($SQL_SIZE)
  - Custom: $(basename "$BACKUP_CUSTOM_FILE") ($CUSTOM_SIZE)

Retention Policy: $RETENTION_DAYS days

Restore Command:
  # From SQL:
  gunzip -c $(basename "$BACKUP_FILE") | psql -U $POSTGRES_USER -d $POSTGRES_DB

  # From Custom (faster):
  pg_restore -U $POSTGRES_USER -d $POSTGRES_DB -c -v $(basename "$BACKUP_CUSTOM_FILE")

EOF

    log_success "Metadata creada: $(basename "$METADATA_FILE")"
}

# Función para enviar notificación (webhook/email - opcional)
send_notification() {
    local status=$1
    local message=$2

    # Aquí puedes agregar integración con:
    # - Slack webhook
    # - Email (sendmail/mailgun)
    # - Discord webhook
    # - Telegram bot

    # Ejemplo de log para futuras integraciones
    if [ "$status" = "success" ]; then
        log_success "Notificación: $message"
    else
        log_error "Notificación: $message"
    fi
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  Backup de Base de Datos - Biblioteca Virtual Renascer        ║"
    echo "║  Timestamp: $(date +'%Y-%m-%d %H:%M:%S')                             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    # 1. Verificar PostgreSQL
    if ! check_postgres; then
        log_error "No se puede realizar el backup: PostgreSQL no disponible"
        send_notification "error" "Backup fallido: PostgreSQL no disponible"
        exit 1
    fi

    # 2. Obtener información de la BD
    get_db_info

    # 3. Realizar backup
    if ! perform_backup; then
        log_error "Error durante el proceso de backup"
        send_notification "error" "Backup fallido: Error durante el proceso"
        exit 1
    fi

    # 4. Crear metadata
    create_metadata

    # 5. Limpiar backups antiguos
    cleanup_old_backups

    # 6. Mostrar estadísticas
    show_backup_stats

    # 7. Notificación de éxito
    send_notification "success" "Backup completado exitosamente: $BACKUP_FILE"

    echo ""
    log_success "==================== BACKUP COMPLETADO ===================="
    echo ""

    exit 0
}

# Manejo de señales (SIGINT, SIGTERM)
trap 'log_error "Backup interrumpido"; exit 130' INT TERM

# Ejecutar script principal
main "$@"
