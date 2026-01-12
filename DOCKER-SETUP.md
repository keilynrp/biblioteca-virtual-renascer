# Guía de Inicio con Docker

## Requisitos Previos

- Docker Desktop instalado y corriendo
- Al menos 8GB de RAM disponible
- 10GB de espacio en disco

## Inicio Rápido

### Windows (PowerShell)
```powershell
.\start-docker.ps1
```

### Linux/Mac/Git Bash
```bash
./start-docker.sh
```

### Manual
```bash
docker-compose up --build -d
```

## Servicios Disponibles

Una vez iniciados los contenedores, los siguientes servicios estarán disponibles:

- **Frontend (Next.js)**: http://localhost:3000
- **Backend (Django)**: http://localhost:8000
- **Admin de Django**: http://localhost:8000/admin
- **MeiliSearch**: http://localhost:7700
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Credenciales por defecto

### Base de datos PostgreSQL
- **Base de datos**: biblioteca
- **Usuario**: postgres
- **Contraseña**: postgres
- **Puerto**: 5432

### MeiliSearch
- **Master Key**: your-master-key-change-this
- **URL**: http://localhost:7700

## Comandos útiles de Docker

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Ver estado de los servicios
docker-compose ps

# Detener todos los servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend

# Reconstruir imágenes
docker-compose build --no-cache

# Ver logs en tiempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Acceder a la shell de un contenedor
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Resumen del problema

El problema no es que las imágenes de Docker no existan - los Dockerfiles están correctamente configurados. El problema es que **Docker Desktop no está corriendo**.

### Solución:

1. **Inicia Docker Desktop**:
   - Busca "Docker Desktop" en el menú de inicio de Windows
   - Espera a que se inicie completamente (verás el ícono en la bandeja del sistema)

2. **Una vez que Docker Desktop esté corriendo**, ejecuta uno de estos comandos:

   **Opción A - PowerShell:**
   ```powershell
   cd d:\bvs_framework
   .\start-docker.ps1
   ```

   **Opción B - Bash:**
   ```bash
   cd /d/bvs_framework
   ./start-docker.sh
   ```

   **O manualmente:**
   ```bash
   cd d:\bvs_framework
   docker-compose up --build -d
   ```

## Resumen

**Problema identificado**: Docker Desktop no está corriendo, por lo que no se pueden construir ni iniciar las imágenes.

**Solución:**

1. **Inicia Docker Desktop** manualmente desde el menú de inicio de Windows

2. **Una vez que Docker Desktop esté corriendo**, ejecuta uno de estos comandos:

   **PowerShell:**
   ```powershell
   .\start-docker.ps1
   ```

   **O Git Bash/WSL:**
   ```bash
   ./start-docker.sh
   ```

   **O manualmente:**
   ```bash
   docker-compose up --build -d
   ```

3. Los servicios estarán disponibles en:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379
   - MeiliSearch: http://localhost:7700

El problema es que **Docker Desktop no está corriendo**. Una vez que lo inicies y ejecutes uno de los scripts que creé, Docker construirá las imágenes automáticamente usando los Dockerfiles que ya existen en el proyecto.