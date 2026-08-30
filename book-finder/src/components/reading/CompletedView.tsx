import React from 'react';
import {
  CheckCircle2,
  Trophy,
  RotateCcw,
  Star,
  Bookmark,
  Calendar,
} from 'lucide-react';
import { Book } from '../../types/book';
import { useReadingProgress } from '../../context/ReadingProgressContext';

interface CompletedViewProps {
  onOpenReader: (book: Book) => void;
  onNavigateToDiscover: () => void;
  darkMode?: boolean;
}

export const CompletedView: React.FC<CompletedViewProps> = ({
  onOpenReader,
  onNavigateToDiscover,
  darkMode = false,
}) => {
  const { completedBooks, readAgain } = useReadingProgress();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-indigo-600/10 border border-emerald-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 text-xs font-bold tracking-wide mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>READING ACHIEVEMENTS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Completed Books
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Celebrate your completed reading milestones and review your personal takeaways.
          </p>
        </div>

        {/* Count Badge */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm">
            {completedBooks.length} {completedBooks.length === 1 ? 'Book Completed' : 'Books Completed'}
          </span>
          <button
            type="button"
            onClick={onNavigateToDiscover}
            className="px-4 py-2 rounded-2xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            + Discover More
          </button>
        </div>
      </div>

      {/* Completed Books Grid */}
      {completedBooks.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto my-8 bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/80 rounded-3xl shadow-sm space-y-4">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              No Completed Books Yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Complete all lessons of a book to unlock your achievement badges and reviews.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToDiscover}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Start Reading a Book
          </button>
        </div>
      ) : (
        /* Grid of Completed Books */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedBooks.map((record) => {
            const { book, completedAt, review } = record;

            return (
              <div
                key={book.key}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                  darkMode
                    ? 'bg-[#0f172a]/80 border-gray-800 hover:border-gray-700 text-gray-100'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {/* Top Info */}
                <div className="flex items-start gap-4">
                  {/* Book Cover */}
                  <div className="w-20 h-28 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 shadow-md border border-emerald-500/20 flex items-center justify-center">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-2 text-center text-emerald-400">
                        <Bookmark className="w-6 h-6 mx-auto mb-1 opacity-75" />
                        <span className="text-[9px] font-bold uppercase block">Book</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Author */}
                  <div className="space-y-1 flex-grow overflow-hidden">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>100% Finished</span>
                    </div>

                    <h3 className="font-extrabold text-base truncate" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {book.authors.join(', ') || 'Unknown Author'}
                    </p>

                    {completedAt && (
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 pt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Completed {new Date(completedAt).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Review Snippet (if submitted) */}
                {review && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 space-y-1">
                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating ? 'fill-current text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="text-gray-600 dark:text-gray-300 font-bold ml-1">
                        {review.rating}/5
                      </span>
                    </div>
                    {review.reviewText && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-2">
                        "{review.reviewText}"
                      </p>
                    )}
                  </div>
                )}

                {/* Footer Action: Read Again */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      readAgain(book);
                      onOpenReader(book);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Read Again</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
