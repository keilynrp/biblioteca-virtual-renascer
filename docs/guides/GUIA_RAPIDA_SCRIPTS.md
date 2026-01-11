# 🚀 Guía Rápida - Scripts de Frontend

## TL;DR - Solo quiero velocidad

```bash
./fix-frontend-lento.sh
```

Espera 5 minutos → Frontend carga en 1-2 segundos ✅

---

## Scripts Disponibles

### 1️⃣ Fix Completo (Recomendado)
```bash
./fix-frontend-lento.sh
```

**Hace:**
- Limpia todo
- Reinstala dependencias
- Build de producción
- Cambia a modo producción
- Reinicia frontend

**Tiempo:** 3-5 minutos
**Resultado:** Carga instantánea (1-2s)

---

### 2️⃣ Quick Start (Si ya hiciste build antes)
```bash
./quick-start-frontend-prod.sh
```

**Hace:**
- Verifica si existe build
- Crea override para producción
- Reinicia frontend

**Tiempo:** 15-20 segundos
**Resultado:** Carga instantánea (1-2s)

---

### 3️⃣ Volver a Desarrollo
```bash
./volver-frontend-desarrollo.sh
```

**Hace:**
- Elimina override de producción
- Reinicia en modo desarrollo
- Habilita hot-reload

**Tiempo:** 20 segundos
**Resultado:** Hot-reload habilitado, primera carga lenta

---

### 4️⃣ Test de Velocidad
```bash
./test-frontend-speed.sh
```

**Hace:**
- Prueba velocidad actual
- Detecta modo (dev/prod)
- Muestra estadísticas
- Da recomendaciones

**Tiempo:** 10 segundos
**Resultado:** Análisis completo

---

## Desde Windows

### Git Bash
```bash
./fix-frontend-lento.sh
```

### PowerShell/CMD
```bash
wsl ./fix-frontend-lento.sh
```

### Alternativa .bat
```batch
FIX_FRONTEND_LENTO.bat
```

---

## Casos de Uso

### Caso 1: Vas a hacer una demo
```bash
# Día anterior
./fix-frontend-lento.sh

# Día de la demo
# Todo carga instantáneo ✅
```

### Caso 2: Estás desarrollando
```bash
# Usa modo desarrollo normal
docker compose up -d

# Si necesitas velocidad temporal
./quick-start-frontend-prod.sh

# Terminas, vuelves a desarrollo
./volver-frontend-desarrollo.sh
```

### Caso 3: Hiciste cambios y quieres probar
```bash
# Si estás en producción
./fix-frontend-lento.sh  # Rebuild

# Si estás en desarrollo
# Hot-reload automático ✅
```

### Caso 4: No sabes en qué modo estás
```bash
./test-frontend-speed.sh
# Te dice el modo y velocidad actual
```

---

## FAQ

### ¿Cuál script debo usar?

**Primera vez o cambios importantes:**
```bash
./fix-frontend-lento.sh
```

**Ya hice build antes, solo quiero iniciar:**
```bash
./quick-start-frontend-prod.sh
```

### ¿Cómo sé si funcionó?

```bash
./test-frontend-speed.sh
```

Debe decir: "MODO PRODUCCIÓN - Velocidad: EXCELENTE (1.Xs)"

### ¿Puedo volver atrás?

Sí, siempre:
```bash
./volver-frontend-desarrollo.sh
```

### ¿Los cambios de código se aplican automáticamente?

**En modo desarrollo:** SÍ (hot-reload)
**En modo producción:** NO (necesitas rebuild)

---

## Troubleshooting Rápido

### Script falla con "permission denied"
```bash
chmod +x *.sh
```

### Build falla
```bash
# Ver qué pasó
docker compose logs frontend --tail 100

# Intentar con más memoria
docker compose exec frontend sh -c "NODE_OPTIONS='--max-old-space-size=8192' npm run build"
```

### Sigue lento después del script
```bash
# Verificar que esté en producción
docker compose exec frontend cat package.json | grep '"start"'

# Debe mostrar: "start": "next start"

# Verificar comando actual
docker compose ps frontend
```

---

## Referencia Rápida

| Quiero | Script | Tiempo |
|--------|--------|--------|
| Velocidad máxima | `fix-frontend-lento.sh` | 5 min |
| Iniciar rápido | `quick-start-frontend-prod.sh` | 20 seg |
| Volver a dev | `volver-frontend-desarrollo.sh` | 20 seg |
| Ver velocidad | `test-frontend-speed.sh` | 10 seg |

---

## Documentación Completa

Para más detalles:
- [SCRIPTS_FRONTEND_README.md](SCRIPTS_FRONTEND_README.md) - Documentación completa
- [SOLUCIONES_FRONTEND_LENTO.md](SOLUCIONES_FRONTEND_LENTO.md) - Todas las soluciones disponibles

---

*Última actualización: 2026-01-02*
