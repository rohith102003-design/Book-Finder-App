export interface ReviewLike {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface UserFollowUser {
  id: string;
  username: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: UserFollowUser | null;
  following?: UserFollowUser | null;
}

export interface FollowStats {
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export interface SocialFeedItem {
  id: string;
  activity_type: 'REVIEW_CREATED' | 'REVIEW_LIKED' | string;
  actor_id: string;
  actor_username: string;
  book_title: string;
  book_openlibrary_id: string;
  review_id?: string | null;
  review_rating?: number | null;
  review_title?: string | null;
  review_content?: string | null;
  created_at: string;
}

export interface SocialFeedResponse {
  items: SocialFeedItem[];
  total_count: number;
}
