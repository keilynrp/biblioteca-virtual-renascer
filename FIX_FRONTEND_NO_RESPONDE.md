# Fix: Frontend No Responde

## Problema

El frontend no responde en http://localhost:3000

## ⚡ Solución Rápida (30 segundos)

```bash
bash restart-frontend-quick.sh
```

Este script:
- Detiene el frontend
- Espera 3 segundos
- Inicia el frontend
- Verifica que responda

---

## 🔍 Diagnóstico

Si el reinicio rápido no funciona, ejecuta el diagnóstico:

```bash
bash diagnose-frontend.sh
```

Este script te mostrará:
1. Estado del contenedor
2. Uso de recursos (CPU/RAM)
3. Últimos 50 logs
4. Variables de entorno
5. Estado del puerto 3000
6. Procesos dentro del contenedor
7. Conectividad con backend
8. Estructura de archivos
9. Scripts de package.json
10. Espacio en disco

---

## 🛠️ Solución Completa (si el reinicio no funciona)

```bash
bash fix-frontend-not-responding.sh
```

Este script:
1. ✅ Verifica Docker
2. ✅ Muestra estado y logs
3. ✅ Verifica puerto 3000
4. ✅ Detiene el frontend
5. ✅ Limpia puerto 3000
6. ✅ Limpia caché de Docker
7. ✅ **Reconstruye** el frontend (sin caché)
8. ✅ Inicia el frontend
9. ✅ Espera hasta 60 segundos
10. ✅ Verifica que responda

**Tiempo:** ~2-3 minutos (incluye reconstrucción)

---

## 📋 Causas Comunes

### 1. Error en el código

**Síntoma:** Logs muestran errores de compilación

**Solución:**
```bash
# Ver logs
docker compose logs frontend --tail=100

# Si hay error de sintaxis en el código, corrígelo
# Luego reinicia
docker compose restart frontend
```

### 2. Puerto 3000 ocupado

**Síntoma:** Error "port already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Reiniciar
docker compose restart frontend
```

### 3. Falta de memoria

**Síntoma:** Contenedor se reinicia constantemente o logs muestran "out of memory"

**Solución:**
```bash
# Ver uso de memoria
docker stats frontend

# Aumentar memoria de Docker Desktop (mínimo 4GB)
# Luego reconstruir
bash fix-frontend-not-responding.sh
```

### 4. Error de compilación de Next.js

**Síntoma:** Logs muestran "Error: Failed to compile"

**Solución:**
```bash
# Limpiar y reconstruir
docker compose stop frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

### 5. Variables de entorno incorrectas

**Síntoma:** Frontend inicia pero da error al conectar al backend

**Verificar:**
```bash
docker compose exec frontend printenv | grep API_URL
```

Debería mostrar:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Solución:**
```bash
# Verificar archivo .env en frontend/
# Debe contener: NEXT_PUBLIC_API_URL=http://localhost:8000

# Reiniciar
docker compose restart frontend
```

---

## 🧪 Verificar que Funciona

### Opción 1: Con curl
```bash
curl -I http://localhost:3000
```

Debería devolver:
```
HTTP/1.1 200 OK
```

### Opción 2: Con navegador
1. Abre http://localhost:3000
2. Deberías ver la página de login
3. Limpia caché si es necesario (Ctrl+Shift+R)

---

## 📊 Scripts Disponibles

### Reinicio
- **restart-frontend-quick.sh** - Reinicio rápido (30s)
- **fix-frontend-not-responding.sh** - Reconstrucción completa (2-3min)

### Diagnóstico
- **diagnose-frontend.sh** - Diagnóstico detallado

### Otros
```bash
# Ver logs en tiempo real
docker compose logs -f frontend

# Ver estado
docker compose ps frontend

# Entrar al contenedor
docker compose exec frontend /bin/sh

# Reconstruir manualmente
docker compose build --no-cache frontend
```

---

## 🔧 Comandos Útiles

```bash
# Ver todos los contenedores
docker compose ps

# Reiniciar todos los servicios
docker compose restart

# Ver uso de recursos
docker stats

# Limpiar todo Docker
docker system prune -a

# Ver procesos en puerto 3000 (Windows)
netstat -ano | findstr :3000

# Ver procesos en puerto 3000 (Linux/Mac)
lsof -i :3000

# Matar proceso en puerto (Windows)
taskkill /PID <PID> /F

# Matar proceso en puerto (Linux/Mac)
kill -9 <PID>
```

---

## 🎯 Flujo de Resolución

```
Frontend no responde
    │
    ├─→ Reinicio rápido
    │   └─→ bash restart-frontend-quick.sh
    │       │
    │       ├─→ Funciona ✅
    │       │
    │       └─→ No funciona
    │           └─→ Diagnóstico
    │               └─→ bash diagnose-frontend.sh
    │                   │
    │                   ├─→ Error en logs
    │                   │   └─→ Corregir código
    │                   │
    │                   ├─→ Puerto ocupado
    │                   │   └─→ Matar proceso
    │                   │
    │                   ├─→ Falta de memoria
    │                   │   └─→ Aumentar RAM Docker
    │                   │
    │                   └─→ Otro problema
    │                       └─→ Reconstruir
    │                           └─→ bash fix-frontend-not-responding.sh
```

---

## ⚠️ Si Nada Funciona

### 1. Limpiar todo y empezar de cero
```bash
# ADVERTENCIA: Esto borrará todos los contenedores y volúmenes

# Detener todo
docker compose down -v

# Limpiar Docker
docker system prune -a -f

# Reconstruir
docker compose up -d --build
```

### 2. Verificar Docker Desktop
- Aumentar memoria asignada (mínimo 4GB)
- Aumentar CPU (mínimo 2 cores)
- Verificar que WSL2 está actualizado (Windows)

### 3. Verificar el código
```bash
# Entrar al directorio frontend
cd frontend

# Instalar dependencias localmente
npm install

# Probar compilación local
npm run build

# Si falla, revisar errores
```

---

## ✅ Checklist de Verificación

Antes de reportar un problema:

- [ ] Docker Desktop está corriendo
- [ ] Docker tiene al menos 4GB de RAM asignada
- [ ] Puerto 3000 no está ocupado por otro proceso
- [ ] Backend está corriendo (`docker compose ps backend`)
- [ ] Logs no muestran errores de sintaxis
- [ ] Variables de entorno son correctas
- [ ] Hay espacio en disco suficiente (mínimo 10GB)
- [ ] Ejecutaste `bash diagnose-frontend.sh`
- [ ] Probaste reconstruir con `bash fix-frontend-not-responding.sh`

---

## 📝 Logs Importantes

### Ver logs completos
```bash
docker compose logs frontend > frontend_logs.txt
```

### Buscar errores específicos
```bash
# Errores de memoria
docker compose logs frontend | grep -i "memory\|heap"

# Errores de compilación
docker compose logs frontend | grep -i "error\|failed"

# Estado de Next.js
docker compose logs frontend | grep -i "ready\|compiled"
```

---

**Última actualización:** 2025-01-02
**Versión:** 1.0
