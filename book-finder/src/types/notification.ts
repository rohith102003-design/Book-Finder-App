export interface Notification {
  id: string;
  user_id: string;
  notification_type: 'FOLLOW' | 'REVIEW_LIKE' | 'SYSTEM' | string;
  title: string;
  message: string;
  related_user_id?: string | null;
  related_username?: string | null;
  related_review_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unread_count: number;
}
