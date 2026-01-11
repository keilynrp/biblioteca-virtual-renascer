# 🔍 Diagnóstico: Login del Frontend No Funciona

## ✅ Estado Verificado

```
Backend:      ✓ Funcionando perfectamente
Login API:    ✓ HTTP 200, tokens generándose
User API:     ✓ HTTP 200, datos correctos
CORS:         ✓ Configurado (CORS_ALLOW_ALL_ORIGINS = True)
Credenciales: ✓ admin / admin123 válidas
Login Directo: ✓ Funciona al 100%
```

**CONCLUSIÓN:** El backend funciona. El problema está en el frontend Next.js.

---

## 🎯 DIAGNÓSTICO PASO A PASO

### Paso 1: Usar Herramienta de Debug

```bash
# Ejecuta:
DEBUG_LOGIN.bat
```

O abre directamente: `debug-login-frontend.html`

**Qué hace:**
1. Muestra logs en tiempo real
2. Test de login completo
3. Muestra network requests
4. Visualiza localStorage
5. Identifica el problema exacto

**Qué buscar:**
- Si "Test Login" funciona → El problema es específico de Next.js
- Si falla → Verás el error exacto (CORS, Network, etc.)

---

### Paso 2: Diagnóstico Manual en el Frontend

#### 2.1 Abrir Consola del Navegador

1. Ve a: `http://localhost:3000/login`
2. Presiona `F12`
3. Ve a la pestaña "Console"
4. Ejecuta:

```javascript
// Limpiar todo
localStorage.clear()

// Recargar
location.reload()
```

#### 2.2 Abrir Network Tab

1. Presiona `F12`
2. Ve a la pestaña "Network"
3. **Deja abierta esta pestaña**

#### 2.3 Intentar Login

1. Ingresa: `admin` / `admin123`
2. Click "Login"
3. **OBSERVA** qué pasa en Network tab

#### 2.4 Buscar la Petición

En la pestaña Network, busca:
- Petición a `login/` o `auth/login/`
- Click en ella
- Ve a la pestaña "Response"

**Posibles resultados:**

##### ✅ Si ves: HTTP 200 con tokens
```json
{
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

**Significa:** El login funciona, el problema es DESPUÉS del login

**Siguiente paso:** Ve a "Console" y busca errores JavaScript

---

##### ❌ Si ves: CORS error
```
Access to fetch at 'http://localhost:8000/api/auth/login/'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Causa:** CORS no está configurado correctamente

**Solución:**
```bash
# Verificar backend/config/settings.py líneas 173-177
# Debe tener:
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
```

---

##### ❌ Si ves: Network Error o ERR_CONNECTION_REFUSED
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Causa:** Backend no está corriendo o no accesible

**Solución:**
```bash
# Verificar backend
curl http://localhost:8000/api/auth/login/

# Si falla, reiniciar
docker compose restart backend
```

---

##### ❌ Si ves: 401 Unauthorized
```json
{
  "detail": "No active account found with the given credentials"
}
```

**Causa:** Credenciales incorrectas

**Solución:** Verifica que usas `admin` / `admin123`

---

##### ❌ Si ves: 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

**Causa:** Error en el backend

**Solución:**
```bash
# Ver logs del backend
docker compose logs backend | tail -50
```

---

### Paso 3: Errores Comunes en Console

Después del login, busca en la pestaña "Console" errores como:

#### Error 1: "Cannot read properties of undefined"
```
Cannot read properties of undefined (reading 'user')
```

**Causa:** El código intenta acceder a datos que no existen

**Solución:** Problema en el código del frontend, necesita fix

---

#### Error 2: "router.push is not a function"
```
TypeError: router.push is not a function
```

**Causa:** El router no está inicializado correctamente

**Solución:** Problema en el código del frontend

---

#### Error 3: "localStorage is not defined"
```
ReferenceError: localStorage is not defined
```

**Causa:** Código ejecutándose en el servidor (SSR) en lugar del cliente

**Solución:** Problema en el código del frontend

---

#### Error 4: Hydration Error
```
Hydration failed because the initial UI does not match what was rendered on the server
```

**Causa:** Diferencia entre render del servidor y cliente

**Solución:** Problema relacionado con autenticación y SSR

---

### Paso 4: Test Completo del Flujo

Ejecuta esto en la consola del navegador mientras estás en `/login`:

```javascript
// Test completo del flujo de login
async function testLoginFlow() {
    console.log('🧪 Testing login flow...');

    // 1. Test API
    try {
        const response = await fetch('http://localhost:8000/api/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        const data = await response.json();
        console.log('✅ Login API:', data);

        if (data.access) {
            console.log('✅ Access token received');

            // 2. Test user endpoint
            const userResponse = await fetch('http://localhost:8000/api/auth/user/', {
                headers: {
                    'Authorization': `Bearer ${data.access}`
                }
            });

            const userData = await userResponse.json();
            console.log('✅ User data:', userData);

            // 3. Save to localStorage (como hace el frontend)
            const authStorage = {
                state: {
                    user: userData,
                    accessToken: data.access,
                    refreshToken: data.refresh,
                    isAuthenticated: true,
                    _hasHydrated: true
                },
                version: 0
            };

            localStorage.setItem('auth-storage', JSON.stringify(authStorage));
            console.log('✅ Saved to localStorage');

            // 4. Verificar
            const saved = JSON.parse(localStorage.getItem('auth-storage'));
            console.log('✅ Verified in storage:', saved);

            console.log('🎉 Todo funciona! El problema es específico del formulario Next.js');

            // 5. Intentar redirigir
            console.log('Intentando redirigir a /home...');
            window.location.href = '/home';

        } else {
            console.error('❌ No access token in response');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar test
testLoginFlow();
```

**Si esto funciona:** El problema es específicamente el componente de login de Next.js

---

## 🔎 POSIBLES CAUSAS

### 1. Problema con el Router
El `router.push('/home')` no funciona correctamente

### 2. Problema con Zustand
El store de autenticación no se actualiza

### 3. Problema con Toast
El toast de error está bloqueando la redirección

### 4. Problema con SSR
El componente se renderiza en el servidor y falla

### 5. Problema con la Forma
El formulario no envía correctamente los datos

---

## 🛠️ SOLUCIONES TEMPORALES

### Solución 1: Login Directo (YA IMPLEMENTADO)
```bash
HACER_LOGIN_AHORA.bat
```

Esto te autentica completamente, bypaseando el formulario.

### Solución 2: Login Manual
1. Ejecuta el código JavaScript del Paso 4
2. Te autenticará y redirigirá

### Solución 3: Usar Debug Tool
1. Ejecuta `DEBUG_LOGIN.bat`
2. Click "Test Login"
3. Si funciona, significa que puedes autenticarte

---

## 📝 INFORMACIÓN PARA DEBUG

Si necesitas compartir información del error, ejecuta esto en la consola:

```javascript
// Recopilar información de debug
console.log('='.repeat(50));
console.log('DEBUG INFO');
console.log('='.repeat(50));
console.log('URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);
console.log('localStorage keys:', Object.keys(localStorage));
console.log('auth-storage:', localStorage.getItem('auth-storage'));
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('='.repeat(50));
```

Copia la salida y compártela.

---

## ✅ CHECKLIST DE DIAGNÓSTICO

- [ ] Ejecuté `DEBUG_LOGIN.bat` y vi los resultados
- [ ] Abrí F12 → Console antes de intentar login
- [ ] Abrí F12 → Network antes de intentar login
- [ ] Intenté hacer login y revisé qué peticiones se hicieron
- [ ] Busqué errores en la consola
- [ ] Ejecuté el test JavaScript del Paso 4
- [ ] Probé `HACER_LOGIN_AHORA.bat` como alternativa

---

## 🎯 RESULTADO ESPERADO

Después de este diagnóstico sabrás:

1. **Si el problema es CORS** → Lo ves en Network tab
2. **Si el problema es el backend** → El test directo falla
3. **Si el problema es el formulario** → El test directo funciona pero el formulario no
4. **Si el problema es la redirección** → Login funciona pero no redirige
5. **Si el problema es JavaScript** → Ves errores en Console

---

## 🚀 PRÓXIMOS PASOS

### Si identificaste el problema:
Comparte el error específico que ves (captura de pantalla o texto)

### Si no identificaste el problema:
1. Ejecuta `DEBUG_LOGIN.bat`
2. Click "Test Login"
3. Copia los logs que aparecen
4. Comparte esos logs

### Mientras tanto:
Usa `HACER_LOGIN_AHORA.bat` para autenticarte y usar la aplicación

---

*Este diagnóstico te ayudará a identificar exactamente qué está fallando*
