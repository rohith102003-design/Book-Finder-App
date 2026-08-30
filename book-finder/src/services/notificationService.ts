import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/auth';
import { Notification, NotificationListResponse } from '../types/notification';

export const notificationService = {
  /**
   * Fetches paginated notifications and unread count for current user
   */
  async getNotifications(
    skip: number = 0,
    limit: number = 20
  ): Promise<NotificationListResponse> {
    const response = await apiClient.get<ApiEnvelope<NotificationListResponse>>(
      `/notifications?skip=${skip}&limit=${limit}`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return { items: [], unread_count: 0 };
  },

  /**
   * Fetches total unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiEnvelope<{ unread_count: number }>>(
      '/notifications/unread-count'
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data.unread_count;
    }
    return 0;
  },

  /**
   * Marks a single notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.patch<ApiEnvelope<Notification>>(
      `/notifications/${notificationId}/read`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to mark notification as read.');
  },

  /**
   * Marks all unread notifications as read
   */
  async markAllAsRead(): Promise<number> {
    const response = await apiClient.post<ApiEnvelope<{ updated_count: number }>>(
      '/notifications/read-all'
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data.updated_count;
    }
    return 0;
  },
};
