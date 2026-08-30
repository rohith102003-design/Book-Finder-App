import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Sliders,
  Star,
  BookOpen,
  RefreshCw,
  Bookmark,
  Check,
  Play,
  Calendar,
  Users,
} from 'lucide-react';
import { BookRecommendationItem } from '../../types/recommendation';
import { recommendationService } from '../../services/recommendationService';
import { useAuth } from '../../context/AuthContext';
import { useBookshelf } from '../../context/BookshelfContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { RecommendationPreferencesModal } from './RecommendationPreferencesModal';
import { Book } from '../../types/book';

interface RecommendationSectionProps {
  onSelectBook?: (workId: string) => void;
  onOpenReader?: (book: Book) => void;
  darkMode?: boolean;
}

// Curated master literature companion catalog for rich dynamic fallbacks
const CURATED_CANDIDATES: Array<{
  openlibrary_work_id: string;
  title: string;
  authors: string[];
  first_publish_year: number;
  cover_url: string;
  subjects: string[];
  average_rating: number;
  baseScore: number;
  reasons: string[];
}> = [
  {
    openlibrary_work_id: 'OL82563W',
    title: "Harry Potter and the Philosopher's Stone",
    authors: ['J.K. Rowling'],
    first_publish_year: 1997,
    cover_url: 'https://covers.openlibrary.org/b/id/10521270-L.jpg',
    subjects: ['Fantasy', 'Magic', 'Wizards', 'Adventure', 'Young Adult'],
    average_rating: 4.9,
    baseScore: 92,
    reasons: ['Curated Master Guide', 'Top Rated Epic Fantasy'],
  },
  {
    openlibrary_work_id: 'OL893415W',
    title: 'Dune',
    authors: ['Frank Herbert'],
    first_publish_year: 1965,
    cover_url: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    subjects: ['Science Fiction', 'Space', 'Sci-Fi', 'Epic', 'Planetary Romance'],
    average_rating: 4.8,
    baseScore: 95,
    reasons: ['Curated Master Guide', 'Seminal Science Fiction Classic'],
  },
  {
    openlibrary_work_id: 'OL1168007W',
    title: '1984',
    authors: ['George Orwell'],
    first_publish_year: 1949,
    cover_url: 'https://covers.openlibrary.org/b/id/12818862-L.jpg',
    subjects: ['Dystopian', 'Classics', 'Political Fiction', 'Literature'],
    average_rating: 4.9,
    baseScore: 90,
    reasons: ['Curated Master Guide', 'Essential Dystopian Literature'],
  },
  {
    openlibrary_work_id: 'OL27479W',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    first_publish_year: 1937,
    cover_url: 'https://covers.openlibrary.org/b/id/12003423-L.jpg',
    subjects: ['Fantasy', 'Adventure', 'Classics', 'Dragons', 'Epic'],
    average_rating: 4.8,
    baseScore: 88,
    reasons: ['Curated Master Guide', 'High Fantasy Foundation'],
  },
  {
    openlibrary_work_id: 'OL20150375W',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    first_publish_year: 2018,
    cover_url: 'https://covers.openlibrary.org/b/id/12739343-L.jpg',
    subjects: ['Self-Help', 'Productivity', 'Habits', 'Psychology', 'Personal Development'],
    average_rating: 4.9,
    baseScore: 94,
    reasons: ['Curated Master Guide', 'Top Practical Psychology & Habits'],
  },
  {
    openlibrary_work_id: 'OL15367683W',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    authors: ['Robert C. Martin'],
    first_publish_year: 2008,
    cover_url: 'https://covers.openlibrary.org/b/id/12845624-L.jpg',
    subjects: ['Programming', 'Software Engineering', 'Computer Science', 'Technology'],
    average_rating: 4.7,
    baseScore: 91,
    reasons: ['Curated Master Guide', 'Essential Software Engineering Manual'],
  },
  {
    openlibrary_work_id: 'OL1063162W',
    title: 'Pride and Prejudice',
    authors: ['Jane Austen'],
    first_publish_year: 1813,
    cover_url: 'https://covers.openlibrary.org/b/id/12847564-L.jpg',
    subjects: ['Classics', 'Romance', 'Literature', 'Historical Fiction'],
    average_rating: 4.8,
    baseScore: 87,
    reasons: ['Curated Master Guide', 'Celebrated Literary Romance'],
  },
  {
    openlibrary_work_id: 'OL27448W',
    title: 'The Lord of the Rings',
    authors: ['J.R.R. Tolkien'],
    first_publish_year: 1954,
    cover_url: 'https://covers.openlibrary.org/b/id/12003435-L.jpg',
    subjects: ['Epic Fantasy', 'Fantasy', 'Adventure', 'Classics', 'Mythology'],
    average_rating: 4.9,
    baseScore: 96,
    reasons: ['Curated Master Guide', 'Ultimate High Fantasy Epic'],
  },
  {
    openlibrary_work_id: 'OL12345W',
    title: 'Neuromancer',
    authors: ['William Gibson'],
    first_publish_year: 1984,
    cover_url: 'https://covers.openlibrary.org/b/id/10543210-L.jpg',
    subjects: ['Cyberpunk', 'Science Fiction', 'AI', 'Technology', 'Sci-Fi'],
    average_rating: 4.7,
    baseScore: 89,
    reasons: ['Curated Master Guide', 'Definitive Cyberpunk Matrix'],
  },
  {
    openlibrary_work_id: 'OL45678W',
    title: 'Foundation',
    authors: ['Isaac Asimov'],
    first_publish_year: 1951,
    cover_url: 'https://covers.openlibrary.org/b/id/10654321-L.jpg',
    subjects: ['Science Fiction', 'Space Opera', 'Classics', 'Sci-Fi'],
    average_rating: 4.8,
    baseScore: 90,
    reasons: ['Curated Master Guide', 'Classic Galactic Psychohistory'],
  },
];

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  onSelectBook,
  onOpenReader,
  darkMode = false,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { addToBookshelf, isInBookshelf } = useBookshelf();
  const { startOrContinueReading } = useReadingProgress();

  const [backendRecommendations, setBackendRecommendations] = useState<
    BookRecommendationItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [addingBookId, setAddingBookId] = useState<string | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('ALL');

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await recommendationService.getRecommendations(15);
      setBackendRecommendations(res.recommendations);
    } catch {
      // Fallback cleanly to curated candidate engine
      setBackendRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Combine backend recommendations with rich curated catalog to ensure recommendations are always populated
  const allRecommendations = useMemo(() => {
    if (backendRecommendations.length > 0) {
      return backendRecommendations;
    }

    // Dynamic fallback candidates
    return CURATED_CANDIDATES.map((c) => ({
      book_id: c.openlibrary_work_id,
      openlibrary_work_id: c.openlibrary_work_id,
      title: c.title,
      authors: c.authors,
      cover_url: c.cover_url,
      first_publish_year: c.first_publish_year,
      subjects: c.subjects,
      score: c.baseScore,
      match_reasons: c.reasons,
      average_rating: c.average_rating,
    }));
  }, [backendRecommendations]);

  // Filter recommendations by selected quick topic chip
  const displayedRecommendations = useMemo(() => {
    if (activeQuickFilter === 'ALL') {
      return allRecommendations;
    }
    const target = activeQuickFilter.toLowerCase();
    return allRecommendations.filter((item) =>
      item.subjects.some((s) => s.toLowerCase().includes(target))
    );
  }, [allRecommendations, activeQuickFilter]);

  const handleAddShelf = async (
    e: React.MouseEvent,
    item: BookRecommendationItem
  ) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    try {
      setAddingBookId(item.book_id);
      await addToBookshelf(
        {
          key: `/works/${item.openlibrary_work_id.replace('/works/', '')}`,
          title: item.title,
          authors: item.authors,
          firstPublishYear: item.first_publish_year ?? null,
          coverUrl: item.cover_url ?? null,
          description: null,
          editionCount: 1,
          subjects: item.subjects,
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
    item: BookRecommendationItem
  ) => {
    e.stopPropagation();
    const bookObj: Book = {
      key: `/works/${item.openlibrary_work_id.replace('/works/', '')}`,
      title: item.title,
      authors: item.authors,
      firstPublishYear: item.first_publish_year ?? null,
      coverUrl: item.cover_url ?? null,
      description: null,
      editionCount: 1,
      subjects: item.subjects,
    };

    startOrContinueReading(bookObj);
    if (onOpenReader) {
      onOpenReader(bookObj);
    } else if (onSelectBook) {
      onSelectBook(item.openlibrary_work_id);
    }
  };

  const handleCardClick = (item: BookRecommendationItem) => {
    if (onSelectBook) {
      onSelectBook(item.openlibrary_work_id);
    }
  };

  return (
    <section className="space-y-6 w-full max-w-7xl mx-auto">
      {/* 1. Header & Preference Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>Recommended For You</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Personalized book discovery curated by your favorite genres, authors, and completed reads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-105"
          >
            <Sliders className="w-4 h-4" />
            <span>Customize Preferences</span>
          </button>

          <button
            type="button"
            onClick={fetchRecommendations}
            disabled={loading}
            aria-label="Refresh recommendations"
            className="p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Quick Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { label: 'All Picks', key: 'ALL' },
          { label: 'Sci-Fi & Space', key: 'Science Fiction' },
          { label: 'Epic Fantasy', key: 'Fantasy' },
          { label: 'Self-Help & Habits', key: 'Self-Help' },
          { label: 'Tech & Code', key: 'Programming' },
          { label: 'Dystopian', key: 'Dystopian' },
          { label: 'Classics', key: 'Classics' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveQuickFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeQuickFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 4. Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`p-5 rounded-3xl border animate-pulse space-y-3 ${
                darkMode ? 'bg-gray-800/40 border-gray-700/60' : 'bg-white border-gray-200'
              }`}
            >
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : displayedRecommendations.length === 0 ? (
        /* Empty State */
        <div
          className={`p-12 rounded-3xl border text-center space-y-4 ${
            darkMode
              ? 'bg-gray-800/40 border-gray-700 text-gray-300'
              : 'bg-white border-gray-200 text-gray-700 shadow-sm'
          }`}
        >
          <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-lg">No Picks in this Category</h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Select another genre or adjust your preferences to explore matching literature.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveQuickFilter('ALL')}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer"
          >
            Show All Recommendations
          </button>
        </div>
      ) : (
        /* 5. Recommendation Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRecommendations.map((item) => {
            const inShelf = isInBookshelf(item.openlibrary_work_id);

            return (
              <div
                key={item.book_id}
                onClick={() => handleCardClick(item)}
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
                    {item.cover_url ? (
                      <img
                        src={item.cover_url}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 text-white">
                        <BookOpen className="w-6 h-6 text-indigo-400 mb-1" />
                        <span className="text-[9px] font-bold line-clamp-2">{item.title}</span>
                      </div>
                    )}

                    {/* Match Score Badge on Cover */}
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black tracking-wider shadow-md">
                      {item.score}% Match
                    </div>
                  </div>

                  {/* Title, Author & Badges */}
                  <div className="flex-grow min-w-0 space-y-2">
                    {/* Match Reasons Badges */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.match_reasons.slice(0, 1).map((reason, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 truncate max-w-[180px]"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>

                    <h3
                      title={item.title}
                      className="font-bold text-sm sm:text-base leading-snug line-clamp-2 text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.authors.length > 0 ? item.authors.join(', ') : 'Unknown'}</span>
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                      {item.average_rating > 0 && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{item.average_rating.toFixed(1)}</span>
                        </span>
                      )}
                      {item.first_publish_year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.first_publish_year}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Half: Primary Read & Bookshelf Actions */}
                <div className="p-4 bg-gray-50/80 dark:bg-[#0b0f17]/60 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                  {/* Primary Read Button */}
                  <button
                    type="button"
                    onClick={(e) => handleReadClick(e, item)}
                    className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Read Guide</span>
                  </button>

                  {/* Add to Bookshelf Button */}
                  <button
                    type="button"
                    onClick={(e) => handleAddShelf(e, item)}
                    disabled={inShelf || addingBookId === item.book_id}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                      inShelf
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 cursor-default'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                    title={inShelf ? 'In Bookshelf' : 'Add to Bookshelf'}
                  >
                    {inShelf ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">+ Shelf</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preferences Modal */}
      <RecommendationPreferencesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchRecommendations}
        darkMode={darkMode}
      />
    </section>
  );
};
