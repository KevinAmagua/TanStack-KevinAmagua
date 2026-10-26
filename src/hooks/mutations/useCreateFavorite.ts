/**
 * useCreateFavorite Mutation
 * Responsabilidad: Crear nuevo favorito
 * Invalidación: favorites.list (según README)
 * networkMode: offlineFirst (permite encolar si offline)
 */

import { useMutation } from '@tanstack/react-query';
import { mutationKeys } from '@/lib/queryKeys';
import type {
  CreateFavoritePayload,
  FavoriteDTO,
} from '@/types/favorite.types';
import type { UseMutationResult } from '@tanstack/react-query';

export function useCreateFavorite(): UseMutationResult<
  FavoriteDTO,
  Error,
  CreateFavoritePayload
> {
  return useMutation({
    mutationKey: mutationKeys.favorites.create,
  });
}
