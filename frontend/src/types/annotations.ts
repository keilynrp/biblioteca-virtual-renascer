// =============================================================================
// Annotation Types - Sprint 10
// =============================================================================

export interface Bookmark {
  id: number;
  user: number;
  book: number;
  book_title: string;
  book_slug: string;
  page_number: number;
  title: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BookmarkCreate {
  book: number;
  page_number: number;
  title?: string;
  notes?: string;
}

export interface BookmarkUpdate {
  page_number?: number;
  title?: string;
  notes?: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export interface HighlightPosition {
  start?: { offset: number; x: number; y: number };
  end?: { offset: number; x: number; y: number };
  rect?: { top: number; left: number; width: number; height: number };
}

export interface Highlight {
  id: number;
  user: number;
  book: number;
  book_title: string;
  book_slug: string;
  page_number: number;
  selected_text: string;
  color: HighlightColor;
  color_display: string;
  position_data: HighlightPosition;
  created_at: string;
  updated_at: string;
}

export interface HighlightCreate {
  book: number;
  page_number: number;
  selected_text: string;
  color: HighlightColor;
  position_data?: HighlightPosition;
}

export interface HighlightUpdate {
  color?: HighlightColor;
  position_data?: HighlightPosition;
}

export interface AnnotationPosition {
  x?: number;
  y?: number;
  [key: string]: any;
}

export interface Annotation {
  id: number;
  user: number;
  book: number;
  book_title: string;
  book_slug: string;
  page_number: number;
  highlight: number | null;
  highlight_data: Highlight | null;
  content: string;
  selected_text: string;
  position_data: AnnotationPosition;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnotationCreate {
  book: number;
  page_number: number;
  content: string;
  selected_text?: string;
  highlight?: number;
  position_data?: AnnotationPosition;
  is_private?: boolean;
}

export interface AnnotationUpdate {
  content?: string;
  selected_text?: string;
  position_data?: AnnotationPosition;
  is_private?: boolean;
}

// Color configuration
export const HIGHLIGHT_COLORS: Record<HighlightColor, { name: string; class: string; hex: string }> = {
  yellow: {
    name: 'Amarillo',
    class: 'bg-yellow-200 text-yellow-900',
    hex: '#fef08a',
  },
  green: {
    name: 'Verde',
    class: 'bg-green-200 text-green-900',
    hex: '#bbf7d0',
  },
  blue: {
    name: 'Azul',
    class: 'bg-blue-200 text-blue-900',
    hex: '#bfdbfe',
  },
  pink: {
    name: 'Rosa',
    class: 'bg-pink-200 text-pink-900',
    hex: '#fbcfe8',
  },
  purple: {
    name: 'Púrpura',
    class: 'bg-purple-200 text-purple-900',
    hex: '#e9d5ff',
  },
};
