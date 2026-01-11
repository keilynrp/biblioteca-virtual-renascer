# 🔧 Solución: Persistencia de PDFs en Upload/Update

## 📋 Resumen del Problema

Similar al problema de las fotos de autores, los archivos PDF no se guardaban cuando se subían o actualizaban desde el frontend porque el serializer `BookDetailSerializer` usaba `SerializerMethodField` (solo lectura) para los campos de archivos.

## ✅ Cambios Realizados

### 1. Backend - Serializer Actualizado
**Archivo**: `backend/apps/content/serializers.py`

Se separaron los campos de lectura y escritura:

```python
# Campos de escritura (reciben archivos del frontend)
cover_image_upload = serializers.ImageField(write_only=True, required=False, allow_null=True, validators=[validate_image_file])
file_upload = serializers.FileField(write_only=True, required=False, allow_null=True, validators=[validate_pdf_file])

# Campos de lectura (devuelven URLs completas)
cover_image = serializers.SerializerMethodField(read_only=True)
file = serializers.SerializerMethodField(read_only=True)
```

Se agregaron métodos `create()` y `update()` para manejar archivos:

```python
def create(self, validated_data):
    """Handle file uploads during creation"""
    cover_image_upload = validated_data.pop('cover_image_upload', None)
    file_upload = validated_data.pop('file_upload', None)

    book = Book.objects.create(**validated_data)

    if cover_image_upload:
        book.cover_image = cover_image_upload
    if file_upload:
        book.file = file_upload

    if cover_image_upload or file_upload:
        book.save()

    return book

def update(self, instance, validated_data):
    """Handle file uploads during update"""
    cover_image_upload = validated_data.pop('cover_image_upload', None)
    file_upload = validated_data.pop('file_upload', None)

    for attr, value in validated_data.items():
        setattr(instance, attr, value)

    if cover_image_upload:
        instance.cover_image = cover_image_upload
    if file_upload:
        instance.file = file_upload

    instance.save()
    return instance
```

### 2. Frontend - Nombres de Campos Actualizados
**Archivo**: `frontend/src/app/(dashboard)/admin/books/page.tsx`

Actualizado para usar los nombres correctos del serializer:

```typescript
// Líneas 259-269
if (formData.cover_image) {
    formDataToSend.append('cover_image_upload', formData.cover_image)
}
if (formData.file) {
    formDataToSend.append('file_upload', formData.file)
}
```

## 🚀 Pasos para Aplicar el Fix

### Paso 1: Reiniciar el Backend

Ejecuta el script de reinicio:

```bash
# En Windows
restart-backend.bat

# O manualmente con Docker
docker compose restart backend
```

Espera 10-15 segundos para que el backend se reinicie completamente.

### Paso 2: Refrescar el Frontend

En el navegador, presiona:
- **Ctrl + Shift + R** (Windows/Linux)
- **Cmd + Shift + R** (Mac)

Esto hace un hard refresh para cargar el código actualizado.

### Paso 3: Probar la Funcionalidad

#### A. Crear un Libro Nuevo con PDF

1. Ve a **Admin → Administrar Libros**
2. Click en **"Nuevo Libro"**
3. Completa el formulario:
   - Título: "Libro de Prueba PDF"
   - Autor: Selecciona uno
   - Categoría: Selecciona una
   - Descripción: Cualquier texto
   - **Archivo PDF**: Sube un PDF de prueba
4. Click en **"Crear"**
5. **Verifica**:
   - El libro se creó exitosamente
   - El archivo PDF se guardó en `backend/media/books/files/`

#### B. Actualizar un Libro Existente

1. En la lista de libros, selecciona uno que ya exista
2. Click en **"Editar"**
3. Cambia el archivo PDF por uno nuevo
4. Click en **"Actualizar"**
5. **Verifica**:
   - El libro se actualizó
   - El nuevo PDF reemplazó al anterior en `backend/media/books/files/`

### Paso 4: Verificar en el Sistema de Archivos

```bash
# Ver archivos PDF guardados
ls -la backend/media/books/files/

# Ver portadas guardadas
ls -la backend/media/books/covers/
```

## 🔍 Verificación de la Persistencia

### Método 1: Inspeccionar en la Base de Datos

```bash
docker compose exec backend python manage.py shell
```

```python
from apps.content.models import Book

# Ver todos los libros con archivos
books_with_files = Book.objects.exclude(file='')
for book in books_with_files:
    print(f"📖 {book.title}")
    print(f"   PDF: {book.file.name if book.file else 'Sin archivo'}")
    print(f"   Portada: {book.cover_image.name if book.cover_image else 'Sin portada'}")
    print()
```

### Método 2: Verificar mediante API

```bash
# Obtener un libro específico
curl http://localhost:8000/api/content/books/<slug>/ | jq
```

Busca en la respuesta:
```json
{
  "file": "http://localhost:8000/media/books/files/nombre-archivo.pdf",
  "cover_image": "http://localhost:8000/media/books/covers/portada.jpg"
}
```

## 📊 Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (FormData)                                         │
│  • cover_image_upload → Archivo de imagen                  │
│  • file_upload → Archivo PDF                               │
└───────────────────────┬─────────────────────────────────────┘
                        │ POST/PATCH multipart/form-data
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend Serializer (BookDetailSerializer)                   │
│  [Escritura]                                                │
│  • cover_image_upload (ImageField, write_only)             │
│  • file_upload (FileField, write_only)                     │
│                                                             │
│  [Lectura]                                                 │
│  • cover_image (SerializerMethodField, read_only)          │
│  • file (SerializerMethodField, read_only)                 │
└───────────────────────┬─────────────────────────────────────┘
                        │ create() / update()
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Modelo Book                                                 │
│  • cover_image → ImageField → media/books/covers/          │
│  • file → FileField → media/books/files/                   │
└───────────────────────┬─────────────────────────────────────┘
                        │ Django Storage
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Sistema de Archivos (Persistido en Docker Volume)          │
│  ./backend/media/books/covers/  (Portadas)                 │
│  ./backend/media/books/files/   (PDFs)                     │
└─────────────────────────────────────────────────────────────┘
```

## ❓ Troubleshooting

### Problema 1: "Los PDFs aún no se guardan"

**Solución**:
1. Verifica que el backend se reinició correctamente:
   ```bash
   docker compose logs backend --tail=50
   ```

2. Busca errores en los logs relacionados con el serializer

3. Verifica que el volumen de Docker está correctamente montado:
   ```bash
   docker compose config | grep -A5 "backend:"
   ```

### Problema 2: "Error 400 al subir archivos"

**Posibles causas**:
- Archivo PDF muy grande (límite: 50MB)
- Formato de imagen incorrecto (solo JPG, PNG, WebP, GIF)
- Validadores bloqueando el archivo

**Solución**:
- Verifica el tamaño del archivo
- Asegúrate de usar formatos permitidos
- Revisa los logs del backend para más detalles

### Problema 3: "Los archivos desaparecen después de reiniciar"

**Causa**: El volumen de Docker no está persistiendo los datos.

**Solución**:
1. Verifica el `docker-compose.yml`:
   ```yaml
   services:
     backend:
       volumes:
         - ./backend:/app  # ✅ Esto debe existir
   ```

2. Reinicia los contenedores sin eliminar volúmenes:
   ```bash
   docker compose restart
   # NO uses: docker compose down -v (esto borra volúmenes)
   ```

## ✨ Ventajas de Esta Solución

✅ **Separación clara**: Campos diferentes para lectura/escritura
✅ **Validación automática**: Los validadores se aplican en el campo
✅ **URLs completas**: El frontend recibe URLs absolutas en respuestas
✅ **Compatibilidad**: Funciona con POST (crear) y PATCH (actualizar)
✅ **Persistencia**: Los archivos se guardan físicamente en el volumen Docker
✅ **Consistencia**: Mismo patrón usado para fotos de autores

## 📝 Archivos Modificados

- ✏️ `backend/apps/content/serializers.py` (líneas 34-166)
- ✏️ `frontend/src/app/(dashboard)/admin/books/page.tsx` (líneas 259-269)

## 🔄 Patrón Reutilizable

Este mismo patrón se puede aplicar a cualquier modelo con archivos:

```python
class MiSerializer(serializers.ModelSerializer):
    # Campo de escritura
    archivo_upload = serializers.FileField(
        write_only=True,
        required=False,
        allow_null=True
    )

    # Campo de lectura
    archivo = serializers.SerializerMethodField(read_only=True)

    def get_archivo(self, obj):
        if obj.archivo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.archivo.url)
            return obj.archivo.url
        return None

    def create(self, validated_data):
        archivo_upload = validated_data.pop('archivo_upload', None)
        instance = MiModelo.objects.create(**validated_data)
        if archivo_upload:
            instance.archivo = archivo_upload
            instance.save()
        return instance

    def update(self, instance, validated_data):
        archivo_upload = validated_data.pop('archivo_upload', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if archivo_upload:
            instance.archivo = archivo_upload
        instance.save()
        return instance
```

---

**Fecha**: 2026-01-08
**Autor**: Claude Code
**Sprint**: Sprint 8 - Phase 1 (Backend Improvements)
