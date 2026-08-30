import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/auth';
import {
  ReadingAnalyticsResponse,
  ReadingGoal,
  SetGoalPayload,
  UpdateGoalPayload,
} from '../types/analytics';

export const analyticsService = {
  /**
   * Fetches reading analytics overview for a target year
   */
  async getAnalyticsOverview(year?: number): Promise<ReadingAnalyticsResponse> {
    const url = year ? `/analytics/overview?year=${year}` : '/analytics/overview';
    const response = await apiClient.get<ApiEnvelope<ReadingAnalyticsResponse>>(url);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to retrieve reading analytics overview.');
  },

  /**
   * Fetches the user's reading goal for a target year
   */
  async getReadingGoal(year: number): Promise<ReadingGoal | null> {
    try {
      const response = await apiClient.get<ApiEnvelope<ReadingGoal>>(
        `/analytics/goals/${year}`
      );
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Creates a new annual reading challenge goal
   */
  async setReadingGoal(payload: SetGoalPayload): Promise<ReadingGoal> {
    const response = await apiClient.post<ApiEnvelope<ReadingGoal>>(
      '/analytics/goals',
      payload
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to create reading goal.');
  },

  /**
   * Updates target books for an existing annual reading goal
   */
  async updateReadingGoal(
    year: number,
    payload: UpdateGoalPayload
  ): Promise<ReadingGoal> {
    const response = await apiClient.patch<ApiEnvelope<ReadingGoal>>(
      `/analytics/goals/${year}`,
      payload
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to update reading goal.');
  },
};
