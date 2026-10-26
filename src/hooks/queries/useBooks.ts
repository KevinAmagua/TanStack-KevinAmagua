/**
 * useBooks Hook
 * Responsabilidad: Query para listado de libros desde OpenLibrary
 * Query Key: queryKeys.books.list(filters)
 * staleTime: 5 minutos (datos mayoritariamente estáticos)
 * networkMode: offlineFirst
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { openLibraryApiClient } from '@/api/clients/openLibraryClient';
import { mapOpenLibrarySearchToDomain } from '@/api/mappers/openLibraryMapper';
import { BookListFilters } from '@/types/query.types';

export function useBooks(filters?: BookListFilters) {
  const query = filters?.query?.trim() || '';

  return useQuery({
    queryKey: queryKeys.books.list(filters),
    queryFn: async () => {
      const response = await openLibraryApiClient.searchBooks(
        query,
        filters?.page || 1,
        filters?.limit || 20
      );
      return mapOpenLibrarySearchToDomain(response);
    },
    enabled: query.length > 0, // Solo buscar si hay query
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });
}
