import { FavoriteDTO, CreateFavoritePayload, UpdateFavoritePayload } from '@/types/favorite.types';

const MOCK_API_BASE_URL = process.env.EXPO_PUBLIC_MOCKAPI_URL || 'https://6ad90d0bf89c5702ed9a6438.mockapi.io/libros';

export class MockApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = MOCK_API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async ensureSuccess(response: Response, operation: string): Promise<void> {
    if (response.ok) {
      return;
    }

    const details = (await response.text()).trim();
    throw new Error(
      'MockAPI ' + operation + ' failed: ' + response.status +
      (details ? ' - ' + details : '')
    );
  }

  async getFavorites(): Promise<FavoriteDTO[]> {
    const url = this.baseUrl;
    const response = await fetch(url);
    await this.ensureSuccess(response, 'getFavorites');
    return response.json();
  }

  async getFavoriteById(id: string): Promise<FavoriteDTO> {
    const url = this.baseUrl + '/' + encodeURIComponent(id);
    const response = await fetch(url);
    await this.ensureSuccess(response, 'getFavoriteById');
    return response.json();
  }

  async createFavorite(payload: CreateFavoritePayload): Promise<FavoriteDTO> {
    const url = this.baseUrl;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    await this.ensureSuccess(response, 'createFavorite');
    return response.json();
  }

  async updateFavorite(payload: UpdateFavoritePayload): Promise<FavoriteDTO> {
    const { id, ...data } = payload;
    const url = this.baseUrl + '/' + encodeURIComponent(id);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    await this.ensureSuccess(response, 'updateFavorite');
    return response.json();
  }

  async deleteFavorite(id: string): Promise<void> {
    const url = this.baseUrl + '/' + encodeURIComponent(id);
    const response = await fetch(url, {
      method: 'DELETE',
    });
    await this.ensureSuccess(response, 'deleteFavorite');
  }
}

export const mockApiClient = new MockApiClient();