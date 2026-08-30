import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/auth';
import { Book } from '../types/book';
import { FavoriteItem, FavoriteListResponse } from '../types/favorite';

export const favoriteService = {
  async getFavorites(): Promise<Book[]> {
    const response = await apiClient.get<ApiEnvelope<FavoriteListResponse>>('/favorites');
    if (response.data?.success && response.data?.data) {
      return response.data.data.items.map((item) => ({
        key: `/works/${item.book.openlibrary_work_id}`,
        title: item.book.title,
        authors: item.book.authors,
        firstPublishYear: item.book.first_publish_year,
        coverUrl: item.book.cover_url,
        editionCount: item.book.edition_count,
        description: item.book.description ?? null,
        subjects: item.book.subjects,
      }));
    }
    return [];
  },

  async addFavorite(book: Book): Promise<void> {
    const cleanWorkId = book.key.replace('/works/', '').trim();
    await apiClient.post<ApiEnvelope<FavoriteItem>>('/favorites', {
      openlibrary_work_id: cleanWorkId,
      title: book.title,
      authors: book.authors || [],
      cover_url: book.coverUrl,
      first_publish_year: book.firstPublishYear,
      description: book.description,
      edition_count: book.editionCount || 1,
      subjects: book.subjects || [],
    });
  },

  async removeFavorite(bookKey: string): Promise<void> {
    const cleanWorkId = bookKey.replace('/works/', '').trim();
    await apiClient.delete<ApiEnvelope<{ message: string }>>(`/favorites/${cleanWorkId}`);
  },
};
