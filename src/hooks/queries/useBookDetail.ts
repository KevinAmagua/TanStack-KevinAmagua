/**
 * useBookDetail Hook
 * Responsabilidad: Query para detalle de libro desde OpenLibrary
 * Query Key: queryKeys.books.detail(id)
 * staleTime: 5 minutos
 * enabled: solo si hay id válido
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { openLibraryApiClient } from '@/api/clients/openLibraryClient';
import { mapOpenLibraryWorkDetailToDomain } from '@/api/mappers/openLibraryMapper';

export function useBookDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.books.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Book id is required');
      const workDetail = await openLibraryApiClient.getWorkDetail(id);
      return mapOpenLibraryWorkDetailToDomain(workDetail, { id });
    },
    enabled: !!id && id.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });
}
