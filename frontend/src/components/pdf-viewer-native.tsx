'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  Maximize2,
  Moon,
  Sun,
  PanelRightOpen,
} from 'lucide-react';
import { BookmarkButton } from './reader/bookmark-button';
import { AnnotationsSidebar } from './reader/annotations-sidebar';

// PDF.js worker — renders via canvas, no browser native PDF toolbar appears
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerNativeProps {
  bookId: number;
  bookTitle: string;
  pdfUrl: string;
  initialPage?: number;
  initialZoom?: number;
  totalPages?: number;
  accessToken?: string;
  userRole?: string;
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
  totalPages: totalPagesProp,
  accessToken,
  onProgressUpdate,
}: PDFViewerNativeProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [numPages, setNumPages] = useState<number | null>(totalPagesProp || null);
  const [readingTime, setReadingTime] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef({ currentPage, zoomLevel, readingTime });

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('pdf-viewer-dark-mode');
    if (saved) setIsDarkMode(saved === 'true');
  }, []);

  // Measure container width for responsive page rendering
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track reading time
  useEffect(() => {
    const interval = setInterval(() => setReadingTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Debounced auto-save progress
  useEffect(() => {
    if (!numPages || !onProgressUpdate) return;
    const progress = { currentPage, totalPages: numPages, zoomLevel, readingTime };
    const last = lastSavedProgressRef.current;
    const hasPageChanged = progress.currentPage !== last.currentPage;
    const hasZoomChanged = Math.abs(progress.zoomLevel - last.zoomLevel) > 0.01;
    const hasEnoughTimeElapsed = progress.readingTime - last.readingTime >= 30;
    if (!hasPageChanged && !hasZoomChanged && !hasEnoughTimeElapsed) return;
    if (progressSaveTimerRef.current) clearTimeout(progressSaveTimerRef.current);
    progressSaveTimerRef.current = setTimeout(() => {
      onProgressUpdate(progress);
      lastSavedProgressRef.current = progress;
    }, 3000);
    return () => {
      if (progressSaveTimerRef.current) clearTimeout(progressSaveTimerRef.current);
    };
  }, [currentPage, numPages, zoomLevel, readingTime, onProgressUpdate]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (numPages && onProgressUpdate) {
        onProgressUpdate({ currentPage, totalPages: numPages, zoomLevel, readingTime });
      }
    };
  }, [currentPage, numPages, zoomLevel, readingTime, onProgressUpdate]);

  // Memoized PDF file config — prevents reloading on every render
  const pdfFile = useMemo(() => ({
    url: pdfUrl,
    httpHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  }), [pdfUrl, accessToken]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => (numPages ? Math.min(p + 1, numPages) : p + 1));
  }, [numPages]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((z) => Math.min(z + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => Math.max(z - 0.25, 0.5));
  }, []);

  const handleFullscreen = () => {
    if (viewerRef.current?.requestFullscreen) {
      viewerRef.current.requestFullscreen();
    }
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('pdf-viewer-dark-mode', next.toString());
  };

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPreviousPage();
      else if (e.key === 'ArrowRight') goToNextPage();
      else if (e.key === '+' || e.key === '=') handleZoomIn();
      else if (e.key === '-') handleZoomOut();
    },
    [goToPreviousPage, goToNextPage, handleZoomIn, handleZoomOut]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div
      ref={viewerRef}
      className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
    >
      {/* Header */}
      <div
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-3 sm:px-6 py-3 sm:py-4 shadow-sm`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="w-full sm:w-auto">
            <h1
              className={`text-base sm:text-xl font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {bookTitle}
            </h1>
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
                    if (page >= 1 && (!numPages || page <= numPages)) setCurrentPage(page);
                  }}
                  className={`w-12 sm:w-16 px-1 sm:px-2 py-1 text-xs sm:text-sm text-center border rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min={1}
                  max={numPages || undefined}
                />
                {numPages && (
                  <span
                    className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    / {numPages}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!!numPages && currentPage >= numPages}
                title="Página siguiente (→)"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom */}
            <div
              className={`flex items-center gap-1 sm:gap-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} border-l pl-2 sm:pl-4`}
            >
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
              <span
                className={`text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px] text-center ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
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
            <div
              className={`flex items-center gap-1 sm:gap-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} border-l pl-2 sm:pl-4`}
            >
              <BookmarkButton bookId={bookId} pageNumber={currentPage} />

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
                onClick={toggleDarkMode}
                title={isDarkMode ? 'Modo claro' : 'Modo nocturno'}
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Canvas Viewer — no browser native toolbar appears */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto ${isDarkMode ? 'bg-gray-950' : 'bg-gray-800'}`}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="flex justify-center min-h-full py-6">
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => console.error('[PDF Viewer] Load error:', err)}
            loading={
              <div className="flex flex-col items-center justify-center gap-4 text-white py-20">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p>Cargando documento...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center gap-4 text-white py-20">
                <p className="text-lg">No se pudo cargar el documento.</p>
              </div>
            }
          >
            {containerWidth > 0 && (
              <Page
                pageNumber={currentPage}
                width={containerWidth * zoomLevel}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div
                    className="flex items-center justify-center text-white py-10"
                    style={{ width: containerWidth * zoomLevel }}
                  >
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                }
              />
            )}
          </Document>
        </div>
      </div>

      {/* Footer — Reading Progress */}
      <div
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-3 sm:px-6 py-2 sm:py-3`}
      >
        <div
          className={`flex items-center justify-between text-xs sm:text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <div>Progreso: {numPages ? Math.round((currentPage / numPages) * 100) : 0}%</div>
          <div className="hidden sm:block">
            Tiempo de lectura: {Math.floor(readingTime / 60)}m {readingTime % 60}s
          </div>
          <div className="sm:hidden">
            {Math.floor(readingTime / 60)}m {readingTime % 60}s
          </div>
        </div>

        {numPages && (
          <div
            className={`mt-2 w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}
          >
            <div
              className={`${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${(currentPage / numPages) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div
        className={`${
          isDarkMode
            ? 'bg-gray-900 border-gray-800 text-gray-400'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        } border-t px-3 sm:px-6 py-2 text-center hidden sm:block`}
      >
        <p className="text-xs">Usa las flechas &larr; &rarr; para navegar, + / - para zoom</p>
      </div>

      {/* Annotations Sidebar */}
      <AnnotationsSidebar
        bookId={bookId}
        bookTitle={bookTitle}
        currentPage={currentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigateToPage={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
