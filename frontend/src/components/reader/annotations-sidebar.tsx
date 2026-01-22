'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark, Highlighter, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bookmarksApi, highlightsApi, annotationsApi } from '@/services/annotations-api';
import type { Bookmark as BookmarkType, Highlight, Annotation } from '@/types/annotations';
import { BookmarksList } from './bookmarks-list';
import { HighlightsList } from './highlights-list';
import { AnnotationsList } from './annotations-list';

interface AnnotationsSidebarProps {
  bookId: number;
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPage: (page: number) => void;
}

export function AnnotationsSidebar({
  bookId,
  currentPage,
  isOpen,
  onClose,
  onNavigateToPage,
}: AnnotationsSidebarProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookmarks');

  // Load data when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, bookId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookmarksData, highlightsData, annotationsData] = await Promise.all([
        bookmarksApi.listByBook(bookId),
        highlightsApi.listByBook(bookId),
        annotationsApi.listByBook(bookId),
      ]);

      // Ensure data is always an array
      setBookmarks(Array.isArray(bookmarksData) ? bookmarksData : []);
      setHighlights(Array.isArray(highlightsData) ? highlightsData : []);
      setAnnotations(Array.isArray(annotationsData) ? annotationsData : []);
    } catch (error) {
      console.error('Error loading annotations data:', error);
      // Reset to empty arrays on error
      setBookmarks([]);
      setHighlights([]);
      setAnnotations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookmark = async (id: number) => {
    try {
      await bookmarksApi.delete(id);
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleDeleteHighlight = async (id: number) => {
    try {
      await highlightsApi.delete(id);
      setHighlights(highlights.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Error deleting highlight:', error);
    }
  };

  const handleDeleteAnnotation = async (id: number) => {
    try {
      await annotationsApi.delete(id);
      setAnnotations(annotations.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting annotation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-white">Anotaciones</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Marcadores</span>
            <span className="sm:hidden">({bookmarks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="highlights" className="flex items-center gap-2">
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline">Resaltados</span>
            <span className="sm:hidden">({highlights.length})</span>
          </TabsTrigger>
          <TabsTrigger value="annotations" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Notas</span>
            <span className="sm:hidden">({annotations.length})</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="bookmarks" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <BookmarksList
                  bookmarks={bookmarks}
                  currentPage={currentPage}
                  onNavigate={onNavigateToPage}
                  onDelete={handleDeleteBookmark}
                  isLoading={isLoading}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="highlights" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <HighlightsList
                  highlights={highlights}
                  currentPage={currentPage}
                  onNavigate={onNavigateToPage}
                  onDelete={handleDeleteHighlight}
                  isLoading={isLoading}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="annotations" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <AnnotationsList
                  annotations={annotations}
                  currentPage={currentPage}
                  onNavigate={onNavigateToPage}
                  onDelete={handleDeleteAnnotation}
                  isLoading={isLoading}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
