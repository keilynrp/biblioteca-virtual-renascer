#!/bin/bash

echo "========================================"
echo "FIX COMPLETO DEL PDF READER"
echo "========================================"
echo ""
echo "Este script aplicará TODOS los cambios necesarios:"
echo ""
echo "FRONTEND:"
echo " 1. Actualizar pdf-viewer.tsx (solucionar DOMMatrix)"
echo " 2. Actualizar pdfjs-config.ts"
echo " 3. Reiniciar contenedor frontend"
echo ""
echo "BACKEND:"
echo " 4. Aplicar migraciones (crear tabla readings)"
echo " 5. Reiniciar contenedor backend"
echo ""
echo "VERIFICACIÓN:"
echo " 6. Verificar estado de contenedores"
echo " 7. Mostrar libros disponibles"
echo ""
read -p "¿Continuar? (presiona Enter o Ctrl+C para cancelar) "

# =============================================================================
# PASO 1: ACTUALIZAR CÓDIGO DEL FRONTEND
# =============================================================================

echo ""
echo "========================================"
echo "PASO 1: Actualizando código del frontend"
echo "========================================"

# Backup
echo ""
echo "[1/3] Creando backups..."
cp frontend/src/components/pdf-viewer.tsx frontend/src/components/pdf-viewer.tsx.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp frontend/src/lib/pdfjs-config.ts frontend/src/lib/pdfjs-config.ts.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
echo "✓ Backups creados"

# Actualizar pdf-viewer.tsx
echo ""
echo "[2/3] Actualizando pdf-viewer.tsx..."
cat > frontend/src/components/pdf-viewer.tsx << 'EOFVIEWER'
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from './ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Import react-pdf components dynamically to prevent SSR issues
const Document = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);

interface PDFViewerProps {
  bookId: number;
  bookTitle: string;
  pdfUrl: string;
  initialPage?: number;
  initialZoom?: number;
  accessToken?: string;
  onProgressUpdate?: (progress: {
    currentPage: number;
    totalPages: number;
    zoomLevel: number;
    readingTime: number;
  }) => void;
}

export function PDFViewer({
  bookId,
  bookTitle,
  pdfUrl,
  initialPage = 1,
  initialZoom = 1.0,
  accessToken,
  onProgressUpdate,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're on client side
  useEffect(() => {
    setIsMounted(true);

    // Configure PDF.js worker on client side only
    if (typeof window !== 'undefined') {
      import('react-pdf').then((mod) => {
        const pdfjs = mod.pdfjs;
        pdfjs.GlobalWorkerOptions.workerSrc = \`https://unpkg.com/pdfjs-dist@\${pdfjs.version}/build/pdf.worker.min.mjs\`;
      });
    }
  }, []);

  // Track reading time
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMounted]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!isMounted || !numPages || !onProgressUpdate) return;

    const interval = setInterval(() => {
      onProgressUpdate({
        currentPage,
        totalPages: numPages,
        zoomLevel,
        readingTime,
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [isMounted, currentPage, numPages, zoomLevel, readingTime, onProgressUpdate]);

  // Save progress when leaving the page
  useEffect(() => {
    if (!isMounted) return;

    return () => {
      if (numPages && onProgressUpdate) {
        onProgressUpdate({
          currentPage,
          totalPages: numPages,
          zoomLevel,
          readingTime,
        });
      }
    };
  }, [isMounted, currentPage, numPages, zoomLevel, readingTime, onProgressUpdate]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Error al cargar el documento PDF. Por favor, intenta de nuevo.');
    setLoading(false);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages || prev));
  }, [numPages]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      goToPreviousPage();
    } else if (event.key === 'ArrowRight') {
      goToNextPage();
    } else if (event.key === '+' || event.key === '=') {
      handleZoomIn();
    } else if (event.key === '-') {
      handleZoomOut();
    }
  }, [goToPreviousPage, goToNextPage, handleZoomIn, handleZoomOut]);

  useEffect(() => {
    if (!isMounted) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMounted, handleKeyPress]);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando lector de documentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar el documento</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{bookTitle}</h1>
            <p className="text-sm text-gray-500">
              {numPages ? \`Página \${currentPage} de \${numPages}\` : 'Cargando...'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= (numPages || 1)) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md"
                  min={1}
                  max={numPages || 1}
                />
                <span className="text-sm text-gray-600">/ {numPages || '...'}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= (numPages || 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>

              <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.0}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-800">
        <div className="flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Cargando documento...</span>
            </div>
          )}

          <Document
            file={{
              url: pdfUrl,
              httpHeaders: accessToken ? {
                'Authorization': \`Bearer \${accessToken}\`,
              } : undefined,
              withCredentials: false,
            }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="shadow-2xl"
          >
            <Page
              pageNumber={currentPage}
              scale={zoomLevel}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="bg-white"
            />
          </Document>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Progreso: {numPages ? Math.round((currentPage / numPages) * 100) : 0}%
          </div>
          <div>
            Tiempo de lectura: {Math.floor(readingTime / 60)}m {readingTime % 60}s
          </div>
        </div>

        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: \`\${numPages ? (currentPage / numPages) * 100 : 0}%\` }}
          />
        </div>
      </div>
    </div>
  );
}
EOFVIEWER

echo "✓ pdf-viewer.tsx actualizado"

# Actualizar pdfjs-config.ts
echo ""
echo "[3/3] Actualizando pdfjs-config.ts..."
cat > frontend/src/lib/pdfjs-config.ts << 'EOFCONFIG'
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker - use CDN for compatibility
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = \`https://unpkg.com/pdfjs-dist@\${pdfjs.version}/build/pdf.worker.min.mjs\`;
}

export default pdfjs;
EOFCONFIG

echo "✓ pdfjs-config.ts actualizado"

# =============================================================================
# PASO 2: APLICAR MIGRACIONES DEL BACKEND
# =============================================================================

echo ""
echo "========================================"
echo "PASO 2: Aplicando migraciones del backend"
echo "========================================"
echo ""

echo "[1/2] Aplicando migraciones..."
docker compose exec -T backend python manage.py migrate

echo ""
echo "[2/2] Verificando tabla readings..."
docker compose exec -T backend python manage.py shell -c "
from apps.content.models import Reading
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT COUNT(*) FROM readings')
print(f'✓ Tabla readings existe. Registros: {cursor.fetchone()[0]}')
" || echo "⚠ Advertencia: No se pudo verificar la tabla readings"

# =============================================================================
# PASO 3: REINICIAR SERVICIOS
# =============================================================================

echo ""
echo "========================================"
echo "PASO 3: Reiniciando servicios"
echo "========================================"

echo ""
echo "[1/2] Reiniciando backend..."
docker compose restart backend
echo "Esperando 10 segundos..."
sleep 10

echo ""
echo "[2/2] Reiniciando frontend..."
docker compose restart frontend
echo "Esperando 20 segundos para que compile..."
sleep 20

# =============================================================================
# PASO 4: VERIFICACIÓN
# =============================================================================

echo ""
echo "========================================"
echo "PASO 4: Verificación"
echo "========================================"

echo ""
echo "[1/3] Estado de contenedores:"
docker compose ps

echo ""
echo "[2/3] Logs del frontend (últimas 20 líneas):"
docker compose logs frontend --tail=20

echo ""
echo "[3/3] Libros disponibles con PDF:"
docker compose exec -T backend python manage.py shell -c "
from apps.content.models import Book
books = Book.objects.exclude(file='')
count = books.count()
print(f'\n✓ Total de libros con PDF: {count}')
if count > 0:
    print('\nPrimeros 5 libros:')
    for b in books[:5]:
        print(f'  • ID {b.id}: {b.title}')
        print(f'    URL: http://localhost:3000/reader/{b.id}')
else:
    print('\n⚠ No hay libros con PDF. Importa algunos con:')
    print('   ./importar-100-libros.sh')
" || echo "⚠ No se pudo obtener la lista de libros"

# =============================================================================
# RESUMEN FINAL
# =============================================================================

echo ""
echo "========================================"
echo "✓ PROCESO COMPLETADO"
echo "========================================"
echo ""
echo "Cambios aplicados:"
echo " ✓ frontend/src/components/pdf-viewer.tsx"
echo " ✓ frontend/src/lib/pdfjs-config.ts"
echo " ✓ Migraciones de base de datos"
echo " ✓ Backend y frontend reiniciados"
echo ""
echo "IMPORTANTE - Pasos finales:"
echo " 1. Abre tu navegador"
echo " 2. Presiona Ctrl+Shift+R (hard refresh)"
echo "    o abre en ventana incógnita"
echo " 3. Accede a: http://localhost:3000/reader/[BOOK_ID]"
echo ""
echo "Si ves errores:"
echo " • Revisa DevTools Console (F12)"
echo " • Revisa DevTools Network tab"
echo " • Ejecuta: docker compose logs frontend --tail=50"
echo " • Ejecuta: docker compose logs backend --tail=50"
echo ""
echo "Backups guardados en:"
echo " → frontend/src/components/pdf-viewer.tsx.backup.*"
echo " → frontend/src/lib/pdfjs-config.ts.backup.*"
echo ""
