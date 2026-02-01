# 📸 Imágenes y Screenshots

Directorio de imágenes, capturas de pantalla y recursos visuales del proyecto.

## 📂 Estructura

```
images/
├── screenshots/           # Capturas de pantalla de la aplicación
│   ├── dashboard/        # Dashboard y home
│   ├── library/          # Catálogo y búsqueda
│   ├── reader/           # Lector PDF
│   ├── auth/             # Login y registro
│   ├── subscriptions/    # Planes y pagos
│   ├── profile/          # Perfil de usuario
│   ├── settings/         # Configuración
│   └── mobile/           # Vistas móviles
├── logos/                # Logos del proyecto
├── icons/                # Iconos y assets
└── diagrams/             # Diagramas técnicos
```

## 📸 Screenshots Necesarios

### Alta Prioridad

- [ ] Dashboard principal (desktop)
- [ ] Catálogo de libros con filtros
- [ ] Lector PDF con anotaciones
- [ ] Página de favoritos
- [ ] Planes de suscripción
- [ ] Personalizador de temas
- [ ] Login/Registro

### Media Prioridad

- [ ] Perfil de usuario
- [ ] Clubes de lectura
- [ ] Historial de lectura
- [ ] Notificaciones
- [ ] Admin panel
- [ ] Búsqueda con resultados

### Baja Prioridad

- [ ] Vistas móviles (responsive)
- [ ] Dark mode
- [ ] Cada tema disponible
- [ ] Proceso de checkout
- [ ] PWA installation prompt

## 📐 Especificaciones

### Tamaños Recomendados

| Tipo | Ancho | Alto | Formato |
|------|-------|------|---------|
| Desktop Full | 1920px | 1080px | PNG |
| Desktop Partial | 1200px | 800px | PNG |
| Mobile | 375px | 812px | PNG |
| Thumbnail | 400px | 300px | JPG |
| Logo | 512px | 512px | PNG/SVG |

### Guías de Captura

1. **Preparación**
   - Usar datos de prueba realistas (no "test test test")
   - Limpiar la consola del navegador
   - Cerrar extensiones innecesarias
   - Usar zoom 100%

2. **Captura**
   - Windows: `Win + Shift + S`
   - Mac: `Cmd + Shift + 4`
   - Linux: `Flameshot` o `Spectacle`

3. **Edición**
   - Ocultar información sensible
   - Agregar anotaciones si es necesario
   - Optimizar tamaño del archivo
   - Usar nombres descriptivos

### Nomenclatura de Archivos

```
{seccion}-{vista}-{estado}-{resolucion}.png

Ejemplos:
dashboard-home-desktop-1920x1080.png
library-catalog-filtered-1200x800.png
reader-pdf-annotations-desktop.png
auth-login-mobile-375x812.png
themes-customizer-desktop.png
```

## 🎨 Estándares Visuales

### Elementos a Incluir

- ✅ UI completa (no crops arbitrarios)
- ✅ Datos de ejemplo realistas
- ✅ Estado interactivo (hover, focus, etc.)
- ✅ Diferentes estados de la app

### Elementos a Evitar

- ❌ Información sensible (emails reales, tokens)
- ❌ Watermarks o logos externos
- ❌ Baja calidad o borroso
- ❌ UI incompleta o en desarrollo

## 🔄 Actualización de Screenshots

Los screenshots deben actualizarse cuando:

- Se rediseña una sección importante
- Se agregan features visuales significativas
- Cambia la identidad visual del proyecto
- Se reportan screenshots desactualizados

## 📝 Cómo Agregar Screenshots

1. Capturar la imagen según especificaciones
2. Editar y optimizar
3. Guardar en la carpeta apropiada
4. Actualizar README.md con la imagen
5. Commit y PR

### Ejemplo de Uso en Markdown

```markdown
### Dashboard Principal

![Dashboard](docs/images/screenshots/dashboard/dashboard-home-desktop-1920x1080.png)

*Vista principal del dashboard con estadísticas de lectura*
```

## 🛠️ Herramientas Recomendadas

### Captura
- **Windows**: Snipping Tool, ShareX
- **Mac**: Built-in Screenshot, CleanShot X
- **Linux**: Flameshot, Spectacle
- **Multi-platform**: Browser DevTools

### Edición
- **Básica**: Paint, Preview
- **Avanzada**: GIMP, Photoshop, Figma
- **Anotación**: Skitch, Greenshot

### Optimización
- **Online**: TinyPNG, Squoosh
- **CLI**: ImageOptim, pngquant
- **Batch**: ImageMagick

## 📊 Estado Actual

```
Total Screenshots:     0 / 20 (0%)
Alta Prioridad:        0 / 7
Media Prioridad:       0 / 6
Baja Prioridad:        0 / 7

Última Actualización:  Pendiente
```

---

## 📞 Contacto

¿Necesitas ayuda con screenshots?

- Abre un [Issue](https://github.com/tu-usuario/bvs_framework/issues)
- Pregunta en [Discussions](https://github.com/tu-usuario/bvs_framework/discussions)

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>
