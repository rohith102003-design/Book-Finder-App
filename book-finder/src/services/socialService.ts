import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/auth';
import {
  FollowStats,
  ReviewLike,
  SocialFeedResponse,
  UserFollow,
} from '../types/social';

export const socialService = {
  /**
   * Likes/casts a helpful vote on a community review
   */
  async likeReview(reviewId: string): Promise<ReviewLike> {
    const response = await apiClient.post<ApiEnvelope<ReviewLike>>(
      `/reviews/${reviewId}/like`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to like review.');
  },

  /**
   * Removes helpful vote from a review
   */
  async unlikeReview(reviewId: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<unknown>>(`/reviews/${reviewId}/like`);
  },

  /**
   * Checks whether the current user has liked the review
   */
  async getReviewLikeStatus(reviewId: string): Promise<boolean> {
    const response = await apiClient.get<ApiEnvelope<{ is_liked: boolean }>>(
      `/reviews/${reviewId}/like`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data.is_liked;
    }
    return false;
  },

  /**
   * Gets total helpful votes for a review
   */
  async getReviewLikeCount(reviewId: string): Promise<number> {
    const response = await apiClient.get<ApiEnvelope<{ likes_count: number }>>(
      `/reviews/${reviewId}/likes/count`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data.likes_count;
    }
    return 0;
  },

  /**
   * Follows a target user
   */
  async followUser(userId: string): Promise<UserFollow> {
    const response = await apiClient.post<ApiEnvelope<UserFollow>>(
      `/users/${userId}/follow`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to follow user.');
  },

  /**
   * Unfollows a target user
   */
  async unfollowUser(userId: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<unknown>>(`/users/${userId}/follow`);
  },

  /**
   * Checks follow relationship status
   */
  async getFollowStatus(userId: string): Promise<boolean> {
    const response = await apiClient.get<ApiEnvelope<{ is_following: boolean }>>(
      `/users/${userId}/follow-status`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data.is_following;
    }
    return false;
  },

  /**
   * Lists followers of a target user
   */
  async getFollowers(
    userId: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<UserFollow[]> {
    const response = await apiClient.get<ApiEnvelope<UserFollow[]>>(
      `/users/${userId}/followers?skip=${skip}&limit=${limit}`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Lists users followed by target user
   */
  async getFollowing(
    userId: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<UserFollow[]> {
    const response = await apiClient.get<ApiEnvelope<UserFollow[]>>(
      `/users/${userId}/following?skip=${skip}&limit=${limit}`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Gets aggregate follow stats for a user
   */
  async getFollowStats(userId: string): Promise<FollowStats> {
    const response = await apiClient.get<ApiEnvelope<FollowStats>>(
      `/users/${userId}/follow-stats`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return { followers_count: 0, following_count: 0, is_following: false };
  },

  /**
   * Gets personalized social activity feed
   */
  async getSocialFeed(
    skip: number = 0,
    limit: number = 20
  ): Promise<SocialFeedResponse> {
    const response = await apiClient.get<ApiEnvelope<SocialFeedResponse>>(
      `/social/feed?skip=${skip}&limit=${limit}`
    );
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return { items: [], total_count: 0 };
  },
};
