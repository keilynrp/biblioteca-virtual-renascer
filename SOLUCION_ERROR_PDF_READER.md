# 🔧 Solución: Errores del Lector de PDF

## 📋 Resumen de Errores

Se identificaron **dos errores** que impedían el funcionamiento del lector de PDF:

### Error 1: DOMMatrix is not defined
**Causa:** Next.js/Turbopack intentaba renderizar `react-pdf` en el servidor (SSR), pero `DOMMatrix` solo existe en el navegador.

**Solución Aplicada:**
- Usamos `next/dynamic` para cargar los componentes `Document` y `Page` solo en el cliente
- Agregamos verificación `isMounted` para asegurar renderizado solo del lado del cliente
- Configuramos PDF.js worker dinámicamente solo cuando `window` existe

### Error 2: Error al iniciar la sesión de lectura
**Causa:** La tabla `readings` no existe en la base de datos porque las migraciones no se han aplicado.

**Solución:** Aplicar las migraciones pendientes.

---

## 🚀 Solución Rápida

### Opción 1: Script Automatizado (RECOMENDADO)

```bash
FIX_PDF_READER_COMPLETO.bat
```

Este script hará todo automáticamente:
1. ✅ Aplicar migraciones de base de datos
2. ✅ Crear tabla `readings`
3. ✅ Reiniciar backend y frontend
4. ✅ Mostrar libros disponibles con PDF

### Opción 2: Comandos Manuales

```bash
# 1. Aplicar migraciones
docker compose exec backend python manage.py migrate

# 2. Verificar tabla readings
docker compose exec backend python manage.py shell -c "
from apps.content.models import Reading
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT COUNT(*) FROM readings')
print(f'Tabla readings existe. Registros: {cursor.fetchone()[0]}')
"

# 3. Reiniciar servicios
docker compose restart backend
docker compose restart frontend

# 4. Esperar 15 segundos para que compile
timeout /t 15

# 5. Hard refresh en navegador
# Ctrl+Shift+R
```

---

## 📝 Cambios Realizados en el Código

### 1. [frontend/src/components/pdf-viewer.tsx](d:\bvs_framework\frontend\src\components\pdf-viewer.tsx)

**Antes:**
```tsx
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
```

**Después:**
```tsx
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const Document = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);
```

**Razón:** Esto previene que Next.js intente renderizar PDF.js en el servidor, donde `DOMMatrix` no existe.

### 2. Configuración de PDF.js Worker

**Antes:**
```tsx
// En pdfjs-config.ts
pdfjs.GlobalWorkerOptions.workerSrc = `...`;
```

**Después:**
```tsx
// Dentro del componente, solo en cliente
useEffect(() => {
  if (typeof window !== 'undefined') {
    import('react-pdf').then((mod) => {
      const pdfjs = mod.pdfjs;
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }
}, []);
```

**Razón:** Asegura que la configuración solo se ejecute en el navegador.

### 3. Client-Side Mounting Check

```tsx
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) {
  return <LoadingSpinner />;
}
```

**Razón:** Previene hidratación incorrecta al asegurar que el componente PDF solo se renderiza después de montar en el cliente.

---

## 🧪 Cómo Probar

### 1. Verificar que hay libros con PDF

```bash
docker compose exec backend python manage.py shell -c "
from apps.content.models import Book
books = Book.objects.exclude(file='')
print(f'Libros con PDF: {books.count()}')
for book in books[:5]:
    print(f'ID: {book.id}, Título: {book.title}')
    print(f'  URL: http://localhost:3000/reader/{book.id}')
"
```

### 2. Acceder al Lector

Usa uno de los IDs de libros mostrados arriba:

```
http://localhost:3000/reader/[BOOK_ID]
```

### 3. Verificar en DevTools

Abre DevTools (F12) y revisa:

**Console Tab:**
- ✅ NO deberías ver "DOMMatrix is not defined"
- ✅ NO deberías ver "Error al iniciar la sesión de lectura"
- ✅ Podrías ver "Progress saved successfully" cada 30 segundos

**Network Tab:**
- Busca la petición a `/api/user/readings/start/[ID]/`
- Debería retornar **201 Created** o **200 OK**
- Busca la petición al PDF (`/api/books/[ID]/file/`)
- Debería tener header: `Authorization: Bearer [token]`
- Debería retornar **200 OK**

---

## 🔍 Diagnóstico de Problemas

### Si aún ves "DOMMatrix is not defined"

1. **Verifica que el frontend se reinició:**
   ```bash
   docker compose logs frontend --tail=50
   ```
   Busca: `✓ Compiled /reader/[bookId]/page in ...`

2. **Hard refresh en navegador:**
   - Windows/Linux: **Ctrl + Shift + R**
   - Mac: **Cmd + Shift + R**
   - O abre en ventana incógnita

3. **Verifica que el archivo se actualizó:**
   - Abre DevTools → Sources
   - Busca `pdf-viewer.tsx`
   - Debería tener `dynamic from 'next/dynamic'` en la línea 4

### Si aún ves "Error al iniciar la sesión de lectura"

1. **Verifica que las migraciones se aplicaron:**
   ```bash
   docker compose exec backend python manage.py showmigrations content
   ```
   Busca:
   - `[X] 0005_add_reading_model`

2. **Revisa el error exacto en Network:**
   - DevTools → Network tab
   - Busca `/api/user/readings/start/[ID]/`
   - Click → Response
   - Comparte el mensaje de error

3. **Revisa logs del backend:**
   ```bash
   docker compose logs backend --tail=100 | grep -i "error\|traceback"
   ```

---

## 📊 Checklist de Verificación

Después de ejecutar el fix:

- [ ] Ejecutado `FIX_PDF_READER_COMPLETO.bat`
- [ ] Migraciones aplicadas (tabla `readings` existe)
- [ ] Backend reiniciado y saludable (`docker compose ps`)
- [ ] Frontend reiniciado y compilado
- [ ] Hard refresh en navegador (Ctrl+Shift+R)
- [ ] No hay errores en DevTools Console
- [ ] Petición a `/api/user/readings/start/[ID]/` retorna 200/201
- [ ] El PDF se carga correctamente
- [ ] Los controles de zoom y paginación funcionan

---

## 🎯 Arquitectura de la Solución

### Flujo de Carga del PDF Reader

```
1. Usuario accede a /reader/[bookId]
   ↓
2. page.tsx verifica autenticación
   ↓
3. Llama a /api/user/readings/start/[bookId]/ (POST)
   ↓
4. Backend crea/recupera registro en tabla 'readings'
   ↓
5. Frontend recibe: { reading: {...}, status: 'started' }
   ↓
6. PDFViewer se monta (solo en cliente)
   ↓
7. Configura PDF.js worker
   ↓
8. Carga PDF desde /api/books/[bookId]/file/
   ↓
9. Renderiza PDF con react-pdf
   ↓
10. Auto-guarda progreso cada 30 segundos
```

### Componentes Involucrados

**Backend:**
- `Reading` model (tabla `readings`)
- `StartReadingView` (POST `/api/user/readings/start/<id>/`)
- `UpdateReadingProgressView` (PATCH `/api/user/readings/<id>/progress/`)
- `ServeBookFileView` (GET `/api/books/<id>/file/`)

**Frontend:**
- `ReaderPage` ([bookId]/page.tsx) - Maneja autenticación y sesión
- `PDFViewer` (pdf-viewer.tsx) - Renderiza PDF con controles
- `Document` y `Page` (react-pdf) - Renderizado del PDF

---

## 🆘 Si Nada Funciona

Comparte estos detalles:

```bash
# 1. Estado de migraciones
docker compose exec backend python manage.py showmigrations content

# 2. Logs del backend
docker compose logs backend --tail=100 > backend-logs.txt

# 3. Logs del frontend
docker compose logs frontend --tail=100 > frontend-logs.txt

# 4. Estado de contenedores
docker compose ps

# 5. DevTools Console screenshot
# 6. DevTools Network tab (petición fallida)
```

---

## ✅ Próximos Pasos

1. **Ejecuta:** `FIX_PDF_READER_COMPLETO.bat`
2. **Espera** 30 segundos para que compile
3. **Hard refresh** en navegador (Ctrl+Shift+R)
4. **Prueba** con un libro que tenga PDF
5. **Disfruta** del lector de PDF funcionando

Si todo funciona correctamente, deberías ver:
- ✅ El PDF cargando correctamente
- ✅ Controles de zoom y navegación funcionando
- ✅ Progreso guardándose automáticamente
- ✅ Sin errores en la consola

---

**Documentos Relacionados:**
- [DIAGNOSTICO_ERROR_READING.md](d:\bvs_framework\DIAGNOSTICO_ERROR_READING.md) - Diagnóstico detallado del error de backend
- [FIX_READING_ERROR.bat](d:\bvs_framework\FIX_READING_ERROR.bat) - Script solo para fix del backend
- [FIX_PDF_READER_COMPLETO.bat](d:\bvs_framework\FIX_PDF_READER_COMPLETO.bat) - Script completo (RECOMENDADO)
