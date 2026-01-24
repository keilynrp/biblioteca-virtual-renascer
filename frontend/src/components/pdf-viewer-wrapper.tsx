'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import PDF viewer to avoid SSR issues with DOMMatrix
const PDFViewerClient = dynamic(
  () => import('./pdf-viewer-native').then(mod => ({ default: mod.PDFViewerNative })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando visor de PDF...</p>
      </div>
    )
  }
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

export function PDFViewer(props: PDFViewerProps) {
  return <PDFViewerClient {...props} />;
}
