# Solución Completa: Errores del Visor de Lectura PDF

## Índice de Errores

1. [Error: "Error al iniciar la sesión de lectura" (sin detalles)](#error-1-genérico)
2. [Error: "Error 404: Not Found"](#error-2-404-not-found)
3. [Otros errores comunes](#otros-errores-comunes)

---

## Error 1: Genérico

### Síntoma
```
Error al iniciar la sesión de lectura
```

Sin más detalles en consola.

### Causa
La tabla `readings` no existe en la base de datos porque las migraciones no están aplicadas.

### Solución

**Opción 1: Automática (Recomendada)**
```bash
bash fix-reading-simple.sh
```

**Opción 2: Manual**
```bash
# 1. Aplicar migraciones
docker compose exec backend python manage.py migrate

# 2. Verificar tabla
docker compose exec db psql -U postgres -d bvs_db -c "\d readings"

# 3. Reiniciar servicios
docker compose restart backend frontend
```

**Documentación completa:** [SOLUCION_ERROR_LECTURA.md](SOLUCION_ERROR_LECTURA.md)

---

## Error 2: 404 Not Found

### Síntoma
```
Error al iniciar la sesión de lectura: Error 404: Not Found
Backend error: null
```

### Causa
Las URLs del frontend no coinciden con las URLs del backend. Las URLs necesitan el prefijo `/api/content/`.

### Solución Aplicada

Se corrigieron las siguientes URLs en [frontend/src/app/(dashboard)/reader/[bookId]/page.tsx](frontend/src/app/(dashboard)/reader/[bookId]/page.tsx):

#### URLs Incorrectas (antes)
```typescript
/api/user/readings/start/${bookId}/          ❌
/api/books/${bookId}/file/                   ❌
/api/user/readings/${bookId}/progress/       ❌
```

#### URLs Correctas (después)
```typescript
/api/content/user/readings/start/${bookId}/      ✅
/api/content/books/${bookId}/file/               ✅
/api/content/user/readings/${bookId}/progress/   ✅
```

### Aplicar el Fix

El fix ya está aplicado en el código. Solo reinicia el frontend:

```bash
docker compose restart frontend
```

O espera a que Next.js detecte los cambios automáticamente (Hot Reload).

### Verificar la Solución

Ejecuta el script de prueba:

```bash
bash test-reading-endpoints.sh
```

Este script probará los 3 endpoints y te dirá si están funcionando correctamente.

**Documentación completa:** [FIX_URL_404_READING.md](FIX_URL_404_READING.md)

---

## Otros Errores Comunes

### Error 401: Unauthorized

**Síntoma:**
```
Error al iniciar la sesión de lectura: Error 401: Unauthorized
```

**Causa:** Token de autenticación expirado o inválido.

**Solución:**
1. Cierra sesión en el frontend
2. Vuelve a iniciar sesión
3. Intenta abrir el libro de nuevo

---

### Error 500: Internal Server Error

**Síntoma:**
```
Error al iniciar la sesión de lectura: Error 500: Internal Server Error
```

**Causa:** Error en el servidor backend (probablemente problema con el modelo o la base de datos).

**Solución:**
```bash
# 1. Ver logs del backend
docker compose logs backend --tail=50

# 2. Verificar migraciones
bash fix-reading-simple.sh

# 3. Si persiste, revisar el error específico en los logs
```

---

### Error: Book not found

**Síntoma:**
```
Error al iniciar la sesión de lectura: Book not found
```

**Causa:** El ID del libro no existe en la base de datos.

**Solución:**
```bash
# Verificar que hay libros
docker compose exec db psql -U postgres -d bvs_db -c "SELECT id, title FROM books LIMIT 5;"

# Si no hay libros, importar algunos
bash importar-libros-openlibrary.sh
```

---

### Error: PDF file not found

**Síntoma:**
El visor se abre pero muestra error al cargar el PDF.

**Causa:** El libro no tiene un archivo PDF asociado.

**Solución:**
```bash
# Verificar libros con archivos
docker compose exec db psql -U postgres -d bvs_db -c "SELECT id, title, file FROM books WHERE file IS NOT NULL LIMIT 5;"

# El campo 'file' debe tener una ruta válida
```

---

## 🚀 Solución Rápida para Todos los Errores

Si tienes cualquier error relacionado con el visor de lectura, ejecuta:

```bash
bash fix-reading-simple.sh
```

Este script:
1. ✅ Aplica migraciones
2. ✅ Verifica tabla readings
3. ✅ Reinicia servicios
4. ✅ Verifica que todo está funcionando

---

## 🧪 Probar que Todo Funciona

### Opción 1: Prueba Automatizada
```bash
bash test-reading-endpoints.sh
```

Este script prueba los 3 endpoints principales y te dice si están funcionando.

### Opción 2: Prueba Manual
1. Abre http://localhost:3000
2. Inicia sesión
3. Ve a la biblioteca
4. Selecciona un libro
5. Haz clic en "Leer"

**Resultado esperado:** El visor PDF se abre sin errores.

---

## 📊 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Docker está corriendo
- [ ] Contenedores están `up` (`docker compose ps`)
- [ ] Migraciones aplicadas (`docker compose exec backend python manage.py showmigrations`)
- [ ] Tabla `readings` existe (`docker compose exec db psql -U postgres -d bvs_db -c "\d readings"`)
- [ ] Hay libros en la BD (`docker compose exec db psql -U postgres -d bvs_db -c "SELECT COUNT(*) FROM books;"`)
- [ ] Frontend tiene las URLs correctas (con `/api/content/`)
- [ ] Token de autenticación válido (reinicia sesión)

---

## 🛠️ Scripts Disponibles

### Soluciones
- **fix-reading-simple.sh** - Fix rápido y confiable (30-60s)
- **EJECUTAR_FIX.sh** - Fix con diagnóstico completo (60-90s)
- **fix-reading-session-error.sh** - Fix completo con pruebas (90-120s)

### Diagnóstico
- **debug-reading-error.sh** - Diagnóstico sin modificaciones (30s)
- **test-reading-endpoints.sh** - Prueba los 3 endpoints principales

### Documentación
- **GUIA_RAPIDA_FIX_LECTURA.md** - Guía visual rápida
- **SOLUCION_ERROR_LECTURA.md** - Solución para error genérico
- **FIX_URL_404_READING.md** - Solución para error 404
- **README_FIX_READING.md** - Manual técnico completo

---

## 📝 Historial de Cambios

### 2025-01-02 - v2.0
- ✅ Corregido error 404 en endpoints
- ✅ URLs actualizadas con prefijo `/api/content/`
- ✅ Creado script de prueba de endpoints
- ✅ Mejorado manejo de errores en frontend

### 2025-01-01 - v1.0
- ✅ Solución inicial para tabla readings
- ✅ Scripts de fix y diagnóstico
- ✅ Documentación completa

---

## 🎯 Flujo de Resolución de Problemas

```
¿Error en visor PDF?
    │
    ├─→ Error genérico sin detalles
    │   └─→ bash fix-reading-simple.sh
    │
    ├─→ Error 404: Not Found
    │   └─→ Ya está corregido en el código
    │       └─→ docker compose restart frontend
    │
    ├─→ Error 401: Unauthorized
    │   └─→ Reinicia sesión
    │
    ├─→ Error 500: Internal Server Error
    │   └─→ docker compose logs backend --tail=50
    │       └─→ bash fix-reading-simple.sh
    │
    └─→ Otro error
        └─→ bash debug-reading-error.sh
            └─→ Revisa la salida y logs
```

---

## ✅ Verificación Final

Después de aplicar cualquier fix, ejecuta:

```bash
# 1. Probar endpoints
bash test-reading-endpoints.sh

# 2. Ver estado
docker compose ps

# 3. Abrir frontend
echo "Abre http://localhost:3000 y prueba el visor PDF"
```

---

**Última actualización:** 2025-01-02
**Versión:** 2.0
