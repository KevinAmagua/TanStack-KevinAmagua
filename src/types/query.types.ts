/**
 * Query Types
 * Responsabilidad: Tipos relacionados con TanStack Query, keys, filtros y configuración
 */

// Estado de red
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

// Filtros para listas
export interface BookListFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export interface FavoriteListFilters {
  // Extensible para futuros filtros
}
