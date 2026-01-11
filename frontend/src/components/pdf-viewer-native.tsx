'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  Download,
  Maximize2,
} from 'lucide-react';

interface PDFViewerNativeProps {
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

export function PDFViewerNative({
  bookTitle,
  pdfUrl,
  initialPage = 1,
  initialZoom = 1.0,
  accessToken,
  onProgressUpdate,
}: PDFViewerNativeProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Construct PDF URL with page parameter and authentication token
  const getPdfUrlWithPage = useCallback(() => {
    const url = new URL(pdfUrl, window.location.origin);

    // Add authentication token to query params
    if (accessToken) {
      url.searchParams.set('token', accessToken);
    }

    // Add page and zoom to hash
    url.hash = `page=${currentPage}&zoom=${Math.round(zoomLevel * 100)}`;

    console.log('[PDF Viewer] URL generated:', url.toString());
    return url.toString();
  }, [pdfUrl, currentPage, zoomLevel, accessToken]);

  // Auto-hide loader after 2 seconds (object load event is unreliable)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[PDF Viewer] Auto-hiding loader after timeout');
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, numPages, zoomLevel, readingTime, onProgressUpdate]);

  // Save progress on unmount
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

  // Estimate number of pages (we can't get exact count from iframe, so use a reasonable estimate)
  // In production, you'd want to get this from your backend
  useEffect(() => {
    // Set a default or fetch from backend
    setNumPages(100); // Placeholder - should come from backend
  }, []);

  const handleLoad = () => {
    console.log('[PDF Viewer] iframe loaded successfully');
    setIsLoading(false);
  };

  const handleError = () => {
    console.error('[PDF Viewer] Error loading PDF in iframe');
    setEmbedError(true);
    setIsLoading(false);
  };

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  const handleOpenInNewTab = () => {
    window.open(getPdfUrlWithPage(), '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getPdfUrlWithPage();
    link.download = `${bookTitle}.pdf`;
    link.click();
  };

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (event.key === 'ArrowRight') {
        goToNextPage();
      } else if (event.key === '+' || event.key === '=') {
        handleZoomIn();
      } else if (event.key === '-') {
        handleZoomOut();
      }
    },
    [goToPreviousPage, goToNextPage, handleZoomIn, handleZoomOut]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{bookTitle}</h1>
            <p className="text-sm text-gray-500">
              Página {currentPage} {numPages && `de ${numPages}`}
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
                title="Página anterior (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md"
                  min={1}
                />
                {numPages && (
                  <span className="text-sm text-gray-600">/ {numPages}</span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                title="Página siguiente (→)"
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
                title="Alejar (-)"
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
                title="Acercar (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                title="Abrir en nueva pestaña"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreen}
                title="Pantalla completa"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Descargar PDF"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative bg-gray-800">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="flex flex-col items-center gap-4 text-white">
              <Loader2 className="w-12 h-12 animate-spin" />
              <p>Cargando documento PDF...</p>
            </div>
          </div>
        )}

        {embedError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
            <p className="text-lg">No se puede mostrar el PDF en esta ventana</p>
            <Button
              onClick={handleOpenInNewTab}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Abrir PDF en nueva pestaña
            </Button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={getPdfUrlWithPage()}
            className="w-full h-full border-0"
            title={`PDF Viewer - ${bookTitle}`}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
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
        {numPages && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / numPages) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-2 text-center">
        <p className="text-xs text-gray-500">
          💡 Usa las flechas ← → para navegar, + / - para zoom
        </p>
      </div>
    </div>
  );
}
