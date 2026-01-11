# 🧪 Test de Year Picker - Guía de Pruebas

## 📋 Checklist de Pruebas Funcionales

Sigue estas pruebas en orden para verificar que todo funciona correctamente.

---

## Test Suite 1: Creación de Libros

### ✅ Test 1.1: Crear Libro con Año

**Pasos:**
1. Ve a Admin → Libros
2. Haz clic en "Crear Libro"
3. Llena los campos obligatorios:
   - Título: "Test Book 2024"
   - Autor: (selecciona cualquiera)
   - Categoría: (selecciona cualquiera)
   - Descripción: "Libro de prueba"
4. En "Año de Publicación":
   - Haz clic en "Seleccionar año"
   - El popover debe abrirse
   - Debería mostrar la década actual (2012-2023 o similar)
5. Haz clic en "2024"
6. Verifica que el botón ahora muestra "2024"
7. Haz clic en "Crear"

**Resultado Esperado:**
- ✅ Libro se crea exitosamente
- ✅ Mensaje "Libro creado exitosamente"
- ✅ Libro aparece en la tabla
- ✅ En la columna "Año" muestra "2024"

---

### ✅ Test 1.2: Crear Libro Sin Año

**Pasos:**
1. Haz clic en "Crear Libro"
2. Llena solo los campos obligatorios
3. NO selecciones ningún año
4. Haz clic en "Crear"

**Resultado Esperado:**
- ✅ Libro se crea sin errores
- ✅ En la columna "Año" muestra "N/A"
- ✅ No hay errores NaN en la consola

---

### ✅ Test 1.3: Crear Libro con Año Antiguo

**Pasos:**
1. Haz clic en "Crear Libro"
2. Llena los campos obligatorios
3. En el campo de año:
   - Haz clic en "Seleccionar año"
   - En el campo de búsqueda, escribe "1850"
   - El selector debe navegar automáticamente a 1848-1859
4. Haz clic en "1850"
5. Crea el libro

**Resultado Esperado:**
- ✅ Popover navega a la década correcta
- ✅ 1850 está disponible para selección
- ✅ Libro se crea con año 1850
- ✅ Aparece "1850" en la tabla

---

### ✅ Test 1.4: Entrada Directa de Año

**Pasos:**
1. Haz clic en "Crear Libro"
2. Llena los campos obligatorios
3. **En lugar de usar el selector**, escribe directamente "1999" en el campo de texto
4. Crea el libro

**Resultado Esperado:**
- ✅ El año se acepta
- ✅ Libro se crea con año 1999
- ✅ Aparece "1999" en la tabla

---

## Test Suite 2: Edición de Libros (PERSISTENCIA)

### ✅ Test 2.1: Editar Libro con Año - Verificar Persistencia

**Pasos:**
1. En la tabla, encuentra el libro "Test Book 2024" creado anteriormente
2. Haz clic en el menú de 3 puntos → "Editar"
3. Verifica el campo de año:
   - El botón debe mostrar "2024" ✅
   - El campo de texto debe mostrar "2024" ✅
4. Haz clic en el botón "Seleccionar año"
5. Verifica el popover:
   - Debe mostrar la década 2012-2023 ✅
   - El año "2024" debe tener fondo azul (seleccionado) ✅
6. Cierra el popover (sin hacer cambios)
7. Cancela la edición

**Resultado Esperado:**
- ✅ El año "2024" aparece en el botón
- ✅ El año "2024" aparece en el campo de texto
- ✅ El popover navega a la década correcta
- ✅ El año está visualmente marcado como seleccionado

**Este es el test MÁS IMPORTANTE** - Si este falla, hay un problema de persistencia.

---

### ✅ Test 2.2: Cambiar Año de Libro Existente

**Pasos:**
1. Edita el libro "Test Book 2024"
2. Verifica que muestra "2024"
3. Abre el selector de año
4. Cambia a "2025"
5. Guarda
6. Vuelve a editar el mismo libro
7. Verifica que ahora muestra "2025"

**Resultado Esperado:**
- ✅ El cambio se guarda
- ✅ La tabla muestra "2025"
- ✅ Al re-editar, muestra "2025" correctamente

---

### ✅ Test 2.3: Quitar Año de Libro

**Pasos:**
1. Edita un libro que tiene año
2. Borra el contenido del campo de texto directo
3. Guarda
4. Verifica la tabla - debe mostrar "N/A"
5. Vuelve a editar
6. Verifica que el campo está vacío

**Resultado Esperado:**
- ✅ Se puede dejar el campo vacío
- ✅ Se guarda correctamente sin año
- ✅ La tabla muestra "N/A"
- ✅ Al re-editar, el campo está vacío

---

### ✅ Test 2.4: Agregar Año a Libro Sin Año

**Pasos:**
1. Edita un libro que NO tiene año (muestra "N/A")
2. Verifica que el campo de año está vacío
3. Selecciona un año (ej: 2023)
4. Guarda
5. Verifica la tabla - debe mostrar "2023"
6. Vuelve a editar
7. Verifica que muestra "2023"

**Resultado Esperado:**
- ✅ Se puede agregar año a libro sin año
- ✅ Los cambios persisten
- ✅ Todo funciona como esperado

---

## Test Suite 3: Navegación del Selector

### ✅ Test 3.1: Navegación por Décadas

**Pasos:**
1. Crea o edita un libro
2. Abre el selector de año
3. Haz clic en la flecha izquierda ◀
4. Verifica que retrocede 12 años
5. Haz clic en la flecha derecha ▶
6. Verifica que avanza 12 años

**Resultado Esperado:**
- ✅ Las flechas funcionan
- ✅ La navegación es fluida
- ✅ El rango se actualiza correctamente

---

### ✅ Test 3.2: Búsqueda de Años

**Pasos:**
1. Abre el selector de año
2. En el campo de búsqueda, escribe "20"
3. Verifica que filtra años que contienen "20" (2020, 2021, etc.)
4. Escribe "1995"
5. Verifica que navega a la década 1992-2003

**Resultado Esperado:**
- ✅ El filtro funciona
- ✅ La navegación automática funciona al escribir 4 dígitos
- ✅ Los años filtrados se muestran correctamente

---

### ✅ Test 3.3: Límites de Años

**Pasos:**
1. Abre el selector de año
2. Navega hacia atrás hasta el año 1000
3. Verifica que la flecha izquierda se deshabilita antes de 1000
4. Navega hacia adelante hasta año actual + 10
5. Verifica que la flecha derecha se deshabilita

**Resultado Esperado:**
- ✅ No puedes navegar antes de 1000
- ✅ No puedes navegar después de año actual + 10
- ✅ Los botones se deshabilitan apropiadamente

---

## Test Suite 4: Interfaz y UX

### ✅ Test 4.1: Indicador de Año Actual

**Pasos:**
1. Abre el selector de año
2. Navega a la década actual
3. Busca el año actual (2025)

**Resultado Esperado:**
- ✅ El año actual tiene un borde azul distintivo
- ✅ Es fácil identificarlo visualmente
- ✅ El footer muestra "Año actual: 2025"

---

### ✅ Test 4.2: Estados Visuales

**Pasos:**
1. Abre el selector
2. Observa un año no seleccionado - borde gris
3. Haz clic en un año
4. Observa que cambia a fondo azul
5. Vuelve a abrir el selector
6. El año seleccionado debe seguir con fondo azul

**Resultado Esperado:**
- ✅ Los estados visuales son claros
- ✅ Año seleccionado = fondo azul
- ✅ Año actual = borde azul
- ✅ Año normal = outline gris

---

### ✅ Test 4.3: Placeholder y Texto

**Pasos:**
1. Crea un libro nuevo
2. Sin seleccionar año, observa el botón
3. Debe decir "Seleccionar año" en gris claro

**Resultado Esperado:**
- ✅ El placeholder es visible
- ✅ El texto está en color gris (muted)
- ✅ Es claro que no hay año seleccionado

---

## Test Suite 5: Validaciones y Errores

### ✅ Test 5.1: Sin Errores en Consola

**Pasos:**
1. Abre DevTools (F12)
2. Ve a la pestaña Console
3. Limpia la consola
4. Realiza todas las operaciones anteriores
5. Revisa que no haya errores

**Resultado Esperado:**
- ✅ No hay errores en rojo
- ✅ No hay warnings sobre NaN
- ✅ No hay errores de React sobre props
- ⚠️ Puede haber warnings normales de Next.js (ignorar)

---

### ✅ Test 5.2: Validación de Entrada Directa

**Pasos:**
1. En el campo de texto directo, intenta escribir letras "abcd"
2. Verifica que no acepta letras
3. Intenta escribir caracteres especiales "@#$"
4. Verifica que no acepta
5. Escribe solo números "2024"
6. Verifica que sí acepta

**Resultado Esperado:**
- ✅ Solo acepta números
- ✅ Rechaza letras y caracteres especiales
- ✅ La validación es inmediata

---

## Test Suite 6: Casos Edge

### ✅ Test 6.1: Año 1000 (Límite Inferior)

**Pasos:**
1. Usando entrada directa, escribe "1000"
2. Guarda el libro
3. Edita y verifica persistencia

**Resultado Esperado:**
- ✅ Acepta el año 1000
- ✅ Se guarda correctamente
- ✅ Persiste al editar

---

### ✅ Test 6.2: Año Futuro (Año Actual + 10)

**Pasos:**
1. Calcula año actual + 10 (ej: 2035)
2. Escribe ese año
3. Guarda y verifica

**Resultado Esperado:**
- ✅ Acepta años futuros dentro del rango
- ✅ Se guarda correctamente

---

### ✅ Test 6.3: Múltiples Ediciones Rápidas

**Pasos:**
1. Edita un libro con año 2020
2. Cambia a 2021, guarda
3. Inmediatamente edita de nuevo
4. Cambia a 2022, guarda
5. Edita de nuevo
6. Verifica que muestra 2022

**Resultado Esperado:**
- ✅ Cambios sucesivos se guardan correctamente
- ✅ No hay errores de estado
- ✅ La última edición persiste

---

## 📊 Reporte de Resultados

Después de completar todas las pruebas, completa este checklist:

### Funcionalidad Core
- [ ] Crear libros con año funciona
- [ ] Crear libros sin año funciona
- [ ] Editar libros mantiene el año (PERSISTENCIA)
- [ ] Cambiar año funciona
- [ ] Quitar año funciona
- [ ] Agregar año a libro sin año funciona

### Selector Visual
- [ ] Popover abre/cierra correctamente
- [ ] Navegación por décadas funciona
- [ ] Búsqueda de años funciona
- [ ] Límites de años se respetan
- [ ] Indicador de año actual funciona

### UX/UI
- [ ] Estados visuales son claros
- [ ] Placeholder correcto
- [ ] Entrada directa funciona
- [ ] Validaciones funcionan

### Calidad
- [ ] No hay errores en consola
- [ ] No hay warnings de NaN
- [ ] Rendimiento es bueno (no lag)

---

## 🐛 Si Algo Falla

### Problema: El año no persiste al editar

**Solución:**
1. Verifica que ejecutaste `APLICAR_FIX_YEAR_PICKER.bat`
2. Haz hard reload (Ctrl+Shift+R)
3. Revisa la consola para errores
4. Lee `YEAR_PICKER_FIX_PERSISTENCE.md`

### Problema: El popover no navega al año correcto

**Solución:**
1. Verifica que el fix del `useEffect` está aplicado
2. Revisa React DevTools para ver el estado de `displayYear`
3. Checa que el `value` prop se está pasando correctamente

### Problema: Errores NaN en consola

**Solución:**
1. Verifica que todos los inputs tienen `|| ""`
2. Revisa el manejo de errores en `handleOpenDialog`
3. Checa que el backend devuelve fechas en formato ISO

---

## 📝 Template de Reporte de Bug

Si encuentras un bug que no pasa las pruebas, repórtalo así:

```
**Test que falla**: Test 2.1 - Verificar Persistencia
**Pasos reproducir**:
1. ...
2. ...

**Resultado esperado**: ...
**Resultado actual**: ...

**Console logs**:
```
[pegar logs aquí]
```

**Network request**:
```json
{
  // pegar payload aquí
}
```

**Screenshot**: [adjuntar si es posible]
```

---

## ✅ Verificación Final

Si todos los tests pasan:

🎉 **¡El Year Picker está funcionando perfectamente!**

Puedes usar con confianza el nuevo selector de año en producción.

---

**Versión del Test Suite**: 1.0.0
**Última actualización**: 2025-01-04
