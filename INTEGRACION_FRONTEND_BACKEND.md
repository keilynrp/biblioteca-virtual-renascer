# 🔗 Guía de Integración Frontend-Backend

## 📋 Resumen de la Integración

El proyecto tiene una integración completa entre el **frontend Next.js** y el **backend Django REST Framework** usando:

- **API REST** con autenticación JWT
- **Axios** para peticiones HTTP
- **Zustand** para manejo de estado global
- **CORS** configurado para desarrollo local
- **Refresh tokens** automáticos

---

## 🎯 Verificación Rápida

### Script de Verificación Integral

Ejecuta este script para verificar TODA la integración:

```bash
cd /mnt/d/bvs_framework
chmod +x verificar-integracion.sh
./verificar-integracion.sh
```

Este script verifica:
- ✅ Estado de todos los servicios
- ✅ Conectividad backend-frontend
- ✅ Configuración de URLs y CORS
- ✅ Endpoints del API
- ✅ Autenticación end-to-end
- ✅ Tokens JWT
- ✅ Logs de errores

---

## 🔧 Configuración Actual

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (.env)

```env
# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Otros
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend
```

---

## 🌐 Arquitectura de la Integración

### Flujo de Autenticación

```
┌─────────────┐           ┌─────────────┐           ┌──────────────┐
│  Frontend   │           │   Backend   │           │  PostgreSQL  │
│  (Next.js)  │           │  (Django)   │           │              │
└──────┬──────┘           └──────┬──────┘           └──────┬───────┘
       │                         │                         │
       │ 1. POST /api/auth/login/│                         │
       ├────────────────────────>│                         │
       │   {username, password}  │                         │
       │                         │ 2. Verify credentials   │
       │                         ├────────────────────────>│
       │                         │                         │
       │                         │<────────────────────────┤
       │  3. JWT tokens          │                         │
       │<────────────────────────┤                         │
       │  {access, refresh}      │                         │
       │                         │                         │
       │ 4. Store in localStorage│                         │
       │    & Zustand            │                         │
       │                         │                         │
       │ 5. GET /api/users/me/   │                         │
       ├────────────────────────>│                         │
       │ Header: Bearer {token}  │                         │
       │                         │ 6. Validate token       │
       │                         │                         │
       │  7. User data           │                         │
       │<────────────────────────┤                         │
       │                         │                         │
```

### Componentes Clave

#### 1. Cliente API (frontend/src/lib/api.ts)

```typescript
// Configuración de Axios con interceptores
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Interceptor de request - Agrega token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de response - Refresh automático de tokens
api.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Intentar refrescar el token
            const refreshToken = localStorage.getItem('refreshToken');
            // ... lógica de refresh
        }
    }
);
```

#### 2. Store de Autenticación (frontend/src/store/authStore.ts)

```typescript
// Zustand store con persistencia
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            login: (user, accessToken, refreshToken) => {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                set({ user, accessToken, refreshToken, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },
        }),
        { name: 'auth-storage' }
    )
);
```

---

## 🔌 Endpoints Importantes

### Autenticación

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/login/` | POST | Login (obtiene tokens) |
| `/api/auth/refresh/` | POST | Refrescar access token |
| `/api/auth/logout/` | POST | Cerrar sesión |
| `/api/auth/register/` | POST | Registro de usuario |

### Usuarios

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/users/me/` | GET | Datos del usuario actual |
| `/api/users/me/` | PUT/PATCH | Actualizar perfil |
| `/api/users/me/avatar/` | POST | Subir avatar |

### Contenido

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/content/books/` | GET | Listar libros |
| `/api/content/books/{id}/` | GET | Detalle de libro |
| `/api/content/categories/` | GET | Listar categorías |
| `/api/content/authors/` | GET | Listar autores |
| `/api/content/books/search/` | GET | Búsqueda de libros |

---

## 🧪 Pruebas Manuales

### 1. Probar Login desde el Frontend

Accede a: http://localhost:3000/login

Credenciales:
- Username: `admin`
- Password: `admin123456`

### 2. Probar API directamente con curl

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'

# Respuesta esperada:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@biblioteca.com"
  }
}
```

```bash
# Usar el token para acceder a endpoint protegido
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Verificar CORS

Desde la consola del navegador en http://localhost:3000:

```javascript
fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123456' })
})
.then(r => r.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

Si hay errores de CORS, verifica que `backend/.env` contenga:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 🔧 Solución de Problemas

### Error: "Network Error" en el frontend

**Causa:** El backend no está corriendo o no es accesible.

**Solución:**
```bash
# Verificar que el backend esté corriendo
sudo docker-compose ps backend

# Ver logs del backend
sudo docker-compose logs backend

# Reiniciar el backend
sudo docker-compose restart backend
```

### Error: "CORS policy"

**Causa:** El frontend no está en la lista de orígenes permitidos.

**Solución:**
1. Verifica `backend/.env`:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

2. Reinicia el backend:
   ```bash
   sudo docker-compose restart backend
   ```

### Error: "401 Unauthorized" en todas las peticiones

**Causa:** Token inválido o expirado.

**Solución:**
1. Limpia localStorage en el navegador:
   ```javascript
   localStorage.clear();
   ```

2. Vuelve a hacer login

3. Verifica que el token se está enviando:
   - Abre DevTools → Network
   - Mira las peticiones
   - Verifica que el header `Authorization: Bearer ...` esté presente

### Error: "404 Not Found" en endpoints

**Causa:** El endpoint no existe o las URLs no coinciden.

**Solución:**
1. Verifica las URLs del backend:
   ```bash
   sudo docker-compose exec backend python manage.py show_urls | grep api
   ```

2. Compara con las URLs que usa el frontend

---

## 📊 Checklist de Integración

Usa este checklist para verificar que todo funciona:

- [ ] Backend corriendo en puerto 8000
- [ ] Frontend corriendo en puerto 3000
- [ ] CORS configurado correctamente
- [ ] `.env.local` del frontend tiene `NEXT_PUBLIC_API_URL` correcto
- [ ] Login funciona desde el frontend
- [ ] Tokens se guardan en localStorage
- [ ] Peticiones autenticadas funcionan
- [ ] Refresh token automático funciona
- [ ] Logout limpia tokens
- [ ] Redirección a login cuando token expira

---

## 🎯 Siguientes Pasos

Una vez verificada la integración:

1. **Prueba funcionalidades específicas:**
   - Listar libros
   - Ver detalle de libro
   - Búsqueda
   - Filtros
   - Paginación

2. **Crea datos de prueba:**
   - Categorías
   - Autores
   - Libros
   - Usuarios de prueba

3. **Prueba el flujo completo:**
   - Registro de usuario
   - Login
   - Navegación
   - Lectura de libros (si está implementado)
   - Suscripciones (si está implementado)

---

## 📝 Resumen Rápido

**Verificar integración completa:**
```bash
./verificar-integracion.sh
```

**Accesos:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

**Credenciales:**
- Username: `admin`
- Password: `admin123456`

---

¡La integración está completa y lista para desarrollo! 🚀
