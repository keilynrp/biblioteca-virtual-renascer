# 🔄 Aplicar Cambios del Lector de PDF

## ⚠️ Los cambios NO se ven porque Next.js está en caché

Los archivos están modificados correctamente, pero **Next.js necesita reconstruir** para ver los cambios.

---

## 🚀 Solución Rápida (Recomendada)

### Opción 1: Reiniciar el Frontend

**Windows:**
```bash
REINICIAR_FRONTEND.bat
```

**Linux/Mac:**
```bash
chmod +x reiniciar-frontend.sh
./reiniciar-frontend.sh
```

### Opción 2: Comandos Manuales

```bash
# 1. Detener frontend
docker compose stop frontend

# 2. Reiniciar frontend
docker compose up -d frontend

# 3. Esperar 10 segundos
# (En Windows: timeout /t 10)
# (En Linux/Mac: sleep 10)

# 4. Ver logs para confirmar que inició bien
docker compose logs frontend --tail=50
```

### Opción 3: Hard Refresh del Navegador

Después de reiniciar el frontend, **IMPORTANTE**:

1. **Ctrl + Shift + R** (Windows/Linux) o **Cmd + Shift + R** (Mac) para hard refresh
2. O abre en **ventana incógnita**: `http://localhost:3000`
3. O limpia cache del navegador:
   - Chrome: Ctrl+Shift+Delete → Seleccionar "Cached images and files"
   - Firefox: Ctrl+Shift+Delete → Seleccionar "Cache"

---

## 🔍 Verificar que los Cambios Están Aplicados

### En el Navegador (DevTools):

1. Abre DevTools (F12)
2. Ve a la pestaña **Sources** o **Debugger**
3. Busca: `pdf-viewer.tsx`
4. **Busca esta línea** (debería estar presente):

```typescript
file={{
  url: pdfUrl,
  httpHeaders: accessToken ? {
    'Authorization': `Bearer ${accessToken}`,
  } : undefined,
```

Si ves eso, los cambios están aplicados ✅

### En los Logs del Frontend:

```bash
docker compose logs frontend --tail=100
```

Busca:
- ✅ `compiled client and server successfully`
- ✅ Sin errores de TypeScript
- ❌ Si ves errores, compártelos

---

## 🐛 Si Aún No Funciona

### 1. Rebuild Completo del Frontend

```bash
# Detener frontend
docker compose stop frontend

# Eliminar cache de Node y Next.js
docker compose run --rm frontend rm -rf node_modules .next

# Rebuild la imagen
docker compose build --no-cache frontend

# Iniciar frontend
docker compose up -d frontend

# Esperar 30 segundos para que instale dependencias
# Ver logs
docker compose logs frontend -f
```

### 2. Verificar Volúmenes de Docker

Asegúrate de que `docker-compose.yml` tenga:

```yaml
frontend:
  volumes:
    - ./frontend:/app
    - /app/node_modules
    - /app/.next
```

### 3. Verificar que el Archivo se Modificó

**En tu editor (VS Code):**
- Abre: `frontend/src/components/pdf-viewer.tsx`
- Busca la línea 234-237 (aproximadamente)
- Deberías ver:

```typescript
file={{
  url: pdfUrl,
  httpHeaders: accessToken ? {
```

Si NO lo ves, los cambios no se guardaron. Revisa el archivo.

---

## 🎯 Pasos para Probar el Lector

Una vez que el frontend se haya reiniciado:

### 1. Verifica que Tienes un Libro con PDF

```bash
docker compose exec backend python manage.py shell -c "
from apps.content.models import Book
books = Book.objects.exclude(file='')
print(f'Libros con PDF: {books.count()}')
if books.exists():
    book = books.first()
    print(f'ID: {book.id}, Título: {book.title}')
    print(f'URL: http://localhost:3000/reader/{book.id}')
"
```

### 2. Accede al Lector

```
http://localhost:3000/reader/[ID]
```

Reemplaza `[ID]` con el ID del libro que tiene PDF.

### 3. Abre DevTools y Revisa

**Console (F12):**
- ❌ Si ves errores, compártelos
- ✅ Deberías ver: "Progress saved successfully" cada 30 segundos

**Network:**
- Busca la petición al PDF
- Debería tener header: `Authorization: Bearer ...`
- Si no lo tiene, los cambios no se aplicaron

---

## 📊 Checklist de Verificación

- [ ] Frontend reiniciado
- [ ] Hard refresh en navegador (Ctrl+Shift+R)
- [ ] DevTools sin errores en Console
- [ ] Archivo `pdf-viewer.tsx` tiene los cambios (verifica en Sources)
- [ ] Existe al menos un libro con PDF en el sistema
- [ ] La URL `/reader/[ID]` carga correctamente
- [ ] El PDF se renderiza (no solo spinner de carga)

---

## 🆘 Si NADA Funciona

Comparte estos logs:

```bash
# 1. Logs del frontend
docker compose logs frontend --tail=100 > frontend-logs.txt

# 2. Estado de los contenedores
docker compose ps > containers-status.txt

# 3. Contenido del archivo modificado
cat frontend/src/components/pdf-viewer.tsx | grep -A 10 "httpHeaders"
```

---

## 💡 Explicación del Problema

**¿Por qué no se ven los cambios?**

1. **Next.js hace build/cache** de los componentes
2. Los cambios en archivos `.tsx` requieren **recompilación**
3. El contenedor tiene que **detectar los cambios** en los archivos montados
4. El navegador puede tener **caché del JavaScript**

**Solución:**
1. Reiniciar frontend → recompila Next.js
2. Hard refresh → limpia caché del navegador
3. DevTools → verificar que el código nuevo está cargado

---

**Próximo Paso**: Ejecuta `REINICIAR_FRONTEND.bat` y luego haz hard refresh en el navegador (Ctrl+Shift+R)
