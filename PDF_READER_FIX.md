# 🔧 Fix: Lector de PDF Corregido

## ✅ Problemas Corregidos

### 1. **Configuración de PDF.js Worker**
- **Antes**: Usaba protocolo relativo `//unpkg.com` que podía fallar
- **Después**: Usa `https://unpkg.com` para mejor compatibilidad

### 2. **Autenticación para Cargar PDFs**
- **Problema**: Los PDFs requieren autenticación del backend pero el componente no enviaba el token
- **Solución**: Agregado soporte para `httpHeaders` con Bearer token

### 3. **Opciones de PDF.js**
- **Agregado**: Configuración de cmaps y fuentes estándar para mejor renderizado

---

## 📝 Cambios Realizados

### Archivo: `frontend/src/lib/pdfjs-config.ts`

```diff
- pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
+ pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

### Archivo: `frontend/src/components/pdf-viewer.tsx`

**1. Agregado import de pdfjs:**
```typescript
import { Document, Page, pdfjs } from 'react-pdf';
```

**2. Agregado prop accessToken:**
```typescript
interface PDFViewerProps {
  // ...
  accessToken?: string;
  // ...
}
```

**3. Actualizado Document component con autenticación:**
```typescript
<Document
  file={{
    url: pdfUrl,
    httpHeaders: accessToken ? {
      'Authorization': `Bearer ${accessToken}`,
    } : undefined,
    withCredentials: false,
  }}
  options={{
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }}
  // ...
>
```

### Archivo: `frontend/src/app/(dashboard)/reader/[bookId]/page.tsx`

**Pasando accessToken al componente:**
```typescript
<PDFViewer
  bookId={bookId}
  bookTitle={reading.book.title}
  pdfUrl={pdfUrl}
  initialPage={reading.current_page}
  initialZoom={parseFloat(reading.zoom_level)}
  accessToken={accessToken || undefined}  // ← Agregado
  onProgressUpdate={handleProgressUpdate}
/>
```

---

## 🧪 Cómo Probar

### 1. Asegúrate de Tener Libros con PDFs

Primero necesitas libros en el sistema con archivos PDF:

```bash
# Ver si hay libros con PDFs
docker compose exec backend python manage.py shell -c "from apps.content.models import Book; print(f'Libros con PDFs: {Book.objects.exclude(file=\"\").count()}')"
```

### 2. Subir un PDF de Prueba

Ve a: http://localhost:3000/admin/books

1. Click en "Nuevo Libro"
2. Llena los campos requeridos
3. **Importante**: Sube un archivo PDF válido (< 50MB)
4. Guarda

### 3. Probar el Lector

1. Ve al Dashboard: http://localhost:3000/dashboard
2. Click en cualquier libro que tenga PDF
3. En la página de detalles, busca el botón "Leer" o similar
4. O accede directamente: http://localhost:3000/reader/[ID_DEL_LIBRO]

**Ejemplo:**
```
http://localhost:3000/reader/1
```

### 4. Verificar Funcionalidad

El lector debe:
- ✅ Mostrar el PDF correctamente
- ✅ Permitir navegar entre páginas (flechas izq/der)
- ✅ Permitir zoom in/out (+/-)
- ✅ Mostrar progreso de lectura
- ✅ Guardar progreso automáticamente cada 30 segundos
- ✅ Mostrar tiempo de lectura

---

## 🐛 Troubleshooting

### Error: "Failed to load PDF"

**Posibles causas:**

1. **El libro no tiene archivo PDF**
   ```bash
   # Verificar en backend
   docker compose exec backend python manage.py shell
   >>> from apps.content.models import Book
   >>> book = Book.objects.get(id=1)
   >>> print(f"PDF: {book.file}")
   ```

2. **Token de autenticación inválido**
   - Verifica que estés logueado
   - Refresca la página
   - Si persiste, cierra sesión y vuelve a iniciar

3. **CORS o problemas de red**
   - Abre DevTools (F12) → Console
   - Busca errores en rojo
   - Verifica que el backend esté corriendo: http://localhost:8000/api

### Error: "Worker not loaded"

```bash
# En la consola del navegador debería verse:
# Descargando de: https://unpkg.com/pdfjs-dist@x.x.x/build/pdf.worker.min.mjs
```

Si no funciona:
1. Verifica conexión a internet
2. Comprueba que no haya bloqueadores de CDN
3. Revisa la consola del navegador

### El PDF se ve en blanco

1. **Verifica que el archivo sea un PDF válido:**
   ```bash
   docker compose exec backend python manage.py shell
   >>> from apps.content.models import Book
   >>> book = Book.objects.get(id=1)
   >>> import os
   >>> print(f"Archivo existe: {os.path.exists(book.file.path)}")
   >>> print(f"Tamaño: {os.path.getsize(book.file.path)} bytes")
   ```

2. **Abre el PDF directamente en el navegador:**
   - Copia la URL del PDF desde DevTools → Network
   - Pégala en una nueva pestaña
   - ¿Se descarga correctamente?

### La autenticación falla

```bash
# Verificar endpoint
curl -H "Authorization: Bearer TU_TOKEN" \
  http://localhost:8000/api/books/1/file/
```

Si devuelve 401:
- Token expirado → Vuelve a loguearte
- Token inválido → Revisa el authStore

---

## 📊 Verificación Rápida

Ejecuta este comando para verificar que todo esté bien:

```bash
# 1. Backend funcionando
curl http://localhost:8000/api/content/books/ | head -20

# 2. Frontend funcionando
curl http://localhost:3000 | head -20

# 3. Libros con PDFs disponibles
docker compose exec backend python manage.py shell -c "
from apps.content.models import Book
books_with_pdf = Book.objects.exclude(file='')
print(f'✅ {books_with_pdf.count()} libros con PDF')
for book in books_with_pdf[:3]:
    print(f'  - ID {book.id}: {book.title}')
"
```

---

## 🎯 Próximas Mejoras

Funcionalidades que se pueden agregar:

- [ ] Modo pantalla completa
- [ ] Modo nocturno/claro
- [ ] Búsqueda de texto en el PDF
- [ ] Marcadores personales
- [ ] Anotaciones
- [ ] Descarga del PDF (con permisos)
- [ ] Tabla de contenidos (si el PDF la tiene)
- [ ] Rotación de páginas
- [ ] Impresión del documento

---

## 📚 Recursos

- **Documentación react-pdf**: https://github.com/wojtekmaj/react-pdf
- **PDF.js Documentación**: https://mozilla.github.io/pdf.js/
- **Guía de API Backend**: Ver archivo `backend/apps/content/views.py` líneas 831-877

---

**Fix Aplicado**: 2026-01-02
**Estado**: ✅ Listo para probar
**Archivos Modificados**: 3 archivos
