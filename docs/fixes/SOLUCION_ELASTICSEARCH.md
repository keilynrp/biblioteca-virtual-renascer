# 🔧 Solución al Problema de Elasticsearch

## 🐛 Problema Identificado

El backend Django estaba fallando al iniciar debido a un error en la configuración de Elasticsearch:

```
ValueError: URL must include a 'scheme', 'host', and 'port' component (ie 'https://localhost:9200')
```

### Causa Raíz
En el archivo [backend/apps/content/documents.py](backend/apps/content/documents.py), la conexión a Elasticsearch estaba configurada incorrectamente:

```python
# ❌ INCORRECTO (falta el esquema http://)
connections.create_connection(
    hosts=['elasticsearch:9200'],
    timeout=20
)
```

### Solución Aplicada
Se corrigió la URL agregando el esquema `http://`:

```python
# ✅ CORRECTO
connections.create_connection(
    hosts=['http://elasticsearch:9200'],
    timeout=20
)
```

---

## 🚀 Cómo Aplicar la Solución

### Opción 1: Script Automático (Recomendado)

Ejecuta el script de reinicio en WSL:

```bash
cd /mnt/d/bvs_framework
chmod +x reiniciar-backend.sh
./reiniciar-backend.sh
```

Este script hará:
1. Detener el contenedor backend
2. Reconstruir la imagen
3. Iniciar el backend
4. Verificar los logs
5. Probar la conectividad HTTP

### Opción 2: Comandos Manuales

Si prefieres ejecutar los comandos manualmente:

```bash
cd /mnt/d/bvs_framework

# Detener el backend
sudo docker-compose stop backend

# Reconstruir la imagen
sudo docker-compose build backend

# Iniciar el backend
sudo docker-compose up -d backend

# Ver los logs
sudo docker-compose logs -f backend
```

---

## ✅ Verificación del Fix

Después de reiniciar, verifica que el backend esté funcionando:

### 1. Verificar logs (no debe haber errores de Elasticsearch):
```bash
sudo docker-compose logs backend --tail=50
```

### 2. Verificar endpoints HTTP:
```bash
# Backend API
curl http://localhost:8000/api/

# Django Admin
curl -I http://localhost:8000/admin/
```

### 3. Verificar todos los servicios:
```bash
sudo docker-compose ps
```

Deberías ver algo como:

```
Name                         State    Ports
--------------------------------------------------------
bvs_framework_backend_1      Up       0.0.0.0:8000->8000/tcp
bvs_framework_db_1           Up       0.0.0.0:5432->5432/tcp
bvs_framework_elasticsearch_1 Up      0.0.0.0:9200->9200/tcp, 9300/tcp
bvs_framework_frontend_1     Up       0.0.0.0:3000->3000/tcp
bvs_framework_redis_1        Up       0.0.0.0:6379->6379/tcp
```

---

## 🎯 Estado Esperado de los Servicios

Una vez aplicada la solución, todos los servicios deberían estar funcionando:

| Servicio | Puerto | Estado Esperado |
|----------|--------|----------------|
| Frontend | 3000 | ✅ Funcionando |
| Backend | 8000 | ✅ Funcionando (después del fix) |
| PostgreSQL | 5432 | ✅ Funcionando |
| Redis | 6379 | ✅ Funcionando |
| Elasticsearch | 9200 | ✅ Funcionando |

---

## 🔍 Pruebas Adicionales

### Probar la búsqueda de Elasticsearch:

Una vez que el backend esté funcionando, puedes probar el endpoint de búsqueda:

```bash
# Crear el índice de Elasticsearch
sudo docker-compose exec backend python manage.py search_index --rebuild

# Probar búsqueda
curl "http://localhost:8000/api/content/books/search/?q=python"
```

---

## 📚 URLs de Acceso

Después de aplicar el fix, podrás acceder a:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
- **Elasticsearch**: http://localhost:9200
- **PostgreSQL**: localhost:5432 (con cliente SQL)
- **Redis**: localhost:6379 (con cliente Redis)

---

## 💡 Notas Importantes

1. **El cambio ya está aplicado** en el código fuente
2. **Solo necesitas reiniciar** el contenedor backend para que tome efecto
3. **No es necesario** reconstruir todos los contenedores, solo el backend
4. **Los datos de la base de datos** no se verán afectados

---

## 🆘 Si el Problema Persiste

Si después de reiniciar el backend sigue sin funcionar:

1. **Verifica los logs completos:**
   ```bash
   sudo docker-compose logs backend
   ```

2. **Verifica que Elasticsearch esté respondiendo:**
   ```bash
   curl http://localhost:9200
   ```

3. **Reconstruye todo desde cero (última opción):**
   ```bash
   sudo docker-compose down -v
   sudo docker-compose up -d --build
   ```

4. **Comparte los logs** y te ayudaré a diagnosticar el problema.
