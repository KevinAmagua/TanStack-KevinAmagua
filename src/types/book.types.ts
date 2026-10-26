/**
 * Book Types
 * Responsabilidad: Tipos de dominio y DTOs para libros (OpenLibrary)
 */

// DTO desde OpenLibrary API (estructura tal como llega de la API)
export interface OpenLibraryBookDTO {
  key: string;           // '/works/OL123W' o '/books/OL123M'
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
  isbn?: string[];
  subject?: string[];
  publisher?: string[];
}

// Respuesta de búsqueda de OpenLibrary
export interface OpenLibrarySearchResponseDTO {
  numFound: number;
  start: number;
  docs: OpenLibraryBookDTO[];
}

// DTO para detalle de trabajo/edición
export interface OpenLibraryWorkDetailDTO {
  title: string;
  description?: string | { value: string };
  covers?: number[];
  subjects?: string[];
  authors?: Array<{ author: { key: string } }>;
  first_publish_date?: string;
}

// Entidad de dominio (normalizada para uso en la app)
export interface Book {
  id: string;                    // ID normalizado (sin prefijo '/works/')
  title: string;
  authors: string[];
  coverUrl?: string;             // URL construida desde cover_i
  firstPublishYear?: number;
  editionCount?: number;
  isbn?: string[];
  subjects?: string[];
  publisher?: string[];
}

// Detalle completo de libro (dominio)
export interface BookDetail extends Book {
  description?: string;
  covers?: string[];
  firstPublishDate?: string;
}

// Parámetros para búsqueda de libros
export interface BookSearchParams {
  query?: string;
  page?: number;
  limit?: number;
  offset?: number;
}
