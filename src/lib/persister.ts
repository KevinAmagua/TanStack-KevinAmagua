/**
 * Persister Configuration
 * Responsabilidad: Configurar query-async-storage-persister con AsyncStorage
 * Reglas: maxAge 24h, gcTime >= maxAge, solo queries exitosas
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Mutation, Query } from '@tanstack/react-query';

export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas

// Persister
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'TAREATANSTACK_KA_QUERY_CACHE', // Key única para este proyecto
  throttleTime: 0,
  deserialize: (serialized) =>
    JSON.parse(serialized, (key, value: unknown) => {
      if (
        (key === 'createdAt' || key === 'updatedAt') &&
        typeof value === 'string'
      ) {
        return new Date(value);
      }
      return value;
    }),
});

export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: PERSIST_MAX_AGE,
  dehydrateOptions: {
    shouldDehydrateQuery: (query: Query) =>
      query.state.status === 'success',
    shouldDehydrateMutation: (mutation: Mutation) =>
      mutation.state.isPaused,
  },
};
