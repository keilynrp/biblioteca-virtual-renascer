'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api, { getErrorMessage } from '@/lib/api';

// Load native PDF viewer (iframe-based, no SSR issues)
const PDFViewer = dynamic(() => import('@/components/pdf-viewer-native').then(mod => ({ default: mod.PDFViewerNative })), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600">Cargando visor PDF...</p>
    </div>
  ),
});

interface Book {
  id: number;
  title: string;
  slug: string;
  author: {
    id: number;
    name: string;
  } | null;
  cover_image: string | null;
}

interface Reading {
  id: number;
  book: Book | null;
  current_page: number | null;
  total_pages: number;
  progress_percentage: string;
  zoom_level: string | null;
  started_at: string;
  last_read_at: string;
  total_reading_time: number;
  is_finished: boolean;
  pages_remaining: number;
}

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuthStore();
  const bookId = parseInt(params.bookId as string);

  const [reading, setReading] = useState<Reading | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      router.push('/login');
      return;
    }

    initializeReading();
  }, [bookId, accessToken, isAuthenticated, router]);

  const initializeReading = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Reader] Initializing reading for book:', bookId);
      console.log('[Reader] Access token present:', !!accessToken);

      // Start or resume reading session using axios
      const response = await api.post(`/content/user/readings/start/${bookId}/`);

      console.log('[Reader] Reading session initialized:', response.data);
      setReading(response.data.reading);

      // Get PDF URL
      const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/content/books/${bookId}/file/`;
      console.log('[Reader] PDF URL:', pdfUrl);
      setPdfUrl(pdfUrl);

      setLoading(false);
    } catch (err) {
      console.error('[Reader] Error initializing reading:', err);
      const errorMessage = getErrorMessage(err);
      setError(`Error al iniciar la sesión de lectura: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (progress: {
    currentPage: number;
    totalPages: number;
    zoomLevel: number;
    readingTime: number;
  }) => {
    if (!accessToken) return;

    try {
      await api.patch(`/content/user/readings/${bookId}/progress/`, {
        current_page: progress.currentPage,
        zoom_level: progress.zoomLevel.toFixed(2),
        total_reading_time: reading ? reading.total_reading_time + progress.readingTime : progress.readingTime,
      });

      console.log('Progress saved successfully');
    } catch (err) {
      console.error('Error updating progress:', err);
      // Don't show error to user for progress updates (non-critical)
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando lector de documentos...</p>
      </div>
    );
  }

  if (error || !reading || !reading.book) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar el lector</h2>
        <p className="text-gray-600 mb-6">{error || 'No se pudo cargar el documento'}</p>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <PDFViewer
        bookId={bookId}
        bookTitle={reading.book.title}
        pdfUrl={pdfUrl || ''}
        initialPage={reading.current_page || 1}
        initialZoom={parseFloat(reading.zoom_level || '1.0')}
        accessToken={accessToken || undefined}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}
