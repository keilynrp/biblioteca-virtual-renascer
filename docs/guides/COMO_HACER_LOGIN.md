# 🚀 CÓMO HACER LOGIN - Guía Rápida

## ⚡ Solución Inmediata (30 segundos)

### Opción 1: Doble Click
```
Haz doble click en:
→ HACER_LOGIN_AHORA.bat
```

### Opción 2: Abrir HTML
```
Haz doble click en:
→ login-directo.html
```

### ¿Qué pasa después?
1. Se abre una página de login
2. Credenciales ya están pre-llenadas (admin / admin123)
3. Click en "Iniciar Sesión"
4. Ves el progreso paso a paso
5. Redirección automática a /home
6. ✅ **¡Estás autenticado!**

---

## 🔧 Si Necesitas Ayuda

### El backend funciona
```bash
✓ API: http://localhost:8000/api
✓ Login: http://localhost:8000/api/auth/login/
✓ Credenciales: admin / admin123
✓ Tokens: Generándose correctamente
```

### Diagnóstico completo
```bash
# Ejecuta este script en Git Bash/WSL:
./reset-auth-completo.sh
```

Te mostrará:
- Estado de contenedores
- Test de login API
- Tokens válidos
- Instrucciones detalladas

---

## 📋 Credenciales

```
Usuario:    admin
Contraseña: admin123
```

---

## 🎯 URLs Importantes

| Servicio | URL |
|----------|-----|
| Login Directo | file:///d:/bvs_framework/login-directo.html |
| Frontend Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/home |
| Backend API | http://localhost:8000/api |
| Admin Panel | http://localhost:8000/admin |

---

## 🆘 Solución de Problemas

### El login-directo.html no funciona

#### Error: "Failed to fetch"
```bash
# Backend no está corriendo
# Solución:
docker compose ps
docker compose restart backend
```

#### Error: "CORS policy"
```bash
# El navegador bloquea peticiones desde file://
# Solución: Usa un servidor local

# Python 3
python -m http.server 8080

# Node.js
npx http-server -p 8080

# Luego abre: http://localhost:8080/login-directo.html
```

### El login en /login tampoco funciona

1. Abre consola del navegador (F12)
2. Ve a pestaña "Console"
3. Ejecuta:
```javascript
localStorage.clear()
location.reload()
```
4. Intenta de nuevo

---

## 📚 Documentación Completa

Para más detalles, ver:
- [SOLUCION_LOGIN_DEFINITIVA.md](SOLUCION_LOGIN_DEFINITIVA.md) - Solución completa
- [SOLUCION_TOKEN_EXPIRADO.md](SOLUCION_TOKEN_EXPIRADO.md) - Problemas de tokens
- [ACCESO_FRONTEND_GUIA_RAPIDA.md](ACCESO_FRONTEND_GUIA_RAPIDA.md) - Acceso al frontend

---

## ✅ Verificación Rápida

Backend funcionando:
```bash
curl http://localhost:8000/api/auth/login/
# Si ves JSON → ✓ Funciona
```

Frontend funcionando:
```bash
curl http://localhost:3000/login
# Si ves HTML → ✓ Funciona
```

Login directo:
```bash
start login-directo.html
# Click "Iniciar Sesión"
# Si ves progreso y redirección → ✓ Funciona
```

---

## 🎉 ¡Eso es Todo!

### TL;DR

```
1. Doble click: HACER_LOGIN_AHORA.bat
2. Click: "Iniciar Sesión"
3. Espera 2 segundos
4. ✅ Autenticado
```

**¡Así de simple!**

---

*Última actualización: 2026-01-02*
