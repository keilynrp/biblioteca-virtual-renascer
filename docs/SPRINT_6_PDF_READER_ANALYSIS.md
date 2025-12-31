# Sprint 6: Análisis de Lector de Documentos PDF

## Fecha: 30 de Diciembre de 2024

## 📋 Objetivo del Sprint

Implementar un lector básico de PDF que permita a los usuarios leer libros directamente en el navegador con las siguientes características:
- Renderizado de PDF
- Navegación entre páginas
- Zoom y ajustes de visualización
- Tracking automático de progreso
- Retomar lectura desde última página

---

## 🔍 Análisis de Librerías PDF

### Opción 1: **react-pdf** (vDOMCOMMANDit-pdf)

#### Pros:
- ✅ Wrapper oficial de React para PDF.js
- ✅ Fácil integración con React 19
- ✅ Componentes React nativos (`<Document>`, `<Page>`)
- ✅ Hooks modernos y API limpia
- ✅ TypeScript support nativo
- ✅ Lazy loading de páginas
- ✅ Buena documentación
- ✅ Activamente mantenido (última actualización reciente)
- ✅ Tamaño bundle razonable (~200KB con PDF.js)

#### Contras:
- ⚠️ Requiere configuración adicional para Worker
- ⚠️ Algunos edge cases con PDFs complejos
- ⚠️ Performance puede degradarse con PDFs muy grandes (>500 páginas)

#### Instalación:
```bash
npm install react-pdf pdfjs-dist
```

#### Ejemplo de Uso:
```tsx
import { Document, Page } from 'react-pdf';

function PDFViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <Document
      file={file}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
    >
      <Page pageNumber={pageNumber} />
    </Document>
  );
}
```

---

### Opción 2: **PDF.js** (Mozilla) - Directo

#### Pros:
- ✅ La biblioteca más robusta y madura
- ✅ Usado por Firefox y muchas aplicaciones grandes
- ✅ Control total sobre renderizado
- ✅ Excelente performance
- ✅ Soporta anotaciones avanzadas
- ✅ Búsqueda dentro del PDF
- ✅ Renderizado de capas y vectores

#### Contras:
- ⚠️ Integración manual con React más compleja
- ⚠️ API de bajo nivel, requiere más código
- ⚠️ Necesita manejo manual de Canvas y eventos
- ⚠️ Curva de aprendizaje más pronunciada
- ⚠️ Mayor tiempo de desarrollo

#### Instalación:
```bash
npm install pdfjs-dist
```

---

### Opción 3: **@react-pdf-viewer/core**

#### Pros:
- ✅ Componente completo con UI incluida
- ✅ Plugins para toolbar, thumbnails, búsqueda
- ✅ Muy fácil de usar "out of the box"
- ✅ Apariencia profesional por defecto

#### Contras:
- ⚠️ Menos flexible para personalización
- ⚠️ Bundle más pesado (~400KB)
- ⚠️ Puede ser "overkill" para nuestras necesidades
- ⚠️ Estilos predefinidos difíciles de personalizar

---

## 🎯 Recomendación: **react-pdf**

### Razones:

1. **Balance perfecto** entre facilidad de uso y flexibilidad
2. **Integración nativa con React 19** y nuestro stack
3. **TypeScript support** completo
4. **Performance adecuada** para la mayoría de PDFs (<500 páginas)
5. **Comunidad activa** y bien documentado
6. **Permite personalización** completa de UI
7. **Tamaño razonable** del bundle
8. **Compatible con Next.js** App Router

### Casos de Uso Cubiertos:
- ✅ Renderizado básico de PDF
- ✅ Navegación entre páginas
- ✅ Zoom (scale)
- ✅ Lazy loading
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

---

## 🏗️ Arquitectura Propuesta

### Backend (Django)

#### 1. Modelo `Reading`
```python
class Reading(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    current_page = models.IntegerField(default=1)
    total_pages = models.IntegerField(null=True, blank=True)
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'book')
        ordering = ['-last_read_at']
```

#### 2. Endpoints API
```
POST   /api/reading/start/          - Iniciar lectura de un libro
GET    /api/reading/progress/{id}/  - Obtener progreso de un libro
PATCH  /api/reading/progress/{id}/  - Actualizar progreso
GET    /api/reading/continue/       - Obtener últimas lecturas
GET    /api/books/{id}/file/        - Servir archivo PDF (protegido)
```

#### 3. Permisos y Seguridad
- Verificar suscripción activa antes de servir PDF
- Usar signed URLs o tokens temporales
- Streaming de archivos para mejor performance
- Rate limiting en endpoints de PDF

---

### Frontend (Next.js + React)

#### 1. Componente `PDFViewer`
```tsx
// components/pdf-viewer.tsx
'use client';

interface PDFViewerProps {
  bookId: number;
  bookTitle: string;
  pdfUrl: string;
  initialPage?: number;
}

export function PDFViewer({
  bookId,
  bookTitle,
  pdfUrl,
  initialPage = 1
}: PDFViewerProps) {
  // Estados
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-save progress cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress(bookId, currentPage, numPages);
    }, 30000);

    return () => clearInterval(interval);
  }, [bookId, currentPage, numPages]);

  // Componente de renderizado
  return (
    <div className="pdf-viewer">
      <PDFToolbar
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        onPageChange={setCurrentPage}
        onScaleChange={setScale}
      />
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<PDFSkeleton />}
        error={<PDFError />}
      >
        <Page
          pageNumber={currentPage}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
}
```

#### 2. Ruta del Lector
```
/dashboard/reader/[bookId]  - Página del lector
```

#### 3. Features Adicionales
- Keyboard shortcuts (← → para navegar)
- Pantalla completa
- Modo oscuro para lectura nocturna
- Indicador de progreso visual
- Botón "Guardar página" manual

---

## 📦 Dependencias a Instalar

### Backend
```bash
# Ya tenemos lo necesario
pip install Pillow  # Para thumbnails (si lo usamos después)
```

### Frontend
```bash
npm install react-pdf pdfjs-dist
npm install --save-dev @types/react-pdf
```

---

## 🚀 Plan de Implementación (2 semanas)

### Semana 1: Backend + Modelo

#### Día 1-2: Modelo y Migraciones
- [x] Crear modelo `Reading`
- [ ] Crear migración
- [ ] Agregar índices para performance
- [ ] Crear serializers

#### Día 3-4: Endpoints API
- [ ] ViewSet para Reading
- [ ] Endpoint de inicio de lectura
- [ ] Endpoint de actualización de progreso
- [ ] Endpoint para obtener últimas lecturas
- [ ] Tests unitarios

#### Día 5: Sistema de Archivos
- [ ] Endpoint para servir PDFs
- [ ] Autenticación y permisos
- [ ] Verificación de suscripción
- [ ] Streaming de archivos
- [ ] Tests de seguridad

---

### Semana 2: Frontend + Integración

#### Día 1-2: Componente PDFViewer Base
- [ ] Setup de react-pdf
- [ ] Configuración de Worker
- [ ] Componente básico de visualización
- [ ] Navegación entre páginas
- [ ] Zoom controls

#### Día 3: Features Avanzadas
- [ ] Auto-guardado de progreso
- [ ] Loading states
- [ ] Error handling
- [ ] Keyboard shortcuts
- [ ] Responsive design

#### Día 4: Página del Lector
- [ ] Ruta /dashboard/reader/[bookId]
- [ ] Integración con API
- [ ] Recuperar progreso guardado
- [ ] Toolbar completo
- [ ] Modo pantalla completa

#### Día 5: "Continuar Leyendo" + Testing
- [ ] Componente en dashboard
- [ ] Lista de últimas lecturas
- [ ] Testing E2E completo
- [ ] Optimización de performance
- [ ] Documentación

---

## ✅ Criterios de Aceptación

### Funcionalidad
- [ ] Usuario puede abrir y leer un PDF
- [ ] Navegación entre páginas funciona (botones + teclado)
- [ ] Zoom in/out funciona correctamente
- [ ] Progreso se guarda automáticamente cada 30 segundos
- [ ] Progreso se guarda al cambiar de página
- [ ] Al abrir un libro, se reanuda desde última página
- [ ] Solo usuarios autenticados pueden acceder
- [ ] Solo usuarios con suscripción activa pueden leer

### Performance
- [ ] PDF carga en menos de 3 segundos (100 páginas)
- [ ] Cambio de página es instantáneo (<100ms)
- [ ] No hay memory leaks
- [ ] Soporta PDFs de hasta 500 páginas sin degradación

### UX/UI
- [ ] Loading skeleton mientras carga PDF
- [ ] Mensajes de error claros
- [ ] Indicador de progreso visible
- [ ] Controles intuitivos
- [ ] Responsive en mobile y desktop

### Seguridad
- [ ] PDFs solo accesibles por usuarios autenticados
- [ ] Verificación de suscripción activa
- [ ] No se pueden descargar PDFs directamente
- [ ] URLs de PDF no son adivinables

---

## 🎨 Diseño de UI

### Toolbar
```
[←] [→] | Página: [5 / 120] | [-] [100%] [+] | [⛶ Pantalla Completa]
```

### Layout
```
┌────────────────────────────────────────┐
│  [Toolbar]                             │
├────────────────────────────────────────┤
│                                        │
│                                        │
│          [PDF Content]                 │
│                                        │
│                                        │
├────────────────────────────────────────┤
│  Progreso: ████████░░ 80%              │
└────────────────────────────────────────┘
```

---

## 🔧 Configuración Técnica

### Next.js Config
```js
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};
```

### PDF.js Worker
```tsx
// app/layout.tsx o componente raíz
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
```

---

## 📊 Métricas de Éxito

### KPIs
- **Tiempo de carga inicial**: < 3 segundos
- **Tasa de error**: < 1%
- **Engagement**: Usuarios leen al menos 5 páginas por sesión
- **Retención de progreso**: 98% de precisión
- **Performance Score**: > 85 (Lighthouse)

---

## 🚨 Riesgos y Mitigaciones

### Riesgo 1: PDFs muy grandes (>500 páginas)
**Mitigación**:
- Implementar lazy loading estricto
- Cargar solo página visible + 1 anterior + 1 siguiente
- Limit de tamaño de archivo (100MB max)

### Riesgo 2: Performance en mobile
**Mitigación**:
- Scale adaptativo según device
- Reducir calidad de renderizado en mobile
- Touch gestures optimizados

### Riesgo 3: Compatibilidad de navegadores
**Mitigación**:
- Testing en Chrome, Firefox, Safari, Edge
- Fallback para navegadores antiguos
- Mensaje de actualización de navegador

### Riesgo 4: Seguridad de archivos
**Mitigación**:
- Signed URLs con expiración
- Rate limiting agresivo
- Watermarking (Sprint 7)

---

## 📚 Referencias

- [react-pdf Documentation](https://github.com/wojtekmaj/react-pdf)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Next.js Custom Webpack Config](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)

---

## 🎯 Próximos Pasos (Sprint 7)

Después de completar Sprint 6, en Sprint 7 agregaremos:
- Marcadores de páginas
- Anotaciones y highlights
- Exportar notas
- Búsqueda dentro del documento
- Watermarking

---

**Creado**: 30 de Diciembre de 2024
**Sprint**: 6 - Lector de Documentos Fase 1
**Duración Estimada**: 2 semanas
**Prioridad**: ALTA
