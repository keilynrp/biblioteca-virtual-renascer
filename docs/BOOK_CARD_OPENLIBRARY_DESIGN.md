# Book Card Design - OpenLibrary Style

## 🎨 Overview

Este documento describe el rediseño de las tarjetas de libros inspirado en el estilo minimalista y profesional de OpenLibrary.org.

## 📐 Design Principles

### 1. **Book Cover Prominence**
La portada del libro es el elemento principal, usando proporciones reales de libro (2:3 aspect ratio).

### 2. **Realistic Book Effects**
Sombras multicapa que simulan un libro físico en un estante.

### 3. **Clean Typography**
Tipografía simple y legible, similar al estilo de OpenLibrary.

### 4. **Minimal UI**
Interfaz limpia sin elementos decorativos innecesarios.

## 🔍 Component Breakdown

### Book Cover Container

```tsx
<div className="relative w-full aspect-[2/3] bg-gray-100 rounded-sm overflow-hidden shadow-book hover:shadow-book-hover">
  <Image src={cover} fill sizes="..." />
</div>
```

**Características:**
- **Aspect Ratio:** 2:3 (estándar de libros)
- **Background:** Gray-100 (mientras carga la imagen)
- **Border Radius:** Pequeño (rounded-sm) para look realista
- **Shadow:** Efecto multicapa tipo libro físico

### Shadows - Book Effect

**Normal State (`shadow-book`):**
```css
box-shadow:
  2px 2px 4px rgba(0, 0, 0, 0.1),      /* Sombra base */
  4px 4px 8px rgba(0, 0, 0, 0.08),     /* Sombra difusa */
  1px 1px 0px rgba(255, 255, 255, 0.5) inset,  /* Luz superior */
  -1px -1px 0px rgba(0, 0, 0, 0.05) inset;     /* Profundidad */
```

**Hover State (`shadow-book-hover`):**
```css
box-shadow:
  4px 4px 8px rgba(0, 0, 0, 0.15),     /* Sombra más pronunciada */
  8px 8px 16px rgba(0, 0, 0, 0.12),    /* Sombra media */
  12px 12px 24px rgba(0, 0, 0, 0.08),  /* Sombra difusa lejana */
  1px 1px 0px rgba(255, 255, 255, 0.6) inset,  /* Luz intensa */
  -1px -1px 0px rgba(0, 0, 0, 0.1) inset;      /* Profundidad mayor */
```

### Book Spine Effect

```tsx
<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/10 to-transparent" />
```

Simula el lomo del libro con un gradiente sutil en el borde izquierdo.

### Shelf Shadow

```tsx
<div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-b from-black/5 to-transparent rounded-full" />
```

Crea la ilusión de que el libro está sobre un estante.

## 📏 Layout Structure

```
┌─────────────────────────────────┐
│                                 │
│         Book Cover              │
│        (aspect 2:3)             │
│     ┌──────────────┐            │
│     │              │            │
│     │    Image     │            │
│     │              │            │
│     │              │            │
│     └──────────────┘            │
│                                 │
│  Title (2 lines max)            │
│  by Author Name                 │
│  [Category Badge]               │
│                                 │
│  [View Details Button]          │
│                                 │
└─────────────────────────────────┘
```

## 🎨 Color Palette

### Cover Placeholder
- **Background:** `gray-100` (#F3F4F6)
- **Icon:** `gray-400` (#9CA3AF)
- **Gradient:** `from-gray-200 to-gray-300`

### Premium Badge
- **Background:** `amber-500` (#F59E0B)
- **Text:** White
- **Icon:** Crown

### Text Colors
- **Title:** `foreground` (inherits from theme)
- **Author:** `muted-foreground` (subtle gray)
- **Category:** `primary/80` (teal con 80% opacity)

### Button
- **Border:** `primary/20` (teal con 20% opacity)
- **Hover Background:** `primary` (teal)
- **Hover Text:** White

## 📱 Responsive Sizing

El componente `Image` usa `sizes` optimizados para diferentes breakpoints:

```tsx
sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
```

| Breakpoint | Size | Columns |
|------------|------|---------|
| Mobile (≤640px) | 50vw | 2 |
| Tablet (≤768px) | 33vw | 3 |
| Desktop (≤1024px) | 25vw | 4 |
| Large (>1024px) | 16vw | 6 |

## 🎭 Hover Effects

### 1. Cover Lift
```css
group-hover:-translate-y-1
```
El libro se "levanta" ligeramente del estante.

### 2. Image Zoom
```css
group-hover:scale-105
```
La imagen hace zoom sutil (105%).

### 3. Shadow Expansion
```css
hover:shadow-book-hover
```
La sombra se expande simulando elevación.

### 4. Title Color Change
```css
group-hover:text-primary
```
El título cambia al color primario (teal).

### 5. Overlay Fade In
```css
opacity-0 group-hover:opacity-100
```
Gradiente oscuro aparece sobre la portada.

## 🔤 Typography

### Title
- **Size:** `text-sm` (0.875rem)
- **Weight:** `font-semibold` (600)
- **Lines:** `line-clamp-2` (máximo 2 líneas)
- **Leading:** `leading-tight`

### Author
- **Size:** `text-xs` (0.75rem)
- **Color:** `muted-foreground`
- **Prefix:** "by "

### Category Badge
- **Size:** `text-[10px]` (10px)
- **Weight:** `font-medium` (500)
- **Transform:** `uppercase`
- **Tracking:** `tracking-wide`
- **Padding:** `px-2 py-0.5`

### Button
- **Size:** `text-xs` (0.75rem)
- **Height:** `h-8` (32px)

## ✨ Key Features

### 1. Realistic Book Appearance
- Proporción 2:3 (como libros reales)
- Sombras multicapa
- Efecto de lomo
- Sombra de estante

### 2. Premium Badge
- Posición absoluta (top-right)
- Icono de corona
- Color amber distintivo
- Alta legibilidad

### 3. Minimal Information
- Solo datos esenciales: título, autor, categoría
- Sin descripción (ahorra espacio)
- Botón compacto

### 4. Performance Optimized
- Lazy loading de imágenes
- Sizes attribute para responsive
- Transiciones CSS eficientes

## 📊 Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Layout** | Card-based | Book-focused |
| **Cover Size** | h-48 (fixed) | aspect-[2/3] (responsive) |
| **Shadow** | Simple shadow-xl | Realistic multilayer |
| **Info Shown** | Title, Author, Category, Description | Title, Author, Category |
| **Button** | Large "Leer Más" | Compact "View Details" |
| **Premium Badge** | Large gradient | Small compact |
| **Hover Effect** | Translate + shadow | Translate + zoom + shadow |
| **Book Effect** | None | Spine + shelf shadow |

## 🎯 Inspiration Sources

Basado en el diseño de:
- [OpenLibrary.org](https://openlibrary.org/) - Layout y proporciones
- [CSS Book Effects](https://freefrontend.com/css-book-effects/) - Sombras y efectos
- [Material Design Cards](https://material.io/components/cards) - Interacciones

## 🔧 Customization Options

### Cambiar Aspect Ratio

```tsx
// Más cuadrado (para revistas)
aspect-[4/5]

// Más alto (para novelas)
aspect-[1/1.6]

// Estándar actual (libros)
aspect-[2/3]
```

### Ajustar Sombras

```css
/* Sombra más sutil */
.shadow-book {
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
}

/* Sombra más dramática */
.shadow-book {
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.15),
    8px 8px 16px rgba(0, 0, 0, 0.12);
}
```

### Cambiar Colores del Badge

```tsx
// De amber a otro color
className="bg-blue-500"  // Azul
className="bg-purple-500"  // Morado
className="bg-red-500"  // Rojo
```

## 📝 Code Example

### Uso Básico

```tsx
import { BookCard } from "@/components/book-card"

const book = {
  id: 1,
  title: "El Quijote",
  slug: "el-quijote",
  description: "...",
  author: { name: "Miguel de Cervantes" },
  category: { name: "Fiction" },
  cover_image: "https://example.com/cover.jpg",
  is_premium: true
}

<BookCard book={book} />
```

### En Grid (6 columnas)

```tsx
<div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
  {books.map((book) => (
    <BookCard key={book.id} book={book} />
  ))}
</div>
```

## 🚀 Performance Tips

1. **Image Optimization**
   - Usa `sizes` attribute para responsive images
   - `unoptimized: true` solo en desarrollo
   - En producción, usa CDN (Cloudinary, imgix)

2. **Lazy Loading**
   - Next.js Image component lazy load por defecto
   - Primeras imágenes usan `priority` si es necesario

3. **CSS Optimization**
   - Sombras son CSS puro (no requiere JavaScript)
   - Transiciones usan GPU (transform, opacity)

## 📚 Related Documentation

- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Tailwind Aspect Ratio](https://tailwindcss.com/docs/aspect-ratio)
- [CSS Box Shadow Generator](https://cssgenerator.org/box-shadow-css-generator.html)

---

**Last Updated:** 2025-12-28
**Design:** OpenLibrary-inspired
**Status:** ✅ Implemented
**Next:** Test responsive behavior across devices
