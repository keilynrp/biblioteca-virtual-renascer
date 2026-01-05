#!/bin/bash
# =============================================================================
# Test Suite para Sistema de Backups - BVS Framework
# =============================================================================
# Descripción: Pruebas automatizadas del sistema de backups
# Uso: ./test_backup_system.sh
# Autor: BVS Framework Team
# Fecha: 2026-01-05
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# =============================================================================
# FUNCIONES DE UTILIDAD
# =============================================================================

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

log_test() {
    ((TESTS_TOTAL++))
    echo -e "${CYAN}[$TESTS_TOTAL]${NC} Testing: $1"
}

# =============================================================================
# TESTS
# =============================================================================

test_docker_service_running() {
    log_test "Backup service is running"

    if docker-compose ps backup | grep -q "Up"; then
        log_success "Backup service is running"
        return 0
    else
        log_error "Backup service is not running"
        return 1
    fi
}

test_scripts_exist() {
    log_test "Backup scripts exist"

    if docker-compose exec -T backup test -f /scripts/backup_database.sh && \
       docker-compose exec -T backup test -f /scripts/backup_media.sh && \
       docker-compose exec -T backup test -f /scripts/restore_database.sh; then
        log_success "All backup scripts exist"
        return 0
    else
        log_error "One or more backup scripts are missing"
        return 1
    fi
}

test_scripts_executable() {
    log_test "Backup scripts are executable"

    if docker-compose exec -T backup test -x /scripts/backup_database.sh && \
       docker-compose exec -T backup test -x /scripts/backup_media.sh && \
       docker-compose exec -T backup test -x /scripts/restore_database.sh; then
        log_success "All scripts are executable"
        return 0
    else
        log_error "One or more scripts are not executable"
        return 1
    fi
}

test_backup_directories_exist() {
    log_test "Backup directories exist"

    if [ -d "backups/database" ] && [ -d "backups/media" ]; then
        log_success "Backup directories exist"
        return 0
    else
        log_error "Backup directories do not exist"
        return 1
    fi
}

test_postgres_connection() {
    log_test "PostgreSQL connection from backup service"

    if docker-compose exec -T backup pg_isready -h db -U postgres -d biblioteca -q; then
        log_success "Can connect to PostgreSQL"
        return 0
    else
        log_error "Cannot connect to PostgreSQL"
        return 1
    fi
}

test_manual_database_backup() {
    log_test "Manual database backup"

    log_info "Creating test data..."
    docker-compose exec -T db psql -U postgres -d biblioteca -c \
        "CREATE TABLE IF NOT EXISTS backup_test (id SERIAL PRIMARY KEY, test_data TEXT, created_at TIMESTAMP DEFAULT NOW());" > /dev/null 2>&1

    docker-compose exec -T db psql -U postgres -d biblioteca -c \
        "INSERT INTO backup_test (test_data) VALUES ('Test backup $(date +%s)');" > /dev/null 2>&1

    log_info "Running backup..."
    if docker-compose exec -T backup /scripts/backup_database.sh > /dev/null 2>&1; then
        # Verificar que se crearon los archivos
        BACKUP_COUNT=$(find backups/database -name "*.sql.gz" -mmin -5 | wc -l)
        if [ "$BACKUP_COUNT" -gt 0 ]; then
            log_success "Database backup created successfully"
            return 0
        else
            log_error "Backup script ran but no backup file found"
            return 1
        fi
    else
        log_error "Database backup failed"
        return 1
    fi
}

test_backup_file_integrity() {
    log_test "Backup file integrity"

    LATEST_BACKUP=$(find backups/database -name "*.custom" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)

    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup file found to test"
        return 1
    fi

    log_info "Verifying: $(basename "$LATEST_BACKUP")"

    # Test con pg_restore -l (list)
    if docker-compose exec -T backup pg_restore -l "$LATEST_BACKUP" > /dev/null 2>&1; then
        log_success "Backup file is valid and not corrupted"
        return 0
    else
        log_error "Backup file appears to be corrupted"
        return 1
    fi
}

test_backup_restoration() {
    log_test "Database restoration from backup"

    LATEST_BACKUP=$(find backups/database -name "*.custom" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)

    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup file found to restore"
        return 1
    fi

    log_info "Getting current row count..."
    BEFORE_COUNT=$(docker-compose exec -T db psql -U postgres -d biblioteca -t -c "SELECT COUNT(*) FROM backup_test;" 2>/dev/null | xargs || echo "0")

    log_info "Deleting test data..."
    docker-compose exec -T db psql -U postgres -d biblioteca -c "DELETE FROM backup_test;" > /dev/null 2>&1

    log_info "Restoring from backup: $(basename "$LATEST_BACKUP")"

    # Restaurar sin confirmación (para testing)
    if docker-compose exec -T backup pg_restore -U postgres -d biblioteca \
        --clean \
        --if-exists \
        --no-owner \
        --no-acl \
        "$LATEST_BACKUP" > /dev/null 2>&1; then

        AFTER_COUNT=$(docker-compose exec -T db psql -U postgres -d biblioteca -t -c "SELECT COUNT(*) FROM backup_test;" 2>/dev/null | xargs || echo "0")

        if [ "$AFTER_COUNT" -gt 0 ]; then
            log_success "Restoration successful (restored $AFTER_COUNT rows)"
            return 0
        else
            log_error "Restoration ran but data not restored"
            return 1
        fi
    else
        log_error "Database restoration failed"
        return 1
    fi
}

test_media_backup() {
    log_test "Media files backup"

    # Crear archivo de prueba si no existe
    mkdir -p backend/media/test
    echo "Test file $(date +%s)" > backend/media/test/test_file.txt

    log_info "Running media backup..."
    if docker-compose exec -T backup /scripts/backup_media.sh > /dev/null 2>&1; then
        BACKUP_COUNT=$(find backups/media -name "media_*.tar.gz" -mmin -5 | wc -l)
        if [ "$BACKUP_COUNT" -gt 0 ]; then
            log_success "Media backup created successfully"
            return 0
        else
            log_error "Media backup script ran but no file found"
            return 1
        fi
    else
        log_error "Media backup failed"
        return 1
    fi
}

test_backup_rotation() {
    log_test "Backup rotation (retention policy)"

    # Crear backups viejos simulados
    log_info "Creating old backup files for rotation test..."

    # Crear un archivo de hace 10 días
    OLD_FILE="backups/database/old_backup_$(date -d '10 days ago' +%Y%m%d_%H%M%S).sql.gz"
    touch -d '10 days ago' "$OLD_FILE" 2>/dev/null || touch "$OLD_FILE"
    echo "fake backup" | gzip > "$OLD_FILE"

    BEFORE_OLD=$(find backups/database -name "old_backup_*.sql.gz" | wc -l)

    # Ejecutar backup (que debería limpiar archivos viejos)
    docker-compose exec -T backup /scripts/backup_database.sh > /dev/null 2>&1

    AFTER_OLD=$(find backups/database -name "old_backup_*.sql.gz" | wc -l)

    if [ "$AFTER_OLD" -lt "$BEFORE_OLD" ]; then
        log_success "Old backups were cleaned up (rotation working)"
        return 0
    else
        log_error "Backup rotation is not working properly"
        return 1
    fi
}

test_metadata_generation() {
    log_test "Backup metadata generation"

    LATEST_BACKUP=$(find backups/database -name "*.sql.gz" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)
    BASENAME=$(basename "$LATEST_BACKUP" .sql.gz)
    META_FILE="backups/database/${BASENAME}.meta"

    if [ -f "$META_FILE" ]; then
        log_success "Metadata file exists: $(basename "$META_FILE")"
        return 0
    else
        log_error "Metadata file not generated"
        return 1
    fi
}

test_cron_configuration() {
    log_test "Cron jobs configured"

    CRON_OUTPUT=$(docker-compose exec -T backup crontab -l 2>/dev/null || echo "")

    if echo "$CRON_OUTPUT" | grep -q "backup_database.sh" && \
       echo "$CRON_OUTPUT" | grep -q "backup_media.sh"; then
        log_success "Cron jobs are configured"
        return 0
    else
        log_error "Cron jobs not configured properly"
        return 1
    fi
}

test_healthcheck() {
    log_test "Docker healthcheck"

    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $(docker-compose ps -q backup) 2>/dev/null || echo "none")

    if [ "$HEALTH" = "healthy" ]; then
        log_success "Healthcheck status: healthy"
        return 0
    else
        log_error "Healthcheck status: $HEALTH"
        return 1
    fi
}

cleanup_test_data() {
    log_info "Cleaning up test data..."

    # Eliminar tabla de prueba
    docker-compose exec -T db psql -U postgres -d biblioteca -c "DROP TABLE IF EXISTS backup_test;" > /dev/null 2>&1

    # Eliminar archivos de prueba
    rm -f backend/media/test/test_file.txt
    rmdir backend/media/test 2>/dev/null || true

    # Eliminar backups de prueba viejos
    find backups/database -name "old_backup_*.sql.gz" -delete 2>/dev/null || true

    log_success "Test data cleaned up"
}

# =============================================================================
# MAIN TEST SUITE
# =============================================================================

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║     Test Suite - Sistema de Backups Automáticos - BVS         ║"
    echo "║                    Timestamp: $(date +'%Y-%m-%d %H:%M:%S')                    ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    log_info "Starting backup system tests..."
    echo ""

    # Ejecutar tests
    test_docker_service_running || true
    test_scripts_exist || true
    test_scripts_executable || true
    test_backup_directories_exist || true
    test_postgres_connection || true
    test_manual_database_backup || true
    test_backup_file_integrity || true
    test_backup_restoration || true
    test_media_backup || true
    test_backup_rotation || true
    test_metadata_generation || true
    test_cron_configuration || true
    test_healthcheck || true

    echo ""
    log_info "Cleaning up..."
    cleanup_test_data

    # Resumen
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                      TEST RESULTS                              ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "  Total Tests:  $TESTS_TOTAL"
    echo -e "  ${GREEN}Passed:       $TESTS_PASSED${NC}"
    echo -e "  ${RED}Failed:       $TESTS_FAILED${NC}"
    echo ""

    if [ "$TESTS_FAILED" -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║           ✓ ALL TESTS PASSED - SYSTEM IS READY                ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        exit 0
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║         ✗ SOME TESTS FAILED - PLEASE REVIEW                    ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        exit 1
    fi
}

# Ejecutar tests
main "$@"
