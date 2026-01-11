# 📋 Documentación: Sistema de Validación de Archivos PDF e Imágenes

## 🎯 Resumen

Se ha implementado un sistema completo de validación para archivos PDF y imágenes en el backend, garantizando seguridad, integridad y optimización del almacenamiento.

---

## ✅ Funcionalidades Implementadas

### 1. **Validación de Archivos PDF**

#### Características:
- ✅ **Validación de tipo MIME**: Verifica que el archivo sea realmente un PDF usando `python-magic`
- ✅ **Validación de tamaño**:
  - Mínimo: 1KB (previene archivos vacíos)
  - Máximo: 50MB
- ✅ **Validación de extensión**: Solo acepta `.pdf`
- ✅ **Validación de estructura**: Verifica el header `%PDF-` del archivo
- ✅ **Detección de encriptación**: Rechaza PDFs protegidos con contraseña
- ✅ **Sanitización de nombres**: Limpia nombres de archivo para prevenir ataques

#### Tipos MIME Aceptados:
- `application/pdf`
- `application/x-pdf`

---

### 2. **Validación de Imágenes (Portadas y Fotos)**

#### Características:
- ✅ **Validación de tipo MIME**: Verifica el tipo real de la imagen
- ✅ **Validación de tamaño**:
  - Mínimo: 1KB
  - Máximo: 5MB
- ✅ **Validación de extensión**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- ✅ **Sanitización de nombres**: Limpia nombres de archivo

#### Tipos MIME Aceptados:
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`

---

### 3. **Sanitización de Nombres de Archivo**

#### Funcionalidad:
```python
sanitize_filename("../../../etc/passwd.pdf")
# Resultado: "etc_passwd.pdf"

sanitize_filename("Mi Libro (2024) - Copia [Final].pdf")
# Resultado: "Mi_Libro_2024_Copia_Final.pdf"
```

#### Protecciones:
- Elimina path separators (`/`, `\`)
- Remueve caracteres especiales peligrosos
- Convierte espacios y caracteres especiales a `_`
- Limita longitud del nombre a 100 caracteres
- Preserva la extensión del archivo
- Genera nombre aleatorio si el nombre queda vacío

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:

1. **`backend/apps/content/validators.py`**
   - Clases de validación: `FileValidator`, `PDFValidator`, `ImageValidator`
   - Funciones utilitarias: `validate_pdf_file()`, `validate_image_file()`, `sanitize_filename()`

### Archivos Modificados:

2. **`backend/apps/content/models.py`**
   - Agregados validadores a campos `file`, `cover_image`, `photo`
   - Funciones de upload path con sanitización automática
   - Help text informativos para cada campo

3. **`backend/apps/content/serializers.py`**
   - Métodos `validate_file()` y `validate_cover_image()` en `BookDetailSerializer`
   - Manejo de errores de validación para la API REST

4. **`backend/config/settings.py`**
   - Configuraciones de límites de carga
   - Constantes de tamaños máximos por tipo

5. **`backend/requirements.txt`**
   - Agregadas dependencias: `python-magic`, `python-magic-bin`

---

## 🔧 Instalación

### Windows:
```bash
INSTALL_VALIDATORS.bat
```

### Linux/Mac:
```bash
chmod +x install-validators.sh
./install-validators.sh
```

### Manual:
```bash
# 1. Instalar dependencias
docker compose exec backend pip install python-magic python-magic-bin

# 2. Crear migraciones
docker compose exec backend python manage.py makemigrations content

# 3. Aplicar migraciones
docker compose exec backend python manage.py migrate
```

---

## 🧪 Ejemplos de Validación

### ✅ Casos Válidos:

```python
# PDF válido de 10MB
file = open('libro.pdf', 'rb')
# ✅ PASS: Tamaño OK, tipo MIME correcto, estructura válida

# Imagen JPG de 2MB
cover = open('portada.jpg', 'rb')
# ✅ PASS: Tamaño OK, tipo MIME correcto
```

### ❌ Casos Inválidos:

```python
# PDF de 60MB
file = open('libro_grande.pdf', 'rb')
# ❌ ERROR: "El archivo es demasiado grande. Tamaño máximo: 50MB"

# Archivo .exe renombrado como .pdf
fake_pdf = open('virus.exe.pdf', 'rb')
# ❌ ERROR: "Tipo de archivo no permitido"

# PDF encriptado
encrypted = open('protegido.pdf', 'rb')
# ❌ ERROR: "El PDF está encriptado. Por favor, sube una versión sin protección"

# Imagen de 8MB
large_image = open('foto_alta_resolucion.jpg', 'rb')
# ❌ ERROR: "El archivo es demasiado grande. Tamaño máximo: 5MB"

# Archivo de texto renombrado
fake_image = open('texto.txt.jpg', 'rb')
# ❌ ERROR: "Tipo de archivo no permitido"
```

---

## 📊 Configuración de Límites

En `backend/config/settings.py`:

```python
# Límites globales de Django
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB

# Límites por tipo de archivo
MAX_UPLOAD_SIZE = {
    'pdf': 52428800,   # 50MB
    'image': 5242880,  # 5MB
}

# Extensiones permitidas
ALLOWED_UPLOAD_EXTENSIONS = {
    'pdf': ['.pdf'],
    'image': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
}
```

### Para modificar límites:

```python
# En validators.py

# Aumentar límite de PDFs a 100MB
class PDFValidator(FileValidator):
    MAX_PDF_SIZE = 100 * 1024 * 1024  # 100MB

# Reducir límite de imágenes a 2MB
class ImageValidator(FileValidator):
    MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2MB
```

---

## 🔒 Seguridad

### Protecciones Implementadas:

1. **Directory Traversal Prevention**
   - Sanitización elimina `../` y paths absolutos
   - Previene escritura fuera del directorio media

2. **MIME Type Spoofing Prevention**
   - Validación de tipo MIME real usando `python-magic`
   - No confía solo en la extensión del archivo

3. **DoS Prevention**
   - Límites estrictos de tamaño de archivo
   - Previene ataques de llenado de disco

4. **Malware Upload Prevention**
   - Validación de estructura de archivo
   - Rechazo de archivos corruptos o malformados

5. **Encrypted PDF Detection**
   - Detecta y rechaza PDFs protegidos
   - Previene problemas en el visor PDF

---

## 🧩 Uso en la API

### Endpoint: `POST /api/content/books/`

**Request con validación exitosa:**
```json
Content-Type: multipart/form-data

{
  "title": "Mi Libro",
  "author": 1,
  "category": 2,
  "description": "Descripción del libro",
  "file": <archivo_valido.pdf>,
  "cover_image": <portada_valida.jpg>
}
```

**Response exitosa:**
```json
{
  "id": 123,
  "title": "Mi Libro",
  "file": "http://localhost:8000/media/books/files/archivo_valido.pdf",
  "cover_image": "http://localhost:8000/media/books/covers/portada_valida.jpg"
}
```

**Response con error de validación:**
```json
{
  "file": [
    "El archivo es demasiado grande. Tamaño máximo: 50.0 MB. Tamaño actual: 75.5 MB."
  ]
}
```

---

## 🐛 Troubleshooting

### Error: "python-magic not installed"
```bash
# Reinstalar dependencia
docker compose exec backend pip install python-magic python-magic-bin
```

### Error: "libmagic not found"
```bash
# En sistemas Linux/Mac, instalar libmagic
sudo apt-get install libmagic1  # Ubuntu/Debian
brew install libmagic            # macOS
```

### Error: Validación no funciona
```bash
# Verificar que las migraciones están aplicadas
docker compose exec backend python manage.py showmigrations content

# Si no están aplicadas, ejecutar:
docker compose exec backend python manage.py migrate
```

---

## 📈 Próximas Mejoras

Planificadas para Fase 2:

- [ ] Escaneo de virus con ClamAV
- [ ] Optimización automática de imágenes (compresión)
- [ ] Conversión automática de formatos de imagen
- [ ] Validación de contenido de PDF (páginas, OCR)
- [ ] Limpieza automática de archivos huérfanos
- [ ] Almacenamiento en la nube (S3, Google Cloud Storage)

---

## 📞 Soporte

Si encuentras algún problema con las validaciones:

1. Verifica que las dependencias estén instaladas
2. Revisa los logs del backend: `docker compose logs backend`
3. Confirma que las migraciones están aplicadas
4. Verifica los límites de tamaño en settings.py

---

**Última actualización:** 2026-01-02
**Versión:** 1.0.0
**Estado:** ✅ Implementado y funcional
