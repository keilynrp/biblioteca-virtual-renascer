'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import {
  Maximize2,
  Moon,
  Sun,
  PanelRightOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';
import { BookmarkButton } from './reader/bookmark-button';
import { AnnotationsSidebar } from './reader/annotations-sidebar';
import api from '@/lib/api';

interface PDFViewerNativeProps {
  bookId: number;
  bookTitle: string;
  pdfUrl: string;
  initialPage?: number;
  initialZoom?: number;
  totalPages?: number;
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
  totalPages: totalPagesProp,
  onProgressUpdate,
}: PDFViewerNativeProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState<number | null>(totalPagesProp || null);
  const [zoomLevel, setZoomLevel] = useState(1.5); // 1.5x scale
  const [readingTime, setReadingTime] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReaderReady, setIsReaderReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  const viewerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('pdf-viewer-dark-mode');
    if (saved) setIsDarkMode(saved === 'true');
  }, []);

  // Fetch PDF as ArrayBuffer
  useEffect(() => {
    async function fetchPdf() {
      try {
        setLoading(true);
        setError(null);
        console.log('[PDF Viewer] Fetching PDF data...');

        const response = await api.get(pdfUrl, {
          responseType: 'arraybuffer',
        });

        console.log('[PDF Viewer] PDF data received, size:', response.data.byteLength);
        setPdfData(response.data);
      } catch (err: any) {
        console.error('[PDF Viewer] Fetch error:', err);
        setError('Error de conexión al cargar el libro. Por favor, intente de nuevo.');
        setLoading(false);
      }
    }

    fetchPdf();
  }, [pdfUrl]);

  // Handle messages from the iframe reader
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'READER_READY') {
        setIsReaderReady(true);
      } else if (data.type === 'PAGE_RENDERED') {
        setCurrentPage(data.pageNum);
        setNumPages(data.totalPages);
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send data to iframe when both data and iframe are ready
  useEffect(() => {
    if (isReaderReady && pdfData && iframeRef.current?.contentWindow) {
      console.log('[PDF Viewer] Sending data to iframe...');
      iframeRef.current.contentWindow.postMessage({
        type: 'LOAD_DATA',
        arrayBuffer: pdfData
      }, '*');
    }
  }, [isReaderReady, pdfData]);

  // Sync state changes to Iframe (Navigation & Zoom)
  useEffect(() => {
    if (isReaderReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'GOTO_PAGE',
        page: currentPage
      }, '*');
    }
  }, [currentPage, isReaderReady]);

  useEffect(() => {
    if (isReaderReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_ZOOM',
        zoom: zoomLevel
      }, '*');
    }
  }, [zoomLevel, isReaderReady]);

  // Track reading time
  useEffect(() => {
    const interval = setInterval(() => setReadingTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Update progress periodically
  useEffect(() => {
    if (!onProgressUpdate) return;
    const interval = setInterval(() => {
      onProgressUpdate({
        currentPage,
        totalPages: numPages || 0,
        zoomLevel: zoomLevel,
        readingTime
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [currentPage, numPages, zoomLevel, readingTime, onProgressUpdate]);

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

  return (
    <div
      ref={viewerRef}
      className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} select-none`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-3 sm:px-6 py-2 sm:py-3 shadow-sm relative z-20 transition-colors duration-200`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="w-full lg:w-auto">
            <h1
              className={`text-sm sm:text-lg font-semibold truncate max-w-[300px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {bookTitle}
            </h1>
            <p className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Lectura Protegida Renascer
            </p>
          </div>

          {/* Controls Container */}
          <div className="flex items-center gap-2 sm:gap-6 flex-wrap w-full lg:w-auto justify-between lg:justify-end">

            {/* Page Navigation */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1 || loading}
                title="Página anterior"
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
                  className={`w-10 sm:w-14 px-1 py-1 text-xs text-center border rounded-md transition-colors ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}
                  min={1}
                  max={numPages || undefined}
                />
                {numPages && (
                  <span
                    className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    / {numPages}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={(!!numPages && currentPage >= numPages) || loading}
                title="Página siguiente"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className={`flex items-center gap-1 sm:gap-2 border-l pl-2 sm:pl-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5 || loading}
                title="Alejar"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>

              <span className={`text-xs font-medium min-w-[40px] text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {Math.round(zoomLevel * 100)}%
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.0 || loading}
                title="Acercar"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Utility Controls */}
            <div className={`flex items-center gap-1 sm:gap-2 border-l pl-2 sm:pl-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <BookmarkButton bookId={bookId} pageNumber={currentPage} />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title="Anotaciones"
                className="h-8 w-8 p-0 sm:h-9"
              >
                <PanelRightOpen className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreen}
                title="Pantalla completa"
                className="h-8 w-8 p-0 hidden sm:flex"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                title={isDarkMode ? 'Modo claro' : 'Modo nocturno'}
                className="h-8 w-8 p-0"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Viewer Content */}
      <div className="flex-1 relative overflow-hidden bg-zinc-900/50">
        {error ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
            <p className="text-xl mb-4 text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
            </Button>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src="/reader/viewer.html"
              className="w-full h-full border-none"
              title={bookTitle}
            />

            {/* Security Overlay (Transparent, blocks some interactions) */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: 'transparent' }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-3 sm:px-6 py-2 relative z-20 transition-colors duration-200`}
      >
        <div className={`flex items-center justify-between text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Servidor Seguro</span>
            <span>•</span>
            <span>Tiempo: {Math.floor(readingTime / 60)}m {readingTime % 60}s</span>
          </div>
          <p className="italic font-medium text-red-500/80">Queda prohibida la reproducción o descarga total o parcial de este documento</p>
        </div>
      </div>

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
