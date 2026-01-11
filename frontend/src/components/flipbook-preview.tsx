'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Loader2, BookOpen, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// Dynamically import react-pdf components to avoid SSR issues with DOMMatrix
const Document = dynamic(
  () => import('react-pdf').then((mod) => {
    // Configure worker when module loads
    mod.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';
    return mod.Document;
  }),
  { ssr: false }
);

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);

interface FlipbookPreviewProps {
  pdfUrl: string;
  bookId: number;
  bookTitle: string;
  previewPages?: number; // Número de páginas a mostrar en preview
}

export function FlipbookPreview({
  pdfUrl,
  bookId,
  bookTitle,
  previewPages = 10
}: FlipbookPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Only render on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Responsive width
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('flipbook-container');
      if (container) {
        const width = container.offsetWidth;
        setPageWidth(Math.min(width - 40, 600)); // Max 600px
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (e.key === 'ArrowRight' && currentPage < Math.min(numPages, previewPages)) {
        setCurrentPage(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, numPages, previewPages]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Error al cargar la vista previa del libro');
    setLoading(false);
  };

  const goToPrevPage = () => {
    setCurrentPage(Math.max(1, currentPage - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(Math.min(Math.min(numPages, previewPages), currentPage + 1));
  };

  const isPreviewComplete = currentPage >= Math.min(numPages, previewPages);
  const maxPreviewPage = Math.min(numPages, previewPages);

  // Don't render anything on server side
  if (!isMounted) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 border-2">
        <div className="flex items-center justify-center min-h-[600px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 border-2">
      <div id="flipbook-container" className="relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Vista Previa</h3>
                <p className="text-sm text-muted-foreground">
                  Primeras {previewPages} páginas de {numPages || '...'} totales
                </p>
              </div>
            </div>

            {/* Page Counter */}
            <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm">
              <span className="text-sm font-medium">
                Página <span className="text-primary font-bold">{currentPage}</span> de {maxPreviewPage}
              </span>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex items-center justify-center bg-gradient-to-b from-muted/20 to-muted/40 p-8 min-h-[600px]">
          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
              <div>
                <p className="font-semibold text-lg mb-2">Error al cargar vista previa</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/reader/${bookId}`}>
                  Abrir lector completo
                </Link>
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="relative">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center min-h-[600px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                }
                className="flex justify-center"
              >
                <Page
                  pageNumber={currentPage}
                  width={pageWidth}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-2xl rounded-lg overflow-hidden border-2 border-border"
                />
              </Document>

              {/* Page Turn Animation Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 p-4 border-t">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Previous Button */}
            <Button
              onClick={goToPrevPage}
              disabled={currentPage <= 1 || loading}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            {/* Progress Bar */}
            <div className="flex-1 mx-6">
              <div className="relative">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300 ease-out"
                    style={{ width: `${(currentPage / maxPreviewPage) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Inicio</span>
                  <span className="text-xs text-muted-foreground">
                    {isPreviewComplete ? 'Fin de vista previa' : `${Math.round((currentPage / maxPreviewPage) * 100)}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <Button
              onClick={goToNextPage}
              disabled={currentPage >= maxPreviewPage || loading}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Read Full Book Button */}
          {isPreviewComplete && (
            <div className="mt-6 pt-6 border-t">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-6 text-center border border-primary/20">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">¿Te gusta lo que has visto?</h4>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Has llegado al final de la vista previa. Accede al libro completo con todas las funciones del lector avanzado.
                </p>
                <Button asChild size="lg" className="gap-2">
                  <Link href={`/reader/${bookId}`}>
                    <BookOpen className="h-5 w-5" />
                    Leer libro completo
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="bg-muted/30 px-4 py-2 text-center border-t">
          <p className="text-xs text-muted-foreground">
            💡 Usa las flechas del teclado ← → para navegar entre páginas
          </p>
        </div>
      </div>
    </Card>
  );
}
