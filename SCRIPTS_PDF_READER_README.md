# 🛠️ Scripts para Solucionar Errores del PDF Reader

## 📋 Índice de Scripts Disponibles

### Scripts Principales

| Script | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| `fix-pdf-reader-todo.sh` | **Script maestro** - Aplica todos los cambios automáticamente | ⭐ **RECOMENDADO** - Úsalo primero |
| `fix-pdf-reader-completo.sh` | Fix completo (asume código ya actualizado) | Si solo necesitas reiniciar servicios |
| `aplicar-cambios-pdf-viewer.sh` | Solo actualiza archivos del frontend | Si solo el código frontend tiene problemas |
| `fix-reading-error.sh` | Solo aplica migraciones del backend | Si solo el backend tiene problemas |
| `test-reading-endpoint.sh` | Diagnóstico del endpoint de lectura | Para debugging |

### Scripts Windows (.bat)

Todos los scripts tienen versión Windows `.bat` con la misma funcionalidad.

---

## 🚀 Guía de Uso Rápida

### Opción 1: Script Maestro (RECOMENDADO)

Este script hace **TODO** automáticamente:

```bash
# Dale permisos de ejecución (solo primera vez)
chmod +x fix-pdf-reader-todo.sh

# Ejecútalo
./fix-pdf-reader-todo.sh
```

**Qué hace:**
1. ✅ Crea backups de los archivos originales
2. ✅ Actualiza `pdf-viewer.tsx` (soluciona DOMMatrix)
3. ✅ Actualiza `pdfjs-config.ts`
4. ✅ Aplica migraciones del backend (crea tabla `readings`)
5. ✅ Reinicia backend y frontend
6. ✅ Verifica estado y muestra libros disponibles

**Tiempo estimado:** 45-60 segundos

---

## 📝 Uso Detallado de Cada Script

### 1. fix-pdf-reader-todo.sh (Script Maestro)

**Usar cuando:** Es la primera vez que aplicas el fix

```bash
./fix-pdf-reader-todo.sh
```

**Salida esperada:**
```
========================================
FIX COMPLETO DEL PDF READER
========================================

PASO 1: Actualizando código del frontend
[1/3] Creando backups...
✓ Backups creados
[2/3] Actualizando pdf-viewer.tsx...
✓ pdf-viewer.tsx actualizado
[3/3] Actualizando pdfjs-config.ts...
✓ pdfjs-config.ts actualizado

PASO 2: Aplicando migraciones del backend
[1/2] Aplicando migraciones...
✓ Migraciones aplicadas
[2/2] Verificando tabla readings...
✓ Tabla readings existe. Registros: 0

PASO 3: Reiniciando servicios
[1/2] Reiniciando backend...
[2/2] Reiniciando frontend...

PASO 4: Verificación
✓ Total de libros con PDF: 3
  • ID 1: El Quijote
    URL: http://localhost:3000/reader/1

✓ PROCESO COMPLETADO
```

---

### 2. fix-pdf-reader-completo.sh

**Usar cuando:** Ya aplicaste cambios de código pero necesitas reiniciar servicios

```bash
./fix-pdf-reader-completo.sh
```

**No modifica archivos**, solo:
- Aplica migraciones
- Reinicia servicios
- Verifica estado

---

### 3. aplicar-cambios-pdf-viewer.sh

**Usar cuando:** Solo necesitas actualizar el código del frontend

```bash
./aplicar-cambios-pdf-viewer.sh
```

**Modifica:**
- `frontend/src/components/pdf-viewer.tsx`
- `frontend/src/lib/pdfjs-config.ts`

**No toca:** Backend, base de datos

---

### 4. fix-reading-error.sh

**Usar cuando:** Solo el backend tiene problemas (tabla readings no existe)

```bash
./fix-reading-error.sh
```

**Hace:**
- Aplica migraciones
- Crea tabla `readings`
- Reinicia backend

**No toca:** Código del frontend

---

### 5. test-reading-endpoint.sh

**Usar cuando:** Quieres diagnosticar problemas del endpoint

```bash
./test-reading-endpoint.sh
```

**Muestra:**
- Estado de migraciones
- Token de admin para testing
- Comandos curl para probar endpoint manualmente

---

## 🔍 Solución de Problemas

### Error: "Permission denied"

```bash
# Dale permisos de ejecución
chmod +x *.sh
```

### Error: "docker: command not found"

Asegúrate de que Docker está corriendo:

```bash
# Verificar Docker
docker --version

# Iniciar Docker (si está detenido)
systemctl start docker  # Linux
# o abre Docker Desktop en Windows/Mac
```

### El script se ejecutó pero aún hay errores

1. **Verifica logs del frontend:**
   ```bash
   docker compose logs frontend --tail=50
   ```

2. **Verifica logs del backend:**
   ```bash
   docker compose logs backend --tail=50
   ```

3. **Hard refresh en navegador:**
   - **Ctrl + Shift + R** (Windows/Linux)
   - **Cmd + Shift + R** (Mac)
   - O abre en ventana incógnita

4. **Verifica en DevTools:**
   - F12 → Console: busca errores
   - F12 → Network: busca peticiones fallidas

### Los cambios no se ven

Si ejecutaste el script pero no ves cambios:

```bash
# 1. Verifica que los archivos se modificaron
cat frontend/src/components/pdf-viewer.tsx | head -20

# Deberías ver "import dynamic from 'next/dynamic';" en línea 4

# 2. Fuerza rebuild del frontend
docker compose stop frontend
docker compose rm -f frontend
docker compose up -d frontend

# 3. Espera 30 segundos
sleep 30

# 4. Hard refresh en navegador
```

---

## 🎯 Verificación Post-Fix

Después de ejecutar cualquier script, verifica que todo funciona:

### 1. Verifica Contenedores

```bash
docker compose ps
```

Deberías ver:
- ✅ `backend` - Up (healthy)
- ✅ `frontend` - Up
- ✅ `db` - Up (healthy)
- ✅ `elasticsearch` - Up

### 2. Verifica Migraciones

```bash
docker compose exec backend python manage.py showmigrations content
```

Busca:
- ✅ `[X] 0005_add_reading_model`

### 3. Prueba el Reader

1. Obtén un libro con PDF:
   ```bash
   docker compose exec backend python manage.py shell -c "
   from apps.content.models import Book
   book = Book.objects.exclude(file='').first()
   if book:
       print(f'Prueba con: http://localhost:3000/reader/{book.id}')
   "
   ```

2. Accede a la URL en tu navegador

3. Verifica en DevTools (F12):
   - **Console:** Sin errores de "DOMMatrix" o "sesión de lectura"
   - **Network:** Petición a `/api/user/readings/start/` retorna 200/201

---

## 📦 Backups

Todos los scripts crean backups automáticos:

```bash
# Ver backups
ls -la frontend/src/components/pdf-viewer.tsx.backup*
ls -la frontend/src/lib/pdfjs-config.ts.backup*
```

### Restaurar Backup

Si algo sale mal:

```bash
# Encuentra el backup más reciente
ls -lt frontend/src/components/pdf-viewer.tsx.backup* | head -1

# Restaura
cp frontend/src/components/pdf-viewer.tsx.backup.YYYYMMDD_HHMMSS frontend/src/components/pdf-viewer.tsx

# Reinicia frontend
docker compose restart frontend
```

---

## 🆘 Ayuda Adicional

### Ver Documentación Completa

- [SOLUCION_ERROR_PDF_READER.md](./SOLUCION_ERROR_PDF_READER.md) - Solución detallada
- [DIAGNOSTICO_ERROR_READING.md](./DIAGNOSTICO_ERROR_READING.md) - Diagnóstico del error de backend

### Reportar Problemas

Si ningún script funciona, comparte:

```bash
# 1. Versión de Docker
docker --version
docker compose version

# 2. Estado de contenedores
docker compose ps

# 3. Logs
docker compose logs frontend --tail=100 > frontend-logs.txt
docker compose logs backend --tail=100 > backend-logs.txt

# 4. Migraciones
docker compose exec backend python manage.py showmigrations content

# 5. Contenido de archivos (primeras 20 líneas)
head -20 frontend/src/components/pdf-viewer.tsx
head -20 frontend/src/lib/pdfjs-config.ts
```

---

## ✅ Checklist Final

Después de ejecutar el script maestro:

- [ ] Ejecutado `./fix-pdf-reader-todo.sh`
- [ ] Script completó sin errores
- [ ] Contenedores están "Up" (`docker compose ps`)
- [ ] Frontend compiló correctamente (ver logs)
- [ ] Backend tiene tabla `readings`
- [ ] Hard refresh en navegador (Ctrl+Shift+R)
- [ ] Accediste a `/reader/[BOOK_ID]`
- [ ] PDF carga sin errores
- [ ] No hay errores en DevTools Console
- [ ] Controles de zoom y navegación funcionan

---

## 🎉 Todo Funciona?

Si el PDF reader funciona correctamente, deberías ver:

- ✅ PDF renderizado correctamente
- ✅ Botones de navegación (anterior/siguiente página)
- ✅ Control de zoom (+/-)
- ✅ Barra de progreso
- ✅ Tiempo de lectura actualizándose
- ✅ Sin errores en Console

**¡Felicidades! El PDF reader está funcionando correctamente.**

---

## 📚 Próximos Pasos

Una vez funcionando:

1. **Importa más libros** (si necesitas):
   ```bash
   ./importar-100-libros.sh
   ```

2. **Prueba todas las funcionalidades**:
   - Navegación de páginas
   - Zoom in/out
   - Teclas de acceso rápido (flechas, +/-)
   - Auto-guardado de progreso

3. **Personaliza el reader** (opcional):
   - Agrega más controles
   - Cambia estilos
   - Agrega funcionalidad de marcadores

---

**Última actualización:** 2026-01-02
