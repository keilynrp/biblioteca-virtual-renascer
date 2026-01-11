#!/bin/bash
# =============================================================================
# Entrypoint para Servicio de Backups
# =============================================================================

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Backup Service - Biblioteca Virtual Renascer do Saber        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Esperar a que PostgreSQL esté disponible
echo "Esperando a que PostgreSQL esté disponible..."
until pg_isready -h db -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-biblioteca} -q; do
    echo "PostgreSQL no disponible, esperando..."
    sleep 5
done
echo "✓ PostgreSQL está disponible"
echo ""

# Configurar variables de entorno para scripts
export POSTGRES_USER="${POSTGRES_USER:-postgres}"
export POSTGRES_DB="${POSTGRES_DB:-biblioteca}"
export PGHOST="${PGHOST:-db}"
export PGPORT="${PGPORT:-5432}"
export BACKUP_DIR="/backups/database"
export BACKUP_MEDIA_DIR="/backups/media"
export BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
export MEDIA_DIR="${MEDIA_DIR:-/app/media}"

# Mostrar configuración
echo "Configuración de Backups:"
echo "  - Base de datos: $POSTGRES_DB"
echo "  - Usuario: $POSTGRES_USER"
echo "  - Host: $PGHOST"
echo "  - Retención: $BACKUP_RETENTION_DAYS días"
echo "  - Backup DB: $BACKUP_DIR"
echo "  - Backup Media: $BACKUP_MEDIA_DIR"
echo "  - Media Dir: $MEDIA_DIR"
echo ""

# Crear directorios si no existen
mkdir -p "$BACKUP_DIR" "$BACKUP_MEDIA_DIR"

# Si se pasa el argumento "now", ejecutar backup inmediatamente
if [ "$1" = "now" ]; then
    echo "Ejecutando backup inmediato..."
    /scripts/backup_database.sh
    /scripts/backup_media.sh
    exit 0
fi

# Si se pasa "restore", ejecutar restauración
if [ "$1" = "restore" ]; then
    shift
    /scripts/restore_database.sh "$@"
    exit 0
fi

# Configuración de cron
echo "Configurando cron jobs..."
echo "  - Backup DB: Diario a las 2:00 AM"
echo "  - Backup Media: Diario a las 2:30 AM"
echo ""

# Iniciar cron
echo "Iniciando servicio de backups..."

# Fix para Docker en Windows: usar supercronic o simple loop en lugar de dcron
# Si se usa CMD ["crond", ...], ejecutarlo; sino, mantener contenedor vivo
if [ "$1" = "crond" ]; then
    echo "⚠ Iniciando en modo compatibilidad (Windows)..."
    # En lugar de crond, usar un loop que mantiene el contenedor vivo
    # y espera ejecutar backups cuando sea necesario
    while true; do
        current_hour=$(date +%H)
        current_minute=$(date +%M)

        # Ejecutar backup de base de datos a las 2:00 AM
        if [ "$current_hour" = "02" ] && [ "$current_minute" = "00" ]; then
            echo "[$(date)] Ejecutando backup de base de datos..."
            /scripts/backup_database.sh >> /var/log/backup.log 2>&1
        fi

        # Ejecutar backup de media a las 2:30 AM
        if [ "$current_hour" = "02" ] && [ "$current_minute" = "30" ]; then
            echo "[$(date)] Ejecutando backup de media..."
            /scripts/backup_media.sh >> /var/log/backup.log 2>&1
        fi

        # Esperar 60 segundos antes de verificar nuevamente
        sleep 60
    done
else
    exec "$@"
fi
