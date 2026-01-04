# 🚀 SOLUCIÓN RÁPIDA - Ejecutar Ahora

## ❌ Problema Identificado

El backend se está deteniendo por **falta de memoria** (Exit Code 137).

Los logs muestran:
```
backend_1 exited with code 137
```

Esto causa el "Network Error" porque el backend simplemente no está corriendo.

---

## ✅ Solución en 3 Pasos

### Paso 1: Ejecutar Script de Corrección

**Abre PowerShell o CMD y ejecuta:**

```bash
FIX_BACKEND_KILLED.bat
```

Este script:
- ✅ Detiene todos los servicios
- ✅ Libera memoria
- ✅ Reinicia servicios optimizados
- ✅ Verifica conectividad

---

### Paso 2: Aumentar Memoria de Docker

**Estás usando WSL2?** Sigue estas instrucciones:

#### Opción A: Script Automático en PowerShell (Recomendado)

**Abre PowerShell como Administrador** y ejecuta:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\CONFIGURAR_WSL_AUTOMATICO.ps1
```

Este script:
- ✅ Detecta tu RAM automáticamente
- ✅ Crea el archivo `.wslconfig` optimizado
- ✅ Reinicia WSL
- ✅ Te guía paso a paso

#### Opción B: Script desde WSL

En tu terminal de **Ubuntu/WSL**, ejecuta:

```bash
chmod +x configurar-wsl-desde-linux.sh
./configurar-wsl-desde-linux.sh
```

Luego sigue las instrucciones que muestra el script.

#### Opción C: Manual

Si prefieres hacerlo manualmente, sigue la guía completa:
- [CONFIGURAR_MEMORIA_WSL.md](CONFIGURAR_MEMORIA_WSL.md)

---

**Si NO usas WSL (Docker Desktop normal):**

1. Abre **Docker Desktop**
2. Click en ⚙️ **Settings**
3. Ve a **Resources** → **Advanced**
4. Configura:
   - **Memory: 6 GB** (mínimo 4 GB)
   - **CPUs: 4** (mínimo 2)
5. Click **Apply & Restart**

---

### Paso 3: Verificar que Funciona

Abre en tu navegador:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000/api
- **Dashboard:** http://localhost:3000/home

Si ves la interfaz sin errores, ¡listo! 🎉

---

## 🔍 Monitorear Memoria

Para ver el uso de memoria en tiempo real:

```bash
docker stats
```

Si ves que algún servicio usa > 80% de memoria, vuelve a ejecutar el Paso 2.

---

## 📚 Documentación Completa

Si necesitas más detalles, consulta:

- **SOLUCION_BACKEND_KILLED.md** - Guía completa del problema de memoria
- **RESUMEN_SOLUCIONES.md** - Resumen de todas las soluciones
- **CORRECCION_RUTAS_DASHBOARD.md** - Rutas actualizadas del sistema

---

## ✅ Estado Después de la Solución

| Problema | Estado |
|----------|--------|
| Build TypeScript | ✅ Corregido |
| Rutas Dashboard | ✅ `/home` configurado |
| Backend Killed | ✅ Script de solución creado |
| Memoria Docker | ⚠️ Requiere configuración manual |

---

**Próximo paso:** Ejecuta `FIX_BACKEND_KILLED.bat` ahora.
