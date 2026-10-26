/**
 * useUpdateFavorite Mutation
 * Responsabilidad: Actualizar favorito existente
 * Invalidación: favorites.list (según README). Opcionalmente favorites.detail(id)
 * networkMode: offlineFirst
 */

import { useMutation } from '@tanstack/react-query';
import { mutationKeys } from '@/lib/queryKeys';
import type {
  FavoriteDTO,
  UpdateFavoritePayload,
} from '@/types/favorite.types';
import type { UseMutationResult } from '@tanstack/react-query';

export function useUpdateFavorite(): UseMutationResult<
  FavoriteDTO,
  Error,
  UpdateFavoritePayload
> {
  return useMutation({
    mutationKey: mutationKeys.favorites.update,
  });
}
