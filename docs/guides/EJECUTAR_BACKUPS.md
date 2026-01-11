# 🚀 Cómo Ejecutar el Sistema de Backups

> **Guía rápida para poner en marcha el sistema de backups automáticos**

---

## ⚡ **Inicio Rápido (3 pasos)**

### **Paso 1: Dar Permisos a los Scripts**

```bash
# Desde la raíz del proyecto
chmod +x scripts/*.sh
```

### **Paso 2: Levantar el Servicio**

```bash
# Construir e iniciar el servicio de backups
docker-compose up -d backup

# Verificar que está corriendo
docker-compose ps backup
```

**Salida esperada**:
```
NAME                    STATUS              PORTS
bvs_framework-backup-1  Up (healthy)
```

### **Paso 3: Ejecutar Tests**

```bash
# Ejecutar suite de tests
./scripts/test_backup_system.sh
```

**Resultado esperado**:
```
╔════════════════════════════════════════════════════════════════╗
║           ✓ ALL TESTS PASSED - SYSTEM IS READY                ║
╚════════════════════════════════════════════════════════════════╝

  Total Tests:  13
  Passed:       13
  Failed:       0
```

---

## ✅ **Si los tests pasan**

¡Felicitaciones! El sistema de backups está funcionando correctamente.

### **Qué Hacer Ahora**

1. **Verificar primer backup**:
```bash
# Esperar a las 2:00 AM o ejecutar manualmente
docker-compose exec backup /scripts/backup_database.sh

# Ver el backup creado
ls -lh backups/database/
```

2. **Monitorear logs**:
```bash
# Ver logs en tiempo real
tail -f backups/database/backup.log

# O logs del contenedor
docker-compose logs -f backup
```

3. **Probar una restauración** (opcional):
```bash
# Listar backups disponibles
docker-compose exec backup /scripts/restore_database.sh --list

# Restaurar el más reciente (en ambiente de prueba)
docker-compose run --rm backup restore --latest
```

---

## ⚠️ **Si algún test falla**

### **Test 1: "Backup service is running" - FALLA**

**Problema**: El servicio no está corriendo

**Solución**:
```bash
# Ver por qué falló
docker-compose logs backup

# Intentar reconstruir
docker-compose build backup
docker-compose up -d backup
```

---

### **Test 5: "PostgreSQL connection" - FALLA**

**Problema**: No puede conectar a PostgreSQL

**Solución**:
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps db

# Si no está corriendo
docker-compose up -d db

# Esperar a que esté ready
docker-compose exec db pg_isready -U postgres

# Reiniciar servicio de backup
docker-compose restart backup
```

---

### **Test 6: "Manual database backup" - FALLA**

**Problema**: No puede crear el backup

**Solución**:
```bash
# Verificar permisos del directorio
mkdir -p backups/database backups/media
chmod -R 755 backups/

# Verificar espacio en disco
df -h

# Intentar backup manual con logs
docker-compose exec backup /scripts/backup_database.sh
```

---

### **Otros Errores**

```bash
# Ver logs detallados
docker-compose logs backup

# Ver logs del último backup
cat backups/database/backup.log

# Verificar healthcheck
docker inspect --format='{{.State.Health.Status}}' $(docker-compose ps -q backup)
```

---

## 📋 **Comandos Útiles**

### **Gestión del Servicio**

```bash
# Iniciar
docker-compose up -d backup

# Detener
docker-compose stop backup

# Reiniciar
docker-compose restart backup

# Ver estado
docker-compose ps backup

# Ver logs
docker-compose logs -f backup

# Reconstruir
docker-compose build backup
docker-compose up -d backup
```

### **Backups Manuales**

```bash
# Backup de base de datos
docker-compose exec backup /scripts/backup_database.sh

# Backup de archivos media
docker-compose exec backup /scripts/backup_media.sh

# Ambos
docker-compose run --rm backup now
```

### **Restauración**

```bash
# Listar backups
docker-compose exec backup /scripts/restore_database.sh --list

# Restaurar último backup
docker-compose run --rm backup restore --latest

# Restaurar backup específico
docker-compose exec backup /scripts/restore_database.sh \
  /backups/database/biblioteca_20260105_020000.custom
```

### **Monitoreo**

```bash
# Ver backups en disco
ls -lh backups/database/
ls -lh backups/media/

# Ver espacio usado
du -sh backups/

# Ver último backup
ls -lt backups/database/*.sql.gz | head -1

# Ver logs
tail -f backups/database/backup.log
```

---

## 🎯 **Próximos Pasos Después de la Implementación**

1. **Hoy**:
   - ✅ Verificar que los tests pasan
   - ✅ Dejar el servicio corriendo
   - ✅ Esperar al primer backup automático (2:00 AM)

2. **Mañana**:
   - ✅ Verificar que se creó el backup nocturno
   - ✅ Revisar logs: `cat backups/database/backup.log`
   - ✅ Probar una restauración en ambiente de prueba

3. **Esta Semana**:
   - ✅ Documentar procedimiento de restauración para el equipo
   - ✅ Configurar notificaciones (opcional)
   - ✅ Continuar con Sprint 7 (MON-001: Sentry)

---

## 📚 **Documentación Completa**

- [BACKUP_SYSTEM.md](BACKUP_SYSTEM.md) - Documentación exhaustiva
- [SPRINT_7_BACKUP_COMPLETADO.md](SPRINT_7_BACKUP_COMPLETADO.md) - Resumen de implementación
- [scripts/README.md](scripts/README.md) - Guía de scripts

---

## ✅ **Checklist Final**

Antes de dar por terminada la implementación:

- [ ] Tests ejecutados y pasando
- [ ] Servicio corriendo (`docker-compose ps backup`)
- [ ] Primer backup manual exitoso
- [ ] Logs verificados
- [ ] Restauración probada (opcional pero recomendado)
- [ ] Documentación leída
- [ ] Equipo informado del nuevo sistema

---

## 🎉 **¡Listo!**

Si llegaste hasta aquí y todos los tests pasaron, **¡felicitaciones!**

El sistema de backups automáticos está funcionando y protegiendo tus datos.

**Próxima tarea del Sprint 7**:
- Implementar Monitoreo con Sentry (MON-001)

---

**¿Dudas o problemas?** Revisa [BACKUP_SYSTEM.md](BACKUP_SYSTEM.md) sección "Troubleshooting"
