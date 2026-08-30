import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  onClear,
  isLoading = false,
  placeholder = 'Search by title, author, or topic...',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl px-2">
      {/* Precision 56px (h-14) Connected Search Container */}
      <div className="relative flex items-stretch h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        {/* Search / Loading Icon */}
        <div className="flex items-center pl-4 pr-1 text-gray-400 dark:text-gray-400 select-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Search Input Field (Exactly matches 56px height) */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search books"
          className="flex-grow h-full px-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base font-medium min-w-0"
        />

        {/* Clear Query 'X' Button */}
        {query && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search query"
            className="flex items-center justify-center px-3 h-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Submit Button (Exactly matches 56px height, seamlessly connected) */}
        <button
          type="button"
          onClick={onSearch}
          disabled={isLoading || !query.trim()}
          className="h-full px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Searching...</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </div>
    </div>
  );
};
