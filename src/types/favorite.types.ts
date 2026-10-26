/**
 * Favorite Types
 * Responsabilidad: Tipos de dominio y DTOs para favoritos (MockAPI)
 */

// DTO desde MockAPI
export interface FavoriteDTO {
  id: string;
  title: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Entidad de dominio para favoritos
export interface Favorite {
  id: string;
  title: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Payload para crear favorito
export interface CreateFavoritePayload {
  title: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payload para actualizar favorito
export interface UpdateFavoritePayload {
  id: string;
  title?: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  notes?: string;
}
