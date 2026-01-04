# Testing del Sprint 6 - Lector de Documentos PDF

**Fecha**: 30 de Diciembre de 2024
**Sprint**: Sprint 6 - Lector de Documentos PDF
**Status**: Listo para probar

---

## 🎯 OBJETIVO

Probar la implementación completa del lector de documentos PDF con datos reales.

---

## 📋 PRE-REQUISITOS

Antes de comenzar el testing, asegúrate de:

1. ✅ Tener Docker Desktop instalado y en ejecución
2. ✅ Tener al menos un libro PDF en la base de datos
3. ✅ Tener un usuario creado para testing
4. ✅ Puerto 3000 (frontend) y 8000 (backend) disponibles

---

## 🚀 PASO 1: INICIAR SERVICIOS

### 1.1 Reiniciar todos los servicios de Docker

```batch
# Ejecutar en la raíz del proyecto
.\REINICIAR_SERVICIOS.bat
```

**Resultado esperado**:
```
✅ PostgreSQL corriendo en puerto 5432
✅ Elasticsearch corriendo en puerto 9200
✅ Backend corriendo en puerto 8000
✅ Frontend corriendo en puerto 3000
```

### 1.2 Verificar que los servicios estén corriendo

```batch
docker compose ps
```

Todos los servicios deben estar en estado "Up" (running).

---

## 🗄️ PASO 2: EJECUTAR MIGRACIÓN

### 2.1 Ejecutar la migración del modelo Reading

```batch
# Opción 1: Desde el contenedor de Docker
docker compose exec backend python manage.py migrate

# Opción 2: Si estás en el backend localmente
cd backend
python manage.py migrate
```

**Resultado esperado**:
```
Running migrations:
  Applying content.0005_add_reading_model... OK
```

### 2.2 Verificar que la tabla se creó correctamente

```batch
docker compose exec db psql -U postgres -d biblioteca_virtual -c "\dt content_reading"
```

**Resultado esperado**:
```
             List of relations
 Schema |      Name        | Type  |  Owner
--------+------------------+-------+----------
 public | content_reading  | table | postgres
```

---

## 📚 PASO 3: VERIFICAR LIBROS PDF

### 3.1 Verificar que hay libros con archivos PDF

```batch
docker compose exec backend python manage.py shell
```

Dentro del shell de Django:
```python
from apps.content.models import Book

# Ver todos los libros
books = Book.objects.all()
print(f"Total de libros: {books.count()}")

# Ver libros con archivo PDF
books_with_pdf = Book.objects.exclude(file='')
print(f"Libros con PDF: {books_with_pdf.count()}")

# Ver detalles del primer libro con PDF
if books_with_pdf.exists():
    book = books_with_pdf.first()
    print(f"\nLibro de prueba:")
    print(f"ID: {book.id}")
    print(f"Título: {book.title}")
    print(f"Archivo: {book.file.path if book.file else 'No file'}")
    print(f"Premium: {book.is_premium}")
```

**Si NO hay libros con PDF**, necesitas subir uno primero:
1. Ir al admin de Django: http://localhost:8000/admin
2. Login con tu superusuario
3. Ir a "Books" → "Add Book"
4. Llenar los campos y subir un PDF en el campo "File"
5. Guardar

---

## 🧪 PASO 4: TESTING DE API (Backend)

### 4.1 Obtener token de autenticación

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"tu_email@example.com","password":"tu_password"}'
```

**Guardar el token** que recibes en la respuesta.

### 4.2 Iniciar sesión de lectura

```bash
# Reemplaza {BOOK_ID} con el ID de un libro con PDF
# Reemplaza {TOKEN} con tu token de autenticación

curl -X POST http://localhost:8000/api/user/readings/start/{BOOK_ID}/ \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Resultado esperado**:
```json
{
  "status": "started",
  "reading": {
    "id": 1,
    "book": {
      "id": 5,
      "title": "Nombre del libro",
      ...
    },
    "current_page": 1,
    "total_pages": null,
    "progress_percentage": "0.00",
    "zoom_level": "1.00",
    "is_finished": false,
    "pages_remaining": 0,
    ...
  }
}
```

### 4.3 Actualizar progreso de lectura

```bash
curl -X PATCH http://localhost:8000/api/user/readings/{BOOK_ID}/progress/ \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "current_page": 5,
    "zoom_level": 1.25,
    "total_reading_time": 120
  }'
```

**Resultado esperado**:
```json
{
  "current_page": 5,
  "zoom_level": "1.25",
  "total_reading_time": 120,
  "progress_percentage": "..."
}
```

### 4.4 Obtener lista de lecturas (Continue Reading)

```bash
curl -X GET http://localhost:8000/api/user/readings/ \
  -H "Authorization: Bearer {TOKEN}"
```

**Resultado esperado**:
```json
[
  {
    "id": 1,
    "book": {...},
    "current_page": 5,
    "total_pages": 100,
    "progress_percentage": "5.00",
    ...
  }
]
```

### 4.5 Verificar acceso al archivo PDF

```bash
curl -I http://localhost:8000/api/books/{BOOK_ID}/file/ \
  -H "Authorization: Bearer {TOKEN}"
```

**Resultado esperado**:
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="nombre_libro.pdf"
X-Content-Type-Options: nosniff
```

---

## 🖥️ PASO 5: TESTING DE FRONTEND

### 5.1 Acceder al Dashboard

1. Abrir navegador en: http://localhost:3000
2. Login con tus credenciales
3. Ir al Dashboard

**Verificar**:
- ✅ Sección "Continuar Leyendo" visible (si tienes lecturas activas)
- ✅ No errores en la consola del navegador

### 5.2 Abrir el Lector PDF

**Opción A**: Desde "Continuar Leyendo"
1. En el dashboard, click en un libro en "Continuar Leyendo"
2. Debe abrir el lector en: `/reader/{bookId}`

**Opción B**: Navegación directa
1. Ir a: http://localhost:3000/reader/{BOOK_ID}
   (Reemplaza {BOOK_ID} con el ID de un libro)

**Verificar en el lector**:
- ✅ PDF se carga correctamente
- ✅ Se muestra el título del libro en el header
- ✅ Se muestra "Página X de Y" correctamente
- ✅ Botones de navegación funcionan (◀️ ▶️)
- ✅ Input de número de página funcional
- ✅ Botones de zoom funcionan (+ -)
- ✅ Barra de progreso se actualiza
- ✅ Contador de tiempo de lectura funciona

### 5.3 Testing de Navegación

**Test 1: Navegación con botones**
- Click en el botón ▶️ (siguiente página)
- Verificar que la página cambia
- Click en el botón ◀️ (página anterior)
- Verificar que vuelve a la página anterior

**Test 2: Navegación con teclado**
- Presionar flecha derecha (→)
- Verificar que avanza una página
- Presionar flecha izquierda (←)
- Verificar que retrocede una página

**Test 3: Ir a página específica**
- Click en el input de número de página
- Escribir un número (ej: 10)
- Presionar Enter
- Verificar que salta a esa página

### 5.4 Testing de Zoom

**Test 1: Zoom con botones**
- Click en botón + (zoom in)
- Verificar que el PDF se agranda
- Verificar que el porcentaje de zoom aumenta
- Click en botón - (zoom out)
- Verificar que el PDF se reduce

**Test 2: Zoom con teclado**
- Presionar tecla + o =
- Verificar que hace zoom in
- Presionar tecla -
- Verificar que hace zoom out

**Test 3: Límites de zoom**
- Hacer zoom out hasta el mínimo (50%)
- Verificar que el botón - se deshabilita
- Hacer zoom in hasta el máximo (300%)
- Verificar que el botón + se deshabilita

### 5.5 Testing de Auto-guardado

**Test 1: Auto-guardado cada 30 segundos**
1. Abrir el lector PDF
2. Navegar a la página 3
3. Cambiar el zoom a 1.5x
4. Esperar 30 segundos
5. Abrir la consola del navegador
6. Verificar mensaje: "Progress saved successfully"

**Test 2: Guardado al salir**
1. Abrir el lector PDF
2. Navegar a la página 5
3. Cerrar la pestaña o navegar a otra página
4. Volver a abrir el mismo libro
5. Verificar que te lleva a la página 5

### 5.6 Testing de "Continuar Leyendo"

1. Abrir varios libros diferentes
2. Leer algunas páginas de cada uno
3. Volver al dashboard (http://localhost:3000/dashboard)
4. Verificar en la sección "Continuar Leyendo":
   - ✅ Se muestran los últimos 3 libros leídos
   - ✅ Barra de progreso correcta para cada libro
   - ✅ Tiempo de lectura mostrado
   - ✅ Click en "Continuar" abre el lector en la página correcta

---

## 🔍 PASO 6: TESTING DE EDGE CASES

### 6.1 Sin autenticación

1. Cerrar sesión (logout)
2. Intentar acceder a: http://localhost:3000/reader/1
3. **Resultado esperado**: Redirección a login

### 6.2 Libro sin archivo PDF

1. Intentar acceder al lector de un libro sin PDF
2. **Resultado esperado**: Error "Book file not found"

### 6.3 Libro que no existe

1. Intentar acceder a: http://localhost:3000/reader/99999
2. **Resultado esperado**: Error 404

### 6.4 Navegación fuera de rango

**Test 1: Página menor a 1**
1. Intentar ir a la página 0 o negativa en el input
2. **Resultado esperado**: No debe permitir

**Test 2: Página mayor al total**
1. Si el libro tiene 50 páginas, intentar ir a la página 100
2. **Resultado esperado**: No debe permitir

### 6.5 Progreso con datos inválidos

Intentar actualizar progreso con valores inválidos vía API:

```bash
# Zoom inválido (fuera de rango 0.5 - 3.0)
curl -X PATCH http://localhost:8000/api/user/readings/1/progress/ \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"zoom_level": 5.0}'

# Página inválida (menor a 1)
curl -X PATCH http://localhost:8000/api/user/readings/1/progress/ \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"current_page": 0}'
```

**Resultado esperado**: Error 400 con mensaje de validación

---

## 📊 PASO 7: VERIFICAR BASE DE DATOS

### 7.1 Verificar que los datos se guardan correctamente

```bash
docker compose exec backend python manage.py shell
```

```python
from apps.content.models import Reading

# Ver todas las lecturas
readings = Reading.objects.all()
print(f"Total lecturas: {readings.count()}")

# Ver detalles de una lectura
reading = readings.first()
if reading:
    print(f"\nDetalle de lectura:")
    print(f"Usuario: {reading.user.email}")
    print(f"Libro: {reading.book.title}")
    print(f"Página actual: {reading.current_page}")
    print(f"Total páginas: {reading.total_pages}")
    print(f"Progreso: {reading.progress_percentage}%")
    print(f"Zoom: {reading.zoom_level}")
    print(f"Tiempo lectura: {reading.total_reading_time}s")
    print(f"Iniciado: {reading.started_at}")
    print(f"Última lectura: {reading.last_read_at}")
    print(f"¿Finalizado?: {reading.is_finished}")
    print(f"Páginas restantes: {reading.pages_remaining}")
```

---

## ✅ CHECKLIST DE TESTING COMPLETO

### Backend API
- [ ] Migración ejecutada correctamente
- [ ] Modelo Reading creado en la base de datos
- [ ] Endpoint de iniciar lectura funciona (POST /api/user/readings/start/{id}/)
- [ ] Endpoint de obtener lecturas funciona (GET /api/user/readings/)
- [ ] Endpoint de actualizar progreso funciona (PATCH /api/user/readings/{id}/progress/)
- [ ] Endpoint de servir PDF funciona (GET /api/books/{id}/file/)
- [ ] Validaciones funcionando correctamente
- [ ] Autenticación requerida en todos los endpoints
- [ ] Ownership verificado (usuarios solo ven sus lecturas)

### Frontend
- [ ] Componente PDFViewer renderiza correctamente
- [ ] PDF se carga y muestra correctamente
- [ ] Navegación con botones funciona
- [ ] Navegación con teclado funciona
- [ ] Input de página funciona
- [ ] Controles de zoom funcionan
- [ ] Zoom con teclado funciona
- [ ] Barra de progreso se actualiza correctamente
- [ ] Contador de tiempo funciona
- [ ] Auto-guardado cada 30s funciona
- [ ] Guardado al salir funciona
- [ ] "Continuar Leyendo" en dashboard funciona
- [ ] Progreso se restaura al reabrir libro
- [ ] Redirección a login si no autenticado
- [ ] Manejo de errores funciona correctamente

### Integration
- [ ] Frontend se comunica correctamente con backend
- [ ] Datos se guardan en la base de datos
- [ ] Datos se recuperan correctamente
- [ ] Auto-save actualiza el backend
- [ ] No hay errores en la consola
- [ ] No hay errores en los logs del backend

### Performance
- [ ] PDF carga en menos de 3 segundos
- [ ] Navegación entre páginas es fluida
- [ ] Zoom es responsive
- [ ] Auto-save no causa lag
- [ ] Dashboard carga rápido

---

## 🐛 TROUBLESHOOTING

### Problema: PDF no se carga

**Posibles causas**:
1. Archivo PDF no existe en el servidor
2. Permisos incorrectos en el archivo
3. Worker de PDF.js no configurado

**Solución**:
```bash
# Verificar que el archivo existe
docker compose exec backend ls -la media/books/

# Verificar permisos
docker compose exec backend chmod 644 media/books/*.pdf

# Ver logs del frontend
docker compose logs -f frontend
```

### Problema: Auto-guardado no funciona

**Verificar**:
1. Abrir consola del navegador
2. Ver si hay errores en las llamadas a la API
3. Verificar que el token de autenticación es válido

**Solución**:
```javascript
// En la consola del navegador
localStorage.getItem('token') // Verificar que hay token
```

### Problema: "Continuar Leyendo" no aparece

**Posibles causas**:
1. No hay lecturas activas
2. Usuario no autenticado
3. Error en la API

**Solución**:
```bash
# Verificar que hay lecturas
curl http://localhost:8000/api/user/readings/ \
  -H "Authorization: Bearer {TOKEN}"
```

### Problema: Progreso no se guarda

**Verificar en la base de datos**:
```bash
docker compose exec backend python manage.py shell
```

```python
from apps.content.models import Reading
Reading.objects.all().values()
```

---

## 📈 MÉTRICAS DE ÉXITO

Un testing exitoso debe mostrar:

✅ **100% de endpoints funcionando** (5/5)
✅ **100% de componentes renderizando** (3/3)
✅ **Cero errores en consola** del navegador
✅ **Cero errores en logs** del backend
✅ **Auto-guardado funcionando** cada 30 segundos
✅ **Progreso persistente** al reabrir libro
✅ **Tiempo de carga < 3 segundos** para PDFs
✅ **Navegación fluida** sin lag

---

## 📝 REPORTE DE BUGS

Si encuentras algún bug durante el testing, documentarlo así:

```markdown
## Bug #{numero}

**Título**: Descripción breve del bug

**Severidad**: Alta / Media / Baja

**Pasos para reproducir**:
1. Paso 1
2. Paso 2
3. Paso 3

**Resultado esperado**:
Lo que debería pasar

**Resultado actual**:
Lo que realmente pasa

**Screenshots/Logs**:
[Adjuntar si es posible]

**Navegador/OS**:
Chrome 120 / Windows 11

**Fecha**: 30 Dic 2024
```

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DEL TESTING

Una vez completado el testing:

1. **Si todo funciona**:
   - ✅ Marcar Sprint 6 como 100% completo
   - ✅ Actualizar documentación con resultados
   - ✅ Planificar Sprint 7 (Sistema de Pagos)

2. **Si hay bugs**:
   - ⚠️ Documentar todos los bugs encontrados
   - ⚠️ Priorizar por severidad
   - ⚠️ Crear issues en GitHub
   - ⚠️ Asignar para corrección

3. **Optimizaciones opcionales**:
   - 💡 Implementar cache de progreso en Redis
   - 💡 Agregar tests automatizados
   - 💡 Optimizar streaming de PDFs grandes

---

**Preparado por**: Claude Sonnet 4.5
**Fecha**: 30 de Diciembre de 2024
**Sprint**: Sprint 6 - Lector de Documentos PDF
**Versión**: 1.0

---

¡Buena suerte con el testing! 🚀📚
