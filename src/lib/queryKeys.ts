/**
 * Query Keys Factory
 * Responsabilidad: Definir y exportar todas las query keys de forma centralizada y jerárquica
 * Ubicación: lib/queryKeys.ts
 * Convención: Jerárquico, determinístico, serializable
 */

import { BookListFilters, FavoriteListFilters } from '@/types/query.types';

/**
 * Factory para keys de libros (OpenLibrary)
 */
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (filters?: BookListFilters) => {
    const normalizedFilters = filters
      ? {
          query: filters.query?.trim().toLowerCase() || undefined,
          page: filters.page || 1,
          limit: filters.limit || 20,
        }
      : undefined;
    return [...bookKeys.lists(), normalizedFilters] as const;
  },
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
} as const;

/**
 * Factory para keys de favoritos (MockAPI)
 */
export const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  list: (filters?: FavoriteListFilters) => {
    // Preparado para futuros filtros
    return filters && Object.keys(filters).length > 0
      ? ([...favoriteKeys.lists(), filters] as const)
      : ([...favoriteKeys.lists()] as const);
  },
  details: () => [...favoriteKeys.all, 'detail'] as const,
  detail: (id: string) => [...favoriteKeys.details(), id] as const,
} as const;

/**
 * Query keys unificadas para fácil importación
 */
export const queryKeys = {
  books: bookKeys,
  favorites: favoriteKeys,
} as const;

export const mutationKeys = {
  favorites: {
    create: [...favoriteKeys.all, 'mutation', 'create'] as const,
    update: [...favoriteKeys.all, 'mutation', 'update'] as const,
    delete: [...favoriteKeys.all, 'mutation', 'delete'] as const,
  },
} as const;

// Tipos derivados para type-safety
export type BookKeys = typeof bookKeys;
export type FavoriteKeys = typeof favoriteKeys;
