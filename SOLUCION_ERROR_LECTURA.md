# Solución: Error al Iniciar Sesión de Lectura

## Descripción del Error

**Error:** `Error al iniciar la sesión de lectura`
**Ubicación:** `src/app/(dashboard)/reader/[bookId]/page.tsx:74`
**Endpoint Afectado:** `POST /api/user/readings/start/{bookId}/`

## Causas Posibles

1. **Migraciones no aplicadas**: La tabla `readings` no existe en la base de datos
2. **Backend no ejecutándose**: El servicio backend está caído
3. **Token expirado**: El token de autenticación ha expirado
4. **Libro no encontrado**: El ID del libro no existe en la base de datos
5. **Error en la base de datos**: Problemas de conexión o permisos

## Soluciones

### ⚡ Solución Automática (RECOMENDADO)

#### Para Linux / Mac / WSL / Git Bash:
```bash
bash EJECUTAR_FIX.sh
```

#### Para Windows (PowerShell / CMD):
```batch
FIX_READING_SESSION_ERROR.bat
```

**Ver guía rápida:** [GUIA_RAPIDA_FIX_LECTURA.md](GUIA_RAPIDA_FIX_LECTURA.md)

Estos scripts:
- ✅ Verifican que Docker está corriendo
- ✅ Aplican todas las migraciones
- ✅ Verifican la tabla `readings`
- ✅ Comprueban el modelo Reading
- ✅ Reinician los servicios
- ✅ Muestran diagnóstico completo

### 🔧 Otros Scripts Disponibles

**Fix completo con pruebas:**
```bash
bash fix-reading-session-error.sh
```

**Fix rápido (sin verificaciones):**
```bash
bash quick-fix-reading.sh
```

**Solo diagnóstico (sin cambios):**
```bash
bash debug-reading-error.sh
```

### Solución Manual (Paso a Paso)

#### 1. Verificar Migraciones

```batch
docker compose exec backend python manage.py showmigrations content
```

Busca la migración `0005_add_reading_model`. Si tiene `[ ]` (sin X), no está aplicada.

#### 2. Aplicar Migraciones

```batch
docker compose exec backend python manage.py migrate
```

#### 3. Verificar Tabla en Base de Datos

```batch
docker compose exec db psql -U postgres -d bvs_db -c "\d readings"
```

Deberías ver la estructura de la tabla con estos campos:
- `id`
- `user_id`
- `book_id`
- `current_page`
- `total_pages`
- `progress_percentage`
- `zoom_level`
- `started_at`
- `last_read_at`
- `total_reading_time`

#### 4. Verificar Servicios

```batch
docker compose ps
```

Asegúrate de que `backend` y `db` estén en estado `healthy` o `running`.

#### 5. Reiniciar Servicios

```batch
docker compose restart backend frontend
```

## Diagnóstico Avanzado

### Ver Logs del Backend

```batch
docker compose logs backend --tail=50
```

### Probar Endpoint Directamente

Ejecuta el script de prueba:

```batch
TEST_READING_ENDPOINT.bat
```

Este script:
1. Verifica que la tabla existe
2. Verifica el estado de las migraciones
3. Genera un token de prueba
4. Te muestra cómo hacer una petición curl

### Comando curl Manual

```batch
curl -X POST http://localhost:8000/api/user/readings/start/1/ ^
  -H "Authorization: Bearer TU_TOKEN_AQUI" ^
  -H "Content-Type: application/json"
```

## Mejoras Implementadas

### 1. Mejor Manejo de Errores (Frontend)

Se mejoró el código en [page.tsx:73-77](frontend/src/app/(dashboard)/reader/[bookId]/page.tsx#L73-L77) para mostrar errores detallados del backend:

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => null);
  const errorMessage = errorData?.detail || errorData?.error || `Error ${response.status}: ${response.statusText}`;
  console.error('Backend error:', errorData);
  throw new Error(`Error al iniciar la sesión de lectura: ${errorMessage}`);
}
```

Ahora verás el mensaje de error real del backend en lugar de un mensaje genérico.

### 2. Scripts de Verificación y Corrección

Se crearon los siguientes scripts de utilidad:

- **[FIX_READING_SESSION_ERROR.bat](FIX_READING_SESSION_ERROR.bat)**: Solución automática completa
- **[VERIFICAR_READING_TABLE.bat](VERIFICAR_READING_TABLE.bat)**: Verifica el estado de la tabla
- **[APLICAR_MIGRACIONES_READING.bat](APLICAR_MIGRACIONES_READING.bat)**: Aplica migraciones específicas
- **[TEST_READING_ENDPOINT.bat](TEST_READING_ENDPOINT.bat)**: Prueba el endpoint directamente

## Estructura del Endpoint

### Backend: StartReadingView

**Archivo:** [backend/apps/content/views.py:759-787](backend/apps/content/views.py#L759-L787)

```python
class StartReadingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)

        reading, created = Reading.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={
                'current_page': 1,
                'zoom_level': 1.0,
            }
        )

        serializer = ReadingSerializer(reading, context={'request': request})

        return Response({
            'status': 'started' if created else 'resumed',
            'reading': serializer.data
        })
```

### Modelo: Reading

**Archivo:** [backend/apps/content/models.py:200-260](backend/apps/content/models.py#L200-L260)

Campos principales:
- `user`: Usuario que está leyendo
- `book`: Libro que se está leyendo
- `current_page`: Página actual (default: 1)
- `total_pages`: Total de páginas del PDF
- `progress_percentage`: Porcentaje de progreso
- `zoom_level`: Nivel de zoom preferido
- `started_at`: Fecha de inicio
- `last_read_at`: Última vez que se leyó
- `total_reading_time`: Tiempo total de lectura en segundos

Propiedades calculadas:
- `is_finished`: Booleano que indica si terminó el libro
- `pages_remaining`: Páginas restantes

### Migración

**Archivo:** [backend/apps/content/migrations/0005_add_reading_model.py](backend/apps/content/migrations/0005_add_reading_model.py)

## Próximos Pasos

1. **Ejecuta el script de corrección:**
   ```batch
   FIX_READING_SESSION_ERROR.bat
   ```

2. **Verifica que todo funciona:**
   - Abre el navegador
   - Inicia sesión
   - Ve a la biblioteca
   - Haz clic en "Leer" en cualquier libro
   - Deberías ver el visor de PDF sin errores

3. **Si el error persiste:**
   - Revisa los logs del backend
   - Ejecuta el script de prueba del endpoint
   - Verifica que el libro tenga un archivo PDF asociado

## Información Adicional

### Respuesta Esperada del Endpoint

```json
{
  "status": "started",  // o "resumed"
  "reading": {
    "id": 1,
    "book": {
      "id": 1,
      "title": "Ejemplo de Libro",
      "slug": "ejemplo-de-libro",
      "author": {
        "id": 1,
        "name": "Autor Ejemplo"
      },
      "cover_image": "/media/covers/ejemplo.jpg"
    },
    "current_page": 1,
    "total_pages": null,
    "progress_percentage": "0.00",
    "zoom_level": "1.00",
    "started_at": "2025-01-02T12:00:00Z",
    "last_read_at": "2025-01-02T12:00:00Z",
    "total_reading_time": 0,
    "is_finished": false,
    "pages_remaining": null
  }
}
```

### Códigos de Error Comunes

- **400 Bad Request**: Datos inválidos en la petición
- **401 Unauthorized**: Token inválido o expirado
- **404 Not Found**: Libro no encontrado
- **500 Internal Server Error**: Error en el servidor (revisar logs)

---

**Última actualización:** 2025-01-02
**Versión de Next.js:** 16.1.0 (Turbopack)
**Versión de Django:** 6.0
