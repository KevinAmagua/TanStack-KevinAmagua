/**
 * MockAPI Mappers
 * Responsabilidad: Transformar DTOs de MockAPI a entidades de dominio
 */

import { FavoriteDTO, Favorite, CreateFavoritePayload } from '@/types/favorite.types';

export function mapFavoriteDTOToDomain(dto: FavoriteDTO): Favorite {
  return {
    id: dto.id,
    title: dto.title,
    author: dto.author,
    description: dto.description,
    coverUrl: dto.coverUrl,
    notes: dto.notes,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}

export function mapFavoritesDTOToDomain(dtos: FavoriteDTO[]): Favorite[] {
  return dtos.map(mapFavoriteDTOToDomain);
}

export function mapCreatePayloadToDTO(payload: CreateFavoritePayload): Partial<FavoriteDTO> {
  const createdAt = payload.createdAt ?? new Date().toISOString();
  return {
    title: payload.title,
    author: payload.author,
    description: payload.description,
    coverUrl: payload.coverUrl,
    notes: payload.notes,
    createdAt,
    updatedAt: payload.updatedAt ?? createdAt,
  };
}
