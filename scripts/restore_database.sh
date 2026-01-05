#!/bin/bash
# =============================================================================
# Restore Script para PostgreSQL - Biblioteca Virtual Renascer do Saber
# =============================================================================
# Descripción: Restaura backup de PostgreSQL
# Uso: ./restore_database.sh <backup_file>
# Autor: BVS Framework Team
# Fecha: 2026-01-05
# =============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-biblioteca}"
BACKUP_DIR="${BACKUP_DIR:-/backups/database}"

# =============================================================================
# FUNCIONES
# =============================================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

# Mostrar uso
show_usage() {
    cat <<EOF
Uso: $0 <backup_file>

Ejemplos:
  # Restaurar desde archivo SQL comprimido:
  $0 /backups/database/biblioteca_20260105_120000.sql.gz

  # Restaurar desde archivo custom:
  $0 /backups/database/biblioteca_20260105_120000.custom

  # Listar backups disponibles:
  $0 --list

Opciones:
  --list          Listar backups disponibles
  --latest        Restaurar el backup más reciente
  --help          Mostrar este mensaje

EOF
}

# Listar backups disponibles
list_backups() {
    log "Backups disponibles en $BACKUP_DIR:"
    echo ""

    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Directorio de backups no existe: $BACKUP_DIR"
        return 1
    fi

    SQL_BACKUPS=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f -printf '%T@ %p\n' | sort -rn | cut -d' ' -f2-)
    CUSTOM_BACKUPS=$(find "$BACKUP_DIR" -name "*.custom" -type f -printf '%T@ %p\n' | sort -rn | cut -d' ' -f2-)

    echo "SQL Backups (comprimidos):"
    if [ -n "$SQL_BACKUPS" ]; then
        echo "$SQL_BACKUPS" | while read -r file; do
            SIZE=$(du -h "$file" | cut -f1)
            DATE=$(stat -c %y "$file" | cut -d' ' -f1-2)
            echo "  - $(basename "$file") ($SIZE) - $DATE"
        done
    else
        echo "  (ninguno)"
    fi

    echo ""
    echo "Custom Backups (formato pg_dump custom):"
    if [ -n "$CUSTOM_BACKUPS" ]; then
        echo "$CUSTOM_BACKUPS" | while read -r file; do
            SIZE=$(du -h "$file" | cut -f1)
            DATE=$(stat -c %y "$file" | cut -d' ' -f1-2)
            echo "  - $(basename "$file") ($SIZE) - $DATE"
        done
    else
        echo "  (ninguno)"
    fi
}

# Obtener backup más reciente
get_latest_backup() {
    LATEST=$(find "$BACKUP_DIR" -name "*.custom" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)

    if [ -z "$LATEST" ]; then
        LATEST=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)
    fi

    echo "$LATEST"
}

# Confirmar acción destructiva
confirm_restore() {
    local backup_file=$1

    echo ""
    log_warning "⚠️  ADVERTENCIA: Esta operación eliminará los datos actuales de la base de datos"
    echo ""
    echo "  Base de datos: $POSTGRES_DB"
    echo "  Archivo de backup: $(basename "$backup_file")"
    echo ""

    read -p "¿Estás seguro de que deseas continuar? [y/N]: " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restauración cancelada por el usuario"
        exit 0
    fi
}

# Restaurar desde SQL comprimido
restore_from_sql() {
    local backup_file=$1

    log "Restaurando desde SQL comprimido..."

    # Descomprimir y restaurar
    if gunzip -c "$backup_file" | psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; then
        log_success "Base de datos restaurada exitosamente"
        return 0
    else
        log_error "Error al restaurar la base de datos"
        return 1
    fi
}

# Restaurar desde custom format
restore_from_custom() {
    local backup_file=$1

    log "Restaurando desde formato custom..."

    # Restaurar con pg_restore
    if pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --clean \
        --if-exists \
        --verbose \
        --no-owner \
        --no-acl \
        "$backup_file" 2>&1 | grep -v "NOTICE:"; then
        log_success "Base de datos restaurada exitosamente"
        return 0
    else
        log_error "Error al restaurar la base de datos"
        return 1
    fi
}

# Verificar la restauración
verify_restore() {
    log "Verificando restauración..."

    # Verificar conectividad
    if ! pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q; then
        log_error "Base de datos no disponible después de la restauración"
        return 1
    fi

    # Contar tablas
    TABLE_COUNT=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

    # Obtener tamaño
    DB_SIZE=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT pg_size_pretty(pg_database_size('$POSTGRES_DB'));" | xargs)

    log_success "Verificación completada"
    log "  - Tablas: $TABLE_COUNT"
    log "  - Tamaño: $DB_SIZE"

    return 0
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  Restore de Base de Datos - Biblioteca Virtual Renascer       ║"
    echo "║  Timestamp: $(date +'%Y-%m-%d %H:%M:%S')                             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    # Procesar argumentos
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi

    case "$1" in
        --help|-h)
            show_usage
            exit 0
            ;;
        --list|-l)
            list_backups
            exit 0
            ;;
        --latest)
            BACKUP_FILE=$(get_latest_backup)
            if [ -z "$BACKUP_FILE" ]; then
                log_error "No se encontraron backups"
                exit 1
            fi
            log "Usando backup más reciente: $(basename "$BACKUP_FILE")"
            ;;
        *)
            BACKUP_FILE="$1"
            ;;
    esac

    # Verificar que el archivo existe
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Archivo de backup no existe: $BACKUP_FILE"
        exit 1
    fi

    # Confirmar acción
    confirm_restore "$BACKUP_FILE"

    # Determinar tipo de backup y restaurar
    if [[ "$BACKUP_FILE" == *.sql.gz ]]; then
        restore_from_sql "$BACKUP_FILE"
    elif [[ "$BACKUP_FILE" == *.custom ]]; then
        restore_from_custom "$BACKUP_FILE"
    else
        log_error "Formato de backup no reconocido"
        log "Formatos soportados: .sql.gz, .custom"
        exit 1
    fi

    # Verificar restauración
    if ! verify_restore; then
        log_error "Restauración completada pero verificación falló"
        exit 1
    fi

    echo ""
    log_success "==================== RESTAURACIÓN COMPLETADA ===================="
    echo ""

    exit 0
}

# Manejo de señales
trap 'log_error "Restauración interrumpida"; exit 130' INT TERM

# Ejecutar
main "$@"
