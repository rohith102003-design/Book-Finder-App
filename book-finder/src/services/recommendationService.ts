import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/auth';
import {
  BookRecommendationResponse,
  RecommendationProfile,
  RecommendationProfileCreate,
  RecommendationProfileUpdate,
} from '../types/recommendation';

export const recommendationService = {
  /**
   * Fetches the user's recommendation profile
   */
  async getProfile(): Promise<RecommendationProfile | null> {
    const response = await apiClient.get<ApiEnvelope<RecommendationProfile | null>>(
      '/recommendations/profile'
    );
    if (response.data?.success) {
      return response.data.data ?? null;
    }
    return null;
  },

  /**
   * Configures initial recommendation preferences
   */
  async createProfile(
    payload: RecommendationProfileCreate
  ): Promise<RecommendationProfile> {
    const response = await apiClient.post<ApiEnvelope<RecommendationProfile>>(
      '/recommendations/profile',
      payload
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to create recommendation profile.');
  },

  /**
   * Updates existing recommendation preferences
   */
  async updateProfile(
    payload: RecommendationProfileUpdate
  ): Promise<RecommendationProfile> {
    const response = await apiClient.patch<ApiEnvelope<RecommendationProfile>>(
      '/recommendations/profile',
      payload
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to update recommendation profile.');
  },

  /**
   * Deletes recommendation profile
   */
  async deleteProfile(): Promise<void> {
    await apiClient.delete<ApiEnvelope<unknown>>('/recommendations/profile');
  },

  /**
   * Fetches personalized book recommendations ranked by score
   */
  async getRecommendations(
    limit: number = 10
  ): Promise<BookRecommendationResponse> {
    const response = await apiClient.get<ApiEnvelope<BookRecommendationResponse>>(
      `/recommendations?limit=${limit}`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return { recommendations: [], total_count: 0 };
  },
};
