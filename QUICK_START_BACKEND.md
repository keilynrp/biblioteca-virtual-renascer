# 🚀 Quick Start - Backend

Guía rápida para levantar el backend sin complicaciones.

---

## ⚡ Inicio Rápido (Windows)

### Opción 1: Archivo .bat (Más fácil)

```cmd
start-backend.bat
```

Selecciona la opción 1 para inicio normal.

### Opción 2: PowerShell

```powershell
.\Start-Backend.ps1
```

O ejecuta directamente:

```powershell
# Inicio normal
.\Start-Backend.ps1 -Action start

# Inicio rápido (sin rebuild)
.\Start-Backend.ps1 -Action skip-build

# Inicio limpio
.\Start-Backend.ps1 -Action fresh
```

### Opción 3: Git Bash (Recomendado para control total)

```bash
./scripts/start_backend_optimized.sh
```

---

## ⚡ Inicio Rápido (Linux/Mac)

```bash
# Dar permisos (solo primera vez)
chmod +x scripts/start_backend_optimized.sh
chmod +x scripts/fix_backend_issues.sh

# Iniciar backend
./scripts/start_backend_optimized.sh
```

---

## 🔧 Opciones de Inicio

### Inicio Normal (Primera vez o después de cambios)

```bash
./scripts/start_backend_optimized.sh
```

**Hace:**
- ✅ Verifica Docker
- ✅ Limpia contenedores antiguos
- ✅ Construye imagen
- ✅ Inicia servicios (DB, Redis, Meilisearch)
- ✅ Actualiza dependencias
- ✅ Ejecuta migraciones
- ✅ Verifica salud del sistema

**Tiempo:** ~3-5 minutos

---

### Inicio Rápido (Sin cambios en código)

```bash
./scripts/start_backend_optimized.sh --skip-build
```

**Hace:**
- ✅ Usa imagen existente (no rebuilds)
- ✅ Inicia servicios
- ✅ Verifica migraciones
- ✅ Verifica salud

**Tiempo:** ~1-2 minutos

---

### Inicio Limpio (Cuando todo está roto)

```bash
./scripts/start_backend_optimized.sh --fresh
```

**Hace:**
- ⚠️ **BORRA TODOS LOS DATOS**
- ✅ Elimina volúmenes
- ✅ Reconstruye todo desde cero
- ✅ Base de datos vacía

**Tiempo:** ~5-7 minutos

---

## 🩺 Diagnóstico de Problemas

Si el backend no arranca:

### Windows (bat):
```cmd
start-backend.bat
```
Selecciona opción 4 (Fix backend issues)

### PowerShell:
```powershell
.\Start-Backend.ps1 -Action fix
```

### Bash:
```bash
./scripts/fix_backend_issues.sh
```

### Menú Interactivo

El script de diagnóstico ofrece:

1. **Full system check** - Revisa todo el sistema
2. **Check port conflicts** - Verifica si puertos están ocupados
3. **Fix dependency conflicts** - Resuelve problemas de paquetes
4. **Fix database issues** - Repara problemas de DB
5. **Nuclear option** - Reset completo (último recurso)

---

## 📊 Verificar que Todo Funciona

Después de iniciar, verifica estas URLs:

### Backend API
```
http://localhost:8000/api/
```

### Django Admin
```
http://localhost:8000/admin/
```

### Meilisearch
```
http://localhost:7700/health
```

### Verificar Servicios

```bash
docker-compose ps
```

Deberías ver:

```
NAME                    STATUS              PORTS
backend                 Up (healthy)        0.0.0.0:8000->8000/tcp
db                      Up (healthy)        0.0.0.0:5432->5432/tcp
redis                   Up (healthy)        0.0.0.0:6379->6379/tcp
meilisearch             Up (healthy)        0.0.0.0:7700->7700/tcp
```

---

## 👤 Crear Superusuario

### Primera vez (método recomendado):

**Windows (bat):**
```cmd
start-backend.bat
```
Selecciona opción 8

**PowerShell:**
```powershell
.\Start-Backend.ps1 -Action superuser
```

**Bash:**
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Credenciales sugeridas:

```
Username: admin
Email: admin@biblioteca.com
Password: admin123 (cambiar en producción)
```

---

## 📝 Comandos Útiles Post-Inicio

### Ver Logs

```bash
# Logs en tiempo real
docker-compose logs -f backend

# Últimas 100 líneas
docker-compose logs backend --tail=100
```

### Django Shell

```bash
docker-compose exec backend python manage.py shell
```

### Ejecutar Migraciones

```bash
# Ver estado
docker-compose exec backend python manage.py showmigrations

# Ejecutar pendientes
docker-compose exec backend python manage.py migrate
```

### Tests

```bash
# Todos los tests
docker-compose exec backend pytest

# Con coverage
docker-compose exec backend pytest --cov
```

### Acceder a Base de Datos

```bash
docker-compose exec db psql -U postgres -d biblioteca
```

---

## 🛑 Detener Servicios

### Detener sin borrar datos:

```bash
docker-compose down
```

### Detener y borrar TODO (cuidado):

```bash
docker-compose down -v
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema: "Port 8000 already in use"

**Solución:**
```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 2 (Check port conflicts)
```

O manualmente:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

---

### Problema: "Cannot connect to database"

**Solución:**
```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 8 (Fix database issues)
```

O manualmente:
```bash
docker-compose restart db
docker-compose logs db
```

---

### Problema: "ModuleNotFoundError" o errores de imports

**Solución:**
```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 7 (Fix dependency conflicts)
```

O manualmente:
```bash
docker-compose build --no-cache backend
```

---

### Problema: "Migration conflicts"

**Solución:**
```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 11 (Fix migrations)
```

O manualmente:
```bash
docker-compose run --rm backend python manage.py migrate --fake-initial
docker-compose run --rm backend python manage.py migrate
```

---

### Problema: Backend arranca pero no responde

**Solución:**
```bash
# Ver logs para identificar el error
docker-compose logs backend --tail=50

# Reiniciar servicio
docker-compose restart backend

# Si sigue fallando, rebuild
docker-compose build --no-cache backend
docker-compose up -d backend
```

---

### Problema: "Docker daemon not running"

**Solución Windows:**
1. Abrir Docker Desktop
2. Esperar a que inicie completamente
3. Reintentar

**Solución Linux:**
```bash
sudo systemctl start docker
```

**Solución Mac:**
```bash
open -a Docker
```

---

### Problema: Memoria/Disco insuficiente

**Solución:**
```bash
# Limpiar Docker
docker system prune -af --volumes

# Ver uso
docker system df
```

---

## 📚 Documentación Adicional

Para más detalles, consulta:

- [scripts/BACKEND_SCRIPTS_README.md](scripts/BACKEND_SCRIPTS_README.md) - Documentación completa de scripts
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Guía de resolución de problemas
- [README.md](README.md) - Documentación general del proyecto

---

## 🆘 Última Opción: Reset Nuclear

Si absolutamente nada funciona:

```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 15 (NUCLEAR OPTION)
# Escribir 'yes' para confirmar
```

Luego:

```bash
./scripts/start_backend_optimized.sh --fresh
```

⚠️ **ADVERTENCIA:** Esto borrará TODA la base de datos y volúmenes.

---

## ✅ Checklist de Inicio Exitoso

Marca cuando completes cada paso:

- [ ] Docker Desktop está corriendo
- [ ] Ejecutaste el script de inicio
- [ ] Todos los servicios muestran "healthy"
- [ ] Backend responde en http://localhost:8000
- [ ] Admin accesible en http://localhost:8000/admin/
- [ ] Creaste un superusuario
- [ ] Puedes hacer login en el admin
- [ ] Logs no muestran errores críticos

---

## 🎯 Próximos Pasos

Una vez el backend esté corriendo:

1. **Crear datos de prueba:**
   ```bash
   docker-compose exec backend python manage.py shell
   # Crear libros, usuarios, etc.
   ```

2. **Configurar Meilisearch:**
   ```bash
   docker-compose exec backend python manage.py index_books
   ```

3. **Levantar el Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Ejecutar tests:**
   ```bash
   docker-compose exec backend pytest
   ```

---

## 📞 Soporte

Si sigues teniendo problemas:

1. Revisa los logs: `docker-compose logs backend > logs.txt`
2. Ejecuta diagnóstico: `./scripts/fix_backend_issues.sh`
3. Consulta [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. Busca el error en la documentación de Django

---

**¡Happy Coding! 🚀**
