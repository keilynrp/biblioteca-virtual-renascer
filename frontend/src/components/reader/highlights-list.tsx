'use client';

import { Highlighter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Highlight } from '@/types/annotations';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface HighlightsListProps {
    highlights: Highlight[];
    currentPage: number;
    onNavigate: (page: number) => void;
    onDelete: (id: number) => void;
    isLoading: boolean;
}

export function HighlightsList({
    highlights,
    currentPage,
    onNavigate,
    onDelete,
    isLoading,
}: HighlightsListProps) {
    if (isLoading) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Cargando resaltados...
            </div>
        );
    }

    const highlightsList = Array.isArray(highlights) ? highlights : [];

    if (highlightsList.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Highlighter className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay resaltados aún</p>
                <p className="text-sm mt-1">
                    Selecciona texto en el PDF para resaltar (próximamente)
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {highlightsList.length} resaltado{highlightsList.length !== 1 ? 's' : ''}
            </p>

            {highlightsList.map((highlight) => {
                const isCurrentPage = highlight.page_number === currentPage;

                return (
                    <Card
                        key={highlight.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${isCurrentPage ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
                            }`}
                        onClick={() => onNavigate(highlight.page_number)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: highlight.color || '#ffeb3b' }}
                                        />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Página {highlight.page_number}
                                        </span>
                                        {isCurrentPage && (
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                • Actual
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        {formatDistanceToNow(new Date(highlight.created_at), {
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
                                        if (confirm('¿Eliminar este resaltado?')) {
                                            onDelete(highlight.id);
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
