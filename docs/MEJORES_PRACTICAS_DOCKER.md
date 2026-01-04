# 🏆 Mejores Prácticas - Docker & Servicios

## 📋 Índice

1. [Desarrollo Diario](#desarrollo-diario)
2. [Mantenimiento Preventivo](#mantenimiento-preventivo)
3. [Monitoreo y Logs](#monitoreo-y-logs)
4. [Optimización de Rendimiento](#optimización-de-rendimiento)
5. [Seguridad](#seguridad)
6. [Backup y Recuperación](#backup-y-recuperación)

---

## 💻 Desarrollo Diario

### Inicio de Jornada

```bash
# 1. Verificar que todo está funcionando
bash verificar-acceso.sh

# 2. Ver estado de contenedores
docker-compose ps

# 3. Si hay problemas, aplicar fix rápido
bash solucion-rapida.sh
```

**✅ DO:**
- Verificar estado ANTES de empezar a trabajar
- Guardar logs si encuentras problemas
- Reiniciar servicios después de cambios grandes

**❌ DON'T:**
- Asumir que todo funciona sin verificar
- Hacer múltiples cambios sin probar entre ellos
- Ignorar warnings en los logs

---

### Durante el Desarrollo

**Cuando cambias código Python (Backend):**
```bash
# Django auto-reload está activo en desarrollo
# Los cambios se aplican automáticamente

# Si hay errores, ver logs:
docker-compose logs -f backend

# Si Django crashea, reiniciar:
docker-compose restart backend
```

**Cuando cambias código JavaScript/React (Frontend):**
```bash
# Next.js auto-reload está activo
# Los cambios se reflejan en el navegador automáticamente

# Si hay errores de compilación:
docker-compose logs -f frontend

# Si Next.js crashea, reiniciar:
docker-compose restart frontend
```

**Cuando cambias dependencias:**
```bash
# Backend (requirements.txt)
docker-compose build backend
docker-compose up -d backend

# Frontend (package.json)
docker-compose build frontend
docker-compose up -d frontend
```

**Cuando cambias docker-compose.yml:**
```bash
# Recrear servicios con nueva configuración
docker-compose up -d --force-recreate

# O servicios específicos
docker-compose up -d --force-recreate backend
```

---

### Fin de Jornada

```bash
# Opción 1: Dejar todo corriendo (recomendado)
# No hacer nada, los servicios siguen corriendo

# Opción 2: Detener todo (opcional, ahorra recursos)
docker-compose stop

# Opción 3: Detener y limpiar (solo si es necesario)
docker-compose down
```

**✅ Recomendación:**
- Dejar servicios corriendo entre días
- Solo detener si necesitas liberar RAM/CPU
- NUNCA hacer `docker-compose down -v` (elimina volúmenes/datos)

---

## 🛡️ Mantenimiento Preventivo

### Semanal

```bash
# 1. Limpiar imágenes no usadas
docker image prune -f

# 2. Ver uso de espacio
docker system df

# 3. Verificar logs no crezcan demasiado
docker-compose logs --tail 5 | wc -l

# 4. Backup de base de datos (ver sección Backup)
```

---

### Mensual

```bash
# 1. Rebuild completo (limpia cache)
docker-compose build --no-cache
docker-compose up -d

# 2. Limpiar todo lo no usado
docker system prune -a --volumes
# ⚠️ CUIDADO: Esto elimina TODO lo no usado

# 3. Verificar actualizaciones de imágenes base
docker-compose pull
```

---

### Después de Cambios Importantes

**Después de merge de feature grande:**
```bash
# 1. Pull cambios
git pull origin main

# 2. Rebuild servicios afectados
docker-compose build

# 3. Aplicar migraciones si hay
docker-compose exec backend python manage.py migrate

# 4. Verificar que funcione
bash verificar-acceso.sh
```

**Después de actualizar versiones de Node/Python:**
```bash
# Rebuild completo sin cache
docker-compose build --no-cache
docker-compose up -d

# Verificar versiones
docker exec bvs_framework-backend-1 python --version
docker exec bvs_framework-frontend-1 node --version
```

---

## 📊 Monitoreo y Logs

### Ver Logs Efectivamente

```bash
# ✅ GOOD: Últimas líneas + tiempo
docker-compose logs --tail 50 --timestamps backend

# ✅ GOOD: Seguir en tiempo real
docker-compose logs -f backend frontend

# ✅ GOOD: Desde hace X tiempo
docker-compose logs --since 30m backend

# ❌ BAD: Sin límite (puede ser MUCHO output)
docker-compose logs backend
```

---

### Guardar Logs para Análisis

```bash
# Logs con timestamp
docker-compose logs --timestamps > logs-$(date +%Y%m%d-%H%M%S).txt

# Logs de un servicio específico
docker-compose logs backend > backend-logs.txt

# Diagnóstico completo
bash diagnostico-puertos.sh > diagnostico-completo-$(date +%Y%m%d).txt
```

---

### Rotación de Logs

**Configurar en docker-compose.yml:**
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Esto mantiene máximo 3 archivos de 10MB cada uno.

---

### Monitoreo de Recursos

```bash
# Ver uso de CPU/RAM en tiempo real
docker stats

# Ver uso de CPU/RAM de un servicio
docker stats bvs_framework-backend-1

# Ver uso de disco
docker system df

# Ver uso detallado
docker system df -v
```

---

## ⚡ Optimización de Rendimiento

### Optimizar Build Times

**En Dockerfile, ordenar comandos por frecuencia de cambio:**
```dockerfile
# ✅ GOOD: Dependencias primero (cambian poco)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Código después (cambia frecuentemente)
COPY . .

# ❌ BAD: Todo junto
COPY . .
RUN pip install -r requirements.txt
```

---

### Optimizar Volúmenes

**En docker-compose.yml:**
```yaml
# ✅ GOOD: Excluir node_modules y .next del bind mount
volumes:
  - ./frontend:/app:cached
  - /app/node_modules
  - /app/.next

# ❌ BAD: Montar todo sin exclusiones
volumes:
  - ./frontend:/app
```

---

### Limitar Recursos

**Para evitar que un servicio use toda la RAM:**
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

---

### Optimizar WSL2 (Windows)

**Configurar `.wslconfig`:**
```ini
# C:\Users\TuUsuario\.wslconfig
[wsl2]
memory=8GB
processors=4
swap=2GB
```

**Reiniciar WSL:**
```bash
wsl --shutdown
# Esperar 10 segundos y volver a abrir terminal
```

---

## 🔒 Seguridad

### Variables de Entorno

**✅ DO:**
```bash
# Usar archivo .env (NO commitear)
# .env
DATABASE_PASSWORD=super_secret_password
SECRET_KEY=django_secret_key_here

# docker-compose.yml
env_file:
  - .env
```

**❌ DON'T:**
```yaml
# ❌ NUNCA hardcodear passwords en docker-compose.yml
environment:
  - DATABASE_PASSWORD=super_secret_password
```

---

### Permisos

```bash
# ✅ Ejecutar contenedores como usuario no-root
# En Dockerfile:
RUN useradd -m appuser
USER appuser

# ❌ Evitar ejecutar como root en producción
```

---

### Actualizaciones

```bash
# Mantener imágenes base actualizadas
docker-compose pull

# Verificar vulnerabilidades (si tienes Docker Scout)
docker scout quickview
```

---

## 💾 Backup y Recuperación

### Backup de Base de Datos

**Backup manual:**
```bash
# PostgreSQL
docker exec bvs_framework-db-1 pg_dump -U postgres biblioteca > backup-$(date +%Y%m%d).sql

# Comprimir
gzip backup-$(date +%Y%m%d).sql
```

**Restaurar backup:**
```bash
# Descomprimir
gunzip backup-20260103.sql.gz

# Restaurar
docker exec -i bvs_framework-db-1 psql -U postgres biblioteca < backup-20260103.sql
```

---

### Backup de Volúmenes

**Listar volúmenes:**
```bash
docker volume ls
```

**Backup de un volumen:**
```bash
# Crear backup del volumen de PostgreSQL
docker run --rm \
  -v bvs_framework_postgres_data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/postgres-data-$(date +%Y%m%d).tar.gz /data
```

**Restaurar volumen:**
```bash
# Detener servicios primero
docker-compose down

# Restaurar
docker run --rm \
  -v bvs_framework_postgres_data:/data \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/postgres-data-20260103.tar.gz -C /

# Reiniciar servicios
docker-compose up -d
```

---

### Backup de Configuración

**Archivos a respaldar:**
```bash
# Crear backup de configuración
tar czf config-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  .env \
  backend/requirements.txt \
  frontend/package.json \
  nginx/ \
  scripts/*.sh
```

---

## 🎯 Checklist de Mejores Prácticas

### ✅ Desarrollo

- [ ] Verifico estado antes de empezar (`bash verificar-acceso.sh`)
- [ ] Uso `docker-compose logs -f` para ver cambios en tiempo real
- [ ] Rebuild cuando cambio dependencias
- [ ] Guardo logs cuando encuentro errores
- [ ] Reinicio servicios después de cambios importantes

### ✅ Mantenimiento

- [ ] Limpio imágenes no usadas semanalmente
- [ ] Hago backup de DB mensualmente
- [ ] Monitoreo uso de recursos con `docker stats`
- [ ] Roto logs para evitar crecimiento excesivo
- [ ] Actualizo imágenes base regularmente

### ✅ Seguridad

- [ ] Uso archivo .env para secrets (NO commiteado)
- [ ] No hardcodeo passwords en docker-compose.yml
- [ ] Ejecuto contenedores como usuario no-root
- [ ] Mantengo imágenes actualizadas
- [ ] Reviso vulnerabilidades conocidas

### ✅ Optimización

- [ ] Uso cache de Docker build correctamente
- [ ] Excluyo directorios grandes de bind mounts
- [ ] Limito recursos con deploy.resources
- [ ] Optimizo configuración de WSL2 (Windows)
- [ ] Uso volúmenes nombrados para datos importantes

---

## 🚀 Comandos Rápidos de Referencia

```bash
# Verificación rápida
bash verificar-acceso.sh

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f backend frontend

# Reiniciar servicio
docker-compose restart backend

# Rebuild servicio
docker-compose build backend
docker-compose up -d backend

# Ver recursos
docker stats

# Limpiar imágenes
docker image prune -f

# Backup DB
docker exec bvs_framework-db-1 pg_dump -U postgres biblioteca > backup.sql

# Ver espacio usado
docker system df

# Fix rápido
bash solucion-rapida.sh

# Reset completo
bash reset-completo.sh
```

---

## 📚 Recursos Adicionales

- **Troubleshooting:** `docs/TROUBLESHOOTING_CONTENEDORES.md`
- **Playbook de Diagnóstico:** `docs/PLAYBOOK_DIAGNOSTICO.md`
- **Scripts de Solución:** `SOLUCION_DEFINITIVA_README.md`

---

## 🎓 Aprende de Errores Comunes

### Error: "No space left on device"

**Causa:** Docker acumuló muchas imágenes/contenedores/volúmenes

**Solución:**
```bash
# Ver uso
docker system df

# Limpiar todo lo no usado
docker system prune -a --volumes
# ⚠️ CUIDADO: Elimina TODO lo no usado

# O solo imágenes
docker image prune -a
```

---

### Error: "Container keeps restarting"

**Causa:** Servicio crashea inmediatamente al iniciar

**Solución:**
```bash
# Ver por qué crashea
docker logs bvs_framework-backend-1 --tail 50

# Ver historial de reinicios
docker inspect bvs_framework-backend-1 --format='{{.RestartCount}}'

# Detener auto-restart temporalmente
docker update --restart=no bvs_framework-backend-1

# Debuggear el problema
docker logs bvs_framework-backend-1
```

---

### Error: "Timeout waiting for container"

**Causa:** Contenedor tarda mucho en arrancar

**Solución:**
```bash
# Aumentar timeout en docker-compose.yml
healthcheck:
  start_period: 120s  # Más tiempo de gracia
  interval: 30s
  timeout: 15s        # Más tiempo para cada check
```

---

**Última actualización:** 2026-01-03
**Versión:** 1.0
**Mantenido por:** DevOps Team
