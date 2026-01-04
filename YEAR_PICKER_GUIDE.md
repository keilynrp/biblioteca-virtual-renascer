# 📅 Guía de Year Picker - Selector de Año Mejorado

## 🎯 ¿Qué se implementó?

Se ha rediseñado completamente el campo "Año de Publicación" en la administración de libros con un selector de año moderno e intuitivo.

## ✨ Características

### 1. **Selector Visual de Año**
- Vista de calendario mostrando 12 años por pantalla
- Navegación por décadas con botones anterior/siguiente
- Indicador visual del año actual (borde azul)
- Selección con un solo clic

### 2. **Campo de Búsqueda**
- Busca años rápidamente escribiendo en el campo de búsqueda
- Auto-navegación: si escribes un año de 4 dígitos válido, automáticamente navega a esa década
- Filtrado en tiempo real de los años mostrados

### 3. **Entrada Directa**
- Campo de texto adicional para escribir el año directamente
- Validación automática (solo acepta números)
- Rango configurable (1000 - año actual + 10)

### 4. **Opcional y Flexible**
- El campo es completamente opcional
- Puedes dejar en blanco si no conoces el año de publicación
- No genera errores NaN ni validaciones molestas

## 📦 Instalación

Ejecuta uno de estos scripts según tu sistema operativo:

### Windows:
```bash
INSTALL_YEAR_PICKER.bat
```

### Linux/Mac:
```bash
chmod +x install-year-picker.sh
./install-year-picker.sh
```

## 🔧 Componentes Creados

### 1. **YearPicker** (`frontend/src/components/ui/year-picker.tsx`)
Componente principal que maneja toda la lógica del selector de año:
- Props configurables (minYear, maxYear, placeholder)
- Estado interno para navegación y búsqueda
- Interfaz intuitiva con iconos de Lucide

### 2. **Popover** (`frontend/src/components/ui/popover.tsx`)
Componente base de Radix UI para el popover que contiene el selector:
- Portal para renderizado fuera del flujo DOM
- Animaciones suaves de entrada/salida
- Posicionamiento inteligente

## 🎨 Interfaz de Usuario

```
┌─────────────────────────────────────────┐
│ Año de Publicación (Opcional)           │
├─────────────────────────────────────────┤
│ [📅 Seleccionar año] [  o escribe el año]│
│                                          │
│ Selecciona o escribe el año de publicación│
└─────────────────────────────────────────┘
```

Al hacer clic en "Seleccionar año" se abre:

```
┌─────────────────────────────────┐
│ 🔍 Buscar año...                │
├─────────────────────────────────┤
│      ◀  2012 - 2023  ▶          │
├─────────────────────────────────┤
│ [2012] [2013] [2014]           │
│ [2015] [2016] [2017]           │
│ [2018] [2019] [2020]           │
│ [2021] [2022] [2023]           │
├─────────────────────────────────┤
│ Año actual: 2025                │
└─────────────────────────────────┘
```

## 💡 Cómo Usar

### Para Usuarios del Admin Panel:

1. **Opción 1 - Selector Visual:**
   - Haz clic en el botón "Seleccionar año"
   - Navega por décadas con las flechas
   - Haz clic en el año deseado

2. **Opción 2 - Búsqueda:**
   - Abre el selector
   - Escribe en el campo de búsqueda
   - El selector navegará automáticamente a esa década
   - Haz clic en el año

3. **Opción 3 - Entrada Directa:**
   - Escribe directamente en el campo de texto "o escribe el año"
   - El año se guardará al enviar el formulario

4. **Dejar en Blanco:**
   - Simplemente no selecciones ni escribas nada
   - El campo se enviará vacío sin errores

## 🔍 Detalles Técnicos

### Integración con el Formulario

El YearPicker se integra perfectamente con el estado del formulario existente:

```typescript
<YearPicker
  value={formData.publication_year}
  onChange={(year) => {
    const date = year ? `${year}-01-01` : '';
    setFormData({
      ...formData,
      publication_year: year,
      publication_date: date
    });
  }}
  placeholder="Seleccionar año"
  minYear={1000}
  maxYear={new Date().getFullYear() + 10}
/>
```

### Conversión Backend

- Frontend: Solo maneja el año (ej: "2024")
- Conversión: Se convierte a fecha ISO (ej: "2024-01-01")
- Backend: Recibe el campo `publication_date` en formato ISO
- Display: La tabla muestra solo el año usando `new Date().getFullYear()`

### Props del YearPicker

| Prop | Tipo | Descripción | Default |
|------|------|-------------|---------|
| `value` | `string` | Año seleccionado actualmente | `undefined` |
| `onChange` | `(year: string) => void` | Callback cuando cambia el año | Requerido |
| `placeholder` | `string` | Texto cuando no hay selección | `"Seleccionar año"` |
| `minYear` | `number` | Año mínimo permitido | `1000` |
| `maxYear` | `number` | Año máximo permitido | Año actual + 10 |
| `className` | `string` | Clases CSS adicionales | `undefined` |

## 🎯 Ventajas sobre el Campo Anterior

| Característica | Campo Anterior | YearPicker Nuevo |
|---------------|----------------|------------------|
| Búsqueda visual | ❌ | ✅ |
| Búsqueda por texto | ❌ | ✅ |
| Navegación por décadas | ❌ | ✅ |
| Entrada directa | ✅ | ✅ |
| Indicador año actual | ❌ | ✅ |
| Errores NaN | ❌ (tenía) | ✅ (eliminados) |
| UX intuitiva | ⚠️ Básica | ✅ Excelente |
| Accesibilidad | ⚠️ Limitada | ✅ Mejorada |

## 🐛 Problemas Resueltos

1. ✅ **Error NaN**: Eliminado completamente con validaciones apropiadas
2. ✅ **Campo obligatorio**: Ahora es opcional como se requería
3. ✅ **Solo año (yyyy)**: Maneja solo el año internamente
4. ✅ **UX mejorada**: Experiencia mucho más intuitiva y profesional
5. ✅ **TypeScript**: Interfaces actualizadas para reflejar que `publication_date` puede ser `null`

## 🚀 Próximos Pasos

Después de instalar:

1. **Ejecuta el script de instalación** (ver arriba)
2. **Espera a que el frontend se reinicie** (~30 segundos)
3. **Abre el navegador** y ve al panel de administración
4. **Hard reload** (Ctrl+Shift+R) para limpiar el cache
5. **Crea o edita un libro** para probar el nuevo selector

## 📸 Vista Previa del Flujo

1. Usuario abre el formulario de crear/editar libro
2. Ve el campo "Año de Publicación (Opcional)" con dos opciones
3. Puede hacer clic en el botón del calendario para abrir el selector
4. O puede escribir directamente en el campo de texto
5. Al seleccionar, el año aparece en el botón del calendario
6. El formulario envía el año como fecha ISO al backend
7. En la tabla se muestra solo el año extraído de la fecha

## ✅ Checklist de Verificación

Después de instalar, verifica que:

- [ ] El botón "Seleccionar año" abre un popover
- [ ] Puedes navegar por décadas con las flechas
- [ ] El campo de búsqueda filtra y navega años
- [ ] Puedes escribir directamente en el campo de texto
- [ ] Al seleccionar un año, se muestra en el botón
- [ ] Puedes crear/editar libros sin año sin errores
- [ ] La tabla muestra solo el año (no la fecha completa)
- [ ] No hay errores NaN en la consola

## 🆘 Troubleshooting

### El selector no aparece
- Verifica que se instaló `@radix-ui/react-popover`
- Reinicia el contenedor frontend
- Haz hard reload en el navegador

### Errores de compilación
- Verifica que todos los archivos se crearon correctamente
- Revisa la consola de Docker para errores
- Verifica que no hay conflictos de versiones en package.json

### El año no se guarda
- Verifica la consola del navegador para errores de red
- Comprueba que el backend esté respondiendo
- Revisa los logs del contenedor backend

## 📚 Recursos

- [Radix UI Popover Docs](https://www.radix-ui.com/primitives/docs/components/popover)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Creado con ❤️ para mejorar la experiencia de administración de BVS Framework**
