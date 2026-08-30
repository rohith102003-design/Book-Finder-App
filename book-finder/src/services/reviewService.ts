import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/auth';
import {
  BookReviewSummary,
  CreateReviewPayload,
  Review,
  UpdateReviewPayload,
} from '../types/review';

export const reviewService = {
  /**
   * Fetches public reviews and star rating distribution for a book
   */
  async getBookReviews(
    workId: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<BookReviewSummary> {
    const cleanId = workId.replace('/works/', '').trim();
    const response = await apiClient.get<ApiEnvelope<BookReviewSummary>>(
      `/books/${cleanId}/reviews?skip=${skip}&limit=${limit}`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to retrieve book reviews.');
  },

  /**
   * Fetches the current authenticated user's review for a book
   */
  async getMyReview(workId: string): Promise<Review | null> {
    const cleanId = workId.replace('/works/', '').trim();
    const response = await apiClient.get<ApiEnvelope<Review | null>>(
      `/reviews/me/${cleanId}`
    );
    if (response.data?.success) {
      return response.data.data ?? null;
    }
    return null;
  },

  /**
   * Creates a new review for a book
   */
  async createReview(payload: CreateReviewPayload): Promise<Review> {
    const response = await apiClient.post<ApiEnvelope<Review>>(
      '/reviews',
      payload
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to create review.');
  },

  /**
   * Updates an existing review (restricted to review owner)
   */
  async updateReview(
    reviewId: string,
    payload: UpdateReviewPayload
  ): Promise<Review> {
    const response = await apiClient.patch<ApiEnvelope<Review>>(
      `/reviews/${reviewId}`,
      payload
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to update review.');
  },

  /**
   * Deletes a review (restricted to owner or admin)
   */
  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<unknown>>(`/reviews/${reviewId}`);
  },
};
