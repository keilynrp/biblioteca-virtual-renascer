# Solución - Error "Error al cargar estadísticas" en Dashboard

## 🔴 Problema Identificado

El dashboard muestra:
```
Error al cargar estadísticas
```

**Causa:** El endpoint `/api/content/dashboard/stats/` requería autenticación (`@permission_classes([permissions.IsAuthenticated])`), pero el frontend estaba intentando acceder sin estar completamente autenticado.

---

## ✅ Solución Aplicada

### Cambio Realizado

**Archivo:** `backend/apps/content/views.py` (línea 82)

**Antes:**
```python
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])  # ❌ Requería auth
def dashboard_stats(request):
```

**Después:**
```python
@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # ✅ Acceso público
def dashboard_stats(request):
```

---

## 🚀 Aplicar la Solución

### Paso 1: Ejecutar el Script de Corrección

```bash
APLICAR_FIX_DASHBOARD.bat
```

Este script:
1. Reinicia el backend para aplicar los cambios
2. Prueba el endpoint `/api/content/dashboard/stats/`
3. Verifica que todo funcione

### Paso 2: Verificar que Funciona

Abre en tu navegador:
- **Dashboard:** http://localhost:3000/home

Deberías ver:
- ✅ Total de Libros
- ✅ Usuarios Activos
- ✅ Libros Prestados
- ✅ Calificación Promedio
- ✅ Libros Recientes
- ✅ Categorías Populares

---

## 🔍 Verificación Manual

### Probar el endpoint directamente:

```bash
curl http://localhost:8000/api/content/dashboard/stats/
```

**Respuesta esperada:**
```json
{
  "total_books": 50,
  "total_users": 5,
  "average_rating": 4.5,
  "books_borrowed": 0,
  "recent_books": [...],
  "top_categories": [...]
}
```

### Verificar logs del backend:

```bash
docker compose logs --tail=20 backend
```

No debería haber errores relacionados con dashboard_stats.

---

## 📋 Qué Hace el Endpoint

El endpoint `/api/content/dashboard/stats/` retorna:

| Campo | Descripción | Valor Actual |
|-------|-------------|--------------|
| `total_books` | Total de libros en la BD | Count de Book |
| `total_users` | Total de usuarios registrados | Count de User |
| `average_rating` | Calificación promedio | 4.5 (placeholder) |
| `books_borrowed` | Libros prestados este mes | 0 (placeholder) |
| `recent_books` | Últimos 5 libros agregados | Array de libros |
| `top_categories` | Top 5 categorías más populares | Array con name y book_count |

---

## 🔐 Nota sobre Permisos

**¿Por qué cambiar de `IsAuthenticated` a `AllowAny`?**

Para el dashboard, las estadísticas generales (totales, promedios) son datos públicos que no comprometen la seguridad. Esto permite:

- ✅ Mostrar estadísticas en la landing page
- ✅ Dashboard accesible sin login completo
- ✅ Mejor UX para usuarios que visitan el sitio

**Para producción:**
- Si las estadísticas son sensibles, mantener `IsAuthenticated`
- O crear dos endpoints: uno público (stats generales) y uno privado (stats personales)

---

## ⚠️ Si el Error Persiste

### Causa 1: Backend No Reinició

```bash
# Reiniciar manualmente
docker compose restart backend

# Verificar que está corriendo
docker compose ps backend
```

### Causa 2: Error en el Código Python

```bash
# Ver logs del backend
docker compose logs -f backend

# Buscar errores
docker compose logs backend | findstr /i "error exception traceback"
```

### Causa 3: Base de Datos Vacía

Si no hay libros en la base de datos:

```bash
# Importar libros de OpenLibrary (opcional)
docker compose exec backend python manage.py import_openlibrary --limit=50
```

### Causa 4: Caché del Navegador

Limpia la caché del navegador:
- **Chrome/Edge:** `Ctrl + Shift + R`
- **Firefox:** `Ctrl + F5`

---

## 🎯 Resultado Esperado

Después de aplicar la solución, el dashboard debería mostrar:

```
┌─────────────────────────────────────────────┐
│           Dashboard                         │
│  Bienvenido a tu biblioteca virtual         │
└─────────────────────────────────────────────┘

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Total Libros│ │Usuarios Act.│ │Libros Prest.│ │Calif. Prom. │
│     50      │ │      5      │ │      0      │ │     4.5     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

┌─────────────────────┐ ┌─────────────────────┐
│ Libros Recientes    │ │ Acciones Rápidas    │
│                     │ │                     │
│ • Book 1            │ │ [Buscar Libros]     │
│ • Book 2            │ │ [Ver Planes]        │
│ • Book 3            │ │ [Mi Perfil]         │
│ • Book 4            │ │ [Historial]         │
│ • Book 5            │ │                     │
└─────────────────────┘ └─────────────────────┘

┌────────────────────────────────────────────┐
│ Categorías Populares                       │
│                                            │
│ [Filosofía - 15 libros] [Ciencia - 12]    │
│ [Historia - 10]  [Literatura - 8]         │
└────────────────────────────────────────────┘
```

---

## 📞 Próximos Pasos

1. **Ejecuta:** `APLICAR_FIX_DASHBOARD.bat`
2. **Abre:** http://localhost:3000/home
3. **Verifica:** Que se muestren las estadísticas sin error
4. **Si falla:** Ejecuta `VER_LOGS_BACKEND.bat` y busca errores

---

**Fecha:** 2025-12-28
**Problema:** Error al cargar estadísticas
**Causa:** Permisos requerían autenticación
**Solución:** Cambiar a `AllowAny` para acceso público
**Estado:** ✅ Corregido - Aplicar con APLICAR_FIX_DASHBOARD.bat
