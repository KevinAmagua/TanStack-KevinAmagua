/**
 * useFavorite Hook
 * Responsabilidad: Query para detalle de favorito desde MockAPI
 * Query Key: queryKeys.favorites.detail(id)
 * staleTime: 30 segundos
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { mockApiClient } from '@/api/clients/mockApiClient';
import { mapFavoriteDTOToDomain } from '@/api/mappers/mockApiMapper';

export function useFavorite(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.favorites.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Favorite id is required');
      const dto = await mockApiClient.getFavoriteById(id);
      return mapFavoriteDTOToDomain(dto);
    },
    enabled: !!id && id.length > 0,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });
}
