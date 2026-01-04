# Instrucciones para Actualizar el Stack

Este documento explica cómo actualizar Node.js, Python y Django en el proyecto BVS Framework.

## Versiones Objetivo

- **Python**: 3.13.2
- **Node.js**: 22.20.0
- **Django**: 6.0

## Métodos de Actualización

### Opción 1: Script Automático (Recomendado)

Ejecuta el script batch desde Windows:

```bash
ACTUALIZAR_STACK.bat
```

Este script:
1. Actualiza Python a 3.13.2 en WSL
2. Actualiza Node.js a 22.20.0 usando nvm
3. Actualiza los Dockerfiles
4. Verifica Django 6.0 en requirements.txt
5. Reconstruye los contenedores Docker

### Opción 2: Ejecución Manual en WSL

Si prefieres ejecutar manualmente:

```bash
# Desde WSL
cd /mnt/d/bvs_framework
chmod +x actualizar-stack.sh
./actualizar-stack.sh
```

## Cambios Realizados

### 1. Backend (Python/Django)

**Dockerfile actualizado:**
- Base image: `python:3.13-slim` (antes `python:3.12-slim`)

**requirements.txt:**
- Django >= 6.0 (ya configurado)

### 2. Frontend (Node.js)

**Dockerfile:**
- Base image: `node:22-alpine` (ya configurado)
- Compatible con Node.js 22.20.0

### 3. WSL

El script instala:
- Python 3.13.2 compilado desde fuente con optimizaciones
- Node.js 22.20.0 mediante nvm (Node Version Manager)

## Verificación Post-Actualización

Después de ejecutar el script, verifica las versiones:

### En WSL:
```bash
python3 --version  # Debería mostrar Python 3.13.2
node --version     # Debería mostrar v22.20.0
npm --version      # Versión actualizada de npm
```

### En Docker:
```bash
# Reconstruir contenedores
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verificar Python en backend
docker-compose exec backend python --version

# Verificar Node en frontend
docker-compose exec frontend node --version

# Verificar Django
docker-compose exec backend python manage.py --version
```

## Pasos Post-Actualización

1. **Ejecutar migraciones de Django:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

2. **Reinstalar dependencias de Node:**
   ```bash
   docker-compose exec frontend npm install
   ```

3. **Verificar que los servicios funcionan:**
   ```bash
   docker-compose ps
   ```

4. **Probar la aplicación:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000/api

## Solución de Problemas

### Error al compilar Python

Si falla la compilación de Python:
- Verifica que tengas suficiente espacio en disco (al menos 2GB libres)
- Asegúrate de tener las dependencias de compilación instaladas
- Intenta ejecutar el script con `sudo bash actualizar-stack.sh`

### Error con nvm

Si nvm no se carga:
```bash
# Cargar nvm manualmente
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Reinstalar Node
nvm install 22.20.0
nvm use 22.20.0
```

### Contenedores no inician

Si los contenedores fallan al iniciar:
```bash
# Ver logs
docker-compose logs backend
docker-compose logs frontend

# Reconstruir sin caché
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Compatibilidad con Django 6.0

Django 6.0 puede requerir cambios en el código:
- Revisa la documentación de Django 6.0 para cambios breaking
- Prueba todas las funcionalidades principales
- Ejecuta tests: `docker-compose exec backend python manage.py test`

## Rollback

Si necesitas volver a las versiones anteriores:

1. **Restaurar Dockerfile del backend:**
   ```dockerfile
   FROM python:3.12-slim
   ```

2. **Restaurar requirements.txt:**
   ```
   Django>=5.0
   ```

3. **Reconstruir:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Notas Importantes

- ⚠️ La compilación de Python puede tardar 10-15 minutos
- ⚠️ Asegúrate de tener backups antes de actualizar
- ⚠️ Prueba en un entorno de desarrollo antes de producción
- ✅ El script crea Python 3.13 como instalación alternativa (altinstall)
- ✅ Node.js se gestiona con nvm para facilitar cambios de versión

## Contacto y Soporte

Si encuentras problemas durante la actualización, revisa:
1. Los logs del script de actualización
2. Los logs de Docker: `docker-compose logs`
3. La documentación oficial de Django 6.0
4. La documentación de Node.js 22
