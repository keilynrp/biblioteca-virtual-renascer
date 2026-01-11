# 🐳 Guía de Configuración de Docker

## Pasos para Iniciar el Proyecto

### 1. Iniciar Docker Desktop

**Opción A - Desde el menú de Windows:**
1. Presiona la tecla Windows
2. Busca "Docker Desktop"
3. Haz clic para iniciar
4. Espera a que el ícono en la bandeja del sistema muestre "Docker Desktop is running"

**Opción B - Desde PowerShell (como administrador):**
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### 2. Verificar que Docker está corriendo

Espera 30-60 segundos y luego ejecuta:

```bash
docker --version
docker ps
```

Deberías ver la versión de Docker y una lista de contenedores (puede estar vacía).

### 3. Iniciar los Servicios del Proyecto

Una vez Docker Desktop esté corriendo:

```bash
cd d:/bvs_framework
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- **Elasticsearch (puertos 9200, 9300)** ⭐ NUEVO
- Backend Django (puerto 8000)
- Frontend Next.js (puerto 3000)

### 4. Verificar que Elasticsearch está corriendo

```bash
# Verificar contenedores
docker-compose ps

# Debería mostrar algo como:
# NAME                      STATUS
# bvs_framework-db-1        Up
# bvs_framework-redis-1     Up
# bvs_framework-elasticsearch-1   Up
# bvs_framework-backend-1   Up
# bvs_framework-frontend-1  Up
```

**Verificar Elasticsearch específicamente:**
```bash
curl http://localhost:9200
```

Deberías ver una respuesta JSON con información del cluster.

### 5. Indexar Libros en Elasticsearch

**Importante:** Ejecuta esto después de que todos los servicios estén corriendo.

```bash
# Opción 1: Ejecutar desde el host (si tienes Python configurado)
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py index_books --rebuild

# Opción 2: Ejecutar dentro del contenedor de Docker
docker-compose exec backend python manage.py index_books --rebuild
```

**Salida esperada:**
```
Eliminando índice existente...
✓ Índice eliminado
Inicializando índice...
✓ Índice inicializado
Indexando 205 libros...
  Indexados: 10/205
  Indexados: 20/205
  ...
✓ Indexación completada
  Total de libros: 205
  Indexados exitosamente: 205
  Errores: 0
```

### 6. Verificar que todo funciona

**Backend:**
```bash
curl http://localhost:8000/api/content/books/
```

**Búsqueda Elasticsearch:**
```bash
curl "http://localhost:8000/api/content/search/?q=python"
```

**Autocomplete:**
```bash
curl "http://localhost:8000/api/content/search/autocomplete/?q=prog"
```

**Frontend:**
Abre en tu navegador: http://localhost:3000

**Página de búsqueda:**
http://localhost:3000/search

---

## Comandos Útiles de Docker

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
# Elasticsearch
docker-compose logs -f elasticsearch

# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend
```

### Reiniciar un servicio específico
```bash
docker-compose restart elasticsearch
docker-compose restart backend
```

### Detener todos los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (¡CUIDADO! Borra datos)
```bash
docker-compose down -v
```

### Ver contenedores corriendo
```bash
docker ps
```

### Ver todos los contenedores (incluyendo detenidos)
```bash
docker ps -a
```

### Acceder a un contenedor
```bash
# Backend
docker-compose exec backend bash

# Elasticsearch
docker-compose exec elasticsearch bash

# PostgreSQL
docker-compose exec db psql -U postgres -d biblioteca
```

---

## Troubleshooting

### Problema: "Cannot connect to Docker daemon"

**Solución:**
1. Verifica que Docker Desktop está corriendo
2. Busca el ícono de Docker en la bandeja del sistema
3. Si no está corriendo, inícialo desde el menú de Windows

### Problema: Puerto ya en uso

**Error:** `Bind for 0.0.0.0:9200 failed: port is already allocated`

**Solución:**
```bash
# Ver qué proceso está usando el puerto
netstat -ano | findstr :9200

# Detener el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F

# O cambiar el puerto en docker-compose.yml:
ports:
  - "9201:9200"  # Usar puerto 9201 en lugar de 9200
```

### Problema: Elasticsearch no inicia (Out of Memory)

**Solución:**
1. Aumentar memoria en Docker Desktop:
   - Settings → Resources → Memory
   - Recomendado: Mínimo 4GB

2. O reducir memoria heap de Elasticsearch en docker-compose.yml:
```yaml
elasticsearch:
  environment:
    - "ES_JAVA_OPTS=-Xms256m -Xmx256m"  # Reducir de 512m
```

### Problema: "Connection refused" al hacer requests a Elasticsearch

**Verificar:**
```bash
# 1. ¿Está corriendo el contenedor?
docker-compose ps

# 2. ¿Está healthy?
docker-compose exec elasticsearch curl http://localhost:9200/_cluster/health

# 3. Ver logs de Elasticsearch
docker-compose logs elasticsearch
```

**Soluciones comunes:**
- Esperar más tiempo (Elasticsearch puede tardar 30-60s en iniciar)
- Reiniciar el contenedor: `docker-compose restart elasticsearch`
- Verificar logs: `docker-compose logs elasticsearch | grep ERROR`

### Problema: Índice no se crea o búsqueda no funciona

**Verificar índice:**
```bash
# Ver todos los índices
curl http://localhost:9200/_cat/indices?v

# Debería mostrar el índice "books"
```

**Recrear índice:**
```bash
docker-compose exec backend python manage.py index_books --rebuild
```

**Verificar que hay documentos:**
```bash
curl http://localhost:9200/books/_count
```

### Problema: Cambios en código no se reflejan

**Backend:**
```bash
docker-compose restart backend
```

**Frontend:**
```bash
docker-compose restart frontend
```

**Si persiste, rebuild:**
```bash
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

---

## Monitoreo de Elasticsearch

### Ver salud del cluster
```bash
curl http://localhost:9200/_cluster/health?pretty
```

### Ver información del índice books
```bash
curl http://localhost:9200/books?pretty
```

### Ver mapping del índice
```bash
curl http://localhost:9200/books/_mapping?pretty
```

### Ver todos los documentos (primeros 10)
```bash
curl http://localhost:9200/books/_search?pretty
```

### Búsqueda de ejemplo
```bash
curl -X GET "http://localhost:9200/books/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "title": "python"
    }
  }
}
'
```

### Estadísticas del índice
```bash
curl http://localhost:9200/books/_stats?pretty
```

---

## Flujo Completo de Inicio

**Resumen de comandos en orden:**

```bash
# 1. Iniciar Docker Desktop (manualmente desde Windows)

# 2. Esperar que Docker esté listo (30-60 segundos)

# 3. Ir al directorio del proyecto
cd d:/bvs_framework

# 4. Iniciar servicios
docker-compose up -d

# 5. Esperar que Elasticsearch esté listo (30-60 segundos)
# Verificar:
curl http://localhost:9200

# 6. Indexar libros
docker-compose exec backend python manage.py index_books --rebuild

# 7. Verificar que funciona
curl "http://localhost:8000/api/content/search/?q=python"

# 8. Abrir navegador
# http://localhost:3000/search
```

---

## Estado Actual del Proyecto

### Servicios Configurados

| Servicio | Puerto | Estado | Descripción |
|----------|--------|--------|-------------|
| PostgreSQL | 5432 | ✅ | Base de datos |
| Redis | 6379 | ✅ | Cache |
| **Elasticsearch** | **9200, 9300** | ✅ **NUEVO** | Búsqueda |
| Backend | 8000 | ✅ | Django API |
| Frontend | 3000 | ✅ | Next.js |

### Endpoints Disponibles

**API Backend:**
- http://localhost:8000/api/content/books/
- http://localhost:8000/api/content/search/
- http://localhost:8000/api/content/search/autocomplete/
- http://localhost:8000/api/content/search/facets/

**Frontend:**
- http://localhost:3000/ (Dashboard)
- http://localhost:3000/search (Búsqueda)
- http://localhost:3000/library (Biblioteca)

**Elasticsearch:**
- http://localhost:9200/ (Cluster info)
- http://localhost:9200/books/_search (Búsqueda directa)

---

## Próximos Pasos

Una vez que Docker y Elasticsearch estén corriendo:

1. ✅ Verificar que puedes acceder a http://localhost:9200
2. ✅ Ejecutar `python manage.py index_books --rebuild`
3. ✅ Probar búsqueda en http://localhost:3000/search
4. ✅ Verificar autocomplete escribiendo en el SearchBar
5. ✅ Probar filtros (categorías, autores, tipo)

**¡Listo para usar el sistema de búsqueda con Elasticsearch!** 🚀
