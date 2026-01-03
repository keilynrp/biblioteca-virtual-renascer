'use client';

import { useEffect, useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

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

const ReadingItem = memo(({ reading }: { reading: Reading }) => {
  const progressPercent = parseFloat(reading.progress_percentage);
  const readingTimeMinutes = Math.floor(reading.total_reading_time / 60);

  return (
    <Link href={`/reader/${reading.book.id}`} className="group block">
      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted transition-all duration-200 border border-transparent hover:border-primary/30">
        {/* Book Cover */}
        <div className="relative h-24 w-16 flex-shrink-0 rounded overflow-hidden bg-gradient-to-br from-primary/10 to-primary-dark/10 shadow-sm group-hover:shadow-md transition-shadow">
          {reading.book.cover_image ? (
            <Image
              src={reading.book.cover_image}
              alt={reading.book.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary/50" />
            </div>
          )}
        </div>

        {/* Reading Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {reading.book.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {reading.book.author.name}
          </p>

          {/* Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Página {reading.current_page} de {reading.total_pages}</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Reading Time */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{readingTimeMinutes}m de lectura</span>
            </div>
            {reading.is_finished && (
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full font-medium">
                Completado
              </span>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex-shrink-0 self-center">
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Continuar
          </Button>
        </div>
      </div>
    </Link>
  );
});

ReadingItem.displayName = 'ReadingItem';

export function ContinueReading() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    fetchReadings();
  }, [accessToken, isAuthenticated]);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/content/user/readings/');
      setReadings(response.data);
    } catch (err) {
      console.error('Error fetching readings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-6">Continuar Leyendo</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || readings.length === 0) {
    return null; // Don't show the section if no readings
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Continuar Leyendo</h2>
        {readings.length > 3 && (
          <Link href="/reading-history">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
              Ver todo
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {readings.slice(0, 3).map((reading) => (
          <ReadingItem key={reading.id} reading={reading} />
        ))}
      </div>

      {readings.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">No has iniciado ninguna lectura</p>
          <Link href="/library">
            <Button variant="outline" className="hover:bg-primary/10 hover:border-primary transition-all">
              Explorar Biblioteca
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
