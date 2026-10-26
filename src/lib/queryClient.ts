/**
 * Query Client Configuration
 * Responsabilidad: Configurar QueryClient con defaults para offline-first
 * Cumple con: staleTime por fuente, gcTime >= maxAge, retry, networkMode
 */

import { onlineManager, QueryClient } from '@tanstack/react-query';
import { mockApiClient } from '@/api/clients/mockApiClient';
import { mapFavoriteDTOToDomain } from '@/api/mappers/mockApiMapper';
import { mutationKeys, queryKeys } from '@/lib/queryKeys';
import type {
  CreateFavoritePayload,
  Favorite,
  FavoriteDTO,
  UpdateFavoritePayload,
} from '@/types/favorite.types';

interface CreateFavoriteContext {
  optimisticId: string;
}

interface UpdateFavoriteContext {
  id: string;
  previousListItem?: FavoriteSnapshot;
  previousDetail?: FavoriteSnapshot;
}

interface FavoriteSnapshot extends Omit<Favorite, 'createdAt' | 'updatedAt'> {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

function snapshotFavorite(favorite: Favorite): FavoriteSnapshot {
  return {
    ...favorite,
    createdAt: favorite.createdAt?.toISOString(),
    updatedAt: favorite.updatedAt?.toISOString(),
  };
}

function restoreFavorite(snapshot: FavoriteSnapshot): Favorite {
  return {
    ...snapshot,
    createdAt: snapshot.createdAt
      ? new Date(
          snapshot.createdAt instanceof Date
            ? snapshot.createdAt.toISOString()
            : snapshot.createdAt
        )
      : undefined,
    updatedAt: snapshot.updatedAt
      ? new Date(
          snapshot.updatedAt instanceof Date
            ? snapshot.updatedAt.toISOString()
            : snapshot.updatedAt
        )
      : undefined,
  };
}

function logMutation(message: string) {
  console.info(`[${new Date().toISOString()}] [mutation] ${message}`);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Por defecto moderado; los hooks sobrescribirán según fuente
      staleTime: 30 * 1000, // 30 segundos por defecto
      gcTime: 24 * 60 * 60 * 1000, // 24 horas - DEBE ser >= maxAge de persistencia
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnReconnect: true,
      refetchOnWindowFocus: false, // No aplica en React Native
      refetchOnMount: true,
      networkMode: 'offlineFirst', // Permite servir desde caché y pausar queries
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
      retryDelay: 0,
    },
  },
});

queryClient.setMutationDefaults<
  FavoriteDTO,
  Error,
  CreateFavoritePayload,
  CreateFavoriteContext
>(mutationKeys.favorites.create, {
  networkMode: 'online',
  retry: 0,
  mutationFn: (payload) => {
    const createdAt = payload.createdAt ?? new Date().toISOString();
    logMutation(
      `sending create: ${payload.title}; savedAt=${createdAt}`
    );
    return mockApiClient.createFavorite({
      ...payload,
      createdAt,
      updatedAt: payload.updatedAt ?? createdAt,
    });
  },
  onMutate: async (payload) => {
    const listKey = queryKeys.favorites.list();
    await queryClient.cancelQueries({ queryKey: listKey });

    const createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();
    const optimisticId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticFavorite: Favorite = {
      id: optimisticId,
      title: payload.title,
      author: payload.author,
      description: payload.description,
      coverUrl: payload.coverUrl,
      notes: payload.notes,
      createdAt,
      updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : createdAt,
    };

    queryClient.setQueryData<Favorite[]>(listKey, (current) => [
      optimisticFavorite,
      ...(current ?? []).filter((favorite) => favorite.id !== optimisticId),
    ]);

    if (!onlineManager.isOnline()) {
      logMutation(`queued offline: ${payload.title}; savedAt=${createdAt.toISOString()}`);
    }
    return { optimisticId };
  },
  onSuccess: async (savedFavorite, payload, context) => {
    const saved = mapFavoriteDTOToDomain({
      ...savedFavorite,
      createdAt: savedFavorite.createdAt ?? payload.createdAt,
      updatedAt: savedFavorite.updatedAt ?? payload.updatedAt,
    });
    queryClient.setQueryData<Favorite[]>(queryKeys.favorites.list(), (current) => [
      saved,
      ...(current ?? []).filter(
        (favorite) =>
          favorite.id !== context?.optimisticId && favorite.id !== saved.id
      ),
    ]);
    logMutation(
      `create confirmed: ${saved.title}; savedAt=${saved.createdAt?.toISOString() ?? 'unknown'}`
    );
    await queryClient.invalidateQueries({
      queryKey: queryKeys.favorites.lists(),
    });
    queryClient.setQueryData<Favorite[]>(queryKeys.favorites.list(), (current) => [
      saved,
      ...(current ?? []).filter((favorite) => favorite.id !== saved.id),
    ]);
  },
  onError: async (error, _payload, context) => {
    if (context) {
      queryClient.setQueryData<Favorite[]>(queryKeys.favorites.list(), (current) =>
        current?.filter((favorite) => favorite.id !== context.optimisticId)
      );
    }
    logMutation(`create failed: ${error.message}`);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.favorites.lists(),
    });
  },
});

queryClient.setMutationDefaults<
  FavoriteDTO,
  Error,
  UpdateFavoritePayload,
  UpdateFavoriteContext
>(mutationKeys.favorites.update, {
  networkMode: 'online',
  retry: 0,
  mutationFn: (payload) => {
    logMutation(`sending update: ${payload.id}`);
    return mockApiClient.updateFavorite(payload);
  },
  onMutate: async (payload) => {
    const listKey = queryKeys.favorites.list();
    const detailKey = queryKeys.favorites.detail(payload.id);
    await Promise.all([
      queryClient.cancelQueries({ queryKey: listKey }),
      queryClient.cancelQueries({ queryKey: detailKey }),
    ]);

    const previousListItem = queryClient
      .getQueryData<Favorite[]>(listKey)
      ?.find((favorite) => favorite.id === payload.id);
    const previousDetail = queryClient.getQueryData<Favorite>(detailKey);
    const previousListItemSnapshot = previousListItem
      ? snapshotFavorite(previousListItem)
      : undefined;
    const previousDetailSnapshot = previousDetail
      ? snapshotFavorite(previousDetail)
      : undefined;
    const changes = {
      ...payload,
      updatedAt: new Date(),
    };

    queryClient.setQueryData<Favorite[]>(listKey, (current) =>
      current?.map((favorite) =>
        favorite.id === payload.id ? { ...favorite, ...changes } : favorite
      )
    );
    queryClient.setQueryData<Favorite>(detailKey, (current) =>
      current ? { ...current, ...changes } : current
    );

    if (!onlineManager.isOnline()) {
      logMutation(`queued offline update: ${payload.id}`);
    }
    return {
      id: payload.id,
      previousListItem: previousListItemSnapshot,
      previousDetail: previousDetailSnapshot,
    };
  },
  onSuccess: async (savedFavorite, _payload, context) => {
    const saved = mapFavoriteDTOToDomain(savedFavorite);
    queryClient.setQueryData<Favorite[]>(queryKeys.favorites.list(), (current) =>
      current?.map((favorite) => (favorite.id === saved.id ? saved : favorite))
    );
    queryClient.setQueryData(queryKeys.favorites.detail(saved.id), saved);
    logMutation(`update confirmed: ${saved.id}`);
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.favorites.lists(),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.favorites.detail(context?.id ?? saved.id),
      }),
    ]);
  },
  onError: async (error, _payload, context) => {
    if (context?.previousListItem) {
      const previousListItem = restoreFavorite(context.previousListItem);
      queryClient.setQueryData<Favorite[]>(queryKeys.favorites.list(), (current) =>
        current?.map((favorite) =>
          favorite.id === context.id ? previousListItem : favorite
        )
      );
    }
    if (context?.previousDetail) {
      queryClient.setQueryData(
        queryKeys.favorites.detail(context.id),
        restoreFavorite(context.previousDetail)
      );
    }
    logMutation(`update failed: ${error.message}`);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.favorites.lists(),
    });
  },
});

interface DeleteFavoriteContext {
  id: string;
  previousList?: Favorite[];
}

queryClient.setMutationDefaults<
  void,
  Error,
  string,
  DeleteFavoriteContext
>(mutationKeys.favorites.delete, {
  networkMode: 'online',
  retry: 0,
  mutationFn: (id) => {
    logMutation(`sending delete: ${id}`);
    return mockApiClient.deleteFavorite(id);
  },
  onMutate: async (id) => {
    const listKey = queryKeys.favorites.list();
    const detailKey = queryKeys.favorites.detail(id);
    await queryClient.cancelQueries({ queryKey: listKey });

    const previousList = queryClient.getQueryData<Favorite[]>(listKey);

    queryClient.setQueryData<Favorite[]>(listKey, (current) =>
      (current ?? []).filter((favorite) => favorite.id !== id)
    );
    queryClient.removeQueries({ queryKey: detailKey });

    logMutation(`optimistic delete: ${id}`);
    return { id, previousList };
  },
  onSuccess: async (_data, _id, _context) => {
    logMutation(`delete confirmed: ${_id}`);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.favorites.lists(),
    });
  },
  onError: async (error, _id, context) => {
    if (context?.previousList) {
      queryClient.setQueryData<Favorite[]>(queryKeys.favorites.list(), context.previousList);
    }
    logMutation(`delete failed: ${error.message}`);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.favorites.lists(),
    });
  },
});
