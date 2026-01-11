# Solución - Network Error (AxiosError)

## Problema

El frontend muestra `AxiosError: Network Error` al intentar conectarse al backend.

## Causa

El error ocurre porque el frontend dentro del contenedor Docker intenta conectarse a `http://localhost:8000/api`, pero `localhost` dentro de un contenedor Docker se refiere al propio contenedor, no al host.

## Soluciones

### Solución 1: Usar host.docker.internal (Recomendado para Windows/Mac)

El archivo `docker-compose.fixed.yml` ya incluye esta configuración:

```yaml
frontend:
  environment:
    - NEXT_PUBLIC_API_URL=http://localhost:8000/api
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

**Pasos:**

1. Reemplaza el archivo `docker-compose.yml`:
   ```bash
   copy docker-compose.fixed.yml docker-compose.yml
   ```

2. Reinicia los servicios:
   ```bash
   REINICIAR_SERVICIOS.bat
   ```

---

### Solución 2: Verificar que el Backend está Corriendo

**Ejecuta el diagnóstico:**
```bash
DIAGNOSTICO_CONEXION.bat
```

Esto verificará:
- ✅ Estado de contenedores Docker
- ✅ Backend respondiendo en http://localhost:8000
- ✅ Frontend respondiendo en http://localhost:3000
- ✅ Configuración del API
- ✅ Logs de errores

**Si el backend NO responde:**

```bash
# Reiniciar solo el backend
docker compose restart backend

# Ver los logs del backend
docker compose logs -f backend

# Si hay errores, reconstruir
docker compose build backend
docker compose up -d backend
```

---

### Solución 3: Verificar Configuración de CORS en el Backend

El backend debe permitir peticiones desde el frontend. Verifica el archivo `backend/config/settings/base.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

**Si necesitas actualizar CORS:**

1. Abre `backend/config/settings/base.py`
2. Asegúrate de que las URLs estén en `CORS_ALLOWED_ORIGINS`
3. Reinicia el backend:
   ```bash
   docker compose restart backend
   ```

---

### Solución 4: Verificar Variables de Entorno del Frontend

El archivo `.env.local` debe tener:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_TELEMETRY_DISABLED=1
```

**Si la variable está incorrecta:**

1. Edita `frontend/.env.local`
2. Verifica que la URL sea `http://localhost:8000/api`
3. Reinicia el frontend:
   ```bash
   docker compose restart frontend
   ```

---

### Solución 5: Limpiar y Reconstruir Todo (Reset Completo)

Si ninguna solución funciona, haz un reset completo:

```bash
# Detener todos los contenedores
docker compose down

# Limpiar volúmenes (CUIDADO: borra la base de datos)
docker compose down -v

# Reconstruir todo
docker compose build --no-cache

# Iniciar servicios en orden
docker compose up -d db elasticsearch redis
timeout /t 10
docker compose up -d backend
timeout /t 5
docker compose up -d frontend

# Ver logs
docker compose logs -f
```

---

## Verificación de la Solución

### 1. Verificar que el Backend Responde

Abre en el navegador o usa curl:
```bash
curl http://localhost:8000/api/auth/health/
```

Debe responder con código 200.

### 2. Verificar que el Frontend Carga

Abre: http://localhost:3000

Debe mostrar la landing page sin errores.

### 3. Verificar la Conexión Frontend-Backend

1. Abre http://localhost:3000/login
2. Abre DevTools (F12) → Network tab
3. Intenta hacer login
4. Verifica que las peticiones a `/api/auth/login/` se completen exitosamente

**Si ves "Network Error":**
- Verifica que el backend esté corriendo: `docker compose ps`
- Revisa los logs del backend: `docker compose logs backend`
- Verifica CORS en el backend

**Si ves "404 Not Found":**
- Verifica que la URL del API sea correcta
- Verifica que las rutas del backend estén configuradas

**Si ves "500 Internal Server Error":**
- Hay un error en el backend
- Revisa los logs: `docker compose logs -f backend`

---

## Errores Comunes y Soluciones

### Error: "ECONNREFUSED"
**Causa:** El backend no está corriendo
**Solución:** `docker compose up -d backend`

### Error: "CORS policy"
**Causa:** El backend no permite peticiones desde el frontend
**Solución:** Actualiza `CORS_ALLOWED_ORIGINS` en el backend

### Error: "Timeout"
**Causa:** El backend está muy lento o no responde
**Solución:** Verifica recursos del contenedor, reinicia Docker Desktop

### Error: "Cannot read properties of undefined"
**Causa:** La respuesta del backend no tiene el formato esperado
**Solución:** Verifica los serializers del backend

---

## Scripts de Diagnóstico Creados

1. **DIAGNOSTICO_CONEXION.bat** - Diagnostica el estado de todos los servicios
2. **REINICIAR_SERVICIOS.bat** - Reinicia todos los servicios en orden correcto
3. **docker-compose.fixed.yml** - Configuración corregida de Docker Compose

---

## Arquitectura de Red

```
┌─────────────────────────────────────────────┐
│ Navegador (http://localhost:3000)          │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ Frontend Container (Puerto 3000)            │
│ - Next.js App                               │
│ - Axios → http://localhost:8000/api         │
│ - Usa host.docker.internal                  │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ Backend Container (Puerto 8000)             │
│ - Django REST API                           │
│ - CORS habilitado para localhost:3000      │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ Database Container (Puerto 5432)            │
│ - PostgreSQL                                │
└─────────────────────────────────────────────┘
```

---

## Notas Importantes

1. **Dentro de Docker:** Los contenedores se comunican usando nombres de servicio (`backend`, `frontend`, `db`)

2. **Desde el Navegador:** El navegador usa `localhost` porque se conecta a puertos expuestos en el host

3. **Variables de Entorno:** `NEXT_PUBLIC_*` son accesibles en el navegador, otras solo en el servidor

4. **Hot Reload:** El frontend con `npm run dev` recarga automáticamente, pero variables de entorno requieren reinicio

---

## Recursos Adicionales

- [Docker Networking](https://docs.docker.com/network/)
- [Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)

---

**Fecha:** 2025-12-28
**Estado:** 🔍 Diagnóstico creado - Ejecuta DIAGNOSTICO_CONEXION.bat
