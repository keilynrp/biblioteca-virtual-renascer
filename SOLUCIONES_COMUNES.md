# Soluciones Comunes - No Puedo Acceder al Frontend/Backend

## Problema: No puedo abrir el backend ni el frontend en el navegador

### Diagnóstico Rápido

Ejecuta el script: **`DIAGNOSTICO_SERVICIOS.bat`**

---

## Soluciones según el problema encontrado

### 1. Docker Desktop no está corriendo

**Síntomas:**
- Error: "docker: command not found" o similar
- Los comandos docker no funcionan

**Solución:**
1. Abre Docker Desktop desde el menú de Windows
2. Espera a que se inicie completamente (ícono en la bandeja del sistema)
3. Ejecuta: `RESTART_ALL_CLEAN.bat`

---

### 2. Los contenedores no están corriendo

**Síntomas:**
- `docker ps` muestra los contenedores como "Exited" o no muestra nada
- Estado "Down" en docker-compose ps

**Solución:**
```batch
# Opción 1: Inicio rápido
QUICK_START.bat

# Opción 2: Inicio limpio (si hay errores)
RESTART_ALL_CLEAN.bat

# Opción 3: Rebuild completo (si persiste)
REBUILD_CONTAINERS.bat
```

---

### 3. Los contenedores están corriendo pero no puedo acceder

**Síntomas:**
- `docker ps` muestra contenedores como "Up"
- El navegador muestra "No se puede acceder al sitio" o timeout

**Posibles causas:**

#### A) Contenedores "unhealthy"
```batch
# Verificar salud
docker ps

# Si aparece "unhealthy", revisar logs:
docker-compose logs backend
docker-compose logs frontend

# Reiniciar servicios:
docker-compose restart backend frontend
```

#### B) Puertos ocupados por otros procesos
```batch
# Verificar qué está usando el puerto 3000
netstat -ano | findstr :3000

# Verificar qué está usando el puerto 8000
netstat -ano | findstr :8000

# Si hay conflictos, detener los procesos:
# Para puerto 3000:
FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :3000') DO TaskKill /PID %P /F

# Para puerto 8000:
FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :8000') DO TaskKill /PID %P /F

# Luego reiniciar:
docker-compose restart
```

#### C) Firewall bloqueando las conexiones
1. Abre Windows Defender Firewall
2. Permite Docker Desktop en redes privadas
3. Permite conexiones a localhost

#### D) WSL sin recursos suficientes
```batch
# Aplicar configuración optimizada:
APLICAR_CONFIG_16GB.bat

# Luego reiniciar WSL:
wsl --shutdown
```

---

### 4. Frontend muestra página en blanco

**Síntomas:**
- La página carga pero está en blanco
- Error 404 o errores de JavaScript en la consola

**Solución:**
```batch
# Rebuild del frontend:
REBUILD_FRONTEND.bat

# O reinicio rápido:
RESTART_FRONTEND_OPTIMIZED.bat
```

---

### 5. Backend muestra error 500 o 502

**Síntomas:**
- Error 500 Internal Server Error
- Error 502 Bad Gateway

**Solución:**
```batch
# Ver logs del backend:
docker-compose logs backend

# Aplicar migraciones si es necesario:
docker-compose exec backend python manage.py migrate

# Reiniciar backend:
docker-compose restart backend
```

---

### 6. Base de datos no conecta

**Síntomas:**
- Errores de conexión a PostgreSQL en los logs
- "could not connect to server"

**Solución:**
```batch
# Verificar PostgreSQL:
docker-compose ps db

# Si está "Exited", reiniciar:
docker-compose up -d db

# Esperar unos segundos y reiniciar backend:
docker-compose restart backend
```

---

### 7. Elasticsearch no responde

**Síntomas:**
- Búsquedas no funcionan
- Error de conexión a Elasticsearch

**Solución:**
```batch
# Verificar Elasticsearch:
docker-compose ps elasticsearch

# Reiniciar si es necesario:
docker-compose restart elasticsearch

# Reindexar:
SIMPLE_REINDEX.bat
```

---

## URLs de Acceso

Una vez que todo esté corriendo:

- **Frontend:** http://localhost:3000
- **Backend Admin:** http://localhost:8000/admin
- **API Rest:** http://localhost:8000/api/
- **API Docs:** http://localhost:8000/api/docs/

---

## Script de Verificación Completa

Ejecuta estos comandos en orden:

```batch
# 1. Verificar Docker
docker --version

# 2. Ver estado de contenedores
docker ps -a

# 3. Ver servicios
docker-compose ps

# 4. Iniciar todos los servicios
docker-compose up -d

# 5. Ver logs en tiempo real
docker-compose logs -f
```

---

## Checklist de Solución

- [ ] Docker Desktop está corriendo
- [ ] Ejecuté `docker ps` y veo contenedores "Up"
- [ ] Los contenedores están "healthy" (no "unhealthy")
- [ ] Los puertos 3000 y 8000 no están ocupados por otros procesos
- [ ] No hay errores en `docker-compose logs backend`
- [ ] No hay errores en `docker-compose logs frontend`
- [ ] Puedo acceder a http://localhost:3000
- [ ] Puedo acceder a http://localhost:8000/admin

---

## Si Nada Funciona

Reset completo del sistema:

```batch
# 1. Detener todo
docker-compose down

# 2. Limpiar Docker
docker system prune -a --volumes

# 3. Reiniciar WSL
wsl --shutdown

# 4. Esperar 30 segundos

# 5. Iniciar Docker Desktop

# 6. Rebuild completo
docker-compose build --no-cache
docker-compose up -d

# 7. Aplicar migraciones
docker-compose exec backend python manage.py migrate

# 8. Crear superusuario
CREAR_SUPERUSUARIO.bat
```

---

## Contacto de Soporte

Si después de seguir estas soluciones el problema persiste, documenta:
1. Salida de `DIAGNOSTICO_SERVICIOS.bat`
2. Logs completos: `docker-compose logs > logs.txt`
3. Versión de Docker: `docker --version`
4. Sistema operativo y RAM disponible
