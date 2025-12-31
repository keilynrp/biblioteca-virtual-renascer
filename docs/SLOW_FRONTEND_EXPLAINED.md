# Frontend Lento - Explicación y Soluciones

## 🐌 Problema

El frontend en http://localhost:3000 tarda mucho en cargar (>10 segundos).

## 🔍 Causas Normales (No requieren acción)

### 1. Primera Carga en Desarrollo
**Tiempo esperado:** 30-60 segundos

**Por qué:**
- Next.js 16 usa **Turbopack** en modo desarrollo
- Turbopack compila todo el código TypeScript/React en la primera carga
- Crea el bundle de desarrollo
- Inicia el dev server
- Compila componentes bajo demanda

**Esto es NORMAL en desarrollo.**

### 2. Hot Reload después de Cambios
**Tiempo esperado:** 2-5 segundos

**Por qué:**
- Turbopack detecta cambios en archivos
- Recompila solo los módulos afectados
- Actualiza el browser automáticamente

**Esto también es NORMAL.**

### 3. Navegación entre Páginas (Primera vez)
**Tiempo esperado:** 1-3 segundos

**Por qué:**
- Next.js compila las páginas bajo demanda
- La primera visita a `/search` compilará esa página
- Visitas posteriores son instantáneas (cache)

**Esto es el comportamiento esperado de Next.js.**

---

## ❌ Causas Problemáticas (Requieren acción)

### 1. Frontend en Loop de Recompilación
**Síntomas:**
- Logs muestran constantemente: "Compiling...", "Compiled successfully"
- CPU al 100% en el contenedor frontend
- Nunca termina de cargar

**Causa:**
- Cambios detectados en `node_modules/` o archivos temporales
- Watch mode detectando cambios en archivos que no debería

**Solución:**
```bash
# Reiniciar frontend
docker compose restart frontend
```

### 2. Cache de Next.js Corrupto
**Síntomas:**
- Errores extraños de compilación
- "Module not found" para módulos que existen
- Páginas en blanco

**Causa:**
- Cache de `.next/` corrupto

**Solución:**
```bash
FIX_SLOW_FRONTEND.bat
# O manualmente:
docker compose run --rm frontend rm -rf .next
docker compose restart frontend
```

### 3. Recursos Insuficientes de Docker
**Síntomas:**
- Lentitud consistente (>30 segundos siempre)
- Docker Desktop al 100% CPU/RAM
- Todos los contenedores lentos

**Causa:**
- Docker Desktop con poco CPU o RAM asignado

**Solución:**
```
Docker Desktop → Settings → Resources
- CPU: Mínimo 4 cores (recomendado 6)
- RAM: Mínimo 4GB (recomendado 8GB)
- Swap: 2GB

Reiniciar Docker Desktop después de cambiar
```

### 4. Demasiados Archivos en node_modules
**Síntomas:**
- Primera carga muy lenta (>2 minutos)
- `docker stats` muestra alto I/O

**Causa:**
- node_modules muy grande
- File watching en todos los archivos

**Solución:**
```bash
# Limpiar node_modules
docker compose run --rm frontend rm -rf node_modules
docker compose run --rm frontend npm install
docker compose restart frontend
```

### 5. Puerto 3000 Ocupado
**Síntomas:**
- Frontend no carga
- Error "EADDRINUSE"

**Causa:**
- Otro proceso usando puerto 3000

**Solución:**
```bash
# Windows: Encontrar proceso
netstat -ano | findstr :3000

# Matar proceso (usar PID del comando anterior)
taskkill /PID <PID> /F

# Reiniciar frontend
docker compose restart frontend
```

---

## ✅ Soluciones Rápidas

### Solución 1: Restart Rápido (Mantiene Cache)
**Tiempo:** 20 segundos
```bash
QUICK_FIX_FRONTEND.bat
```

**Qué hace:**
- Reinicia contenedor frontend
- Mantiene cache de `.next/`
- Espera a que compile

### Solución 2: Restart Completo (Limpia Cache)
**Tiempo:** 45-60 segundos
```bash
FIX_SLOW_FRONTEND.bat
```

**Qué hace:**
- Detiene frontend
- Elimina `.next/` (cache)
- Reinicia frontend
- Espera a que compile desde cero

### Solución 3: Diagnóstico Completo
**Tiempo:** 1 minuto
```bash
DIAGNOSE_SLOW_FRONTEND.bat
```

**Qué hace:**
- Verifica estado de contenedores
- Muestra uso de recursos
- Muestra logs recientes
- Muestra errores
- Mide tiempo de respuesta

---

## 📊 Tiempos Esperados

### Desarrollo (Normal)

| Acción | Tiempo Esperado | Tiempo Problemático |
|--------|-----------------|---------------------|
| Primera carga del frontend | 30-60s | >90s |
| Hot reload (cambio en archivo) | 2-5s | >10s |
| Navegación entre páginas | 1-3s (primera vez) | >5s |
| Navegación (páginas visitadas) | <1s (instant) | >2s |
| Restart del contenedor | 20-30s | >60s |

### Producción (Build)

| Acción | Tiempo Esperado |
|--------|-----------------|
| Build completo | 2-4 minutos |
| Start del servidor | 5-10s |
| Carga de página | <1s |

---

## 🔧 Optimizaciones para Desarrollo

### 1. Desactivar Turbopack (Volver a Webpack)
**Solo si Turbopack causa problemas**

Editar `package.json`:
```json
{
  "scripts": {
    "dev": "next dev"  // Sin --turbopack
  }
}
```

Reiniciar:
```bash
docker compose restart frontend
```

### 2. Aumentar Recursos de Docker

**Docker Desktop → Settings → Resources:**
```
CPU: 6 cores (o más)
RAM: 8GB
Swap: 2GB
```

### 3. Usar .dockerignore

Crear/verificar `frontend/.dockerignore`:
```
node_modules
.next
.git
*.log
```

Esto evita copiar archivos innecesarios al contenedor.

### 4. Configurar Next.js para Desarrollo

Editar `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  // ... existing config

  // Optimizaciones de desarrollo
  experimental: {
    // Reducir cantidad de archivos watched
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
}
```

---

## 📈 Monitoreo de Performance

### Ver Recursos en Tiempo Real
```bash
docker stats frontend
```

**Interpretación:**
- **CPU:** <50% normal, >80% problemático
- **MEM:** <1GB normal, >2GB revisar
- **NET I/O:** Variable, depende de tráfico
- **BLOCK I/O:** Alto al iniciar (lee archivos), luego bajo

### Ver Logs en Tiempo Real
```bash
docker compose logs -f frontend
```

**Buscar:**
- ✅ "Compiled successfully in Xms"
- ✅ "Ready on http://localhost:3000"
- ❌ "Error: ..."
- ❌ "Warning: ..."
- ❌ "Compiling..." (repetido constantemente)

### Medir Tiempo de Carga
```bash
curl -s -o nul -w "Tiempo: %{time_total}s\n" http://localhost:3000
```

**Interpretación:**
- <2s: Excelente
- 2-5s: Normal
- 5-10s: Lento pero aceptable
- >10s: Problemático

---

## 🎯 Checklist de Diagnóstico

Sigue este orden:

- [ ] **1. ¿Es la primera carga?**
  - Si SÍ → Esperar 60 segundos, es normal
  - Si NO → Continuar

- [ ] **2. ¿Acabas de hacer cambios en código?**
  - Si SÍ → Esperar 5 segundos para hot reload, es normal
  - Si NO → Continuar

- [ ] **3. Verificar logs**
  ```bash
  docker compose logs --tail=20 frontend
  ```
  - ¿Hay errores? → Solucionar errores primero
  - ¿Dice "Compiled successfully"? → Frontend OK, problema es otro
  - ¿Stuck en "Compiling..."? → Continuar

- [ ] **4. Restart rápido**
  ```bash
  QUICK_FIX_FRONTEND.bat
  ```
  - ¿Solucionó? → Listo
  - ¿Persiste? → Continuar

- [ ] **5. Verificar recursos**
  ```bash
  docker stats frontend
  ```
  - CPU >80%? → Aumentar recursos de Docker
  - MEM >2GB? → Aumentar RAM de Docker

- [ ] **6. Restart completo**
  ```bash
  FIX_SLOW_FRONTEND.bat
  ```
  - ¿Solucionó? → Listo
  - ¿Persiste? → Continuar

- [ ] **7. Verificar puerto 3000**
  ```bash
  netstat -ano | findstr :3000
  ```
  - ¿Hay otro proceso? → Matar proceso y reiniciar

- [ ] **8. Reiniciar Docker Desktop**
  - Docker Desktop → Restart
  - Esperar 2 minutos
  - `docker compose up -d`

---

## 🚀 Mejores Prácticas

### Durante Desarrollo

1. **No editar muchos archivos a la vez**
   - Turbopack recompila cada cambio
   - Edita, guarda, espera → Edita siguiente

2. **Cerrar tabs innecesarias del browser**
   - Hot reload envía updates a todas las tabs
   - Una tab abierta es suficiente

3. **Usar Hard Refresh cuando sea necesario**
   - `Ctrl + Shift + R` limpia cache del browser
   - Útil si ves cambios no reflejados

4. **No reiniciar frontend innecesariamente**
   - Hot reload es más rápido que restart
   - Solo reinicia si hay errores

### Para Producción

1. **Usar build optimizado**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

2. **Configurar cache de Next.js**
   ```typescript
   const nextConfig = {
     output: 'standalone',
     compress: true,
     poweredByHeader: false
   }
   ```

3. **Usar CDN para assets estáticos**

---

## 📞 Si Nada Funciona

Si después de todos estos pasos el frontend sigue lento:

1. **Captura información completa:**
   ```bash
   # Logs
   docker compose logs frontend > frontend_logs.txt

   # Stats
   docker stats --no-stream > docker_stats.txt

   # Configuración
   docker info > docker_info.txt
   ```

2. **Verifica tu sistema:**
   - SO: Windows 10/11?
   - RAM total: ¿Cuánta tienes?
   - CPU: ¿Modelo?
   - Docker Desktop versión: `docker --version`
   - WSL versión (si usas): `wsl --version`

3. **Comparte:**
   - Los archivos generados arriba
   - Logs de Docker Desktop
   - Screenshot del problema

---

## 💡 Información Técnica

### Por qué Next.js 16 es Lento en Desarrollo

**Turbopack:**
- Motor de build escrito en Rust
- Más rápido que Webpack en teoría
- Pero en primera carga compila TODO
- Modo desarrollo prioriza DX sobre velocidad inicial

**Solución oficial:**
- Esperar a que compile una vez
- Compilaciones siguientes son incrementales (rápidas)
- En producción, usa build optimizado (muy rápido)

### Docker Overhead

**Virtualización:**
- Docker Desktop en Windows usa WSL2
- WSL2 es una VM ligera
- Hay overhead de I/O comparado con native

**Impacto:**
- file watching puede ser más lento
- node_modules acceso más lento
- ~10-20% overhead vs native

**No hay mucho que hacer, es limitación de la arquitectura.**

---

**Fecha:** 2025-12-28
**Problema:** Frontend lento al cargar
**Causa Principal:** Compilación inicial de Next.js/Turbopack
**Solución Rápida:** `QUICK_FIX_FRONTEND.bat`
**Solución Completa:** `FIX_SLOW_FRONTEND.bat`
**Status:** ✅ Normal en desarrollo, optimizable
