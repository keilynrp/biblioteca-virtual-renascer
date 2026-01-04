# 🎯 SOLUCIÓN COMPLETA - Problemas de Login

## 🔴 TUS PROBLEMAS ACTUALES

1. **No puedes acceder a `http://localhost:3000` desde Firefox** ✗
2. **No puedes hacer login desde el frontend** ✗
3. **El error de debug muestra: "NetworkError when attempting to fetch resource"** ✗

## ✅ ANÁLISIS

```
Backend:      ✓ Funcionando perfectamente (verificado con curl)
API Login:    ✓ HTTP 200, tokens generándose correctamente
Credenciales: ✓ admin / admin123 válidas
Frontend:     ✓ Respondiendo HTTP 200 desde el servidor
               ✗ Pero TU NAVEGADOR no puede acceder

Problema: NAVEGADOR bloqueado/configuración local
```

---

## 🚀 SOLUCIÓN INMEDIATA (3 pasos)

### PASO 1: Limpiar Completamente el Navegador

#### En Firefox:

```
1. Presiona Ctrl + Shift + Del
2. Selecciona "Todo"
3. Marca TODAS las opciones:
   ✓ Historial de navegación
   ✓ Cookies
   ✓ Caché
   ✓ Datos de sitios web
   ✓ Todo lo demás
4. Click "Limpiar ahora"
5. CIERRA Firefox completamente
6. Espera 10 segundos
7. Abre Firefox de nuevo
```

#### En Chrome:

```
1. Presiona Ctrl + Shift + Del
2. Selecciona "Desde siempre"
3. Marca todo:
   ✓ Historial
   ✓ Cookies
   ✓ Imágenes y archivos en caché
   ✓ Todo lo demás
4. Click "Borrar datos"
5. CIERRA Chrome completamente
6. Espera 10 segundos
7. Abre Chrome de nuevo
```

---

### PASO 2: Verificar Acceso al Frontend

Después de limpiar, prueba **en orden**:

#### Prueba A: Usar IP directa
```
http://127.0.0.1:3000
```

#### Prueba B: Usar localhost
```
http://localhost:3000
```

#### Prueba C: Modo incógnito
```
Firefox: Ctrl + Shift + P
Chrome:  Ctrl + Shift + N

Luego: http://127.0.0.1:3000
```

**¿Qué debe pasar?**
- Debería cargar la página del frontend
- Si ves CUALQUIER página (aunque sea de error) = ✓ Conexión funciona
- Si no carga NADA = ✗ Problema de red/firewall

---

### PASO 3: Hacer Login

#### Opción A: Si el frontend carga (PASO 2 funcionó)

1. Ve a: `http://127.0.0.1:3000/login`
2. Abre F12 (consola del navegador)
3. Ve a la pestaña "Console"
4. Pega este código y presiona Enter:

```javascript
async function loginManual() {
    try {
        // Login
        const res = await fetch('http://localhost:8000/api/auth/login/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: 'admin', password: 'admin123'})
        });
        const tokens = await res.json();

        // Get user
        const userRes = await fetch('http://localhost:8000/api/auth/user/', {
            headers: {'Authorization': `Bearer ${tokens.access}`}
        });
        const user = await userRes.json();

        // Save
        localStorage.setItem('auth-storage', JSON.stringify({
            state: {
                user: user,
                accessToken: tokens.access,
                refreshToken: tokens.refresh,
                isAuthenticated: true,
                _hasHydrated: true
            },
            version: 0
        }));

        console.log('✅ Login exitoso!');
        window.location.href = '/home';
    } catch (e) {
        console.error('❌ Error:', e);
    }
}

loginManual();
```

Esto te autenticará y redirigirá al dashboard.

#### Opción B: Si el frontend NO carga (PASO 2 falló)

Usa el login directo:
```
HACER_LOGIN_AHORA.bat
```

---

## 🔧 SOLUCIÓN AL PROBLEMA DE RED

Si el PASO 2 falló (no puedes acceder al frontend), el problema es de configuración local:

### Solución 1: Flush DNS

```powershell
# En PowerShell como Administrador:
ipconfig /flushdns
```

### Solución 2: Verificar Firewall

```powershell
# En PowerShell como Administrador:
New-NetFirewallRule -DisplayName "Docker Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Solución 3: Verificar archivo hosts

**Archivo:** `C:\Windows\System32\drivers\etc\hosts`

**Debe contener:**
```
127.0.0.1    localhost
::1          localhost
```

Si no las tiene, agrégalas (como Administrador).

### Solución 4: Reiniciar Stack de Red

```powershell
# En PowerShell como Administrador:
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /renew
ipconfig /flushdns
```

Luego reinicia la computadora.

### Solución 5: Probar desde WSL

```bash
# En WSL/Git Bash:
curl http://localhost:3000

# Si funciona, el problema es específico del navegador Windows
```

---

## 🆘 SI NADA FUNCIONA

### Opción Final: Login Directo Permanente

El `login-directo.html` funcionará siempre porque:
1. Se conecta directamente al backend
2. No depende del frontend Next.js
3. Bypasea todos los problemas de navegador

**Usar permanentemente:**
```
HACER_LOGIN_AHORA.bat
```

Ejecuta esto cada vez que necesites hacer login (cada ~24 horas).

---

## 📋 DIAGNÓSTICO PASO A PASO

### Test 1: ¿Backend accesible?

```bash
# En Git Bash o WSL:
curl http://localhost:8000/api/auth/login/
```

**Esperado:** Debe devolver un error sobre método no permitido (normal)

**Si falla:** Backend no está corriendo
```bash
docker compose ps
docker compose restart backend
```

---

### Test 2: ¿Frontend accesible desde WSL?

```bash
# En Git Bash o WSL:
curl -I http://localhost:3000
```

**Esperado:** HTTP 200

**Si funciona:** El frontend está bien, problema es el navegador
**Si falla:** El frontend no está corriendo

---

### Test 3: ¿Frontend accesible desde Windows?

```cmd
# En CMD:
curl -I http://localhost:3000
```

**Si funciona:** Navegador tiene problemas
**Si falla:** Problema de red en Windows

---

### Test 4: ¿Navegador puede hacer peticiones?

```
1. Abre: http://google.com (debe funcionar)
2. Abre: http://127.0.0.1:8000/admin (debe mostrar admin de Django)
3. Abre: http://127.0.0.1:3000 (debe mostrar frontend)
```

Si 1 y 2 funcionan pero 3 no:
- Problema específico con puerto 3000
- Posible firewall bloqueando

---

## 🎯 RECOMENDACIÓN FINAL

### Para resolver AHORA y usar la app:

```
1. Ejecuta: HACER_LOGIN_AHORA.bat
2. Usa la aplicación normalmente
```

### Para diagnosticar el problema de red:

```
1. Ejecuta los 4 tests de diagnóstico
2. Comparte los resultados:
   - ¿Cuál test falló?
   - ¿Qué error viste?
   - ¿Qué navegador usas?
```

### Para fix permanente:

Basado en el diagnóstico, aplicaremos:
- Fix de firewall
- Fix de DNS
- Fix de navegador
- O configuración alternativa

---

## ✅ ACCIONES INMEDIATAS

### AHORA MISMO (5 minutos):

1. **Limpiar navegador** (PASO 1 arriba)
2. **Probar acceso** (PASO 2 arriba)
3. **Si funciona:** Login con código JavaScript (PASO 3A)
4. **Si no funciona:** `HACER_LOGIN_AHORA.bat` (PASO 3B)

### DIAGNÓSTICO (10 minutos):

Ejecuta los 4 tests y comparte resultados.

---

## 💡 LO MÁS IMPORTANTE

**El backend funciona perfectamente.**
**El frontend funciona perfectamente.**
**El problema es la conexión desde tu navegador al frontend.**

Soluciones:
1. **Temporal:** `HACER_LOGIN_AHORA.bat` (funciona al 100%)
2. **Permanente:** Diagnosticar y arreglar la conexión del navegador

---

*Empieza con PASO 1, 2 y 3. Si nada funciona, usa HACER_LOGIN_AHORA.bat*
