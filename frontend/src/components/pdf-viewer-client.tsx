'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';

// Dynamically import react-pdf components to avoid SSR issues with DOMMatrix
const Document = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Cargando visor PDF...</span>
      </div>
    )
  }
);

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);

// Import pdfjs and configure worker
let pdfjs: any;
if (typeof window !== 'undefined') {
  import('react-pdf').then((mod) => {
    pdfjs = mod.pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  });

  // Import CSS styles
  import('react-pdf/dist/Page/AnnotationLayer.css');
  import('react-pdf/dist/Page/TextLayer.css');
}

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

  // Track reading time
  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!numPages || !onProgressUpdate) return;

    const interval = setInterval(() => {
      onProgressUpdate({
        currentPage,
        totalPages: numPages,
        zoomLevel,
        readingTime,
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, numPages, zoomLevel, readingTime, onProgressUpdate]);

  // Save progress when leaving the page
  useEffect(() => {
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
  }, [currentPage, numPages, zoomLevel, readingTime, onProgressUpdate]);

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
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{bookTitle}</h1>
            <p className="text-sm text-gray-500">
              {numPages ? `Página ${currentPage} de ${numPages}` : 'Cargando...'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Navigation */}
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

            {/* Zoom Controls */}
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

      {/* PDF Viewer */}
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
                'Authorization': `Bearer ${accessToken}`,
              } : undefined,
              withCredentials: false,
            }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="shadow-2xl"
            options={{
              cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
              cMapPacked: true,
              standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
            }}
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

      {/* Footer - Reading Progress */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Progreso: {numPages ? Math.round((currentPage / numPages) * 100) : 0}%
          </div>
          <div>
            Tiempo de lectura: {Math.floor(readingTime / 60)}m {readingTime % 60}s
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${numPages ? (currentPage / numPages) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
