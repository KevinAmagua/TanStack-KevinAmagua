/**
 * useFavorites Hook
 * Responsabilidad: Query para listado de favoritos desde MockAPI
 * Query Key: queryKeys.favorites.list()
 * staleTime: 30 segundos (datos mutables por usuario)
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { mockApiClient } from '@/api/clients/mockApiClient';
import { mapFavoritesDTOToDomain } from '@/api/mappers/mockApiMapper';

export function useFavorites() {
  return useQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: async () => {
      const dtos = await mockApiClient.getFavorites();
      return mapFavoritesDTOToDomain(
        [...dtos].sort((left, right) => {
          const leftCreatedAt = left.createdAt
            ? Date.parse(left.createdAt)
            : Number.NEGATIVE_INFINITY;
          const rightCreatedAt = right.createdAt
            ? Date.parse(right.createdAt)
            : Number.NEGATIVE_INFINITY;
          return rightCreatedAt - leftCreatedAt;
        })
      );
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });
}
