import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/auth';
import {
  AddBookshelfItemPayload,
  BookshelfItem,
  BookshelfListResponse,
  ReadingStatus,
} from '../types/bookshelf';

export const bookshelfService = {
  /**
   * Fetches the authenticated user's bookshelf, optionally filtered by reading status
   */
  async getBookshelf(status?: ReadingStatus): Promise<BookshelfListResponse> {
    const url = status ? `/bookshelf?status=${status}` : '/bookshelf';
    const response = await apiClient.get<ApiEnvelope<BookshelfListResponse>>(url);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to retrieve bookshelf items.');
  },

  /**
   * Retrieves a single bookshelf item strictly owned by the authenticated user
   */
  async getBookshelfItem(itemId: string): Promise<BookshelfItem> {
    const response = await apiClient.get<ApiEnvelope<BookshelfItem>>(`/bookshelf/${itemId}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to retrieve bookshelf item.');
  },

  /**
   * Adds a book to the personal bookshelf
   */
  async addToBookshelf(payload: AddBookshelfItemPayload): Promise<BookshelfItem> {
    const response = await apiClient.post<ApiEnvelope<BookshelfItem>>('/bookshelf', payload);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to add book to bookshelf.');
  },

  /**
   * Updates the reading status of a bookshelf item
   */
  async updateStatus(itemId: string, status: ReadingStatus): Promise<BookshelfItem> {
    const response = await apiClient.patch<ApiEnvelope<BookshelfItem>>(
      `/bookshelf/${itemId}/status`,
      { status }
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to update reading status.');
  },

  /**
   * Updates current reading progress and optional total pages
   */
  async updateProgress(
    itemId: string,
    currentPage: number,
    totalPages?: number
  ): Promise<BookshelfItem> {
    const payload: { current_page: number; total_pages?: number } = {
      current_page: currentPage,
    };
    if (totalPages !== undefined && totalPages > 0) {
      payload.total_pages = totalPages;
    }

    const response = await apiClient.patch<ApiEnvelope<BookshelfItem>>(
      `/bookshelf/${itemId}/progress`,
      payload
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to update reading progress.');
  },

  /**
   * Removes a book from the user's bookshelf
   */
  async removeFromBookshelf(itemId: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<unknown>>(`/bookshelf/${itemId}`);
  },
};
