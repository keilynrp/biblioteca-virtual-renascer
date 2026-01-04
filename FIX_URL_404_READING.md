# Fix: Error 404 en Endpoint de Lectura

## Problema Identificado

**Error:** `Error 404: Not Found` al intentar iniciar una sesión de lectura

**Causa:** Las URLs del frontend no coincidían con las URLs registradas en el backend.

---

## 🔍 Análisis del Problema

### URLs del Frontend (INCORRECTAS)
```typescript
// Iniciar sesión de lectura
/api/user/readings/start/${bookId}/

// Obtener archivo PDF
/api/books/${bookId}/file/

// Actualizar progreso
/api/user/readings/${bookId}/progress/
```

### URLs Registradas en el Backend (CORRECTAS)

En `backend/config/urls.py`:
```python
path('api/content/', include('apps.content.urls'))
```

Esto significa que todas las URLs de `apps.content.urls` están bajo el prefijo `/api/content/`.

### URLs Finales Correctas
```typescript
// Iniciar sesión de lectura
/api/content/user/readings/start/${bookId}/

// Obtener archivo PDF
/api/content/books/${bookId}/file/

// Actualizar progreso
/api/content/user/readings/${bookId}/progress/
```

---

## ✅ Solución Aplicada

### Archivo Modificado
[frontend/src/app/(dashboard)/reader/[bookId]/page.tsx](frontend/src/app/(dashboard)/reader/[bookId]/page.tsx)

### Cambios Realizados

#### 1. Endpoint de Inicio de Sesión
**Antes:**
```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/user/readings/start/${bookId}/`,
  // ...
);
```

**Después:**
```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/content/user/readings/start/${bookId}/`,
  // ...
);
```

#### 2. URL del Archivo PDF
**Antes:**
```typescript
const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}/file/`;
```

**Después:**
```typescript
const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/content/books/${bookId}/file/`;
```

#### 3. Actualización de Progreso
**Antes:**
```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/user/readings/${bookId}/progress/`,
  // ...
);
```

**Después:**
```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/content/user/readings/${bookId}/progress/`,
  // ...
);
```

---

## 🚀 Cómo Aplicar el Fix

El fix ya está aplicado en el código. Solo necesitas reiniciar el frontend:

```bash
docker compose restart frontend
```

O si prefieres, espera a que Next.js detecte el cambio automáticamente (Hot Reload).

---

## 🧪 Verificar que Funciona

### 1. Verifica que el Backend Responde

Prueba el endpoint directamente:

```bash
# Obtén un token primero
docker compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
token, _ = Token.objects.get_or_create(user=user)
print(token.key)
"
```

Luego prueba el endpoint:

```bash
curl -X POST \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  http://localhost:8000/api/content/user/readings/start/1/
```

### 2. Prueba desde el Frontend

1. Abre http://localhost:3000
2. Inicia sesión
3. Ve a la biblioteca
4. Selecciona un libro
5. Haz clic en "Leer"

**Resultado esperado:** El visor PDF se abre sin error 404.

---

## 📊 Endpoints Verificados

| Endpoint | URL Correcta | Estado |
|----------|-------------|---------|
| Iniciar lectura | `/api/content/user/readings/start/{id}/` | ✅ Corregido |
| Archivo PDF | `/api/content/books/{id}/file/` | ✅ Corregido |
| Actualizar progreso | `/api/content/user/readings/{id}/progress/` | ✅ Corregido |

---

## 🔗 Estructura de URLs del Backend

Para referencia futura, esta es la estructura completa de URLs:

```
/api/
  ├─ auth/          → apps.authentication.urls
  ├─ institutions/  → apps.institutions.urls
  ├─ subscriptions/ → apps.subscriptions.urls
  ├─ payments/      → apps.payments.urls
  └─ content/       → apps.content.urls
       ├─ books/
       ├─ authors/
       ├─ categories/
       ├─ search/
       ├─ user/
       │   ├─ favorites/
       │   ├─ reviews/
       │   ├─ reading-history/
       │   └─ readings/  ← Endpoints de sesión de lectura
       └─ admin/
```

---

## 🎯 Próximos Pasos

1. **Reinicia el frontend** (si no se actualizó automáticamente):
   ```bash
   docker compose restart frontend
   ```

2. **Prueba el visor PDF**:
   - Navega a un libro
   - Haz clic en "Leer"
   - Verifica que no hay error 404

3. **Verifica que el progreso se guarda**:
   - Cambia de página en el PDF
   - Cierra el visor
   - Vuelve a abrir el mismo libro
   - Debería abrir en la misma página

---

## 🐛 Si el Error Persiste

### Error 404 Still Happening

1. **Limpia la caché del navegador:**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

2. **Verifica la variable de entorno:**
   ```bash
   # En el contenedor frontend
   docker compose exec frontend printenv | grep API_URL
   ```

   Debería mostrar:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Reconstruye el frontend:**
   ```bash
   docker compose up -d --build frontend
   ```

### Error 500 Internal Server Error

Si ahora obtienes error 500, significa que el endpoint está respondiendo pero hay un error en el backend:

```bash
# Ver logs del backend
docker compose logs backend --tail=50

# Verificar que las migraciones están aplicadas
bash fix-reading-simple.sh
```

### Error 401 Unauthorized

Tu token expiró. Cierra sesión y vuelve a iniciar sesión.

---

## 📝 Notas Técnicas

### ¿Por qué pasó esto?

El error ocurrió porque:

1. El código original asumía que las URLs estaban directamente bajo `/api/`
2. Pero en el backend, las URLs de contenido están bajo `/api/content/`
3. Esta configuración permite separar lógicamente los diferentes módulos de la aplicación

### ¿Cómo evitarlo en el futuro?

1. **Crea constantes para las URLs base:**
   ```typescript
   // constants/api.ts
   export const API_ENDPOINTS = {
     CONTENT: '/api/content',
     AUTH: '/api/auth',
     // ...
   };
   ```

2. **Usa las constantes en lugar de strings hardcodeados:**
   ```typescript
   const url = `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.CONTENT}/user/readings/start/${bookId}/`;
   ```

3. **Centraliza las llamadas API en un servicio:**
   ```typescript
   // services/readingService.ts
   export const startReading = (bookId: number) => {
     return api.post(`/content/user/readings/start/${bookId}/`);
   };
   ```

---

## ✅ Resumen

- ✅ **Problema identificado:** URLs incorrectas en el frontend
- ✅ **Causa raíz:** Faltaba el prefijo `/content/` en las URLs
- ✅ **Solución aplicada:** Corregidas 3 URLs en el componente reader
- ✅ **Archivo modificado:** `frontend/src/app/(dashboard)/reader/[bookId]/page.tsx`
- ✅ **Próximo paso:** Reiniciar frontend y probar

---

**Última actualización:** 2025-01-02
**Versión:** 1.0
