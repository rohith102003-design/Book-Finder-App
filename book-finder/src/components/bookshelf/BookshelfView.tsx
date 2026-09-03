import React, { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  Sparkles,
  Users,
  TrendingUp,
  Play,
  RotateCcw,
  Star,
  Calendar,
} from 'lucide-react';
import { useBookshelf } from '../../context/BookshelfContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { useAuth } from '../../context/AuthContext';
import { BookshelfItem } from '../../types/bookshelf';
import { Book } from '../../types/book';
import { getBookReadingState } from '../../utils/readingState';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { ReadingGoalWidget } from '../analytics/ReadingGoalWidget';
import { ReadingAnalyticsModal } from '../analytics/ReadingAnalyticsModal';

interface BookshelfViewProps {
  darkMode?: boolean;
  onNavigateToDiscover?: () => void;
  onOpenReader?: (book: Book) => void;
  onSelectBook?: (book: Book) => void;
  isFavorite?: (bookKey: string) => boolean;
  onToggleFavorite?: (book: Book) => void;
}

type BookshelfFilter = 'ALL' | 'NOT_STARTED' | 'READING' | 'COMPLETED';

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  darkMode = false,
  onNavigateToDiscover,
  onOpenReader,
  onSelectBook,
  isFavorite,
  onToggleFavorite,
}) => {
  const { bookshelf, isLoading, removeFromBookshelf, fetchBookshelf } = useBookshelf();
  const { getProgress, startOrContinueReading } = useReadingProgress();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [activeFilter, setActiveFilter] = useState<BookshelfFilter>('ALL');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [goalRefreshTrigger, setGoalRefreshTrigger] = useState<number>(0);

  // Synchronize bookshelf state on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookshelf();
    }
  }, [isAuthenticated, fetchBookshelf]);

  // Convert BookshelfItem.book to a standard Book entity
  const mapItemToBook = (item: BookshelfItem): Book => {
    const rawKey = item.book.openlibrary_work_id || '';
    const key = rawKey.startsWith('/works/') ? rawKey : `/works/${rawKey}`;
    return {
      key,
      title: item.book.title,
      authors: item.book.authors,
      firstPublishYear: item.book.first_publish_year ?? null,
      coverUrl: item.book.cover_url ?? null,
      description: item.book.description ?? null,
      editionCount: item.book.edition_count || 1,
      subjects: item.book.subjects || [],
    };
  };

  // Compute bookshelf items paired with their real-time reading state
  const itemsWithReadingState = useMemo(() => {
    return bookshelf.map((item) => {
      const bookObj = mapItemToBook(item);
      const progressRecord = getProgress(bookObj.key);
      const readingState = getBookReadingState(bookObj, progressRecord);
      return {
        item,
        book: bookObj,
        readingState,
      };
    });
  }, [bookshelf, getProgress]);

  // Compute counts for metrics
  const counts = useMemo(() => {
    const total = itemsWithReadingState.length;
    const notStarted = itemsWithReadingState.filter((i) => i.readingState.state === 'not_started').length;
    const reading = itemsWithReadingState.filter((i) => i.readingState.state === 'reading').length;
    const completed = itemsWithReadingState.filter((i) => i.readingState.state === 'completed').length;
    return { total, notStarted, reading, completed };
  }, [itemsWithReadingState]);

  // Filter items by status tab and search query
  const displayedItems = useMemo(() => {
    let list = itemsWithReadingState;

    if (activeFilter === 'NOT_STARTED') {
      list = list.filter((i) => i.readingState.state === 'not_started');
    } else if (activeFilter === 'READING') {
      list = list.filter((i) => i.readingState.state === 'reading');
    } else if (activeFilter === 'COMPLETED') {
      list = list.filter((i) => i.readingState.state === 'completed');
    }

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.book.title.toLowerCase().includes(q) ||
          i.book.authors.some((a) => a.toLowerCase().includes(q))
      );
    }

    return list;
  }, [itemsWithReadingState, activeFilter, filterQuery]);

  const handleCardClick = (book: Book) => {
    startOrContinueReading(book);
    if (onOpenReader) {
      onOpenReader(book);
    } else if (onSelectBook) {
      onSelectBook(book);
    }
  };

  const handlePrimaryReadAction = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    startOrContinueReading(book);
    if (onOpenReader) {
      onOpenReader(book);
    }
  };

  const handleRemove = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (window.confirm('Remove this book from your personal bookshelf?')) {
      try {
        await removeFromBookshelf(itemId);
        setGoalRefreshTrigger((prev) => prev + 1);
      } catch {
        // Handled in context
      }
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(book);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Personal Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            <span>My Bookshelf</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your personal reading library. Open any saved book, resume current lessons, or review completed classics.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Reading Analytics Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsAnalyticsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer shadow-sm"
          >
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Reading Analytics</span>
          </button>

          {onNavigateToDiscover && (
            <button
              type="button"
              onClick={onNavigateToDiscover}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              <span>Discover Books</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Reading Goal Widget */}
      <ReadingGoalWidget darkMode={darkMode} refreshTrigger={goalRefreshTrigger} />

      {/* 3. Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Books */}
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all text-left cursor-pointer ${
            activeFilter === 'ALL'
              ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm'
              : darkMode
              ? 'bg-[#0f172a]/80 border-gray-800 hover:border-gray-700'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Books
            </span>
            <Bookmark className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-gray-900 dark:text-white">
            {counts.total}
          </p>
        </button>

        {/* Not Started */}
        <button
          type="button"
          onClick={() => setActiveFilter('NOT_STARTED')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all text-left cursor-pointer ${
            activeFilter === 'NOT_STARTED'
              ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm'
              : darkMode
              ? 'bg-[#0f172a]/80 border-gray-800 hover:border-gray-700'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Not Started
            </span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-blue-600 dark:text-blue-400">
            {counts.notStarted}
          </p>
        </button>

        {/* Currently Reading */}
        <button
          type="button"
          onClick={() => setActiveFilter('READING')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all text-left cursor-pointer ${
            activeFilter === 'READING'
              ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 shadow-sm'
              : darkMode
              ? 'bg-[#0f172a]/80 border-gray-800 hover:border-gray-700'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reading
            </span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-amber-600 dark:text-amber-400">
            {counts.reading}
          </p>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => setActiveFilter('COMPLETED')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all text-left cursor-pointer ${
            activeFilter === 'COMPLETED'
              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-sm'
              : darkMode
              ? 'bg-[#0f172a]/80 border-gray-800 hover:border-gray-700'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
            {counts.completed}
          </p>
        </button>
      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('NOT_STARTED')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeFilter === 'NOT_STARTED'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Not Started ({counts.notStarted})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('READING')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeFilter === 'READING'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Currently Reading ({counts.reading})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('COMPLETED')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({counts.completed})
          </button>
        </div>

        {/* In-shelf Search Filter */}
        {counts.total > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* 5. Library Bookshelf Cards Grid */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : displayedItems.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-500 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {counts.total === 0
              ? 'My Bookshelf is Empty'
              : `No books found in "${activeFilter.replace('_', ' ')}"`}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mt-2 mb-6">
            {counts.total === 0
              ? 'Save books you want to read later and they’ll appear here in your personal library.'
              : filterQuery
              ? `No books in your library match "${filterQuery}".`
              : 'Add or update books in your collection to view them in this category.'}
          </p>
          {onNavigateToDiscover && (
            <button
              type="button"
              onClick={onNavigateToDiscover}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer hover:scale-105"
            >
              <Search className="w-4 h-4" />
              <span>Discover Books</span>
            </button>
          )}
        </div>
      ) : (
        /* Dynamic Library Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map(({ item, book, readingState }) => {
            const authorsText =
              book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author';
            const bookIsFavorite = isFavorite ? isFavorite(book.key) : false;

            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(book)}
                className={`group relative flex flex-col justify-between rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border cursor-pointer ${
                  darkMode
                    ? 'bg-[#0f172a]/90 border-gray-800 hover:border-indigo-500/50'
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                {/* Top Half: Cover & Meta Details */}
                <div className="p-5 flex gap-4 items-start">
                  {/* Book Cover Thumbnail */}
                  <div className="w-24 h-36 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-gray-200 dark:border-gray-700/80 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 text-white">
                        <Bookmark className="w-6 h-6 text-indigo-400 mb-1" />
                        <span className="text-[9px] font-bold line-clamp-2">{book.title}</span>
                      </div>
                    )}

                    {/* Cover Status Tag */}
                    {readingState.isCompleted && (
                      <div className="absolute top-1.5 left-1.5 p-1 rounded-full bg-emerald-500 text-white shadow-md">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Title, Author & Badges */}
                  <div className="flex-grow min-w-0 space-y-2">
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 border ${
                          readingState.state === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : readingState.state === 'reading'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {readingState.state === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : readingState.state === 'reading' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <Bookmark className="w-3 h-3" />
                        )}
                        <span>{readingState.statusBadge}</span>
                      </span>
                    </div>

                    <h3
                      title={book.title}
                      className="font-bold text-sm sm:text-base leading-snug line-clamp-2 text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors"
                    >
                      {book.title}
                    </h3>

                    <p
                      title={authorsText}
                      className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{authorsText}</span>
                    </p>

                    {book.firstPublishYear && (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Est. {book.firstPublishYear}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Half: Progress Tracker & Primary Action Buttons */}
                <div className="p-4 bg-gray-50/80 dark:bg-[#0b0f17]/60 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  {/* Progress details if reading */}
                  {readingState.isReading && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="truncate max-w-[180px]">
                          Lesson {readingState.currentLessonNumber} of {readingState.totalLessons}
                        </span>
                        <span className="text-indigo-500 font-mono">
                          {readingState.progressPercent}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${readingState.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Primary State-Based Action Button */}
                    <button
                      type="button"
                      onClick={(e) => handlePrimaryReadAction(e, book)}
                      className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
                        readingState.state === 'completed'
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-indigo-600/20'
                      }`}
                    >
                      {readingState.state === 'completed' ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Read Again</span>
                        </>
                      ) : readingState.state === 'reading' ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Continue Reading</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Read</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Actions: Favorite Toggle */}
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={(e) => handleFavoriteToggle(e, book)}
                        aria-label={bookIsFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          bookIsFavorite
                            ? 'bg-yellow-400 text-gray-950 border-yellow-400 shadow-md shadow-yellow-400/20'
                            : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-yellow-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={bookIsFavorite ? 'Favorited' : 'Add to favorites'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            bookIsFavorite ? 'fill-gray-950 text-gray-950' : 'fill-none'
                          }`}
                        />
                      </button>
                    )}

                    {/* Secondary Actions: Remove from Bookshelf */}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, item.id)}
                      aria-label={`Remove ${book.title} from bookshelf`}
                      className="p-2.5 rounded-2xl text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                      title="Remove from Bookshelf"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reading Analytics Modal */}
      <ReadingAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
};
