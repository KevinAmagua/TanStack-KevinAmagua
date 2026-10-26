/**
 * useDeleteFavorite Mutation
 * Responsabilidad: Eliminar favorito
 * Invalidación: favorites.list
 */

import { useMutation } from '@tanstack/react-query';
import { mutationKeys } from '@/lib/queryKeys';
import type { UseMutationResult } from '@tanstack/react-query';

export function useDeleteFavorite(): UseMutationResult<
  void,
  Error,
  string
> {
  return useMutation({
    mutationKey: mutationKeys.favorites.delete,
  });
}
