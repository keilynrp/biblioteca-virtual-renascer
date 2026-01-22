'use client';

import { FileText, Trash2, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Annotation } from '@/types/annotations';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AnnotationsListProps {
    annotations: Annotation[];
    currentPage: number;
    onNavigate: (page: number) => void;
    onDelete: (id: number) => void;
    isLoading: boolean;
}

export function AnnotationsList({
    annotations,
    currentPage,
    onNavigate,
    onDelete,
    isLoading,
}: AnnotationsListProps) {
    if (isLoading) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Cargando anotaciones...
            </div>
        );
    }

    const annotationsList = Array.isArray(annotations) ? annotations : [];

    if (annotationsList.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay anotaciones aún</p>
                <p className="text-sm mt-1">
                    Crea anotaciones para tus pensamientos y notas
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {annotationsList.length} anotación{annotationsList.length !== 1 ? 'es' : ''}
            </p>

            {annotationsList.map((annotation) => {
                const isCurrentPage = annotation.page_number === currentPage;

                return (
                    <Card
                        key={annotation.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${isCurrentPage ? 'border-primary bg-primary/5' : ''
                            }`}
                        onClick={() => onNavigate(annotation.page_number)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded">
                                            Página {annotation.page_number}
                                        </span>
                                        {annotation.is_private ? (
                                            <Lock className="w-3 h-3 text-gray-400" title="Privada" />
                                        ) : (
                                            <Globe className="w-3 h-3 text-primary/60" title="Pública" />
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                        {annotation.content}
                                    </p>

                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        {formatDistanceToNow(new Date(annotation.created_at), {
                                            addSuffix: true,
                                            locale: es,
                                        })}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('¿Eliminar esta anotación?')) {
                                            onDelete(annotation.id);
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
