'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { bookmarksApi } from '@/services/annotations-api';
import type { Bookmark } from '@/types/annotations';
import { toast } from 'sonner';

interface BookmarkEditDialogProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmarkUpdated: (bookmark: Bookmark) => void;
}

export function BookmarkEditDialog({
  bookmark,
  isOpen,
  onClose,
  onBookmarkUpdated,
}: BookmarkEditDialogProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when bookmark changes
  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title || '');
      setNotes(bookmark.notes || '');
    }
  }, [bookmark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookmark) return;

    setIsLoading(true);

    try {
      const updatedBookmark = await bookmarksApi.update(bookmark.id, {
        title: title.trim(),
        notes: notes.trim(),
      });

      toast.success('Marcador actualizado exitosamente');
      onBookmarkUpdated(updatedBookmark);
      onClose();
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Error al actualizar el marcador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Marcador</DialogTitle>
          <DialogDescription>
            {bookmark && `Página ${bookmark.page_number}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookmark-title">Título</Label>
            <Input
              id="bookmark-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Capítulo importante"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookmark-notes">Notas</Label>
            <Textarea
              id="bookmark-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega notas adicionales..."
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
