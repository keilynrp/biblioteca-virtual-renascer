# 🔐 Solución: Token Expirado - No Puede Acceder

## ❌ Problema

```
Usuario: admin
Contraseña: admin123
Error: Token expirado / No puede acceder
```

## ✅ Solución Inmediata

### Opción 1: Login Normal (RECOMENDADO) ⭐

```
1. Ve a: http://localhost:3000/login
2. Ingresa:
   - Usuario: admin
   - Contraseña: admin123
3. Click "Login"
4. ✅ Listo
```

El frontend automáticamente:
- Guardará nuevos tokens
- Renovará el token cuando expire
- Te mantendrá autenticado

---

## 🔍 ¿Por Qué Expiró el Token?

### Configuración Actual

```python
# backend/config/settings.py (líneas 69-72)

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),   # ⏱️ 60 minutos
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),      # ⏱️ 1 día
}
```

### Ciclo de Vida de Tokens

| Token | Duración | ¿Qué pasa cuando expira? |
|-------|----------|--------------------------|
| **Access Token** | 60 minutos | Frontend usa refresh token automáticamente |
| **Refresh Token** | 1 día | Te redirige a `/login` |

### Renovación Automática

El frontend ([api.ts:40-62](frontend/src/lib/api.ts#L40-L62)) detecta automáticamente cuando el access token expira y:

1. Detecta error 401 (Unauthorized)
2. Usa el refresh token para obtener nuevo access token
3. Reintenta la petición original
4. Todo sin que notes nada ✅

**PERO:** Si el **refresh token** también expiró (después de 1 día sin acceder):
- No puede renovar automáticamente
- Te redirige a `/login`
- Necesitas volver a autenticarte

---

## 🛠️ Obtener Nuevos Tokens Manualmente

### Para Desarrollo/Testing

```bash
# Desde WSL
./renovar-token-admin.sh

# Desde Windows
RENOVAR_TOKEN_ADMIN.bat
```

Esto te dará:
- Nuevo access token (válido 60 min)
- Nuevo refresh token (válido 1 día)
- Verificación que funcionan correctamente

---

## ⏰ Extender Tiempo de Expiración

Si quieres que los tokens duren **más tiempo**, edita la configuración:

### 1. Editar Settings

**Archivo:** [backend/config/settings.py](backend/config/settings.py#L69-L72)

**Cambio:**

```python
# ANTES (actual)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),    # 1 hora
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),       # 1 día
}

# DESPUÉS (tokens más largos)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),      # 24 horas ⭐
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),      # 30 días ⭐
}
```

### 2. Reiniciar Backend

```bash
wsl docker compose restart backend
```

### 3. Login Nuevamente

```
http://localhost:3000/login
```

Los nuevos tokens tendrán la duración actualizada.

---

## 📊 Comparación de Configuraciones

| Configuración | Access Token | Refresh Token | Uso Recomendado |
|---------------|--------------|---------------|-----------------|
| **Actual (Segura)** | 60 minutos | 1 día | Producción |
| **Desarrollo** | 24 horas | 30 días | Desarrollo local |
| **Muy Larga** | 7 días | 90 días | Solo para testing |

---

## 🔐 Cómo Funciona la Autenticación

### 1. Login Inicial

```
Usuario → /api/auth/login/ → Backend
                            ↓
                     { access, refresh }
                            ↓
                    Frontend guarda en:
                    - localStorage
                    - Zustand store
```

### 2. Peticiones Autenticadas

```
Frontend → API Request
          ↓
     Interceptor agrega:
     Authorization: Bearer <access_token>
          ↓
     Backend valida token
          ↓
     Respuesta
```

### 3. Cuando Access Token Expira

```
Frontend → API Request
          ↓
     Backend → 401 Unauthorized
          ↓
     Interceptor detecta 401
          ↓
     POST /api/auth/refresh/
     { refresh: <refresh_token> }
          ↓
     Backend → { access: <nuevo_token> }
          ↓
     Frontend actualiza access token
          ↓
     Reintenta petición original
          ↓
     ✅ Éxito
```

### 4. Cuando Refresh Token Expira

```
Frontend → API Request
          ↓
     Backend → 401 Unauthorized
          ↓
     Interceptor detecta 401
          ↓
     POST /api/auth/refresh/
          ↓
     Backend → 401 (refresh inválido/expirado)
          ↓
     Frontend:
     - Limpia tokens
     - logout()
     - Redirige a /login
```

---

## 🧪 Verificar Configuración Actual

### Script de Verificación

```bash
# Desde WSL
./renovar-token-admin.sh
```

Este script verifica:
- ✅ Login funciona
- ✅ Access token es válido
- ✅ Refresh token funciona
- ✅ Muestra configuración actual

### Verificación Manual

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Respuesta:
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
# }

# 2. Usar access token
curl -X GET http://localhost:8000/api/auth/user/ \
  -H "Authorization: Bearer <access_token>"

# Respuesta:
# {
#   "username": "admin",
#   "email": "admin@biblioteca.com",
#   "user_type": "..."
# }

# 3. Refresh token
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<refresh_token>"}'

# Respuesta:
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."  (nuevo token)
# }
```

---

## 📝 Archivos Relevantes

### Backend - Autenticación

| Archivo | Función |
|---------|---------|
| [backend/config/settings.py](backend/config/settings.py#L69-L72) | Configuración JWT |
| [backend/apps/authentication/urls.py](backend/apps/authentication/urls.py) | Endpoints de auth |
| [backend/apps/authentication/views.py](backend/apps/authentication/views.py) | Lógica de auth |

### Frontend - Autenticación

| Archivo | Función |
|---------|---------|
| [frontend/src/lib/api.ts](frontend/src/lib/api.ts) | Interceptores y refresh automático |
| [frontend/src/store/authStore.ts](frontend/src/store/authStore.ts) | Estado de autenticación (Zustand) |
| [frontend/src/app/(auth)/login/page.tsx](frontend/src/app/(auth)/login/page.tsx) | Página de login |

---

## 🎯 Checklist de Resolución

- [ ] Intenté hacer login en http://localhost:3000/login
- [ ] Verifiqué que las credenciales son: admin / admin123
- [ ] Ejecuté `renovar-token-admin.sh` para obtener nuevos tokens
- [ ] Revisé la configuración de `SIMPLE_JWT` en settings.py
- [ ] Reinicié el backend después de cambiar la configuración
- [ ] Abrí la consola del navegador (F12) para ver errores específicos

---

## 🆘 Si Aún No Funciona

### 1. Verificar Backend

```bash
# Estado del backend
wsl docker compose ps backend

# Debe mostrar: Up (healthy)

# Ver logs
wsl docker compose logs backend | grep -i "error\|jwt"
```

### 2. Verificar Conectividad

```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Si esto falla, el problema es del backend
# Si funciona, el problema es del frontend
```

### 3. Limpiar Storage del Navegador

```
1. F12 (Consola del navegador)
2. Application → Storage → Clear site data
3. Recargar página
4. Login nuevamente
```

### 4. Verificar Configuración Frontend

```bash
# Ver variables de entorno
wsl docker compose exec frontend printenv | grep API

# Debe mostrar:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## ✅ Solución Rápida (90 segundos)

```bash
# 1. Obtener nuevos tokens (30 seg)
./renovar-token-admin.sh

# 2. Limpiar storage del navegador (30 seg)
#    F12 → Application → Clear site data

# 3. Login en el frontend (30 seg)
#    http://localhost:3000/login
#    admin / admin123

# ✅ Listo
```

---

## 🎓 Mejores Prácticas

### Para Desarrollo
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}
```

### Para Producción
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Más seguro
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

### Para Testing
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=90),
}
```

---

## 📚 Documentación Relacionada

- [SOLUCION_ACCESO_FRONTEND.md](SOLUCION_ACCESO_FRONTEND.md) - Problemas de acceso al frontend
- [verificar-autenticacion-completa.sh](verificar-autenticacion-completa.sh) - Verificar autenticación completa
- [ACCESO_FRONTEND_GUIA_RAPIDA.md](ACCESO_FRONTEND_GUIA_RAPIDA.md) - Guía rápida de acceso

---

## 🏁 Resumen

### El Problema
- Token expiró (60 minutos para access, 1 día para refresh)
- No puedes acceder con admin/admin123

### La Solución
1. **Login nuevamente**: http://localhost:3000/login
2. **O extender tiempo**: Editar `settings.py` → Reiniciar backend

### Prevención
- El frontend renueva tokens automáticamente
- Solo necesitas login manual cada 24 horas (con config actual)
- Puedes extender a 30 días si lo necesitas

---

*Última actualización: 2026-01-02*
*Sistema de autenticación JWT funcionando correctamente*
