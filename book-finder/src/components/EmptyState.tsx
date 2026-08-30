import React from 'react';
import { Search, BookX, StarOff, Compass, RefreshCw } from 'lucide-react';

type EmptyStateType = 'initial' | 'no-results' | 'no-favorites';

interface EmptyStateProps {
  type: EmptyStateType;
  query?: string;
  onActionClick?: () => void;
  onSelectSuggestion?: (suggestion: string) => void;
  onSearchAgain?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  query,
  onActionClick,
  onSelectSuggestion,
  onSearchAgain,
}) => {
  const suggestions = ['Dune', 'Harry Potter', 'Atomic Habits', 'The Hobbit', '1984', 'Clean Code'];

  switch (type) {
    case 'no-results':
      return (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-lg mx-auto my-8 bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/80 rounded-3xl backdrop-blur-sm shadow-sm">
          <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl text-indigo-500 mb-4">
            <BookX className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Books Found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            We couldn't find books matching <span className="font-bold text-gray-700 dark:text-gray-200">"{query}"</span>. Try another title, author, or topic.
          </p>

          {/* Quick Suggestions */}
          {onSelectSuggestion && (
            <div className="w-full mb-6 space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Popular Searches
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onSelectSuggestion(item)}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700/60 hover:bg-indigo-600 hover:text-white text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {onSearchAgain && (
              <button
                type="button"
                onClick={onSearchAgain}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Search Again</span>
              </button>
            )}

            {onActionClick && (
              <button
                type="button"
                onClick={onActionClick}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Back to Discover</span>
              </button>
            )}
          </div>
        </div>
      );

    case 'no-favorites':
      return (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto my-8 bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/80 rounded-3xl shadow-sm">
          <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500 mb-4">
            <StarOff className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Favorite Books Yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Books you favorite will appear here.
          </p>
          {onActionClick && (
            <button
              onClick={onActionClick}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Discover Books
            </button>
          )}
        </div>
      );

    case 'initial':
    default:
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto my-8">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 mb-4">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Find Your Next Read
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Type a title, author, or subject above to search millions of books via OpenLibrary.
          </p>
        </div>
      );
  }
};
