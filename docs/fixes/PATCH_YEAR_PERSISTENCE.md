# 🔧 PATCH: Solución Definitiva al Problema "N/A"

## 🎯 Problema

Después de guardar un libro con año de publicación, al editar el libro nuevamente, el año aparece como "N/A" en la tabla.

## 🔍 Diagnóstico

El problema puede estar en **3 lugares diferentes**:

### 1. El dato NO se está guardando en la base de datos
**Síntoma**: La tabla muestra N/A porque el campo `publication_date` es NULL en PostgreSQL

### 2. El dato SÍ se guarda pero NO se envía al actualizar
**Síntoma**: Al crear funciona, pero al actualizar un libro existente el año se pierde

### 3. El dato SÍ se guarda pero NO se muestra en el frontend
**Síntoma**: La BD tiene el dato pero el componente no lo lee/muestra correctamente

## 🛠️ Solución Paso a Paso

### PASO 1: Ejecutar Diagnóstico

```bash
DIAGNOSE_YEAR_PERSISTENCE.bat
```

Selecciona opción [1] para verificar la base de datos.

**Si ves NULL en publication_date** → Ve a PASO 2
**Si ves una fecha (ej: 2024-01-01)** → Ve a PASO 3

---

### PASO 2: El dato NO se guarda (Backend Issue)

#### Causa Probable:
El formulario no está enviando `publication_date` correctamente o el backend lo está rechazando.

#### Fix:

**Archivo**: `frontend/src/app/(dashboard)/admin/books/page.tsx`

Busca la sección donde se construye `formDataToSend` (línea ~237):

```typescript
// Solo enviar publication_date si tiene valor
if (formData.publication_date) {
    formDataToSend.append('publication_date', formData.publication_date)
}
```

**PROBLEMA**: Si `publication_date` es un string vacío `""`, esta condición es `false` y no se envía.

**SOLUCIÓN**:

```typescript
// Enviar publication_date si tiene valor Y no es string vacío
if (formData.publication_date && formData.publication_date.trim() !== '') {
    formDataToSend.append('publication_date', formData.publication_date)
    console.log('📅 Enviando publication_date:', formData.publication_date)
} else {
    console.log('⚠️ publication_date está vacío, no se enviará')
}
```

#### Verificación:

1. Abre DevTools (F12) → Console
2. Edita un libro y cambia el año
3. Guarda
4. Deberías ver en consola: `📅 Enviando publication_date: 2024-01-01`

Si NO ves el log → El problema está en el `onChange` del YearPicker

---

### PASO 3: El dato SÍ se guarda pero NO se muestra (Frontend Issue)

#### Causa Probable:
El componente `handleOpenDialog` no está leyendo correctamente `publication_date` del libro.

#### Fix:

**Archivo**: `frontend/src/app/(dashboard)/admin/books/page.tsx`

Verifica la función `handleOpenDialog` (línea ~161):

```typescript
const handleOpenDialog = (book?: Book) => {
    if (book) {
        setEditingBook(book)

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

        console.log('📖 Abriendo libro:', book.title)
        console.log('📅 publication_date:', book.publication_date)
        console.log('🗓️ year extraído:', year)

        setFormData({
            // ...otros campos
            publication_date: book.publication_date || "",
            publication_year: year,
            // ...
        })
    }
}
```

#### Agregamos logs para debugging

#### Verificación:

1. Abre DevTools (F12) → Console
2. Haz clic en editar un libro que tenga año
3. Deberías ver en consola:
   ```
   📖 Abriendo libro: Test Book 2024
   📅 publication_date: 2024-01-01
   🗓️ year extraído: 2024
   ```

Si `publication_date` es `null` → El backend no está devolviendo el dato
Si `year extraído` es `""` → Hay un problema en el parsing

---

### PASO 4: Verificar el YearPicker onChange

#### Causa Probable:
Cuando el usuario selecciona un año, el `onChange` no está seteando correctamente `publication_date`.

#### Fix:

**Archivo**: `frontend/src/app/(dashboard)/admin/books/page.tsx`

Busca donde usas el YearPicker (línea ~626):

```typescript
<YearPicker
    value={formData.publication_year}
    onChange={(year) => {
        console.log('🔄 YearPicker onChange llamado con:', year)

        const date = year ? `${year}-01-01` : '';

        console.log('📅 publication_date generado:', date)

        setFormData({
            ...formData,
            publication_year: year,
            publication_date: date
        });

        console.log('✅ Estado actualizado')
    }}
    placeholder="Seleccionar año"
    minYear={1000}
    maxYear={new Date().getFullYear() + 10}
/>
```

#### Verificación:

1. Abre DevTools (F12) → Console
2. Abre el YearPicker y selecciona un año
3. Deberías ver:
   ```
   🔄 YearPicker onChange llamado con: 2024
   📅 publication_date generado: 2024-01-01
   ✅ Estado actualizado
   ```

Si NO ves estos logs → El YearPicker no está llamando onChange

---

## 🚀 Script de Fix Automático

He creado un script que aplica todos estos logs y verificaciones:

```bash
APPLY_DEBUG_LOGS.bat
```

Este script:
1. Agrega logs de debugging en todos los puntos críticos
2. Reinicia el frontend
3. Te guía en la verificación paso a paso

---

## 🧪 Test Manual Completo

### Test 1: Crear Libro con Año

1. **Crear** libro nuevo
2. **Seleccionar** año 2024 en el YearPicker
3. **Verificar consola**:
   ```
   🔄 YearPicker onChange llamado con: 2024
   📅 publication_date generado: 2024-01-01
   ```
4. **Guardar** libro
5. **Verificar consola**:
   ```
   📅 Enviando publication_date: 2024-01-01
   ```
6. **Verificar tabla**: Debe mostrar "2024", no "N/A"

Si muestra "N/A" → El problema está en cómo la tabla lee el dato

---

### Test 2: Editar Libro Existente

1. **Editar** libro que tiene año
2. **Verificar consola**:
   ```
   📖 Abriendo libro: [Nombre]
   📅 publication_date: 2024-01-01
   🗓️ year extraído: 2024
   ```
3. **Verificar YearPicker**: Debe mostrar "2024" en el botón
4. **Cambiar** a otro año (ej: 2025)
5. **Verificar consola**:
   ```
   🔄 YearPicker onChange llamado con: 2025
   📅 publication_date generado: 2025-01-01
   ```
6. **Guardar**
7. **Verificar consola**:
   ```
   📅 Enviando publication_date: 2025-01-01
   ```
8. **Verificar tabla**: Debe mostrar "2025"

---

### Test 3: Verificar Tabla Display

El problema podría estar en cómo se MUESTRA el año en la tabla.

**Archivo**: `frontend/src/app/(dashboard)/admin/books/page.tsx`

Busca donde se renderiza la tabla (línea ~477):

```typescript
<TableCell>
    {book.publication_date ? new Date(book.publication_date).getFullYear() : 'N/A'}
</TableCell>
```

**Agregar log**:

```typescript
<TableCell>
    {(() => {
        if (!book.publication_date) {
            console.warn(`⚠️ Libro ${book.id} sin publication_date`)
            return 'N/A'
        }

        try {
            const year = new Date(book.publication_date).getFullYear()
            console.log(`📅 Libro ${book.id}: ${book.publication_date} → ${year}`)
            return year
        } catch (e) {
            console.error(`❌ Error parseando fecha del libro ${book.id}:`, e)
            return 'N/A'
        }
    })()}
</TableCell>
```

#### Verificación:

1. Recarga la página de admin/books
2. Mira la consola
3. Para cada libro deberías ver:
   ```
   📅 Libro 1: 2024-01-01 → 2024
   📅 Libro 2: 2023-05-15 → 2023
   ⚠️ Libro 3 sin publication_date
   ```

Si ves muchos "⚠️ sin publication_date" → Los datos NO se están guardando

---

## 📊 Matriz de Problemas y Soluciones

| Síntoma | Causa | Solución |
|---------|-------|----------|
| "N/A" en tabla después de crear | No se envía al backend | Fix PASO 2 |
| "N/A" al editar libro con año | No se lee al abrir diálogo | Fix PASO 3 |
| YearPicker vacío al editar | handleOpenDialog no setea year | Fix PASO 3 |
| Año no cambia al seleccionar | onChange no actualiza estado | Fix PASO 4 |
| BD tiene fecha pero tabla muestra N/A | Error en renderizado de tabla | Fix Test 3 |

---

## 🎯 Checklist de Verificación

Después de aplicar los fixes:

- [ ] Console logs aparecen al seleccionar año
- [ ] Console logs aparecen al guardar libro
- [ ] Console logs aparecen al editar libro
- [ ] YearPicker muestra el año al editar
- [ ] Tabla muestra el año (no N/A)
- [ ] Base de datos tiene el dato (verifica con DIAGNOSE_YEAR_PERSISTENCE.bat)
- [ ] El dato persiste después de refrescar la página

---

## 🚨 Si Nada Funciona

1. **Limpieza profunda**:
   ```bash
   docker compose down
   docker system prune -f
   docker compose up -d
   # Esperar 1 minuto
   FIX_YEAR_PICKER_SUPER.bat
   ```

2. **Verificar Network Tab**:
   - F12 → Network
   - Filtra por "books"
   - Al guardar, ve el payload
   - Debe incluir `publication_date: "2024-01-01"`

3. **Verificar Response**:
   - En Network, ve la respuesta del servidor
   - Debe incluir `publication_date: "2024-01-01"`

4. **Verificar Estado de React**:
   - Instala React DevTools
   - Busca AdminBooksPage component
   - Ve el estado `formData`
   - Debe tener `publication_year` y `publication_date`

---

## 📝 Reporte de Bug

Si después de todo esto sigue sin funcionar, crea un reporte con:

```
PROBLEMA: El año aparece como N/A después de guardar

VERIFICACIONES:
1. Base de datos tiene el dato: [SÍ/NO]
2. Backend devuelve el dato: [SÍ/NO]
3. handleOpenDialog recibe el dato: [SÍ/NO]
4. YearPicker muestra el dato: [SÍ/NO]
5. onChange actualiza el estado: [SÍ/NO]
6. Tabla renderiza el dato: [SÍ/NO]

CONSOLE LOGS:
[Pegar logs de la consola aquí]

NETWORK REQUEST:
[Pegar payload del request aquí]

NETWORK RESPONSE:
[Pegar respuesta del servidor aquí]
```

---

**Versión**: 1.0.0
**Fecha**: 2025-01-04
**Autor**: BVS Framework Team
