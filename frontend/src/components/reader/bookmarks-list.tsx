'use client';

import { Bookmark, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Bookmark as BookmarkType } from '@/types/annotations';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface BookmarksListProps {
  bookmarks: BookmarkType[];
  currentPage: number;
  onNavigate: (page: number) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export function BookmarksList({
  bookmarks,
  currentPage,
  onNavigate,
  onDelete,
  isLoading,
}: BookmarksListProps) {
  if (isLoading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Cargando marcadores...
      </div>
    );
  }

  // Defensive check: ensure bookmarks is always an array
  const bookmarksList = Array.isArray(bookmarks) ? bookmarks : [];

  if (bookmarksList.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No hay marcadores aún</p>
        <p className="text-sm mt-1">
          Usa el botón de marcador para guardar páginas importantes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {bookmarksList.length} marcador{bookmarksList.length !== 1 ? 'es' : ''}
      </p>

      {bookmarksList.map((bookmark) => {
        const isCurrentPage = bookmark.page_number === currentPage;

        return (
          <Card
            key={bookmark.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
              isCurrentPage ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
            }`}
            onClick={() => onNavigate(bookmark.page_number)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Page number badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                      Página {bookmark.page_number}
                    </span>
                    {isCurrentPage && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        • Actual
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  {bookmark.title && (
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {bookmark.title}
                    </h4>
                  )}

                  {/* Notes */}
                  {bookmark.notes && (
                    <div className="flex items-start gap-2 mt-2">
                      <FileText className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {bookmark.notes}
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(bookmark.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('¿Eliminar este marcador?')) {
                      onDelete(bookmark.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
