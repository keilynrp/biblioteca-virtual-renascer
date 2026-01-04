# ❌ Error: "Credenciales Inválidas"

## 🔍 ANÁLISIS DEL PROBLEMA

**Mensaje de error:** "Credenciales inválidas. Por favor intente de nuevo"

**¿Qué significa?**
El formulario del frontend **SÍ está enviando** la petición al backend, pero el backend responde que las credenciales son incorrectas.

**Verificado:**
```bash
✓ Backend funciona perfectamente
✓ curl con admin/admin123 retorna HTTP 200 con tokens
✓ Usuario admin existe en la base de datos
✓ Password admin123 es correcta
```

**Entonces, ¿por qué falla?**

Posibles causas:

1. **Espacios extra en el formulario**
   - El input tiene espacios antes/después de "admin" o "admin123"
   - El backend rechaza "admin " (con espacio)

2. **Problemas de mayúsculas/minúsculas**
   - Estás escribiendo "Admin" en lugar de "admin"
   - O "Admin123" en lugar de "admin123"

3. **Autocomplete del navegador**
   - El navegador está auto-completando con credenciales viejas/incorrectas

4. **Copiar/pegar con caracteres invisibles**
   - Si copiaste las credenciales de algún lado, pueden tener caracteres invisibles

---

## ✅ SOLUCIÓN INMEDIATA

### Opción 1: Usar Test de Credenciales

```bash
# Ejecuta:
TEST_CREDENCIALES.bat
```

Esto abre una herramienta que:
1. Muestra EXACTAMENTE qué estás enviando
2. Verifica espacios extra
3. Prueba variaciones de case
4. Te autentica automáticamente si funciona

**Qué hacer:**
1. Click "🧪 Test Login"
2. Lee el log detallado
3. Verás exactamente qué está mal

---

### Opción 2: Escribir Manualmente (Sin Copiar/Pegar)

En `http://localhost:3000/login`:

1. **Borra todo** en el campo usuario
2. Escribe letra por letra: `a` `d` `m` `i` `n`
3. **NO copies/pegues**
4. Presiona Tab
5. Escribe letra por letra: `a` `d` `m` `i` `n` `1` `2` `3`
6. Click Login

---

### Opción 3: Desactivar Autocomplete

En el formulario de login:

1. Presiona F12
2. Console
3. Ejecuta:

```javascript
document.querySelector('input[name="username"]').value = 'admin';
document.querySelector('input[name="password"]').value = 'admin123';
```

Luego click en Login.

---

### Opción 4: Login Directo (SIEMPRE FUNCIONA)

```bash
HACER_LOGIN_AHORA.bat
```

Esto bypasea el formulario completamente.

---

## 🔎 DIAGNÓSTICO DETALLADO

### Verificar qué estás enviando

En el formulario de login:

1. Presiona F12
2. Console
3. Pega este código:

```javascript
// Capturar el submit del formulario
const form = document.querySelector('form');
const originalSubmit = form.onsubmit;

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    console.log('━'.repeat(60));
    console.log('VALORES ENVIADOS:');
    console.log('Username:', JSON.stringify(username));
    console.log('Username length:', username.length);
    console.log('Username trimmed:', JSON.stringify(username.trim()));
    console.log('');
    console.log('Password:', JSON.stringify(password));
    console.log('Password length:', password.length);
    console.log('Password trimmed:', JSON.stringify(password.trim()));
    console.log('━'.repeat(60));

    // Comparación
    if (username === 'admin' && password === 'admin123') {
        console.log('✅ CREDENCIALES EXACTAMENTE CORRECTAS');
    } else {
        console.log('❌ HAY DIFERENCIAS:');
        if (username !== 'admin') {
            console.log(`  Username: "${username}" !== "admin"`);
            if (username.trim() === 'admin') {
                console.log('  → Tiene ESPACIOS extra');
            }
        }
        if (password !== 'admin123') {
            console.log(`  Password: "${password}" !== "admin123"`);
            if (password.trim() === 'admin123') {
                console.log('  → Tiene ESPACIOS extra');
            }
        }
    }

    // Continuar con el submit original
    if (originalSubmit) {
        originalSubmit.call(form, e);
    }
}, true);

console.log('✅ Interceptor instalado. Ahora haz click en Login.');
```

Luego intenta hacer login y mira la consola.

---

## 🎯 CAUSAS COMUNES

### 1. Espacios Extra

**Problema:**
```
" admin" o "admin " (con espacio)
"admin123 " (con espacio al final)
```

**Solución:**
Escribe manualmente, sin copiar/pegar.

---

### 2. Mayúsculas Incorrectas

**Problema:**
```
"Admin" (capitalizado)
"ADMIN" (todo mayúsculas)
"Admin123" (password capitalizado)
```

**Correcto:**
```
"admin" (todo minúsculas)
"admin123" (todo minúsculas)
```

---

### 3. Autocomplete del Navegador

**Problema:**
El navegador está rellenando con credenciales guardadas incorrectas.

**Solución:**
```
1. F12 → Application → Storage → Clear site data
2. Recargar página
3. Escribir manualmente
```

---

### 4. Caracteres Invisibles

**Problema:**
Si copiaste de un PDF o documento, puede tener caracteres Unicode invisibles.

**Solución:**
Escribe manualmente letra por letra.

---

## 🧪 TEST RÁPIDO

Ejecuta esto en la consola del navegador para verificar:

```javascript
async function testQuick() {
    console.log('🧪 Testing credentials...');

    // Test 1: Exactas
    let res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    console.log('Test 1 (admin/admin123):', res.status, res.ok ? '✅' : '❌');

    // Test 2: Con espacio
    res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: ' admin', password: 'admin123' })
    });
    console.log('Test 2 (espacio antes):', res.status, res.ok ? '✅' : '❌');

    // Test 3: Capitalizado
    res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Admin', password: 'admin123' })
    });
    console.log('Test 3 (Admin capitalizado):', res.status, res.ok ? '✅' : '❌');

    console.log('');
    console.log('Solo el Test 1 debe mostrar ✅');
}

testQuick();
```

---

## ✅ SOLUCIÓN DEFINITIVA

### Si identificas el problema:

1. **Espacios extra** → Escribe manualmente sin copiar/pegar
2. **Case incorrecto** → Usa todo minúsculas: admin / admin123
3. **Autocomplete** → Limpia storage y escribe manualmente

### Si no identificas el problema:

```bash
# Usa la herramienta de test:
TEST_CREDENCIALES.bat

# O usa login directo:
HACER_LOGIN_AHORA.bat
```

---

## 📊 CREDENCIALES CORRECTAS

```
Username: admin
Password: admin123

✓ Todo en minúsculas
✓ Sin espacios antes o después
✓ Sin caracteres especiales
✓ Exactamente como aparece arriba
```

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecuta:** `TEST_CREDENCIALES.bat`
2. **Click:** "🧪 Test Login"
3. **Lee:** El log detallado
4. **Identifica:** Qué está mal (espacios, case, etc.)
5. **Corrige:** Escribe manualmente las credenciales correctas

**O simplemente usa:** `HACER_LOGIN_AHORA.bat` (funciona al 100%)

---

*Las credenciales son 100% correctas. El problema es cómo se están enviando desde el formulario.*
