# Scripts de Optimización del Frontend

## 📁 Scripts Disponibles

### 1. `fix-frontend-lento.sh` - Optimización Definitiva ⭐

**Propósito:** Construir y servir el frontend en modo producción para carga instantánea.

**Uso:**
```bash
./fix-frontend-lento.sh
```

**Qué hace:**
1. Limpia cache anterior (.next, .turbo, node_modules/.cache)
2. Reinstala dependencias con `npm install --force`
3. Construye el build de producción (`npm run build`)
4. Crea `docker-compose.override.yml` para modo producción
5. Reinicia el frontend con el build optimizado

**Resultado:**
- ✅ Carga en 1-2 segundos (vs 10-50 segundos)
- ✅ Sin compilación en runtime
- ✅ Todas las páginas pre-compiladas
- ❌ Sin hot-reload (necesitas rebuild para cambios)

**Duración:** 3-5 minutos (solo la primera vez)

---

### 2. `volver-frontend-desarrollo.sh` - Volver a Desarrollo

**Propósito:** Restaurar el frontend a modo desarrollo con hot-reload.

**Uso:**
```bash
./volver-frontend-desarrollo.sh
```

**Qué hace:**
1. Elimina `docker-compose.override.yml`
2. Reinicia el frontend en modo desarrollo
3. Restaura hot-reload

**Resultado:**
- ✅ Hot-reload habilitado
- ✅ Desarrollo normal
- ⚠️ Primera carga lenta de nuevo (10-30s)

**Duración:** ~20 segundos

---

### 3. `test-frontend-speed.sh` - Test de Velocidad

**Propósito:** Probar la velocidad actual del frontend y detectar el modo.

**Uso:**
```bash
./test-frontend-speed.sh
```

**Qué hace:**
1. Prueba 4 requests diferentes
2. Calcula tiempo promedio
3. Detecta si está en modo producción o desarrollo
4. Muestra estadísticas de memoria y CPU
5. Da recomendaciones

**Resultado:**
```
Análisis:
✓ MODO PRODUCCIÓN
  - Velocidad: EXCELENTE (1.2s)
  - Build pre-compilado detectado
```

**Duración:** ~10 segundos

---

## 🚀 Flujo de Trabajo Recomendado

### Para Testing/Demos
```bash
# 1. Optimizar frontend
./fix-frontend-lento.sh

# 2. Usar la aplicación (todo es rápido)
# ...

# 3. Cuando termines, volver a desarrollo
./volver-frontend-desarrollo.sh
```

### Para Desarrollo Activo
```bash
# Solo usar docker compose normalmente
docker compose up -d

# Si quieres verificar velocidad
./test-frontend-speed.sh
```

### Para Cambios de Código (en modo producción)
```bash
# 1. Edita tus archivos
# ...

# 2. Rebuild
./fix-frontend-lento.sh

# 3. Listo, cambios aplicados y optimizados
```

---

## 📊 Comparación de Modos

| Aspecto | Modo Desarrollo | Modo Producción |
|---------|----------------|-----------------|
| Primera carga | 10-50s ⚠️ | 1-2s ✅ |
| Recargas | 150-600ms ✅ | 1-2s ✅ |
| Hot-reload | ✅ Sí | ❌ No |
| Build inicial | N/A | 3-5 min |
| Rebuild para cambios | Instantáneo | 3-5 min |
| Mejor para | Desarrollo activo | Testing/Demos |

---

## 🔧 Uso desde Windows

### Opción 1: Desde Git Bash
```bash
./fix-frontend-lento.sh
```

### Opción 2: Desde WSL
```bash
wsl ./fix-frontend-lento.sh
```

### Opción 3: Desde PowerShell
```powershell
wsl bash fix-frontend-lento.sh
```

### Opción 4: Usar versión .bat
```batch
FIX_FRONTEND_LENTO.bat
```

---

## 📝 Detalles Técnicos

### docker-compose.override.yml Creado

Cuando ejecutas `fix-frontend-lento.sh`, se crea:

```yaml
services:
  frontend:
    command: npm run start
    environment:
      - NODE_ENV=production
```

Esto sobrescribe el comando del `docker-compose.yml` principal.

### Limpieza de Cache

El script limpia:
- `.next/` - Build de Next.js
- `.turbo/` - Cache de Turbopack
- `node_modules/.cache/` - Cache de babel/webpack

Esto asegura un build limpio.

### Build con Más Memoria

Si el build falla, el script automáticamente reintenta con:
```bash
NODE_OPTIONS='--max-old-space-size=6144' npm run build
```

Esto da 6GB de heap a Node.js para evitar errores de memoria.

---

## 🐛 Troubleshooting

### Error: "npm run build failed"

**Solución 1:** Verificar logs
```bash
docker compose logs frontend --tail 100
```

**Solución 2:** Build manual con más memoria
```bash
docker compose exec frontend sh -c "NODE_OPTIONS='--max-old-space-size=8192' npm run build"
```

**Solución 3:** Limpiar todo y empezar de nuevo
```bash
docker compose down
docker compose up -d --build frontend
./fix-frontend-lento.sh
```

### Error: "Frontend no inicia en modo producción"

**Verificar:**
```bash
docker compose logs frontend
```

**Común:** Falta el build. Ejecuta:
```bash
docker compose exec frontend npm run build
docker compose restart frontend
```

### Script dice "permission denied"

**Solución:**
```bash
chmod +x fix-frontend-lento.sh
chmod +x volver-frontend-desarrollo.sh
chmod +x test-frontend-speed.sh
```

### Modo producción pero sigue lento

**Posibles causas:**
1. Build no se completó correctamente
2. Backend está lento (no es el frontend)
3. Primera request a Elasticsearch

**Verificar modo:**
```bash
./test-frontend-speed.sh
```

---

## 💡 Tips

### Mantener dos versiones

Puedes tener dos contenedores simultáneamente:

**Terminal 1:** Modo desarrollo (hot-reload)
```bash
docker compose -f docker-compose.yml up frontend
```

**Terminal 2:** Modo producción (testing)
```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d frontend-prod
```

### Pre-build antes de presentar

Si vas a hacer una demo:
```bash
# Día anterior
./fix-frontend-lento.sh

# Día de la demo
docker compose up -d
# Todo carga instantáneamente
```

### Automatizar con Git Hooks

Puedes crear un git hook para auto-build:

```bash
# .git/hooks/post-merge
#!/bin/bash
if [ -f "docker-compose.override.yml" ]; then
    echo "Rebuilding frontend..."
    ./fix-frontend-lento.sh
fi
```

---

## 📚 Archivos Relacionados

- [SOLUCIONES_FRONTEND_LENTO.md](SOLUCIONES_FRONTEND_LENTO.md) - Guía completa de soluciones
- [FRONTEND_PERFORMANCE_OPTIMIZATION.md](FRONTEND_PERFORMANCE_OPTIMIZATION.md) - Detalles técnicos de optimizaciones
- [SISTEMA_FUNCIONANDO.md](SISTEMA_FUNCIONANDO.md) - Estado general del sistema

---

## 🎯 Resumen Rápido

**¿Frontend lento?**
```bash
./fix-frontend-lento.sh
```

**¿Volver a desarrollo?**
```bash
./volver-frontend-desarrollo.sh
```

**¿Probar velocidad?**
```bash
./test-frontend-speed.sh
```

---

*Última actualización: 2026-01-02*
