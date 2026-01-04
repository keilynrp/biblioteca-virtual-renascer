# 📚 Índice de Soluciones - BVS Framework

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### 1. 🔐 No Puedo Hacer Login

**Síntomas:**
- No puedes autenticarte con admin/admin123
- El formulario de login no funciona
- Los tokens expiraron

**SOLUCIÓN INMEDIATA:**
```bash
# Ejecuta:
HACER_LOGIN_AHORA.bat
```

**Documentación:**
- [COMO_HACER_LOGIN.md](COMO_HACER_LOGIN.md) - Guía rápida ⭐
- [SOLUCION_LOGIN_DEFINITIVA.md](SOLUCION_LOGIN_DEFINITIVA.md) - Solución completa
- [login-directo.html](login-directo.html) - Login standalone

**Scripts:**
- `HACER_LOGIN_AHORA.bat` - Abrir login directo
- `ABRIR_LOGIN.bat` - Alternativa
- `reset-auth-completo.sh` - Diagnóstico completo
- `renovar-token-admin.sh` - Renovar tokens

---

### 2. ⏰ Token Expirado

**Síntomas:**
- Mensaje "Token expirado"
- Error 401 Unauthorized
- No puedes acceder después de estar autenticado

**SOLUCIÓN INMEDIATA:**
```bash
# Opción 1: Login de nuevo
HACER_LOGIN_AHORA.bat

# Opción 2: Renovar tokens
./renovar-token-admin.sh
```

**Documentación:**
- [SOLUCION_TOKEN_EXPIRADO.md](SOLUCION_TOKEN_EXPIRADO.md) - Guía completa

**Configuración:**
```python
# backend/config/settings.py (líneas 69-72)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # Cambiar aquí
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),     # Cambiar aquí
}
```

---

### 3. 🌐 No Puedo Acceder al Frontend

**Síntomas:**
- Firefox/Chrome no carga localhost:3000
- Página en blanco
- "No se puede acceder a este sitio"

**SOLUCIÓN INMEDIATA:**
```bash
# Opción 1: Limpiar caché
Ctrl + Shift + Del → Limpiar caché → Recargar

# Opción 2: Usar IP directa
http://127.0.0.1:3000

# Opción 3: Modo incógnito
Ctrl + Shift + N (Chrome) / Ctrl + Shift + P (Firefox)
```

**Documentación:**
- [SOLUCION_ACCESO_FRONTEND.md](SOLUCION_ACCESO_FRONTEND.md) - Solución completa
- [ACCESO_FRONTEND_GUIA_RAPIDA.md](ACCESO_FRONTEND_GUIA_RAPIDA.md) - Guía rápida

**Scripts:**
- `test-frontend-access.bat` - Test desde Windows
- `test-browser-connection.html` - Test desde navegador

---

### 4. 🐌 Frontend Muy Lento

**Síntomas:**
- Primera carga toma 30+ segundos
- Recargas muy lentas
- Compilación en cada petición

**SOLUCIÓN INMEDIATA:**
```bash
# Ya está optimizado en modo producción
# Debería cargar en ~15ms

# Si no es así:
./fix-frontend-lento.sh
```

**Documentación:**
- [FRONTEND_OPTIMIZADO_EXITOSAMENTE.md](FRONTEND_OPTIMIZADO_EXITOSAMENTE.md)
- [SOLUCIONES_FRONTEND_LENTO.md](SOLUCIONES_FRONTEND_LENTO.md)

**Estado Actual:**
```
Velocidad: ~15 milisegundos ⚡
Modo: Producción
Build: Pre-compilado
```

---

### 5. 🐳 Docker Compose Error

**Síntomas:**
- `docker-compose: command not found`
- `Package metadata not found`
- Python 3.13 compatibility error

**SOLUCIÓN:**
```bash
# Usa Docker Compose V2 (ya instalado)
docker compose up -d

# NO uses:
docker-compose up -d  # ← Viejo, Python-based
```

**Documentación:**
- [DOCKER_COMPOSE_PYTHON313_FIX.md](DOCKER_COMPOSE_PYTHON313_FIX.md)
- [FIX_DOCKER_COMPOSE.bat](FIX_DOCKER_COMPOSE.bat)

---

### 6. ⚕️ Backend Unhealthy

**Síntomas:**
- `container bvs_framework-backend-1 is unhealthy`
- Backend no inicia
- Healthcheck failed

**SOLUCIÓN:**
Ya está arreglado. El healthcheck ahora usa `/admin/` en lugar de `/`.

**Verificación:**
```bash
docker compose ps backend
# Debe mostrar: Up (healthy)
```

---

## 🛠️ SCRIPTS DE UTILIDAD

### Autenticación
| Script | Propósito |
|--------|-----------|
| `HACER_LOGIN_AHORA.bat` | Login directo (solución inmediata) |
| `reset-auth-completo.sh` | Diagnóstico completo de auth |
| `renovar-token-admin.sh` | Renovar tokens JWT |
| `verificar-autenticacion-completa.sh` | Verificar sistema de auth |
| `login-directo.html` | Página de login standalone |

### Frontend
| Script | Propósito |
|--------|-----------|
| `test-frontend-access.bat` | Test de acceso desde Windows |
| `test-browser-connection.html` | Test desde navegador |
| `fix-frontend-lento.sh` | Optimizar frontend lento |

### Docker
| Script | Propósito |
|--------|-----------|
| `quick-start.sh` | Inicio rápido del stack |
| `check-all-containers.sh` | Verificar todos los contenedores |

---

## 📖 DOCUMENTACIÓN POR TEMA

### Autenticación y Login
1. [COMO_HACER_LOGIN.md](COMO_HACER_LOGIN.md) - **EMPIEZA AQUÍ** ⭐
2. [SOLUCION_LOGIN_DEFINITIVA.md](SOLUCION_LOGIN_DEFINITIVA.md)
3. [SOLUCION_TOKEN_EXPIRADO.md](SOLUCION_TOKEN_EXPIRADO.md)

### Acceso al Frontend
1. [ACCESO_FRONTEND_GUIA_RAPIDA.md](ACCESO_FRONTEND_GUIA_RAPIDA.md) - **EMPIEZA AQUÍ** ⭐
2. [SOLUCION_ACCESO_FRONTEND.md](SOLUCION_ACCESO_FRONTEND.md)

### Performance
1. [FRONTEND_OPTIMIZADO_EXITOSAMENTE.md](FRONTEND_OPTIMIZADO_EXITOSAMENTE.md)
2. [SOLUCIONES_FRONTEND_LENTO.md](SOLUCIONES_FRONTEND_LENTO.md)

### Docker y Configuración
1. [DOCKER_COMPOSE_PYTHON313_FIX.md](DOCKER_COMPOSE_PYTHON313_FIX.md)
2. [GUIA_COMPLETA_CONFIGURACION_16GB.md](GUIA_COMPLETA_CONFIGURACION_16GB.md)

---

## 🎯 FLUJO DE TROUBLESHOOTING

### Problema: No puedo usar la aplicación

```
¿Puedes acceder a localhost:3000?
│
├─ NO → Ver "3. No Puedo Acceder al Frontend"
│
└─ SÍ → ¿Puedes hacer login?
         │
         ├─ NO → Ver "1. No Puedo Hacer Login"
         │       Ejecuta: HACER_LOGIN_AHORA.bat
         │
         └─ SÍ → ¿El token expiró?
                 │
                 ├─ SÍ → Ver "2. Token Expirado"
                 │       Ejecuta: renovar-token-admin.sh
                 │
                 └─ NO → ¿Lento?
                         │
                         ├─ SÍ → Ver "4. Frontend Muy Lento"
                         │
                         └─ NO → ✅ Todo funciona correctamente
```

---

## ⚡ SOLUCIONES RÁPIDAS

### Login no funciona
```bash
HACER_LOGIN_AHORA.bat
```

### Frontend no carga
```bash
# Opción 1: Limpiar caché
Ctrl + Shift + Del

# Opción 2: Usar IP
http://127.0.0.1:3000
```

### Token expirado
```bash
./renovar-token-admin.sh
```

### Todo está roto
```bash
# Reset completo
docker compose down
docker compose up -d
./reset-auth-completo.sh
HACER_LOGIN_AHORA.bat
```

---

## 📊 ESTADO DEL SISTEMA

### Verificado Funcionando ✅

```
Backend:
  ✓ API: http://localhost:8000/api
  ✓ Login: http://localhost:8000/api/auth/login/
  ✓ Admin: http://localhost:8000/admin
  ✓ Healthcheck: /admin/ (200)

Frontend:
  ✓ URL: http://localhost:3000
  ✓ Login: http://localhost:3000/login
  ✓ Velocidad: ~15ms (optimizado)
  ✓ Modo: Producción

Autenticación:
  ✓ Usuario: admin
  ✓ Password: admin123
  ✓ JWT: Generándose correctamente
  ✓ Tokens: Access (60min) + Refresh (1día)
  ✓ Renovación automática: Funcionando
```

---

## 🏃 INICIO RÁPIDO

### Primera vez usando el sistema

1. **Verificar servicios:**
```bash
docker compose ps
# Todos deben estar "Up (healthy)"
```

2. **Hacer login:**
```bash
HACER_LOGIN_AHORA.bat
# O abrir: http://localhost:3000/login
```

3. **Credenciales:**
```
Usuario: admin
Password: admin123
```

4. **¡Listo!** 🎉

---

## 🆘 CONTACTO Y AYUDA

### Si nada funciona:

1. Ejecuta diagnóstico completo:
```bash
./reset-auth-completo.sh
```

2. Revisa logs:
```bash
docker compose logs backend | tail -50
docker compose logs frontend | tail -50
```

3. Verifica estado:
```bash
docker compose ps
```

4. Comparte la salida de estos comandos para ayuda específica

---

## 📝 CREDENCIALES POR DEFECTO

```
Usuario:    admin
Password:   admin123
Email:      admin@biblioteca.com
Tipo:       Superuser
```

---

## 🔗 URLS DEL SISTEMA

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ |
| **Backend API** | http://localhost:8000/api | ✅ |
| **Admin Panel** | http://localhost:8000/admin | ✅ |
| **Login** | http://localhost:3000/login | ✅ |
| **Dashboard** | http://localhost:3000/home | ✅ |
| **Login Directo** | file:///d:/bvs_framework/login-directo.html | ✅ |

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca lo que has probado:

- [ ] Intenté acceder a http://localhost:3000
- [ ] Ejecuté `HACER_LOGIN_AHORA.bat`
- [ ] Limpié la caché del navegador
- [ ] Probé en modo incógnito
- [ ] Usé http://127.0.0.1:3000
- [ ] Ejecuté `reset-auth-completo.sh`
- [ ] Verifiqué que los contenedores están "healthy"
- [ ] Revisé la consola del navegador (F12)

---

## 🎓 APRENDIZAJE

### Conceptos Clave

1. **JWT Tokens:** Access (corto plazo) + Refresh (largo plazo)
2. **Renovación Automática:** El frontend renueva tokens automáticamente
3. **Modo Producción:** Frontend pre-compilado para velocidad
4. **CORS:** Backend permite peticiones desde localhost:3000
5. **Docker Compose V2:** Usa `docker compose` (sin guion)

---

*Última actualización: 2026-01-02*
*Todas las soluciones verificadas y funcionando*
