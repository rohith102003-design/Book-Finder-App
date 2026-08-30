import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  ThumbsUp,
} from 'lucide-react';
import { Review } from '../../types/review';
import { StarRating } from './StarRating';
import { socialService } from '../../services/socialService';
import { useAuth } from '../../context/AuthContext';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string | null;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onSelectUser?: (userId: string, username: string) => void;
  darkMode?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onSelectUser,
  darkMode = false,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [showSpoiler, setShowSpoiler] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(review.likes_count || 0);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const isOwner = currentUserId ? review.user_id === currentUserId : false;

  const formattedDate = new Date(review.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      socialService
        .getReviewLikeStatus(review.id)
        .then((status) => {
          if (isMounted) {
            setIsLiked(status);
          }
        })
        .catch(() => {});
    } else {
      setIsLiked(false);
    }
    return () => {
      isMounted = false;
    };
  }, [review.id, isAuthenticated]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      if (isLiked) {
        await socialService.unlikeReview(review.id);
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await socialService.likeReview(review.id);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch {
      // Revert or keep state
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        darkMode
          ? 'bg-gray-800/80 border-gray-700/80 text-gray-100'
          : 'bg-white border-gray-200 text-gray-900 shadow-sm'
      }`}
    >
      {/* Header: Author Info, Rating, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            onClick={() => onSelectUser?.(review.author.id, review.author.username)}
            className="flex items-center gap-1.5 font-bold text-sm cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold shadow group-hover:scale-105 transition-transform">
              {review.author.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="group-hover:text-indigo-500 transition-colors">
              @{review.author.username}
            </span>
          </div>

          {/* Verified Reader Badge */}
          {review.author.is_verified_reader && (
            <span
              title="This user has read and completed this book on their bookshelf"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified Reader</span>
            </span>
          )}

          <span className="text-xs text-gray-400 dark:text-gray-500">
            • {formattedDate}
          </span>
        </div>

        {/* Edit / Delete Buttons for Owner */}
        {isOwner && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review)}
                aria-label="Edit review"
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                aria-label="Delete review"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Star Rating & Optional Title */}
      <div className="mb-2.5 space-y-1">
        <StarRating rating={review.rating} size="sm" />
        {review.title && (
          <h4 className="font-bold text-base tracking-tight leading-snug">
            {review.title}
          </h4>
        )}
      </div>

      {/* Review Content / Spoiler Guard */}
      {review.contains_spoilers && !showSpoiler ? (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 mb-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>This review contains plot spoilers</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            The reviewer has indicated that this review reveals key plot points.
          </p>
          <button
            type="button"
            onClick={() => setShowSpoiler(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pt-1"
          >
            Show Spoiler Review
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-3">
          {review.content}
        </p>
      )}

      {/* Footer: Helpful / Like Button */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isLiking}
          aria-label="Helpful vote"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isLiked
              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          <span>Helpful</span>
          {likesCount > 0 && <span className="font-bold">({likesCount})</span>}
        </button>
      </div>
    </div>
  );
};
