'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDFViewer } from '@/components/pdf-viewer';
import { useAuthStore } from '@/store/authStore';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Book {
  id: number;
  title: string;
  slug: string;
  author: {
    id: number;
    name: string;
  };
  cover_image: string | null;
}

interface Reading {
  id: number;
  book: Book;
  current_page: number;
  total_pages: number;
  progress_percentage: string;
  zoom_level: string;
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

      // Start or resume reading session
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/content/user/readings/start/${bookId}/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || errorData?.error || `Error ${response.status}: ${response.statusText}`;
        console.error('Backend error:', errorData);
        throw new Error(`Error al iniciar la sesión de lectura: ${errorMessage}`);
      }

      const data = await response.json();
      setReading(data.reading);

      // Get PDF URL
      const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/content/books/${bookId}/file/`;
      setPdfUrl(pdfUrl);

      setLoading(false);
    } catch (err) {
      console.error('Error initializing reading:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/content/user/readings/${bookId}/progress/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_page: progress.currentPage,
            zoom_level: progress.zoomLevel.toFixed(2),
            total_reading_time: reading ? reading.total_reading_time + progress.readingTime : progress.readingTime,
          }),
        }
      );

      if (!response.ok) {
        console.error('Error updating reading progress');
      } else {
        console.log('Progress saved successfully');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
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

  if (error || !reading || !pdfUrl) {
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
        pdfUrl={pdfUrl}
        initialPage={reading.current_page}
        initialZoom={parseFloat(reading.zoom_level)}
        accessToken={accessToken || undefined}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}
