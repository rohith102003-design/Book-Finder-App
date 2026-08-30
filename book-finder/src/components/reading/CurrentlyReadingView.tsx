import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Trash2,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { Book } from '../../types/book';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { getReadingContentForBook } from '../../data/reading/bookReadingRegistry';

interface CurrentlyReadingViewProps {
  onOpenReader: (book: Book) => void;
  onNavigateToDiscover: () => void;
  darkMode?: boolean;
}

export const CurrentlyReadingView: React.FC<CurrentlyReadingViewProps> = ({
  onOpenReader,
  onNavigateToDiscover,
  darkMode = false,
}) => {
  const { activeSessions, startOrContinueReading, removeFromReading } = useReadingProgress();

  const sessionsList = Object.values(activeSessions);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-indigo-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-500 text-xs font-bold tracking-wide mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ACTIVE READING SESSIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Currently Reading
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Resume your active reading guides right where you stopped.
          </p>
        </div>

        {/* Count Badge */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm">
            {sessionsList.length} {sessionsList.length === 1 ? 'Active Book' : 'Active Books'}
          </span>
          <button
            type="button"
            onClick={onNavigateToDiscover}
            className="px-4 py-2 rounded-2xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            + Explore Books
          </button>
        </div>
      </div>

      {/* Main Content List */}
      {sessionsList.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto my-8 bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/80 rounded-3xl shadow-sm space-y-4">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              No Books In Progress
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Start a book and your reading progress will appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToDiscover}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Explore & Discover Books
          </button>
        </div>
      ) : (
        /* Active Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessionsList.map((record) => {
            const { book, progressPercentage, currentLessonIndex, completedLessonIds } = record;
            const content = getReadingContentForBook(book);
            const totalLessons = content.totalLessons || content.lessons.length;
            const currentLesson = content.lessons[currentLessonIndex] || content.lessons[0];

            return (
              <div
                key={book.key}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                  darkMode
                    ? 'bg-[#0f172a]/80 border-gray-800 hover:border-gray-700 text-gray-100'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {/* Top Details */}
                <div className="flex items-start gap-4">
                  {/* Book Cover / Fallback */}
                  <div className="w-20 h-28 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 shadow-md border border-indigo-500/20 flex items-center justify-center">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-2 text-center text-indigo-400">
                        <Bookmark className="w-6 h-6 mx-auto mb-1 opacity-75" />
                        <span className="text-[9px] font-bold uppercase block">Guide</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Author */}
                  <div className="space-y-1.5 flex-grow overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-500 font-bold px-2 py-0.5 rounded-full bg-indigo-500/10">
                        {content.genre || 'Reading Guide'}
                      </span>
                      {content.sourceType === 'curated-guide' && (
                        <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> Curated
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg truncate" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      By {book.authors.join(', ') || 'Unknown Author'}
                    </p>

                    {/* Active Resume Location */}
                    <div className="pt-2 text-xs">
                      <span className="text-gray-400 block text-[11px]">Continue from:</span>
                      <span className="font-bold text-indigo-500 dark:text-indigo-400 block truncate">
                        "{currentLesson?.title || 'Lesson 1'}"
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Actions */}
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {/* Progress Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      {completedLessonIds.length} / {totalLessons} lessons completed
                    </span>
                    <span className="font-bold text-indigo-500 font-mono">{progressPercentage}%</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => removeFromReading(book.key)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove from currently reading"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        startOrContinueReading(book);
                        onOpenReader(book);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span>Continue Reading</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
