'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Button } from './ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  Download,
  Maximize2,
  Moon,
  Sun,
  PanelRightOpen,
} from 'lucide-react';
import { BookmarkButton } from './reader/bookmark-button';
import { AnnotationsSidebar } from './reader/annotations-sidebar';

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
  bookId,
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef({ currentPage, zoomLevel, readingTime });

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('pdf-viewer-dark-mode');
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true');
    }
  }, []);

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

  // Debounced auto-save progress - only when values change
  useEffect(() => {
    if (!numPages || !onProgressUpdate) return;

    const currentProgress = { currentPage, totalPages: numPages, zoomLevel, readingTime };
    const lastProgress = lastSavedProgressRef.current;

    // Only save if something meaningfully changed
    const hasPageChanged = currentProgress.currentPage !== lastProgress.currentPage;
    const hasZoomChanged = Math.abs(currentProgress.zoomLevel - lastProgress.zoomLevel) > 0.01;
    const hasEnoughTimeElapsed = currentProgress.readingTime - lastProgress.readingTime >= 30;

    if (!hasPageChanged && !hasZoomChanged && !hasEnoughTimeElapsed) {
      return;
    }

    // Clear existing timer
    if (progressSaveTimerRef.current) {
      clearTimeout(progressSaveTimerRef.current);
    }

    // Set debounced timer - save after 3 seconds of inactivity
    progressSaveTimerRef.current = setTimeout(() => {
      console.log('[PDF Viewer] Auto-saving progress...');
      onProgressUpdate(currentProgress);
      lastSavedProgressRef.current = currentProgress;
    }, 3000);

    return () => {
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
    };
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

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('pdf-viewer-dark-mode', newDarkMode.toString());
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
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-3 sm:px-6 py-3 sm:py-4 shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="w-full sm:w-auto">
            <h1 className={`text-base sm:text-xl font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{bookTitle}</h1>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Página {currentPage} {numPages && `de ${numPages}`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto justify-end">
            {/* Navigation */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                title="Página anterior (←)"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 sm:gap-2">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1) {
                      setCurrentPage(page);
                    }
                  }}
                  className={`w-12 sm:w-16 px-1 sm:px-2 py-1 text-xs sm:text-sm text-center border rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min={1}
                />
                {numPages && (
                  <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>/ {numPages}</span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                title="Página siguiente (→)"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className={`flex items-center gap-1 sm:gap-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} border-l pl-2 sm:pl-4`}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                title="Alejar (-)"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>

              <span className={`text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px] text-center ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {Math.round(zoomLevel * 100)}%
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.0}
                title="Acercar (+)"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Additional Controls */}
            <div className={`flex items-center gap-1 sm:gap-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} border-l pl-2 sm:pl-4`}>
              <BookmarkButton
                bookId={bookId}
                pageNumber={currentPage}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title="Abrir anotaciones"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <PanelRightOpen className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreen}
                title="Pantalla completa"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 hidden sm:flex"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Descargar PDF"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 hidden sm:flex"
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                title={isDarkMode ? "Modo claro" : "Modo nocturno"}
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className={`flex-1 relative ${isDarkMode ? 'bg-gray-950' : 'bg-gray-800'}`}>
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-800'} z-10`}>
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
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-3 sm:px-6 py-2 sm:py-3`}>
        <div className={`flex items-center justify-between text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div>
            Progreso: {numPages ? Math.round((currentPage / numPages) * 100) : 0}%
          </div>
          <div className="hidden sm:block">
            Tiempo de lectura: {Math.floor(readingTime / 60)}m {readingTime % 60}s
          </div>
          <div className="sm:hidden">
            {Math.floor(readingTime / 60)}m {readingTime % 60}s
          </div>
        </div>

        {/* Progress Bar */}
        {numPages && (
          <div className={`mt-2 w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
            <div
              className={`${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${(currentPage / numPages) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint - Hidden on mobile */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'} border-t px-3 sm:px-6 py-2 text-center hidden sm:block`}>
        <p className="text-xs">
          💡 Usa las flechas ← → para navegar, + / - para zoom
        </p>
      </div>

      {/* Annotations Sidebar */}
      <AnnotationsSidebar
        bookId={bookId}
        currentPage={currentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigateToPage={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
