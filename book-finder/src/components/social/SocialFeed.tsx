import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Activity,
  ThumbsUp,
  BookOpen,
  RefreshCw,
  UserCheck,
  Play,
  Bookmark,
  Check,
  Sparkles,
} from 'lucide-react';
import { SocialFeedItem } from '../../types/social';
import { socialService } from '../../services/socialService';
import { useAuth } from '../../context/AuthContext';
import { useBookshelf } from '../../context/BookshelfContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { StarRating } from '../reviews/StarRating';
import { PublicProfileModal } from './PublicProfileModal';
import { Book } from '../../types/book';

interface SocialFeedProps {
  onSelectBook?: (workId: string) => void;
  onOpenReader?: (book: Book) => void;
  onSelectUser?: (user: { id: string; username: string }) => void;
  darkMode?: boolean;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  onSelectBook,
  onOpenReader,
  onSelectUser,
  darkMode = false,
}) => {
  const { user: currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { addToBookshelf, isInBookshelf } = useBookshelf();
  const { startOrContinueReading, completedBooks } = useReadingProgress();

  const [backendItems, setBackendItems] = useState<SocialFeedItem[]>(() => {
    try {
      if (currentUser) {
        const saved = localStorage.getItem(`biblio_social_feed_${currentUser.id}`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [addingBookId, setAddingBookId] = useState<string | null>(null);

  // Profile modal state
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!isAuthenticated) {
      setBackendItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await socialService.getSocialFeed(0, 50);
      setBackendItems(res.items);
      if (currentUser) {
        try {
          localStorage.setItem(`biblio_social_feed_${currentUser.id}`, JSON.stringify(res.items));
        } catch {}
      }
    } catch {
      if (currentUser) {
        try {
          const saved = localStorage.getItem(`biblio_social_feed_${currentUser.id}`);
          if (saved) setBackendItems(JSON.parse(saved));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Combine backend feed items + current user's submitted reviews from completedBooks
  const feedItems = useMemo(() => {
    const itemsMap = new Map<string, SocialFeedItem>();

    // 1. Add backend feed items from users you actually follow
    backendItems.forEach((item) => itemsMap.set(item.id, item));

    // 2. Add current user's submitted reviews from completedBooks
    completedBooks
      .filter((c) => c.review && c.review.rating > 0)
      .forEach((c) => {
        const cleanId = c.bookKey.replace('/works/', '');
        const myItem: SocialFeedItem = {
          id: `my_rev_${cleanId}`,
          activity_type: 'REVIEW_CREATED',
          actor_id: currentUser?.id || 'me',
          actor_username: currentUser?.username || 'You',
          book_title: c.book.title,
          book_openlibrary_id: cleanId,
          review_id: `rev_my_${cleanId}`,
          review_rating: c.review?.rating,
          review_title: `My Review for ${c.book.title}`,
          review_content: c.review?.reviewText || 'Completed 100% of the reading guide lessons.',
          created_at: c.completedAt || new Date().toISOString(),
        };
        itemsMap.set(myItem.id, myItem);
      });

    // Sort newest first
    const list = Array.from(itemsMap.values());
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [backendItems, completedBooks, currentUser]);

  const handleLikeToggle = async (e: React.MouseEvent, reviewId?: string | null) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!reviewId) return;

    const currentlyLiked = !likedReviews[reviewId];
    setLikedReviews((prev) => ({ ...prev, [reviewId]: currentlyLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + (currentlyLiked ? 1 : -1),
    }));

    try {
      if (currentlyLiked) {
        await socialService.likeReview(reviewId);
      } else {
        await socialService.unlikeReview(reviewId);
      }
    } catch {
      // Revert if error
    }
  };

  const handleAddShelf = async (
    e: React.MouseEvent,
    workId: string,
    title: string
  ) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    try {
      setAddingBookId(workId);
      await addToBookshelf(
        {
          key: `/works/${workId.replace('/works/', '')}`,
          title,
          authors: [],
          firstPublishYear: null,
          coverUrl: null,
          description: null,
          editionCount: 1,
          subjects: [],
        },
        'WANT_TO_READ'
      );
    } catch {
      // Handled in context
    } finally {
      setAddingBookId(null);
    }
  };

  const handleReadClick = (
    e: React.MouseEvent,
    workId: string,
    title: string
  ) => {
    e.stopPropagation();
    const bookObj: Book = {
      key: `/works/${workId.replace('/works/', '')}`,
      title,
      authors: [],
      firstPublishYear: null,
      coverUrl: null,
      description: null,
      editionCount: 1,
      subjects: [],
    };

    startOrContinueReading(bookObj);
    if (onOpenReader) {
      onOpenReader(bookObj);
    } else if (onSelectBook) {
      onSelectBook(workId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className={`p-10 rounded-3xl border text-center space-y-4 max-w-2xl mx-auto ${
          darkMode
            ? 'bg-gray-800/60 border-gray-700 text-gray-200'
            : 'bg-white border-gray-200 text-gray-800 shadow-sm'
        }`}
      >
        <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Community Social Feed</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Follow fellow avid readers on book reviews to see their latest completed books, star ratings, and community reviews in real time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 cursor-pointer"
        >
          Sign In to View Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      {/* 1. Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>Community Activity Feed</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Live updates, reviews, and reading accomplishments from readers you follow.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchFeed}
          disabled={loading}
          aria-label="Refresh feed"
          className="p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh activity feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 3. Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`p-6 rounded-3xl border animate-pulse space-y-3 ${
                darkMode ? 'bg-gray-800/40 border-gray-700/60' : 'bg-white border-gray-200'
              }`}
            >
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-xl w-2/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/2" />
            </div>
          ))}
        </div>
      ) : feedItems.length === 0 ? (
        /* 4. Empty State */
        <div
          className={`p-12 rounded-3xl border text-center space-y-4 ${
            darkMode
              ? 'bg-gray-800/40 border-gray-700 text-gray-300'
              : 'bg-white border-gray-200 text-gray-700 shadow-sm'
          }`}
        >
          <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-lg">Your Feed is Quiet</h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Follow other readers when viewing book reviews to see their latest completed books, star ratings, and community reviews here in real time!
            </p>
          </div>
        </div>
      ) : (
        /* 5. Feed Activity Timeline */
        <div className="space-y-5">
          {feedItems.map((item) => {
            const isReview = item.activity_type === 'REVIEW_CREATED';
            const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const inShelf = isInBookshelf(item.book_openlibrary_id);
            const isLiked = !!likedReviews[item.review_id || item.id];
            const likeCount = likeCounts[item.review_id || item.id] || 0;

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border transition-all duration-200 space-y-4 ${
                  darkMode
                    ? 'bg-[#0f172a]/90 border-gray-800 hover:border-indigo-500/30'
                    : 'bg-white border-gray-200 shadow-sm hover:border-indigo-200'
                }`}
              >
                {/* Event Header Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* User Avatar */}
                    <div
                      onClick={() =>
                        setSelectedUser({ id: item.actor_id, username: item.actor_username })
                      }
                      className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shadow cursor-pointer hover:scale-105 transition-transform"
                    >
                      {item.actor_username.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedUser({
                              id: item.actor_id,
                              username: item.actor_username,
                            })
                          }
                          className="font-bold text-sm hover:text-indigo-500 transition-colors cursor-pointer"
                        >
                          @{item.actor_username}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {isReview ? 'completed & reviewed' : 'liked a review on'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block">{dateStr}</span>
                    </div>
                  </div>

                  {/* Activity Badge */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Sparkles className="w-3 h-3" />
                    <span>{isReview ? 'Book Completed' : 'Review Liked'}</span>
                  </div>
                </div>

                {/* Book & Review Body Card */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                  {/* Book Title Banner */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      onClick={() => onSelectBook?.(item.book_openlibrary_id)}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors line-clamp-1">
                        {item.book_title}
                      </h4>
                    </div>

                    {item.review_rating && (
                      <StarRating rating={item.review_rating} size="sm" />
                    )}
                  </div>

                  {/* Review Content */}
                  {item.review_title && (
                    <h5 className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                      "{item.review_title}"
                    </h5>
                  )}

                  {item.review_content && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      "{item.review_content}"
                    </p>
                  )}
                </div>

                {/* Bottom Interactive Action Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800/80">
                  {/* Left: Like Review Button */}
                  <button
                    type="button"
                    onClick={(e) => handleLikeToggle(e, item.review_id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isLiked
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                    {likeCount > 0 && <span className="font-bold">({likeCount})</span>}
                  </button>

                  {/* Right: Read Guide & + Shelf Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleReadClick(e, item.book_openlibrary_id, item.book_title)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Read Guide</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleAddShelf(e, item.book_openlibrary_id, item.book_title)}
                      disabled={inShelf || addingBookId === item.book_openlibrary_id}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        inShelf
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 cursor-default'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 cursor-pointer'
                      }`}
                    >
                      {inShelf ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Shelf</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>+ Shelf</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Public Profile Modal */}
      {selectedUser && (
        <PublicProfileModal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.id}
          username={selectedUser.username}
          onSelectUser={(u) => {
            if (onSelectUser) onSelectUser(u);
            setSelectedUser(u);
          }}
          onSelectBook={onSelectBook}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
