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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { annotationsApi } from '@/services/annotations-api';
import type { Annotation } from '@/types/annotations';
import { userToast } from '@/lib/toast-utils';

interface AnnotationEditDialogProps {
  annotation: Annotation | null;
  isOpen: boolean;
  onClose: () => void;
  onAnnotationUpdated: (annotation: Annotation) => void;
}

export function AnnotationEditDialog({
  annotation,
  isOpen,
  onClose,
  onAnnotationUpdated,
}: AnnotationEditDialogProps) {
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when annotation changes
  useEffect(() => {
    if (annotation) {
      setContent(annotation.content || '');
      setIsPrivate(annotation.is_private);
    }
  }, [annotation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!annotation) return;

    if (!content.trim()) {
      userToast.error('El contenido de la nota es requerido');
      return;
    }

    setIsLoading(true);

    try {
      const updatedAnnotation = await annotationsApi.update(annotation.id, {
        content: content.trim(),
        is_private: isPrivate,
      });

      userToast.success('Nota actualizada exitosamente');
      onAnnotationUpdated(updatedAnnotation);
      onClose();
    } catch (error) {
      console.error('Error updating annotation:', error);
      userToast.error('Error al actualizar la nota');
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
          <DialogTitle>Editar Nota</DialogTitle>
          <DialogDescription>
            {annotation && `Página ${annotation.page_number}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="annotation-content">Contenido *</Label>
            <Textarea
              id="annotation-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="annotation-private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            />
            <Label htmlFor="annotation-private" className="text-sm cursor-pointer">
              Nota privada
            </Label>
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
            <Button type="submit" disabled={isLoading || !content.trim()}>
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
