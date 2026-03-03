'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { bookmarksApi } from '@/services/annotations-api';
import type { Bookmark as BookmarkType } from '@/types/annotations';
import { userToast } from '@/lib/toast-utils';
import { useToast } from '@/hooks/use-toast';

interface BookmarkButtonProps {
  bookId: number;
  pageNumber: number;
  onBookmarkChange?: (bookmark: BookmarkType | null) => void;
}

export function BookmarkButton({ bookId, pageNumber, onBookmarkChange }: BookmarkButtonProps) {
  const [bookmark, setBookmark] = useState<BookmarkType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  // Check if page is bookmarked
  useEffect(() => {
    checkBookmark();
  }, [bookId, pageNumber]);

  const checkBookmark = async () => {
    try {
      const existingBookmark = await bookmarksApi.isPageBookmarked(bookId, pageNumber);
      setBookmark(existingBookmark);
      onBookmarkChange?.(existingBookmark);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleToggleBookmark = () => {
    if (bookmark) {
      // Delete bookmark
      handleDeleteBookmark();
    } else {
      // Show dialog to create bookmark
      setTitle(`Página ${pageNumber}`);
      setNotes('');
      setShowDialog(true);
    }
  };

  const handleCreateBookmark = async () => {
    setIsLoading(true);
    try {
      const newBookmark = await bookmarksApi.create({
        book: bookId,
        page_number: pageNumber,
        title: title.trim() || `Página ${pageNumber}`,
        notes: notes.trim(),
      });

      setBookmark(newBookmark);
      onBookmarkChange?.(newBookmark);
      setShowDialog(false);

      toast({
        title: 'Marcador creado',
        description: 'La página ha sido marcada exitosamente.',
      });
    } catch (error) {
      console.error('Error creating bookmark:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el marcador. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookmark = async () => {
    if (!bookmark) return;

    setIsLoading(true);
    try {
      await bookmarksApi.delete(bookmark.id);
      setBookmark(null);
      onBookmarkChange?.(null);

      toast({
        title: 'Marcador eliminado',
        description: 'El marcador ha sido eliminado.',
      });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el marcador.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleBookmark}
        disabled={isLoading}
        title={bookmark ? 'Eliminar marcador' : 'Agregar marcador'}
        className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
      >
        {bookmark ? (
          <BookmarkCheck className="w-4 h-4 text-blue-600" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar marcador</DialogTitle>
            <DialogDescription>
              Agrega un título y notas opcionales para este marcador.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Página ${pageNumber}`}
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agrega notas sobre esta página..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateBookmark} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar marcador'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
