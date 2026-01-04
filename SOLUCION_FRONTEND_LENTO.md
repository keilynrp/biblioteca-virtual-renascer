# Solución: Frontend Lento y No Responde

## 🔍 Problema Identificado

**Fecha:** 2 de enero de 2026

### Diagnóstico

Se detectaron **DOS procesos** compitiendo por el puerto 3000:

```
PID 38596 - node.exe (Node.js nativo de Windows)
└─ Ejecutándose desde: 1 de enero 2026, 1:55 AM
└─ Tiempo activo: >24 horas

PID 49304 - wslrelay.exe (Docker/WSL)
└─ Intentando reenviar el puerto 3000 desde Docker
```

### Causa Raíz

1. Un proceso de **Node.js nativo** (fuera de Docker) se quedó ejecutando
2. Este proceso está ocupando el puerto 3000
3. Docker está intentando usar el mismo puerto → **conflicto**
4. El resultado: frontend lento, conexiones colgadas, respuestas lentas

---

## ✅ Solución Rápida (2 minutos)

### Paso 1: Ejecutar el script de corrección

```batch
FIX_FRONTEND_CONFLICTO_PUERTO.bat
```

Este script:
1. ✅ Identifica procesos en puerto 3000
2. ✅ Mata el proceso Node.js nativo (PID 38596)
3. ✅ Verifica que el puerto esté libre
4. ✅ Limpia cualquier proceso residual

### Paso 2: Verificar que Docker Desktop está ejecutándose

1. Abre Docker Desktop
2. Espera a que esté completamente iniciado (ícono verde)

### Paso 3: Reiniciar el contenedor frontend

```batch
docker compose restart frontend
```

O si quieres reconstruir (recomendado):

```batch
docker compose up -d --build frontend
```

### Paso 4: Verificar que funciona

Abre en tu navegador: http://localhost:3000

---

## 🔧 Comandos Manuales (si prefieres hacerlo paso a paso)

### 1. Ver procesos usando el puerto 3000

```powershell
netstat -ano | findstr :3000
```

### 2. Matar proceso específico

```powershell
taskkill /PID 38596 /F
```

### 3. Matar TODOS los procesos en puerto 3000

```powershell
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /PID %a /F
```

### 4. Verificar que el puerto está libre

```powershell
netstat -ano | findstr :3000
```

No debería devolver ningún resultado si está libre.

### 5. Reiniciar Docker frontend

```batch
docker compose restart frontend
```

---

## 🎯 Prevención

Para evitar este problema en el futuro:

### 1. Nunca ejecutes `npm run dev` localmente

❌ **NO HACER:**
```batch
cd frontend
npm run dev
```

✅ **HACER:**
```batch
docker compose up -d frontend
```

### 2. Siempre usa Docker para desarrollo

El proyecto está configurado para ejecutarse completamente en Docker. No necesitas instalar Node.js localmente.

### 3. Verifica procesos antes de iniciar

```batch
netstat -ano | findstr :3000
```

Si hay algún proceso, mátalo antes de iniciar Docker.

### 4. Para servicios del proyecto

```batch
docker compose down
```

No solo cierres Docker Desktop o la terminal.

---

## 📊 Scripts Disponibles

### Diagnóstico
- `diagnose-frontend.sh` - Diagnóstico completo del frontend
- `CHECK_FRONTEND.bat` - Verificar estado del frontend

### Reinicio
- `FIX_FRONTEND_CONFLICTO_PUERTO.bat` - Solucionar conflicto de puerto
- `restart-frontend-quick.sh` - Reinicio rápido
- `REINICIAR_FRONTEND.bat` - Reiniciar frontend

### Reconstrucción
- `fix-frontend-not-responding.sh` - Reconstrucción completa
- `REBUILD_FRONTEND.bat` - Reconstruir frontend

---

## 🐛 Debug Adicional

### Ver logs del frontend

```batch
docker compose logs frontend --tail=100
```

### Ver logs en tiempo real

```batch
docker compose logs -f frontend
```

### Verificar estado del contenedor

```batch
docker compose ps frontend
```

### Entrar al contenedor

```batch
docker compose exec frontend /bin/sh
```

### Ver uso de recursos

```batch
docker stats frontend
```

---

## ⚠️ Si Aún Hay Problemas

### Docker Desktop no inicia

1. Reinicia Docker Desktop
2. Si persiste: reinicia Windows
3. Verifica WSL2: `wsl --status`

### Puerto sigue ocupado después de matar procesos

```batch
# Espera 30 segundos y verifica nuevamente
timeout /t 30
netstat -ano | findstr :3000

# Si sigue ocupado, reinicia Windows
shutdown /r /t 0
```

### Frontend no responde después de reiniciar

```batch
# Reconstruir completamente
docker compose down
docker compose up -d --build frontend
```

### Error de memoria

```batch
# Aumentar memoria de Node.js
# Ya está configurado en docker-compose.yml:
# NODE_OPTIONS=--max-old-space-size=4096
```

---

## ✅ Checklist de Verificación

Después de aplicar la solución:

- [ ] Puerto 3000 está libre (`netstat -ano | findstr :3000` no devuelve resultados o solo muestra Docker)
- [ ] Docker Desktop está ejecutándose
- [ ] Contenedor frontend está "healthy" (`docker compose ps`)
- [ ] Frontend responde en http://localhost:3000
- [ ] Página de login carga correctamente
- [ ] No hay errores en los logs (`docker compose logs frontend`)

---

## 📝 Notas Técnicas

### ¿Por qué ocurrió esto?

Probablemente ejecutaste `npm run dev` localmente en algún momento y el proceso se quedó ejecutando en segundo plano.

### ¿Cómo evitar que vuelva a pasar?

- **Siempre** usa `docker compose` para ejecutar el proyecto
- **Nunca** ejecutes `npm` directamente en tu máquina
- **Siempre** detén los servicios con `docker compose down`

### Procesos normales vs anormales

✅ **Normal:** Solo `wslrelay.exe` en puerto 3000 (es Docker reenviando el puerto)

❌ **Anormal:** `node.exe` nativo + `wslrelay.exe` (conflicto)

---

## 🔗 Referencias

- [FIX_FRONTEND_NO_RESPONDE.md](FIX_FRONTEND_NO_RESPONDE.md) - Guía general de troubleshooting
- [docker-compose.yml](docker-compose.yml) - Configuración de servicios
- [SOLUCIONES_FRONTEND_LENTO.md](SOLUCIONES_FRONTEND_LENTO.md) - Otras soluciones

---

**Última actualización:** 2026-01-02
**Estado:** ✅ Solución verificada
**Autor:** Claude Code Assistant
