'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, BookOpen, Eye, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { Progress } from '@/components/ui/progress';

interface FlipbookPreviewProps {
  pdfUrl: string;
  bookId: number;
  bookTitle: string;
  previewPages?: number;
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
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const { trialStatus, isLoading: trialLoading } = useTrialStatus();

  // Determine actual limit
  const hasSubscription = trialStatus?.has_active_subscription || trialStatus?.is_on_trial;
  const maxPages = hasSubscription ? (numPages || 1000) : previewPages;
  const isLimitReached = !hasSubscription && currentPage >= previewPages;

  // Load PDF.js from CDN
  useEffect(() => {
    setIsMounted(true);

    const loadPdfJs = async () => {
      if (typeof window === 'undefined') return;

      // Check if already loaded
      if ((window as any).pdfjsLib) return;

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadPdfJs().catch(err => {
      console.error('Failed to load PDF.js script', err);
      setError('Error al cargar el motor de visualización');
    });
  }, []);

  // Initialize PDF
  useEffect(() => {
    if (!isMounted || !pdfUrl) return;

    const initPdf = async () => {
      try {
        setLoading(true);
        // Wait for pdfjsLib to be available
        let attempts = 0;
        while (!(window as any).pdfjsLib && attempts < 50) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) throw new Error('PDF.js not loaded');

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error('PDF Init Error:', err);
        setError(`No se pudo cargar el libro: ${err.message}`);
        setLoading(false);
      }
    };

    initPdf();
  }, [isMounted, pdfUrl]);

  // Render Page
  const renderPage = useCallback(async (pageNo: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      // Cancel previous render if any
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNo);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Adjust scale based on container width
      const container = canvas.parentElement;
      const containerWidth = container?.clientWidth || 600;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth - 40) / unscaledViewport.width;
      const viewport = page.getViewport({ scale: Math.min(scale, 1.5) });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err: any) {
      if (err.name === 'RenderingCancelledException') return;
      console.error('Render Error:', err);
    }
  }, [pdfDoc]);

  useEffect(() => {
    if (pdfDoc && currentPage <= maxPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage, maxPages]);

  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => {
    if (currentPage < maxPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (!isMounted) return null;

  return (
    <Card className="overflow-hidden bg-zinc-950 border-zinc-800 shadow-2xl transition-all duration-500 hover:shadow-primary/5">
      <div className="flex flex-col min-h-[600px]">
        {/* Superior Toolbar */}
        <div className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-inner">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                Vista Previa <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-zinc-700">Read Inside</Badge>
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Página {currentPage} de {hasSubscription ? numPages : previewPages} {!hasSubscription && '(Límite gratuito)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hasSubscription && (
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 animate-pulse hidden sm:flex">
                Prueba de 10 páginas
              </Badge>
            )}
            <div className="bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-bold shadow-sm">
              {currentPage} / {numPages || '...'}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 flex items-center justify-center p-6 md:p-12 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-zinc-950/80 backdrop-blur-sm">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-primary animate-spin"></div>
                <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary/50" />
              </div>
              <p className="text-zinc-400 font-medium animate-pulse">Iniciando motor de lectura segura...</p>
            </div>
          )}

          {error && (
            <div className="text-center p-8 max-w-md animate-in fade-in slide-in-from-bottom-4">
              <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <Lock className="h-10 w-10 text-red-500" />
              </div>
              <h4 className="text-xl font-bold text-zinc-100 mb-2">Error de Lectura</h4>
              <p className="text-zinc-500 mb-8">{error}</p>
              <Button asChild className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
                <Link href={`/reader/${bookId}`}>Intentar abrir lector completo</Link>
              </Button>
            </div>
          )}

          <div className={`relative transition-all duration-700 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isLimitReached ? 'blur-md pointer-events-none' : ''}`}>
            <canvas ref={canvasRef} className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm border border-zinc-800" />
          </div>

          {/* Premium Overlay at Page 10 */}
          {isLimitReached && !loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-sm">
              <Card className="max-w-md w-full bg-zinc-900/90 border-zinc-800/50 shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                  <Zap className="h-10 w-10 text-white fill-white" />
                </div>
                <h3 className="text-2xl font-black text-zinc-100 mb-4 tracking-tight">¡Has descubierto un gran libro!</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  Has completado la vista previa de las primeras <strong>10 páginas</strong>.
                  Para continuar leyendo y acceder a nuestra biblioteca completa, suscríbete a un plan.
                </p>
                <div className="space-y-3">
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-lg border-0 shadow-lg shadow-amber-500/20 group">
                    <Link href="/pricing" className="flex items-center justify-center gap-2">
                      Suscribirme Ahora <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800">
                    Saber más sobre biblioteca
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-zinc-900 border-t border-zinc-800 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={goToPrevPage}
                disabled={currentPage <= 1 || loading}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all px-8 shrink-0"
              >
                <ChevronLeft className="h-5 w-5 mr-2" /> Anterior
              </Button>

              <div className="flex-1 flex flex-col gap-2">
                <Progress
                  value={(currentPage / maxPages) * 100}
                  className="h-2 bg-zinc-800"
                />
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-zinc-600">
                  <span>Inicio</span>
                  <span>{isLimitReached ? 'Límite alcanzado' : `${Math.round((currentPage / maxPages) * 100)}% de vista previa`}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={goToNextPage}
                disabled={currentPage >= maxPages || loading}
                className={`transition-all px-8 shrink-0 ${currentPage >= maxPages ? 'bg-zinc-800 border-zinc-700' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'}`}
              >
                Siguiente <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-zinc-500 text-xs">
              <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Lectura Protegida</span>
              <span className="flex items-center gap-1.5"><Eye className="h-3 w-3" /> Modo Concentración</span>
              <span className="flex items-center gap-1.5">← → Navegación ràpida</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
