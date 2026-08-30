import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  BookOpen,
  FileText,
  Star,
  Calendar,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { ReadingAnalyticsResponse } from '../../types/analytics';
import { analyticsService } from '../../services/analyticsService';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { useBookshelf } from '../../context/BookshelfContext';
import { Book } from '../../types/book';

interface ReadingAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  year?: number;
  darkMode?: boolean;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const ReadingAnalyticsModal: React.FC<ReadingAnalyticsModalProps> = ({
  isOpen,
  onClose,
  year = new Date().getFullYear(),
  darkMode = false,
}) => {
  const { completedBooks } = useReadingProgress();
  const { bookshelf } = useBookshelf();

  const [backendData, setBackendData] = useState<ReadingAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getAnalyticsOverview(year);
      setBackendData(res);
    } catch (err: unknown) {
      // If backend call fails (e.g. unauthenticated or network error), fallback cleanly to client synthesized data
      if (err instanceof Error && !err.message.includes('401')) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, fetchAnalytics]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Dynamically compute and merge real-time analytics with backend response
  const data: ReadingAnalyticsResponse = useMemo(() => {
    const baseData: ReadingAnalyticsResponse = backendData || {
      total_books_completed: 0,
      total_pages_read: 0,
      average_personal_rating: 0,
      active_goal: null,
      monthly_breakdown: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        books_completed: 0,
        pages_read: 0,
      })),
      top_genres: [],
    };

    // Gather unique completed books across ReadingProgressContext and BookshelfContext
    const allCompletedBooksMap = new Map<
      string,
      { book: Book; completedAt?: string; rating?: number; pages: number }
    >();

    // 1. From completedBooks in ReadingProgressContext
    completedBooks.forEach((c) => {
      const pgs = c.book.editionCount ? c.book.editionCount * 30 : 250;
      allCompletedBooksMap.set(c.bookKey, {
        book: c.book,
        completedAt: c.completedAt || new Date().toISOString(),
        rating: c.review?.rating,
        pages: pgs || 250,
      });
    });

    // 2. From bookshelf items marked COMPLETED
    bookshelf
      .filter((b) => b.status === 'COMPLETED')
      .forEach((b) => {
        const rawKey = b.book.openlibrary_work_id || '';
        const key = rawKey.startsWith('/works/') ? rawKey : `/works/${rawKey}`;
        if (!allCompletedBooksMap.has(key)) {
          allCompletedBooksMap.set(key, {
            book: {
              key,
              title: b.book.title,
              authors: b.book.authors,
              firstPublishYear: b.book.first_publish_year ?? null,
              coverUrl: b.book.cover_url ?? null,
              description: b.book.description ?? null,
              editionCount: b.book.edition_count || 1,
              subjects: b.book.subjects || [],
            },
            completedAt: b.completed_at || b.updated_at || new Date().toISOString(),
            rating: b.rating || undefined,
            pages: b.total_pages > 0 ? b.total_pages : 250,
          });
        }
      });

    const uniqueCompletedList = Array.from(allCompletedBooksMap.values());
    const localCompletedCount = uniqueCompletedList.length;

    // Total books completed: max of backend count or local completed count
    const total_books_completed = Math.max(
      baseData.total_books_completed,
      localCompletedCount
    );

    // Total pages read
    const localPagesRead = uniqueCompletedList.reduce((acc, curr) => acc + curr.pages, 0);
    const total_pages_read = Math.max(baseData.total_pages_read, localPagesRead);

    // Personal average rating
    const ratedItems = uniqueCompletedList.filter((i) => i.rating && i.rating > 0);
    const localAvgRating =
      ratedItems.length > 0
        ? ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length
        : 0;

    const average_personal_rating =
      baseData.average_personal_rating > 0
        ? baseData.average_personal_rating
        : localAvgRating;

    // Monthly breakdown
    const monthly_breakdown = baseData.monthly_breakdown.map((m) => ({ ...m }));
    if (baseData.total_books_completed === 0 && uniqueCompletedList.length > 0) {
      uniqueCompletedList.forEach((item) => {
        const date = item.completedAt ? new Date(item.completedAt) : new Date();
        if (date.getFullYear() === year) {
          const mIdx = date.getMonth(); // 0 to 11
          if (mIdx >= 0 && mIdx < 12) {
            monthly_breakdown[mIdx].books_completed += 1;
            monthly_breakdown[mIdx].pages_read += item.pages;
          }
        }
      });
    }

    // Top genres
    let top_genres = [...baseData.top_genres];
    if (top_genres.length === 0 && uniqueCompletedList.length > 0) {
      const genreCounts: Record<string, number> = {};
      uniqueCompletedList.forEach(({ book }) => {
        if (book.subjects && book.subjects.length > 0) {
          book.subjects.forEach((s) => {
            const clean = s.trim();
            if (clean) {
              genreCounts[clean] = (genreCounts[clean] || 0) + 1;
            }
          });
        }
      });
      top_genres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([genre, count]) => ({ genre, count }));
    }

    return {
      total_books_completed,
      total_pages_read,
      average_personal_rating: Math.round(average_personal_rating * 10) / 10,
      active_goal: baseData.active_goal,
      monthly_breakdown,
      top_genres,
    };
  }, [backendData, completedBooks, bookshelf, year]);

  if (!isOpen) return null;

  // Compute max monthly books for relative bar heights
  const maxMonthlyBooks = Math.max(
    ...data.monthly_breakdown.map((m) => m.books_completed),
    1
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 z-10 ${
            darkMode
              ? 'bg-gray-900 text-white border border-gray-800'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close analytics modal"
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <span>Reading Analytics & Insights</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Velocity, page count, monthly distribution, and top genres for {year}.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                  />
                ))}
              </div>
              <div className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Books Completed */}
                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-indigo-500">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Books Completed
                    </span>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <p className="text-3xl font-black mt-2 text-indigo-600 dark:text-indigo-400">
                    {data.total_books_completed}
                  </p>
                </div>

                {/* Total Pages Read */}
                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-blue-500">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Total Pages Read
                    </span>
                    <FileText className="w-4 h-4" />
                  </div>
                  <p className="text-3xl font-black mt-2 text-blue-600 dark:text-blue-400">
                    {data.total_pages_read.toLocaleString()}
                  </p>
                </div>

                {/* Personal Average Rating */}
                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Personal Avg Rating
                    </span>
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <p className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400">
                    {data.average_personal_rating > 0
                      ? `${data.average_personal_rating.toFixed(1)} ★`
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Monthly Completion Histogram (Tailwind/CSS Chart) */}
              <div
                className={`p-5 rounded-2xl border ${
                  darkMode ? 'bg-gray-800/50 border-gray-700/60' : 'bg-gray-50/80 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>Monthly Reading Velocity</span>
                  </h4>
                  <span className="text-[11px] text-gray-400">12-Month Distribution</span>
                </div>

                <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-40 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {data.monthly_breakdown.map((m) => {
                    const heightPercent =
                      m.books_completed > 0
                        ? Math.round((m.books_completed / maxMonthlyBooks) * 100)
                        : 0;

                    return (
                      <div
                        key={m.month}
                        className="flex flex-col items-center justify-end h-full group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                          {m.books_completed} books ({m.pages_read} pgs)
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full max-w-[24px] rounded-t-md transition-all duration-500 ${
                            m.books_completed > 0
                              ? 'bg-indigo-600 hover:bg-indigo-500'
                              : 'bg-gray-200 dark:bg-gray-700/50'
                          }`}
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        />

                        {/* Month Label */}
                        <span className="text-[10px] font-semibold text-gray-400 mt-2">
                          {MONTH_NAMES[m.month - 1]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Genres Breakdown */}
              <div
                className={`p-5 rounded-2xl border ${
                  darkMode ? 'bg-gray-800/50 border-gray-700/60' : 'bg-gray-50/80 border-gray-200'
                }`}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-4">
                  <Tag className="w-4 h-4 text-purple-500" />
                  <span>Favorite Topics & Genres</span>
                </h4>

                {data.top_genres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.top_genres.map((g, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                      >
                        <span>{g.genre}</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-800 dark:text-purple-200 font-black">
                          {g.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    Complete books on your bookshelf to uncover your reading genre distribution.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
