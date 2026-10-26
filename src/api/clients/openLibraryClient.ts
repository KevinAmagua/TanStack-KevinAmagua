/**
 * OpenLibrary API Client - Actualizado para usar .env
 */
import { OpenLibrarySearchResponseDTO, OpenLibraryWorkDetailDTO } from '@/types/book.types';

const OPEN_LIBRARY_BASE_URL = process.env.EXPO_PUBLIC_OPENLIBRARY_URL || 'https://openlibrary.org';

export class OpenLibraryApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = OPEN_LIBRARY_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async searchBooks(query: string, page: number = 1, limit: number = 20): Promise<OpenLibrarySearchResponseDTO> {
    const offset = (page - 1) * limit;
    const url = this.baseUrl + '/search.json?q=' + encodeURIComponent(query) + '&limit=' + limit + '&offset=' + offset;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('OpenLibrary search failed: ' + response.status);
    }
    
    return response.json();
  }

  async getWorkDetail(workKey: string): Promise<OpenLibraryWorkDetailDTO> {
    const key = workKey.startsWith('/works/') ? workKey : '/works/' + workKey;
    const url = this.baseUrl + key + '.json';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('OpenLibrary work detail failed: ' + response.status);
    }
    
    return response.json();
  }

  async getEditionDetail(editionKey: string): Promise<any> {
    const key = editionKey.startsWith('/books/') ? editionKey : '/books/' + editionKey;
    const url = this.baseUrl + key + '.json';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('OpenLibrary edition detail failed: ' + response.status);
    }
    
    return response.json();
  }
}

export const openLibraryApiClient = new OpenLibraryApiClient();