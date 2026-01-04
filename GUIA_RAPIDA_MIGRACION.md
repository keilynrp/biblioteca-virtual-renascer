# 🚀 Guía Rápida - Migración Docker

## ⚠️ Tienes Error de Timeout

Si ves este error:
```
ERROR: Read timed out. (read timeout=60)
```

## ✅ Solución en 3 Pasos

### Paso 1: Limpiar Docker
```cmd
LIMPIAR_DOCKER.bat
```
Espera que termine (2-3 minutos)

### Paso 2: Aumentar Memoria de Docker

1. Abre **Docker Desktop**
2. Ve a **Settings** → **Resources**
3. Aumenta **Memory** a **4GB** o más
4. Click **Apply & Restart**
5. Espera 1-2 minutos

### Paso 3: Ejecutar Migración con Fix de Timeouts
```cmd
MIGRAR_DOCKER_TIMEOUT_FIX.bat
```
Espera pacientemente (5-10 minutos)

## ✅ Si Todo Va Bien

1. Ejecuta setup completo:
```cmd
SETUP_COMPLETO_POST_MIGRACION.bat
```

2. Verifica que funcione:
```cmd
VERIFICAR_MIGRACION.bat
```

## 🆘 Si Aún Falla

Usa inicio incremental (más lento pero más seguro):
```cmd
INICIAR_SERVICIOS_INCREMENTAL.bat
```

## 📖 Más Información

- [SOLUCION_TIMEOUT_DOCKER.md](SOLUCION_TIMEOUT_DOCKER.md) - Guía completa de timeouts
- [RESUMEN_MIGRACION_DOCKER.md](RESUMEN_MIGRACION_DOCKER.md) - Resumen completo
- [INSTRUCCIONES_MIGRACION_DOCKER.md](INSTRUCCIONES_MIGRACION_DOCKER.md) - Instrucciones detalladas

## 🎯 Accesos Después de Migrar

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Django: http://localhost:8000/admin/
- Elasticsearch: http://localhost:9200/

---

**Tiempo total estimado**: 10-15 minutos
