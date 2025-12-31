# Diseño de Landing Page - Biblioteca Virtual Renascer Saber

## Visión General

La landing page está diseñada siguiendo los principios del sitio de referencia [bibliotecavirtual.renascerdosaber.com](https://bibliotecavirtual.renascerdosaber.com/), adaptada para Next.js 16 con React 19 y Tailwind CSS.

## Estructura de Secciones

### 1. Navigation Bar (Fixed)
**Ubicación**: Top fijo con backdrop blur
**Elementos**:
- Logo/icono de la biblioteca (lado izquierdo)
- Nombre "Biblioteca Virtual Renascer Saber"
- Botones de acción: "Iniciar Sesión" y "Registrarse"

**Características**:
- Fondo blanco semi-transparente con efecto backdrop-blur
- Sticky positioning (permanece visible al hacer scroll)
- Responsive: menú colapsable en móvil

### 2. Hero Section
**Ubicación**: Primera sección visible
**Diseño**: Grid de 2 columnas (1 columna en móvil)

**Columna Izquierda**:
- Badge destacado: "✨ Plataforma de Conocimiento Digital"
- Título principal: "Aumenta tu desempeño educacional" (con palabra clave resaltada en azul #398ffc)
- Descripción: Pitch de valor de la plataforma
- CTAs primarios:
  - "Comenzar Ahora" (botón principal azul)
  - "Explorar Biblioteca" (botón secundario outline)
- Estadísticas destacadas:
  - 10,000+ Libros Digitales
  - 500+ Instituciones
  - 24/7 Acceso Total

**Columna Derecha**:
- Card con gradiente azul
- Icono de GraduationCap
- Título: "Educación sin límites"
- Lista de beneficios con iconos:
  - Libros digitales ilimitados
  - Colaboración institucional
  - Contenido verificado
- Efecto de blur gradient en el fondo

### 3. Features Section
**Ubicación**: Sección central sobre fondo blanco
**Diseño**: Grid responsive de 3 columnas (2 en tablet, 1 en móvil)

**6 Feature Cards**:
1. **Biblioteca Personalizable** (Library icon, azul)
2. **Precios por Libro** (BookOpen icon, verde)
3. **Acreditación Institucional** (Shield icon, morado)
4. **Acceso 24/7** (Clock icon, naranja)
5. **Multi-usuario** (Users icon, rojo)
6. **Búsqueda Avanzada** (Search icon, cyan)

**Características de Cards**:
- Border de 2px que cambia a azul en hover
- Icono en círculo colorido (bg-[color]-100)
- Título semibold
- Descripción en texto gris
- Efecto de elevación (shadow-lg) en hover

### 4. CTA Section
**Ubicación**: Pre-footer
**Diseño**: Sección con gradiente azul (#398ffc a blue-600)
**Contenido**:
- Título grande: "¿Listo para transformar tu biblioteca?"
- Subtítulo: Mensaje de valor
- Dos CTAs:
  - "Comenzar Gratis" (botón blanco)
  - "Ver Planes" (botón outline blanco)

### 5. Footer
**Ubicación**: Parte inferior
**Diseño**: Grid de 4 columnas (1 en móvil)
**Fondo**: Gray-900 oscuro

**Columnas**:
1. **Branding** (2 columnas de ancho):
   - Logo e icono
   - Descripción breve de la plataforma
2. **Plataforma**:
   - Links a Biblioteca, Planes, Login, Registro
3. **Soporte**:
   - Links a Centro de Ayuda, Contacto, Términos, Privacidad

**Footer Bottom**:
- Copyright notice
- Border superior gris

## Paleta de Colores

### Colores Principales
- **Azul Primario**: `#398ffc` (Branding principal)
- **Azul Hover**: `#2976d4` (Estados hover)
- **Gradiente Azul**: `from-[#398ffc] to-blue-600`

### Colores de Iconos por Feature
- **Azul**: `bg-blue-100` con `text-[#398ffc]` (Biblioteca)
- **Verde**: `bg-green-100` con `text-green-600` (Precios)
- **Morado**: `bg-purple-100` con `text-purple-600` (Acreditación)
- **Naranja**: `bg-orange-100` con `text-orange-600` (Acceso)
- **Rojo**: `bg-red-100` con `text-red-600` (Multi-usuario)
- **Cyan**: `bg-cyan-100` con `text-cyan-600` (Búsqueda)

### Colores de Fondo
- **Principal**: `bg-gradient-to-b from-white to-blue-50/30`
- **Sección Features**: `bg-white`
- **Footer**: `bg-gray-900`

## Tipografía

### Jerarquía
- **H1 Hero**: `text-5xl lg:text-6xl font-bold`
- **H2 Secciones**: `text-4xl font-bold`
- **H3 Cards**: `text-xl font-semibold`
- **Párrafos**: `text-xl text-gray-600` (hero), `text-gray-600` (cards)
- **Small text**: `text-sm`, `text-xs`

### Font Family
- Default: Sistema sans-serif de Tailwind
- Weight range: 400 (normal), 600 (semibold), 700 (bold)

## Componentes UI Utilizados

### De shadcn/ui:
- `Button` - CTAs y navegación
- `Card` / `CardContent` - Feature cards y hero card

### De lucide-react:
- `BookOpen` - Logo y features
- `Users` - Multi-usuario
- `Clock` - Acceso 24/7
- `Shield` - Acreditación
- `GraduationCap` - Hero card
- `Library` - Biblioteca personalizable
- `Search` - Búsqueda avanzada
- `Sparkles` - CTA decorativo

## Responsive Design

### Breakpoints:
- **Mobile**: Base (< 640px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)

### Adaptaciones Responsive:

#### Navigation:
- Mobile: Puede requerir menú hamburguesa (futuro)
- Desktop: Links horizontales

#### Hero:
- Mobile: 1 columna, texto centrado
- Desktop: 2 columnas, hero a la izquierda

#### Features Grid:
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas

#### CTAs:
- Mobile: Botones apilados verticalmente
- Desktop: Botones en fila horizontal

#### Footer:
- Mobile: 1 columna apilada
- Desktop: 4 columnas

## Efectos y Animaciones

### Hover Effects:
- **Botones**: Cambio de color de fondo
- **Feature Cards**: Border color change + shadow elevation
- **Links**: Color change a azul

### Blur Effects:
- Navigation: `backdrop-blur-sm`
- Hero gradient background: `blur-3xl`

### Transitions:
- Cards: `transition-all` para suavizar hover
- Links: Transiciones automáticas de color

## Rutas y Navegación

### Links Implementados:
- `/` - Landing page (esta página)
- `/login` - Página de inicio de sesión
- `/register` - Página de registro
- `/library` - Explorar biblioteca
- `/plans` - Ver planes de suscripción

### Links de Footer (pendientes):
- Centro de Ayuda
- Contacto
- Términos
- Privacidad

## Optimizaciones Aplicadas

### Performance:
- `"use client"` - Client component para interactividad
- Gradientes CSS (no imágenes)
- Iconos SVG (lucide-react) escalables

### SEO:
- Estructura semántica HTML5 (`<nav>`, `<section>`, `<footer>`)
- Headings jerárquicos (h1, h2, h3)
- Textos descriptivos

### Accesibilidad:
- Contraste de colores WCAG AA
- Links con textos descriptivos
- Botones con áreas de click suficientes (px-8 py-6)

## Futuras Mejoras

### Fase 2:
1. **Integrar logo real** en `/public/logo.png` o `/public/logo.svg`
2. **Animaciones de entrada**: Framer Motion para scroll animations
3. **Video embed**: Agregar sección de video explicativo
4. **Testimonios**: Carousel de testimonios de instituciones
5. **Partners**: Logos de instituciones partner
6. **Proceso de 3 pasos**: Infografía visual del proceso de registro

### Fase 3:
1. **Formulario de contacto** integrado en landing
2. **Live chat** con soporte
3. **Búsqueda en vivo** preview de libros
4. **Estadísticas dinámicas** desde el backend
5. **A/B Testing** para optimizar conversión
6. **Analytics** tracking de conversiones

## Compatibilidad

- ✅ Next.js 16 App Router
- ✅ React 19
- ✅ Tailwind CSS 3
- ✅ TypeScript
- ✅ shadcn/ui components
- ✅ Responsive design (mobile-first)
- ✅ Dark mode ready (estructura preparada)

## Archivo de Implementación

**Ubicación**: `frontend/src/app/page.tsx`
**Tipo**: Client Component
**Dependencias**:
```typescript
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Clock, Shield, GraduationCap, Library, Search, Sparkles } from "lucide-react"
```

---

**Fecha**: 2025-12-27
**Versión**: 1.0.0
**Status**: ✅ Primera iteración completada
**Próximos pasos**: Integrar logo real, añadir animaciones, implementar formulario de contacto
