import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquarePlus, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  BookReviewSummary,
  Review,
  CreateReviewPayload,
  UpdateReviewPayload,
} from '../../types/review';
import { reviewService } from '../../services/reviewService';
import { StarRating } from './StarRating';
import { ReviewCard } from './ReviewCard';
import { ReviewFormModal } from './ReviewFormModal';
import { PublicProfileModal } from '../social/PublicProfileModal';

interface ReviewSectionProps {
  workId: string;
  bookTitle?: string;
  darkMode?: boolean;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  workId,
  bookTitle = 'this book',
  darkMode = false,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [summary, setSummary] = useState<BookReviewSummary | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);

  const cleanWorkId = workId.replace('/works/', '').trim();

  // Fetch reviews and user's review
  const loadReviewsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summaryData = await reviewService.getBookReviews(cleanWorkId);
      setSummary(summaryData);

      if (isAuthenticated) {
        const userReview = await reviewService.getMyReview(cleanWorkId);
        setMyReview(userReview);
      } else {
        setMyReview(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load community reviews.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [cleanWorkId, isAuthenticated]);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  // Handle Form Submission (Create or Update)
  const handleReviewSubmit = async (payload: CreateReviewPayload | UpdateReviewPayload) => {
    if (editingReview) {
      await reviewService.updateReview(editingReview.id, payload as UpdateReviewPayload);
    } else {
      await reviewService.createReview(payload as CreateReviewPayload);
    }
    await loadReviewsData();
  };

  // Handle Delete
  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await reviewService.deleteReview(reviewId);
        await loadReviewsData();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete review.');
      }
    }
  };

  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setEditingReview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (review: Review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  // Calculate rating distribution bars
  const totalReviews = summary?.total_reviews || 0;
  const dist = summary?.rating_distribution || {
    one_star: 0,
    two_star: 0,
    three_star: 0,
    four_star: 0,
    five_star: 0,
  };

  const starBreakdowns = [
    { stars: 5, count: dist.five_star },
    { stars: 4, count: dist.four_star },
    { stars: 3, count: dist.three_star },
    { stars: 2, count: dist.two_star },
    { stars: 1, count: dist.one_star },
  ];

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-6">
      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Community Reviews & Ratings</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Verified ratings and critical reviews from reader discussions.
          </p>
        </div>

        {isAuthenticated ? (
          !myReview && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Sign in to Review</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Rating Summary Card */}
      {summary && (
        <div
          className={`p-6 rounded-2xl border ${
            darkMode
              ? 'bg-gray-800/50 border-gray-700/60'
              : 'bg-gray-50/80 border-gray-200'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Score & Star Widget */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                {summary.average_rating > 0 ? summary.average_rating.toFixed(1) : '—'}
              </span>
              <StarRating
                rating={Math.round(summary.average_rating)}
                size="md"
                className="my-1.5"
              />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Rating Distribution Bars */}
            <div className="flex-grow w-full space-y-1.5">
              {starBreakdowns.map((b) => {
                const percentage =
                  totalReviews > 0 ? Math.round((b.count / totalReviews) * 100) : 0;

                return (
                  <div key={b.stars} className="flex items-center gap-3 text-xs font-medium">
                    <span className="w-8 flex items-center justify-end gap-1 font-semibold text-gray-600 dark:text-gray-300">
                      {b.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-grow bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-gray-400 dark:text-gray-500">
                      {b.count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Authenticated User's Review Spotlight */}
      {myReview && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your Review</span>
          </h4>
          <ReviewCard
            review={myReview}
            currentUserId={user?.id}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteReview}
            onSelectUser={(uId, uName) => setSelectedUser({ id: uId, username: uName })}
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Community Review Stream */}
      <div className="space-y-4">
        <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400">
          All Reviews ({summary?.reviews.length || 0})
        </h4>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : summary && summary.reviews.length > 0 ? (
          <div className="space-y-3">
            {summary.reviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                currentUserId={user?.id}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteReview}
                onSelectUser={(uId, uName) => setSelectedUser({ id: uId, username: uName })}
                darkMode={darkMode}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No reviews yet for {bookTitle}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Be the first to share your thoughts and help other readers!
            </p>
          </div>
        )}
      </div>

      {/* Create / Edit Review Modal */}
      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReviewSubmit}
        workId={cleanWorkId}
        initialReview={editingReview}
        darkMode={darkMode}
      />

      {/* Public Profile Modal */}
      {selectedUser && (
        <PublicProfileModal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.id}
          username={selectedUser.username}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
