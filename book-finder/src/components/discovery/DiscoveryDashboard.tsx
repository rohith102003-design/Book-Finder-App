import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Flame,
  Compass,
  RefreshCw,
} from 'lucide-react';
import { Book } from '../../types/book';
import { SearchBar } from '../SearchBar';
import { BookCard } from '../BookCard';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { searchBooksByTitle } from '../../services/openLibrary';

interface DiscoveryDashboardProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (explicitQuery?: string) => void;
  onClear: () => void;
  isLoading: boolean;
  onSelectBook: (book: Book) => void;
  isFavorite: (bookKey: string) => boolean;
  onToggleFavorite: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
  darkMode?: boolean;
}

const QUICK_SEARCHES = [
  'Dune',
  'Harry Potter',
  'Atomic Habits',
  'Clean Code',
  'The Hobbit',
  '1984',
  'Project Hail Mary',
  'Sapiens',
];

const GENRE_CATEGORIES = [
  {
    id: 'fiction',
    name: 'Fiction & Novels',
    query: 'fiction novels',
    emoji: '📚',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-500',
    description: 'Literary classics, modern drama & compelling stories',
  },
  {
    id: 'scifi',
    name: 'Science Fiction',
    query: 'science fiction space',
    emoji: '🚀',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-500',
    description: 'Space exploration, cyber worlds & alternate futures',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    query: 'epic fantasy magic',
    emoji: '🧙',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-500',
    description: 'Magical realms, mythical creatures & heroic quests',
  },
  {
    id: 'mystery',
    name: 'Mystery & Thriller',
    query: 'mystery thriller detective',
    emoji: '🔎',
    color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-500',
    description: 'Suspenseful investigations & psychological twists',
  },
  {
    id: 'romance',
    name: 'Romance',
    query: 'romance love stories',
    emoji: '❤️',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-500',
    description: 'Heartfelt journeys, deep connections & passion',
  },
  {
    id: 'biography',
    name: 'Biography',
    query: 'biography autobiography memoirs',
    emoji: '👤',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-500',
    description: 'Inspiring life stories, historical figures & memoirs',
  },
  {
    id: 'history',
    name: 'History',
    query: 'world history civilization',
    emoji: '📖',
    color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-500',
    description: 'Ancient empires, world revolutions & historic eras',
  },
  {
    id: 'technology',
    name: 'Technology',
    query: 'computer science programming technology',
    emoji: '💻',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-500',
    description: 'Software engineering, artificial intelligence & systems',
  },
  {
    id: 'self-help',
    name: 'Self-Help',
    query: 'self help productivity personal growth',
    emoji: '🧠',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-500',
    description: 'Habits, mindset, productivity & mental resilience',
  },
  {
    id: 'business',
    name: 'Business',
    query: 'business economics leadership',
    emoji: '💼',
    color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-500',
    description: 'Entrepreneurship, leadership & strategic management',
  },
];

export const DiscoveryDashboard: React.FC<DiscoveryDashboardProps> = ({
  query,
  onQueryChange,
  onSearch,
  onClear,
  isLoading,
  onSelectBook,
  isFavorite,
  onToggleFavorite,
  onOpenReader,
  darkMode = false,
}) => {
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loadingCurated, setLoadingCurated] = useState<boolean>(true);
  const [curatedError, setCuratedError] = useState<string | null>(null);

  const fetchCuratedSections = async () => {
    try {
      setLoadingCurated(true);
      setCuratedError(null);

      // Fetch trending and popular titles in parallel
      const [trendingRes, popularRes] = await Promise.all([
        searchBooksByTitle('the lord of the rings', undefined, 6),
        searchBooksByTitle('classic fiction masterpiece', undefined, 6),
      ]);

      setTrendingBooks(trendingRes.books);
      setPopularBooks(popularRes.books);
    } catch {
      setCuratedError('Unable to load curated recommendations right now.');
    } finally {
      setLoadingCurated(false);
    }
  };

  useEffect(() => {
    fetchCuratedSections();
  }, []);

  const handleChipClick = (term: string) => {
    onQueryChange(term);
    onSearch(term);
  };

  return (
    <div className="w-full space-y-12">
      {/* 1. Hero Search Section */}
      <section
        className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center space-y-6 transition-colors ${
          darkMode
            ? 'bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-indigo-500/20 shadow-xl'
            : 'bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-purple-50/70 border border-indigo-100 shadow-sm'
        }`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-4 h-4" />
          <span>BIBLIOTRACK DISCOVERY ENGINE</span>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          <h2
            className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Discover Your Next Great Read
          </h2>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-slate-600'
            }`}
          >
            Explore millions of books, find your next read, and discover popular genres with real-time OpenLibrary search.
          </p>
        </div>

        {/* Central Search Bar */}
        <div className="flex justify-center w-full">
          <SearchBar
            query={query}
            onQueryChange={onQueryChange}
            onSearch={() => onSearch()}
            onClear={onClear}
            isLoading={isLoading}
            placeholder="Search by title, author, or topic..."
          />
        </div>

        {/* Quick Search Chips */}
        <div className="space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Quick Searches
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {QUICK_SEARCHES.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 cursor-pointer ${
                  darkMode
                    ? 'bg-white/5 hover:bg-indigo-600/20 text-gray-300 hover:text-white border border-white/10 hover:border-indigo-500/40 backdrop-blur-sm'
                    : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Explore by Genre (10 Genre Cards) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Explore by Genre</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Browse curated collections across your favorite literary categories
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {GENRE_CATEGORIES.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => handleChipClick(genre.query)}
              className={`flex flex-col items-start p-5 rounded-2xl border transition-all duration-200 text-left bg-gradient-to-br ${
                genre.color
              } hover:scale-[1.03] hover:shadow-lg group cursor-pointer ${
                darkMode ? 'bg-[#0f172a]/60 hover:bg-[#1e293b]/80' : 'bg-white hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                {genre.emoji}
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-400 transition-colors">
                {genre.name}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {genre.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Trending Books Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Trending This Week</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Most discovered and discussed titles by the reading community
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchCuratedSections}
            disabled={loadingCurated}
            aria-label="Refresh curated books"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCurated ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {curatedError ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {curatedError}
          </div>
        ) : loadingCurated ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingBooks.slice(0, 4).map((book) => (
              <BookCard
                key={book.key}
                book={book}
                isFavorite={isFavorite(book.key)}
                onToggleFavorite={onToggleFavorite}
                onSelectBook={onSelectBook}
                onOpenReader={onOpenReader}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Popular Books Section */}
      {popularBooks.length > 0 && !loadingCurated && (
        <section className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Popular Masterpieces</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Timeless bestsellers and critically acclaimed favorites
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularBooks.slice(0, 4).map((book) => (
              <BookCard
                key={book.key}
                book={book}
                isFavorite={isFavorite(book.key)}
                onToggleFavorite={onToggleFavorite}
                onSelectBook={onSelectBook}
                onOpenReader={onOpenReader}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. How It Works Guide */}
      <section className="p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800/80 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h3 className="text-2xl font-bold tracking-tight">How It Works</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            A comprehensive reading suite designed for modern book lovers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {[
            {
              step: '01',
              title: 'Search Books',
              desc: 'Search titles, authors, and topics across OpenLibrary in real-time.',
              icon: '🔍',
            },
            {
              step: '02',
              title: 'Discover Trends',
              desc: 'Explore curated genres, quick searches, and trending titles.',
              icon: '✨',
            },
            {
              step: '03',
              title: 'Track Reading',
              desc: 'Organize personal bookshelves with page tracking and reading states.',
              icon: '🔖',
            },
            {
              step: '04',
              title: 'Rate & Review',
              desc: 'Write detailed reviews, submit star ratings, and earn verified badges.',
              icon: '⭐',
            },
            {
              step: '05',
              title: 'Connect Socially',
              desc: 'Follow fellow readers, upvote reviews, and track friends in the feed.',
              icon: '👥',
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-5 rounded-2xl border transition-all ${
                darkMode
                  ? 'bg-[#0f172a]/80 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400">
                  {item.step}
                </span>
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
