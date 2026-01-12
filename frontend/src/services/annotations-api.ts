// =============================================================================
// Annotations API Client - Sprint 10
// =============================================================================

import api from '../lib/api';
import type {
  Bookmark,
  BookmarkCreate,
  BookmarkUpdate,
  Highlight,
  HighlightCreate,
  HighlightUpdate,
  Annotation,
  AnnotationCreate,
  AnnotationUpdate,
} from '@/types/annotations';

// =============================================================================
// Bookmarks API
// =============================================================================

export const bookmarksApi = {
  /**
   * Get all bookmarks for the current user
   */
  list: async (params?: { book?: number; page_number?: number; ordering?: string }) => {
    const response = await api.get<Bookmark[]>('/content/user/bookmarks/', { params });
    return response.data;
  },

  /**
   * Get bookmarks for a specific book
   */
  listByBook: async (bookId: number) => {
    const response = await api.get<Bookmark[]>('/content/user/bookmarks/', {
      params: { book: bookId, ordering: 'page_number' },
    });
    return response.data;
  },

  /**
   * Get a single bookmark by ID
   */
  get: async (id: number) => {
    const response = await api.get<Bookmark>(`/content/user/bookmarks/${id}/`);
    return response.data;
  },

  /**
   * Create a new bookmark
   */
  create: async (data: BookmarkCreate) => {
    const response = await api.post<Bookmark>('/content/user/bookmarks/', data);
    return response.data;
  },

  /**
   * Update a bookmark
   */
  update: async (id: number, data: BookmarkUpdate) => {
    const response = await api.patch<Bookmark>(`/content/user/bookmarks/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a bookmark
   */
  delete: async (id: number) => {
    await api.delete(`/content/user/bookmarks/${id}/`);
  },

  /**
   * Check if a page is bookmarked
   */
  isPageBookmarked: async (bookId: number, pageNumber: number) => {
    try {
      const bookmarks = await bookmarksApi.list({ book: bookId, page_number: pageNumber });
      return bookmarks.length > 0 ? bookmarks[0] : null;
    } catch (error) {
      return null;
    }
  },
};

// =============================================================================
// Highlights API
// =============================================================================

export const highlightsApi = {
  /**
   * Get all highlights for the current user
   */
  list: async (params?: {
    book?: number;
    page_number?: number;
    color?: string;
    ordering?: string;
  }) => {
    const response = await api.get<Highlight[]>('/content/user/highlights/', { params });
    return response.data;
  },

  /**
   * Get highlights for a specific book
   */
  listByBook: async (bookId: number) => {
    const response = await api.get<Highlight[]>('/content/user/highlights/', {
      params: { book: bookId, ordering: 'page_number,created_at' },
    });
    return response.data;
  },

  /**
   * Get highlights for a specific page
   */
  listByPage: async (bookId: number, pageNumber: number) => {
    const response = await api.get<Highlight[]>('/content/user/highlights/', {
      params: { book: bookId, page_number: pageNumber },
    });
    return response.data;
  },

  /**
   * Get a single highlight by ID
   */
  get: async (id: number) => {
    const response = await api.get<Highlight>(`/content/user/highlights/${id}/`);
    return response.data;
  },

  /**
   * Create a new highlight
   */
  create: async (data: HighlightCreate) => {
    const response = await api.post<Highlight>('/content/user/highlights/', data);
    return response.data;
  },

  /**
   * Update a highlight (e.g., change color)
   */
  update: async (id: number, data: HighlightUpdate) => {
    const response = await api.patch<Highlight>(`/content/user/highlights/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a highlight
   */
  delete: async (id: number) => {
    await api.delete(`/content/user/highlights/${id}/`);
  },
};

// =============================================================================
// Annotations API
// =============================================================================

export const annotationsApi = {
  /**
   * Get all annotations for the current user
   */
  list: async (params?: {
    book?: number;
    page_number?: number;
    is_private?: boolean;
    ordering?: string;
  }) => {
    const response = await api.get<Annotation[]>('/content/user/annotations/', { params });
    return response.data;
  },

  /**
   * Get annotations for a specific book
   */
  listByBook: async (bookId: number) => {
    const response = await api.get<Annotation[]>('/content/user/annotations/', {
      params: { book: bookId, ordering: 'page_number,created_at' },
    });
    return response.data;
  },

  /**
   * Get annotations for a specific page
   */
  listByPage: async (bookId: number, pageNumber: number) => {
    const response = await api.get<Annotation[]>('/content/user/annotations/', {
      params: { book: bookId, page_number: pageNumber },
    });
    return response.data;
  },

  /**
   * Get a single annotation by ID
   */
  get: async (id: number) => {
    const response = await api.get<Annotation>(`/content/user/annotations/${id}/`);
    return response.data;
  },

  /**
   * Create a new annotation
   */
  create: async (data: AnnotationCreate) => {
    const response = await api.post<Annotation>('/content/user/annotations/', data);
    return response.data;
  },

  /**
   * Update an annotation
   */
  update: async (id: number, data: AnnotationUpdate) => {
    const response = await api.patch<Annotation>(`/content/user/annotations/${id}/`, data);
    return response.data;
  },

  /**
   * Delete an annotation
   */
  delete: async (id: number) => {
    await api.delete(`/content/user/annotations/${id}/`);
  },
};
