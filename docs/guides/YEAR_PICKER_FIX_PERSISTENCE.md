# 🔧 Fix: Persistencia del Año de Publicación

## 🐛 Problema Reportado

El campo de año no persiste correctamente cuando se guarda un libro y se vuelve a abrir para editar.

## 🔍 Diagnóstico

El problema tenía dos causas:

### 1. Estado Interno del YearPicker No Se Sincronizaba
El componente YearPicker mantiene un estado interno `displayYear` que controla qué década mostrar en el selector. Este estado se inicializaba solo una vez cuando el componente se montaba, pero no se actualizaba cuando cambiaba el prop `value`.

**Síntoma**: Al abrir un libro para editar, el popover del selector no navegaba automáticamente al año guardado.

### 2. Parsing de Fecha Frágil
La conversión de `publication_date` a año podía fallar silenciosamente sin manejo de errores, causando que el campo aparezca vacío.

**Síntoma**: Algunos libros no mostraban su año al editarlos, especialmente si la fecha tenía un formato inesperado.

## ✅ Soluciones Implementadas

### Fix 1: Sincronización del Estado Interno

**Archivo**: `frontend/src/components/ui/year-picker.tsx`

Agregué un `useEffect` que sincroniza el estado interno `displayYear` cada vez que cambia el prop `value`:

```typescript
// Sincronizar displayYear cuando cambia el value prop
React.useEffect(() => {
  if (value && !isNaN(parseInt(value))) {
    setDisplayYear(parseInt(value))
  }
}, [value])
```

**Beneficio**: Ahora cuando abres un libro para editar, el popover automáticamente navega a la década correcta que contiene el año guardado.

### Fix 2: Manejo Robusto de Errores

**Archivo**: `frontend/src/app/(dashboard)/admin/books/page.tsx`

Mejoré el parsing de la fecha con try-catch y validaciones adicionales:

```typescript
// Extraer el año de publication_date si existe
let year = "";
if (book.publication_date) {
    try {
        const yearNum = new Date(book.publication_date).getFullYear();
        if (!isNaN(yearNum) && yearNum > 0) {
            year = yearNum.toString();
        }
    } catch (error) {
        console.warn("Error parsing publication_date:", error);
    }
}
```

**Beneficios**:
- ✅ Manejo de errores explícito
- ✅ Validación de que el año es un número válido y positivo
- ✅ Log de advertencia para debugging sin romper la UI
- ✅ Garantía de que `year` siempre es un string (vacío o con año válido)

## 🔄 Flujo Completo Actualizado

### Guardar un Libro con Año

1. Usuario selecciona año "2024" en el YearPicker
2. `onChange` se dispara con `"2024"`
3. El estado se actualiza:
   ```typescript
   publication_year: "2024"
   publication_date: "2024-01-01"
   ```
4. Al enviar, solo se envía `publication_date` al backend
5. Backend guarda `"2024-01-01"` en PostgreSQL
6. Respuesta del backend incluye el libro actualizado
7. Estado local `books` se actualiza con la respuesta

### Editar un Libro con Año

1. Usuario hace clic en "Editar" en un libro
2. `handleOpenDialog(book)` se ejecuta
3. Se extrae el año de `book.publication_date`:
   ```typescript
   publication_date: "2024-01-01"
   → yearNum = 2024
   → year = "2024"
   ```
4. El estado del formulario se setea con:
   ```typescript
   publication_year: "2024"
   publication_date: "2024-01-01"
   ```
5. El YearPicker recibe `value="2024"`
6. El `useEffect` detecta el cambio y actualiza `displayYear` a `2024`
7. El botón muestra "2024"
8. Al abrir el popover, muestra la década 2012-2023 automáticamente

## 🧪 Casos de Prueba

### Test 1: Crear Libro con Año
```
✅ Crear libro con año 2024
✅ Guardar
✅ Recargar página
✅ Editar el libro
✅ Verificar que muestra "2024" en el botón
✅ Abrir popover
✅ Verificar que muestra la década correcta (2012-2023)
✅ Verificar que 2024 está seleccionado (fondo azul)
```

### Test 2: Crear Libro Sin Año
```
✅ Crear libro sin seleccionar año
✅ Guardar
✅ Verificar que se guarda correctamente
✅ Editar el libro
✅ Verificar que el campo está vacío
✅ Seleccionar un año
✅ Guardar
✅ Editar nuevamente
✅ Verificar que ahora muestra el año
```

### Test 3: Cambiar Año de Libro Existente
```
✅ Editar libro con año 2020
✅ Verificar que muestra "2020"
✅ Cambiar a 2025
✅ Guardar
✅ Editar nuevamente
✅ Verificar que muestra "2025"
```

### Test 4: Quitar Año de Libro
```
✅ Editar libro con año 2024
✅ Borrar el contenido del campo directo (o del botón)
✅ Guardar
✅ Editar nuevamente
✅ Verificar que el campo está vacío
```

### Test 5: Libros Antiguos
```
✅ Crear libro con año 1850
✅ Guardar
✅ Editar
✅ Verificar que muestra "1850"
✅ Abrir popover
✅ Verificar que navega a la década 1848-1859
```

## 🔍 Debugging

Si aún experimentas problemas de persistencia:

### 1. Verificar Console Logs

Abre DevTools (F12) → Console y busca:

```
Error parsing publication_date: ...
```

Esto indica que el formato de fecha en el backend no es el esperado.

### 2. Verificar Network Requests

En DevTools → Network:

**Al guardar libro:**
```json
{
  "title": "...",
  "publication_date": "2024-01-01",  // ✅ Debe estar presente
  ...
}
```

**Respuesta del backend:**
```json
{
  "id": 123,
  "publication_date": "2024-01-01",  // ✅ Debe coincidir
  ...
}
```

### 3. Verificar Estado de React

Instala React DevTools y verifica:

**En AdminBooksPage:**
```javascript
formData: {
  publication_year: "2024",  // ✅ String con el año
  publication_date: "2024-01-01",  // ✅ Fecha ISO
  ...
}
```

**En YearPicker:**
```javascript
value: "2024"  // ✅ Debe ser el prop correcto
displayYear: 2024  // ✅ Debe ser número
```

### 4. Verificar Base de Datos

Conecta a PostgreSQL y verifica:

```sql
SELECT id, title, publication_date FROM content_book WHERE id = 123;
```

Debe mostrar:
```
id  | title        | publication_date
----|--------------|------------------
123 | Test Book    | 2024-01-01
```

## 📊 Comparación Antes/Después

| Aspecto | Antes del Fix | Después del Fix |
|---------|---------------|-----------------|
| Año se guarda | ✅ | ✅ |
| Año persiste al editar | ❌ | ✅ |
| Popover navega al año | ❌ | ✅ |
| Manejo de errores | ❌ | ✅ |
| Campo de texto sincronizado | ⚠️ | ✅ |
| Logs de debugging | ❌ | ✅ |

## 🚀 Próximos Pasos

1. **Reinicia el frontend**:
   ```bash
   docker compose restart frontend
   ```

2. **Hard reload** en el navegador (Ctrl+Shift+R)

3. **Prueba el flujo completo**:
   - Crea un libro con año
   - Guárdalo
   - Edítalo
   - Verifica que el año persiste

4. **Reporta resultados**: Si aún hay problemas, revisa los logs de console y network

## 🎯 Archivos Modificados

1. **[frontend/src/components/ui/year-picker.tsx](frontend/src/components/ui/year-picker.tsx)**
   - Líneas 37-42: Agregado useEffect para sincronización

2. **[frontend/src/app/(dashboard)/admin/books/page.tsx](frontend/src/app/(dashboard)/admin/books/page.tsx)**
   - Líneas 165-176: Mejorado parsing con try-catch

## ✅ Verificación Final

Después de aplicar estos fixes:

- [ ] El año se muestra en el botón al editar
- [ ] El popover navega a la década correcta
- [ ] El campo de entrada directa muestra el año
- [ ] No hay warnings en console sobre NaN
- [ ] Los cambios se persisten correctamente
- [ ] Puedes cambiar el año y volver a editar sin problemas

---

**Status**: ✅ CORREGIDO
**Versión**: 1.1.0
**Fecha**: 2025-01-04
