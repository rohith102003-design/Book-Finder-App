import React, { useState, useMemo } from 'react';
import { Star, Sparkles, ArrowDownAZ, ArrowUpAZ, Calendar, Search } from 'lucide-react';
import { Book, SortOrder } from '../../types/book';
import { BookCard } from '../BookCard';
import { EmptyState } from '../EmptyState';

interface FavoritesViewProps {
  favorites: Book[];
  onToggleFavorite: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  onNavigateToDiscover: () => void;
  onOpenReader?: (book: Book) => void;
  darkMode?: boolean;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onToggleFavorite,
  onSelectBook,
  onNavigateToDiscover,
  onOpenReader,
  darkMode = false,
}) => {
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  // Filter and sort favorite books
  const displayedFavorites = useMemo(() => {
    let result = [...favorites];

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authors.some((a) => a.toLowerCase().includes(q))
      );
    }

    if (sortOrder === 'az') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortOrder === 'za') {
      result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else if (sortOrder === 'year') {
      result.sort((a, b) => (b.firstPublishYear || 0) - (a.firstPublishYear || 0));
    }

    return result;
  }, [favorites, filterQuery, sortOrder]);

  const cycleSortOrder = () => {
    if (sortOrder === 'none') setSortOrder('az');
    else if (sortOrder === 'az') setSortOrder('za');
    else if (sortOrder === 'za') setSortOrder('year');
    else setSortOrder('none');
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'az':
        return { label: 'Title (A → Z)', icon: <ArrowDownAZ className="w-4 h-4 text-indigo-400" /> };
      case 'za':
        return { label: 'Title (Z → A)', icon: <ArrowUpAZ className="w-4 h-4 text-indigo-400" /> };
      case 'year':
        return { label: 'Newest Year', icon: <Calendar className="w-4 h-4 text-indigo-400" /> };
      default:
        return { label: 'Default Order', icon: <Sparkles className="w-4 h-4 text-gray-400" /> };
    }
  };

  const sortInfo = getSortLabel();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-indigo-500/10 border border-yellow-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-yellow-600 dark:text-yellow-400 text-xs font-bold tracking-wide mb-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>SAVED LIBRARY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            My Favorites
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Your saved books, all in one place.
          </p>
        </div>

        {/* Count Badge & Quick CTA */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm">
            {favorites.length} {favorites.length === 1 ? 'Book Saved' : 'Books Saved'}
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

      {/* Main Content Area */}
      {favorites.length === 0 ? (
        /* Empty State */
        <EmptyState
          type="no-favorites"
          onActionClick={onNavigateToDiscover}
        />
      ) : (
        /* Favorites Grid with Controls */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            {/* Search within favorites */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter saved titles or authors..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={cycleSortOrder}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm border cursor-pointer bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {sortInfo.icon}
              <span>Sort: {sortInfo.label}</span>
            </button>
          </div>

          {/* Cards Grid */}
          {displayedFavorites.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500 text-sm">
              No saved books match "{filterQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedFavorites.map((book) => (
                <BookCard
                  key={book.key}
                  book={book}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onSelectBook={onSelectBook}
                  onOpenReader={onOpenReader}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
