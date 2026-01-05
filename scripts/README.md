# 📜 Scripts de Backups - BVS Framework

Este directorio contiene todos los scripts relacionados con el sistema de backups automáticos.

## 📁 Archivos

| Archivo | Descripción |
|---------|-------------|
| `backup_database.sh` | Script principal de backup de PostgreSQL |
| `backup_media.sh` | Script de backup de archivos media |
| `restore_database.sh` | Script de restauración de base de datos |
| `test_backup_system.sh` | Suite de tests automatizados |
| `Dockerfile.backup` | Imagen Docker para el servicio de backups |
| `entrypoint-backup.sh` | Entrypoint del contenedor |

## 🚀 Inicio Rápido

### 1. Construir y levantar el servicio

```bash
# Desde la raíz del proyecto
docker-compose up -d backup

# Verificar que está corriendo
docker-compose ps backup
```

### 2. Ejecutar tests

```bash
# Dar permisos de ejecución
chmod +x scripts/test_backup_system.sh

# Ejecutar suite de tests
./scripts/test_backup_system.sh
```

### 3. Ejecutar backup manual

```bash
# Backup de base de datos
docker-compose exec backup /scripts/backup_database.sh

# Backup de media files
docker-compose exec backup /scripts/backup_media.sh

# Ambos
docker-compose run --rm backup now
```

## 📊 Resultados Esperados del Test

```
╔════════════════════════════════════════════════════════════════╗
║     Test Suite - Sistema de Backups Automáticos - BVS         ║
╚════════════════════════════════════════════════════════════════╝

[1] Testing: Backup service is running
✓ Backup service is running

[2] Testing: Backup scripts exist
✓ All backup scripts exist

[3] Testing: Backup scripts are executable
✓ All scripts are executable

[4] Testing: Backup directories exist
✓ Backup directories exist

[5] Testing: PostgreSQL connection from backup service
✓ Can connect to PostgreSQL

[6] Testing: Manual database backup
ℹ Creating test data...
ℹ Running backup...
✓ Database backup created successfully

[7] Testing: Backup file integrity
ℹ Verifying: biblioteca_20260105_123456.custom
✓ Backup file is valid and not corrupted

[8] Testing: Database restoration from backup
ℹ Getting current row count...
ℹ Deleting test data...
ℹ Restoring from backup: biblioteca_20260105_123456.custom
✓ Restoration successful (restored 1 rows)

[9] Testing: Media files backup
ℹ Running media backup...
✓ Media backup created successfully

[10] Testing: Backup rotation (retention policy)
ℹ Creating old backup files for rotation test...
✓ Old backups were cleaned up (rotation working)

[11] Testing: Backup metadata generation
✓ Metadata file exists: biblioteca_20260105_123456.meta

[12] Testing: Cron jobs configured
✓ Cron jobs are configured

[13] Testing: Docker healthcheck
✓ Healthcheck status: healthy

╔════════════════════════════════════════════════════════════════╗
║                      TEST RESULTS                              ║
╚════════════════════════════════════════════════════════════════╝

  Total Tests:  13
  Passed:       13
  Failed:       0

╔════════════════════════════════════════════════════════════════╗
║           ✓ ALL TESTS PASSED - SYSTEM IS READY                ║
╚════════════════════════════════════════════════════════════════╝
```

## 📚 Documentación Completa

Ver [BACKUP_SYSTEM.md](../BACKUP_SYSTEM.md) para la documentación completa del sistema de backups.

## 🔧 Troubleshooting

### Error: "Permission denied"

```bash
# Dar permisos a los scripts
chmod +x scripts/*.sh
```

### Error: "Docker service not running"

```bash
# Iniciar el servicio
docker-compose up -d backup

# Ver logs
docker-compose logs backup
```

### Tests fallan

```bash
# Ver logs detallados
docker-compose logs backup

# Verificar que PostgreSQL está corriendo
docker-compose ps db

# Verificar conexión
docker-compose exec backup pg_isready -h db -U postgres -d biblioteca
```

## ✅ Checklist de Implementación

- [x] Scripts de backup creados
- [x] Scripts de restauración creados
- [x] Dockerfile del servicio
- [x] Docker Compose configurado
- [x] Cron jobs configurados
- [x] Suite de tests creada
- [ ] **Tests ejecutados y pasando**
- [ ] Documentación completa
- [ ] Sistema en producción

## 🎯 Próximo Paso

Ejecutar los tests:

```bash
./scripts/test_backup_system.sh
```

Si todos los tests pasan, el sistema de backups está **✅ LISTO PARA PRODUCCIÓN**.
