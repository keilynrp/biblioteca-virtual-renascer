# 📖 Guía de Testing - Funcionalidad Flipbook Preview

## 🚀 Paso 1: Iniciar el Servidor de Desarrollo

### Opción A: Usando el script automático (RECOMENDADO)
```bash
# Ejecutar desde la raíz del proyecto
START_FRONTEND_DEV.bat
```

### Opción B: Manual
```bash
cd frontend
npm run dev
```

**El servidor se iniciará en**: http://localhost:3000

---

## 🧪 Paso 2: Preparar Datos de Prueba

### Asegúrate de tener al menos un libro con PDF:

1. **Opción A: Panel de Admin (si ya tienes libros)**
   - Ir a: http://localhost:3000/admin/books
   - Editar un libro existente
   - Subir un archivo PDF en el campo "file"
   - Guardar

2. **Opción B: Importar desde OpenLibrary**
   - Ir a: http://localhost:3000/admin
   - Usar el panel "Importar Libros desde OpenLibrary"
   - Nota: Los libros importados NO tienen PDF, necesitas subirlo manualmente

3. **Opción C: Crear libro manualmente vía Admin Django**
   - Backend: http://localhost:8000/admin
   - Crear libro con archivo PDF

---

## ✅ Paso 3: Probar la Funcionalidad

### 3.1 Probar el Badge "LEER AHORA"

1. **Ir a la biblioteca**:
   ```
   http://localhost:3000/library
   ```

2. **Hacer hover sobre una portada de libro que tenga PDF**
   - ✅ Debe aparecer el badge verde "LEER AHORA" en la parte inferior
   - ✅ El badge debe aparecer suavemente (animación)
   - ✅ Solo debe aparecer si el libro tiene PDF

3. **Verificar que NO aparece en libros sin PDF**
   - Los libros sin PDF no deben mostrar el badge

---

### 3.2 Probar la Vista Previa Flipbook

1. **Click en un libro con PDF** para ir a la página de detalle:
   ```
   http://localhost:3000/library/[slug-del-libro]
   ```

2. **Scroll down** hasta la sección "Vista Previa del Libro"
   - Debe aparecer DESPUÉS de la descripción del libro
   - ANTES de las reseñas

3. **Verificar componentes visuales**:
   - ✅ Header con ícono 👁️ "Vista Previa"
   - ✅ Texto: "Primeras 10 páginas de X totales"
   - ✅ Contador: "Página 1 de 10"
   - ✅ PDF renderizado correctamente
   - ✅ Botones ◀️ Anterior y Siguiente ▶️
   - ✅ Barra de progreso visual
   - ✅ Hint: "💡 Usa las flechas del teclado..."

---

### 3.3 Probar Navegación

**Con Botones**:
1. Click en "Siguiente ▶️"
   - ✅ Debe avanzar a página 2
   - ✅ Contador se actualiza: "Página 2 de 10"
   - ✅ Barra de progreso aumenta (20%)

2. Click en "Anterior ◀️"
   - ✅ Debe retroceder a página 1
   - ✅ Botón "Anterior" se deshabilita en página 1

**Con Teclado**:
1. Presionar tecla `→` (flecha derecha)
   - ✅ Avanza a siguiente página

2. Presionar tecla `←` (flecha izquierda)
   - ✅ Retrocede a página anterior

---

### 3.4 Probar el CTA al Final del Preview

1. **Navegar hasta la página 10**
   - Usar botones o teclado para llegar a la página 10

2. **Verificar que aparece el CTA**:
   - ✅ Card con gradiente destacado
   - ✅ Ícono de libro
   - ✅ Título: "¿Te gusta lo que has visto?"
   - ✅ Texto: "Has llegado al final de la vista previa..."
   - ✅ Botón grande: "📖 Leer libro completo →"

3. **Click en "Leer libro completo"**:
   - ✅ Debe redirigir a: `/reader/[bookId]`
   - ✅ Debe abrir el lector completo de PDF

---

### 3.5 Probar Responsive Design

**Desktop (>1024px)**:
- ✅ PDF con ancho máximo de 600px
- ✅ Botón "Ir al Lector Completo" visible en header

**Tablet (768px-1024px)**:
- ✅ PDF ajustado al contenedor
- ✅ Controles responsivos

**Mobile (<768px)**:
- ✅ PDF ajustado a pantalla
- ✅ Botón "Ir al Lector Completo" oculto en header (espacio)
- ✅ Controles apilados correctamente

---

### 3.6 Probar Estados de Loading y Errores

**Loading State**:
1. Recargar la página de detalle
   - ✅ Debe mostrar spinner giratorio
   - ✅ Texto: "Cargando vista previa..."

**Error State** (opcional - requiere PDF corrupto):
1. Subir un PDF inválido
   - ✅ Debe mostrar ícono de libro
   - ✅ Mensaje de error
   - ✅ Botón para ir al lector completo

---

## 📊 Checklist de Testing Completo

### Funcionalidad Básica
- [ ] Badge "LEER AHORA" aparece en hover
- [ ] Badge solo en libros con PDF
- [ ] Vista previa se renderiza correctamente
- [ ] Navegación con botones funciona
- [ ] Navegación con teclado funciona
- [ ] Contador de páginas correcto
- [ ] Barra de progreso se actualiza

### CTA y Redirección
- [ ] CTA aparece en página 10
- [ ] Botón "Leer libro completo" funciona
- [ ] Redirección a /reader/[bookId] correcta

### UX/UI
- [ ] Animaciones suaves
- [ ] Loading states elegantes
- [ ] Error handling correcto
- [ ] Responsive en mobile
- [ ] Responsive en tablet
- [ ] Responsive en desktop

### Integración
- [ ] Sección aparece solo si hay PDF
- [ ] Integración con página de detalle correcta
- [ ] Botones del sidebar actualizados
- [ ] No hay errores en consola

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: PDF no se renderiza
**Síntoma**: Spinner infinito o error de carga
**Solución**:
1. Verificar que el PDF es válido
2. Verificar URL del PDF en Network tab
3. Verificar que PDF.js worker está cargado
4. Revisar consola para errores CORS

### Problema 2: Badge no aparece
**Síntoma**: No se ve "LEER AHORA" en hover
**Solución**:
1. Verificar que el libro tiene campo `file`
2. Inspeccionar elemento y ver si está oculto
3. Verificar que el hover funciona (CSS)

### Problema 3: Navegación con teclado no funciona
**Síntoma**: Flechas no cambian página
**Solución**:
1. Click en el componente para que tenga focus
2. Verificar que no hay otros listeners de teclado
3. Abrir consola y revisar errores JS

### Problema 4: Redirección a /reader no funciona
**Síntoma**: 404 al hacer click en CTA
**Solución**:
1. Verificar que la ruta `/reader/[bookId]` existe
2. Verificar que el componente PDF reader está implementado
3. Revisar que el bookId es correcto

---

## 📸 Screenshots Esperados

### Vista de Biblioteca con Badge
```
┌────────────────┐
│   [Portada]    │  ← Hover aquí
│                │
│  [LEER AHORA]  │  ← Debe aparecer
└────────────────┘
```

### Vista Previa en Detalle
```
┌──────────────────────────────────────┐
│ 👁️ Vista Previa        Página 3 de 10│
├──────────────────────────────────────┤
│                                      │
│     [PDF Page 3 Rendered]            │
│                                      │
├──────────────────────────────────────┤
│ ◀️ Anterior [━━━━━░░░░░] Siguiente ▶️│
│              50% completado          │
├──────────────────────────────────────┤
│ 💡 Usa las flechas del teclado...    │
└──────────────────────────────────────┘
```

### CTA al Final
```
┌──────────────────────────────────────┐
│  📖  ¿Te gusta lo que has visto?     │
│                                      │
│  Has llegado al final de la vista    │
│  previa. Accede al libro completo... │
│                                      │
│  [📖 Leer libro completo →]          │
└──────────────────────────────────────┘
```

---

## 🎯 Métricas de Éxito

**Testing Completo = 100%**
- ✅ Todas las funcionalidades funcionan
- ✅ Sin errores en consola
- ✅ Responsive en todos los tamaños
- ✅ Navegación fluida y rápida
- ✅ UX intuitiva y agradable

---

## 📝 Reporte de Bugs

Si encuentras bugs, reporta con este formato:

```markdown
### Bug: [Título corto]

**Reproducción**:
1. Paso 1
2. Paso 2
3. Paso 3

**Resultado esperado**: [Qué debería pasar]
**Resultado actual**: [Qué pasa realmente]
**Screenshot**: [Si es posible]
**Navegador**: [Chrome, Firefox, etc.]
**Consola**: [Errores en consola si los hay]
```

---

## ✅ Una Vez Completado el Testing

1. Marcar el checklist completo
2. Reportar cualquier bug encontrado
3. Sugerir mejoras de UX si las hay
4. ¡Disfrutar de la nueva funcionalidad! 🎉

---

**Creado**: 01 de Enero de 2026
**Versión**: 1.0
**Estado**: Listo para Testing
