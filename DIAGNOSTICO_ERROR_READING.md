# 🔍 Diagnóstico: Error al iniciar la sesión de lectura

## 📋 Descripción del Error

**Mensaje:** `Error al iniciar la sesión de lectura`
**Ubicación:** [src/app/(dashboard)/reader/[bookId]/page.tsx:74](../frontend/src/app/(dashboard)/reader/[bookId]/page.tsx#L74)
**Tipo:** Error de API (HTTP response no OK)

---

## 🎯 Causas Probables

### 1. **Migraciones no aplicadas** (MÁS PROBABLE)
La tabla `readings` podría no existir en la base de datos porque las migraciones no se han aplicado.

**Verificación:**
```bash
docker compose exec backend python manage.py showmigrations content
```

Busca:
- ✅ `[X] 0004_review_reviewhelpful_favorite_readinghistory_and_more`
- ✅ `[X] 0005_add_reading_model`
- ✅ `[X] 0006_alter_author_photo_alter_book_cover_image_and_more`

Si ves `[ ]` (sin X), las migraciones NO están aplicadas.

---

### 2. **Token de autenticación inválido o expirado**
El token JWT podría haber expirado o ser inválido.

**Verificación en DevTools (F12 → Network):**
- Busca la petición a `/api/user/readings/start/[ID]/`
- Revisa el status code:
  - `401 Unauthorized` → Token inválido/expirado
  - `403 Forbidden` → Permisos insuficientes
  - `404 Not Found` → Endpoint no existe
  - `500 Internal Server Error` → Error en el servidor

---

### 3. **Backend no está corriendo o tiene errores**
El contenedor de backend podría estar caído o tener errores.

**Verificación:**
```bash
docker compose ps
```

Busca `backend` con estado `Up (healthy)`.

Si está `unhealthy` o `exited`, revisa logs:
```bash
docker compose logs backend --tail=50
```

---

### 4. **Libro no existe o no tiene archivo PDF**
El endpoint podría fallar si el libro no existe o no tiene un archivo PDF asociado.

**Verificación:**
```bash
docker compose exec backend python manage.py shell -c "
from apps.content.models import Book
book = Book.objects.filter(id=1).first()
if book:
    print(f'Libro existe: {book.title}')
    print(f'Tiene archivo PDF: {bool(book.file)}')
else:
    print('Libro NO existe')
"
```

Reemplaza `id=1` con el ID del libro que intentas leer.

---

## 🔧 Soluciones

### Solución 1: Aplicar Migraciones (RECOMENDADA)

**Ejecutar script automatizado:**
```bash
FIX_READING_ERROR.bat
```

**O hacer manualmente:**

```bash
# 1. Aplicar migraciones
docker compose exec backend python manage.py migrate

# 2. Verificar que la tabla existe
docker compose exec backend python manage.py shell -c "
from apps.content.models import Reading
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT COUNT(*) FROM readings')
print(f'Tabla readings existe. Registros: {cursor.fetchone()[0]}')
"

# 3. Reiniciar backend
docker compose restart backend

# 4. Esperar 10 segundos
# En Windows: timeout /t 10
# En Linux: sleep 10

# 5. Reiniciar frontend
docker compose restart frontend
```

---

### Solución 2: Renovar Token de Autenticación

Si el problema es el token expirado:

```bash
# 1. Cerrar sesión en el navegador
# 2. Volver a hacer login en http://localhost:3000/login

# O renovar token manualmente:
RENOVAR_TOKEN_ADMIN.bat
```

---

### Solución 3: Verificar que el Libro tiene PDF

```bash
# Listar libros con archivos PDF
docker compose exec backend python manage.py shell -c "
from apps.content.models import Book
books = Book.objects.exclude(file='')
print(f'Libros con PDF: {books.count()}')
for book in books[:5]:
    print(f'ID: {book.id}, Título: {book.title}')
    print(f'  URL: http://localhost:3000/reader/{book.id}')
"
```

Si no hay libros con PDF, importa algunos:
```bash
IMPORTAR_100_LIBROS.bat
```

---

### Solución 4: Ver Logs Detallados del Error

Abre DevTools (F12) en el navegador y:

1. **Console Tab:**
   - Mira el error completo (puede tener más detalles)

2. **Network Tab:**
   - Busca la petición a `/api/user/readings/start/[ID]/`
   - Click derecho → Copy → Copy as cURL
   - Pega el comando en la terminal para ver la respuesta exacta

3. **Backend Logs:**
```bash
docker compose logs backend -f
```
Luego intenta acceder al reader de nuevo y mira qué error aparece.

---

## 🧪 Prueba Manual del Endpoint

Prueba el endpoint directamente con curl:

```bash
# 1. Obtener token de administrador
docker compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
token, _ = Token.objects.get_or_create(user=user)
print(f'Token: {token.key}')
"

# 2. Copiar el token y probar endpoint
# Reemplaza YOUR_TOKEN_HERE y BOOK_ID
curl -X POST http://localhost:8000/api/user/readings/start/BOOK_ID/ \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json"
```

**Respuestas esperadas:**

✅ **Éxito (201 Created):**
```json
{
  "status": "started",
  "reading": {
    "id": 1,
    "book": { ... },
    "current_page": 1,
    "total_pages": null,
    "progress_percentage": "0.00",
    "zoom_level": "1.00",
    ...
  }
}
```

❌ **Error (500):**
```json
{
  "detail": "..."
}
```
Esto indica error en el backend (posiblemente tabla no existe).

❌ **Error (401):**
```json
{
  "detail": "Invalid token."
}
```
Token inválido o expirado.

---

## 📊 Checklist de Diagnóstico

- [ ] Ejecutar `FIX_READING_ERROR.bat`
- [ ] Verificar que migraciones están aplicadas
- [ ] Verificar que backend está `Up (healthy)`
- [ ] Verificar que existe al menos un libro con archivo PDF
- [ ] Renovar token si es necesario (cerrar sesión y volver a login)
- [ ] Reiniciar backend y frontend
- [ ] Hard refresh en navegador (Ctrl+Shift+R)
- [ ] Revisar logs de backend durante el intento
- [ ] Probar endpoint con curl manualmente

---

## 🆘 Si Nada Funciona

Comparte estos detalles:

1. **Salida de:**
   ```bash
   docker compose exec backend python manage.py showmigrations content
   ```

2. **Logs del backend:**
   ```bash
   docker compose logs backend --tail=100 > backend-error-logs.txt
   ```

3. **Respuesta del Network tab en DevTools:**
   - URL completa de la petición
   - Headers (especialmente Authorization)
   - Response body
   - Status code

4. **Versión de Next.js y dependencias:**
   ```bash
   cat frontend/package.json | grep "next\|react"
   ```

---

## ✅ Próximos Pasos

1. **Ejecuta:** `FIX_READING_ERROR.bat`
2. **Espera** a que termine (puede tomar 30 segundos)
3. **Reinicia frontend:** `docker compose restart frontend`
4. **Hard refresh** en navegador (Ctrl+Shift+R)
5. **Intenta** acceder al reader de nuevo

Si el error persiste, revisa los logs y comparte los detalles arriba.
