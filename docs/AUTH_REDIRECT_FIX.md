# Auth Redirect Fix - Redirección al Dashboard después de Login

## 📋 Overview

Fix para redirigir a los usuarios al dashboard (`/dashboard`) después de autenticarse exitosamente, en lugar de redirigirlos a la landing page (`/`).

---

## 🔧 Cambio Implementado

### Archivo Modificado

**`frontend/src/app/(auth)/login/page.tsx`**

**Línea:** 67

### Código

**ANTES:**
```tsx
// Step 6: Redirect to dashboard
router.push("/")
```

**DESPUÉS:**
```tsx
// Step 6: Redirect to dashboard
router.push("/dashboard")
```

---

## 🚀 Cómo Aplicar

### Método 1: Script Automatizado

```bash
APPLY_AUTH_REDIRECT_FIX.bat
```

**Qué hace:**
1. Reinicia el frontend
2. Espera 20 segundos a que compile
3. Muestra instrucciones de verificación

### Método 2: Manual

```bash
# 1. Reiniciar frontend
docker compose restart frontend

# 2. Esperar compilación
timeout /t 20

# 3. Abrir navegador
start http://localhost:3000/login
```

---

## ✅ Verificación

### Flujo de Autenticación

1. **Usuario abre** → `http://localhost:3000/login`
2. **Usuario ingresa credenciales** → Username y password
3. **Sistema valida** → Backend `/api/auth/login/`
4. **Backend retorna** → `{ access: "...", refresh: "..." }`
5. **Frontend obtiene perfil** → Backend `/api/auth/user/`
6. **Datos guardados** → authStore (Zustand)
7. **Mensaje de éxito** → "Inicio de sesión exitoso"
8. **Redirección** → `http://localhost:3000/dashboard` ✅

### Checklist Visual

- [ ] Abrir `/login` en el navegador
- [ ] Ingresar credenciales válidas
- [ ] Click en botón "Login"
- [ ] Ver mensaje: "Inicio de sesión exitoso"
- [ ] **Verificar URL cambió a**: `/dashboard`
- [ ] Ver el dashboard con stats, libros recientes, categorías

---

## 📊 Flujo Técnico Completo

### 1. Usuario Hace Submit del Form

**Archivo:** `frontend/src/app/(auth)/login/page.tsx`

**Función:** `onSubmit()` (línea 46)

```tsx
async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        setIsLoading(true)

        // Step 1: Get tokens from login endpoint
        const loginResponse = await api.post("/auth/login/", values)
        const { access, refresh } = loginResponse.data

        // Step 2: Set token temporarily to fetch user data
        localStorage.setItem('accessToken', access)

        // Step 3: Fetch user profile
        const userResponse = await api.get("/auth/user/")

        // Step 4: Store everything in auth store
        login(userResponse.data, access, refresh)

        // Step 5: Show success message
        showSuccess('Inicio de sesión exitoso')

        // Step 6: Redirect to dashboard
        router.push("/dashboard")  // ✅ LÍNEA MODIFICADA

    } catch (err) {
        handleApiError(err, 'Credenciales inválidas. Por favor, intenta nuevamente.')
    } finally {
        setIsLoading(false)
    }
}
```

### 2. Backend Endpoints

#### `/api/auth/login/` (POST)

**Request:**
```json
{
  "username": "usuario",
  "password": "contraseña"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### `/api/auth/user/` (GET)

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response:**
```json
{
  "id": 1,
  "username": "usuario",
  "email": "usuario@example.com",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "is_premium": false,
  "created_at": "2025-12-28T10:00:00Z"
}
```

### 3. AuthStore (Zustand)

**Archivo:** `frontend/src/store/authStore.ts`

**Función:** `login()`

```tsx
login: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))

    set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true
    })
}
```

---

## 🔐 Seguridad

### Tokens Almacenados

**localStorage:**
- `accessToken` - JWT para autenticar requests
- `refreshToken` - JWT para renovar access token
- `user` - Datos del usuario (JSON string)

### Protección de Rutas

**Dashboard está protegido** por middleware/layout que verifica `isAuthenticated`:

```tsx
// frontend/src/app/(dashboard)/layout.tsx
const { isAuthenticated } = useAuthStore()

useEffect(() => {
    if (!isAuthenticated) {
        router.push('/login')
    }
}, [isAuthenticated, router])
```

---

## 🐛 Troubleshooting

### Problema 1: Sigue redirigiendo a "/"

**Causa:** Frontend no reinició correctamente

**Solución:**
```bash
docker compose restart frontend
timeout /t 25
```

### Problema 2: Error "Cannot read properties of undefined"

**Causa:** authStore no inicializado

**Verificar:**
```bash
# Verificar que authStore existe
cat frontend/src/store/authStore.ts
```

### Problema 3: Token no se guarda

**Causa:** localStorage bloqueado o error en login()

**Verificar en navegador:**
```javascript
// Abrir DevTools → Console
localStorage.getItem('accessToken')
// Debe retornar un JWT string
```

### Problema 4: Dashboard muestra "Loading..."

**Causa:** Middleware redirige a /login porque no detecta autenticación

**Verificar:**
```javascript
// DevTools → Console
localStorage.getItem('accessToken')
localStorage.getItem('user')
```

---

## 📝 Notas Importantes

### Por qué "/dashboard" y no "/"?

1. **Landing Page** (`/`) - Página pública de inicio para visitantes
2. **Dashboard** (`/dashboard`) - Página privada para usuarios autenticados

**Flujo Correcto:**
- Usuario no autenticado → Ve landing page (`/`)
- Usuario autenticado → Ve dashboard (`/dashboard`)
- Usuario hace login → Redirige a dashboard (`/dashboard`) ✅

### Alternativas Consideradas

#### Opción 1: Redirigir según rol
```tsx
// Si el usuario es admin, llevar a /admin
// Si el usuario es normal, llevar a /dashboard
if (userResponse.data.is_staff) {
    router.push("/admin")
} else {
    router.push("/dashboard")
}
```

#### Opción 2: Redirigir a página anterior
```tsx
// Guardar página de donde venía
const returnUrl = searchParams.get('returnUrl') || '/dashboard'
router.push(returnUrl)
```

**Decisión:** Implementamos redirección simple a `/dashboard` porque:
- Es más predecible para el usuario
- Evita loops de redirección
- Dashboard es la página principal para usuarios autenticados

---

## 💡 Mejoras Futuras

### 1. Remember Me

Agregar checkbox "Recordarme" que guarde credenciales:

```tsx
<FormField
    name="rememberMe"
    render={({ field }) => (
        <div className="flex items-center gap-2">
            <Checkbox {...field} />
            <label>Recordarme</label>
        </div>
    )}
/>
```

### 2. Redirect to Previous Page

Guardar URL previa y redirigir allí después de login:

```tsx
// En middleware que redirige a login
router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)

// En login page
const returnUrl = searchParams.get('returnUrl') || '/dashboard'
router.push(returnUrl)
```

### 3. Social Login

Agregar login con Google/Facebook:

```tsx
<Button variant="outline" onClick={handleGoogleLogin}>
    <GoogleIcon /> Login with Google
</Button>
```

### 4. Two-Factor Authentication

Agregar 2FA para mayor seguridad:

```tsx
// Después de login exitoso, si user.has_2fa
if (userResponse.data.has_2fa) {
    router.push('/verify-2fa')
} else {
    router.push('/dashboard')
}
```

---

## 📚 Referencias

- [Next.js Router](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [Zustand Store](https://github.com/pmndrs/zustand)
- [JWT Authentication](https://jwt.io/introduction)
- [React Hook Form](https://react-hook-form.com/)

---

**Fecha:** 2025-12-28
**Feature:** Auth Redirect to Dashboard
**Status:** ✅ Implementado
**Archivo Modificado:** `frontend/src/app/(auth)/login/page.tsx:67`
**Next Action:** Ejecutar `APPLY_AUTH_REDIRECT_FIX.bat`
