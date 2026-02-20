'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { annotationsApi } from '@/services/annotations-api';
import type { Annotation } from '@/types/annotations';
import { toast } from 'sonner';

interface AnnotationCreateFormProps {
  bookId: number;
  currentPage: number;
  onAnnotationCreated: (annotation: Annotation) => void;
}

export function AnnotationCreateForm({
  bookId,
  currentPage,
  onAnnotationCreated,
}: AnnotationCreateFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(currentPage);
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('El contenido de la nota es requerido');
      return;
    }

    if (pageNumber < 1) {
      toast.error('El número de página debe ser mayor a 0');
      return;
    }

    setIsLoading(true);

    try {
      const newAnnotation = await annotationsApi.create({
        book: bookId,
        page_number: pageNumber,
        content: content.trim(),
        is_private: isPrivate,
      });

      toast.success('Nota creada exitosamente');
      onAnnotationCreated(newAnnotation);

      // Reset form
      setContent('');
      setIsPrivate(true);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error creating annotation:', error);
      toast.error('Error al crear la nota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsPrivate(true);
    setPageNumber(currentPage);
    setIsExpanded(false);
  };

  // Update page number when currentPage changes
  if (!isExpanded && pageNumber !== currentPage) {
    setPageNumber(currentPage);
  }

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="w-full mb-4"
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar Nota
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4">
      <h4 className="font-medium text-sm dark:text-white">Nueva Nota</h4>

      <div className="space-y-2">
        <Label htmlFor="page-number" className="text-sm">
          Página
        </Label>
        <Input
          id="page-number"
          type="number"
          min={1}
          value={pageNumber}
          onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
          className="w-24"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm">
          Contenido *
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu nota aquí..."
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-private"
          checked={isPrivate}
          onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
        />
        <Label htmlFor="is-private" className="text-sm cursor-pointer">
          Nota privada
        </Label>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !content.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
