import React, { useState, useMemo } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BookshelfProvider } from './context/BookshelfContext';
import { NotificationProvider } from './context/NotificationContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { ReadingProgressProvider, useReadingProgress } from './context/ReadingProgressContext';
import { Navbar, AppView } from './components/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';
import { ErrorBanner } from './components/ErrorBanner';
import { AuthModal } from './components/auth/AuthModal';
import { BookshelfView } from './components/bookshelf/BookshelfView';
import { SocialFeed } from './components/social/SocialFeed';
import { RecommendationSection } from './components/recommendations/RecommendationSection';
import { DiscoveryDashboard } from './components/discovery/DiscoveryDashboard';
import { FavoritesView } from './components/favorites/FavoritesView';
import { CurrentlyReadingView } from './components/reading/CurrentlyReadingView';
import { CompletedView } from './components/reading/CompletedView';
import { ReaderView } from './components/reading/ReaderView';
import { PublicProfileModal } from './components/social/PublicProfileModal';

import { useAuth } from './context/AuthContext';
import { useBookSearch } from './hooks/useBookSearch';
import { useDarkMode } from './hooks/useDarkMode';
import { Book, SortOrder } from './types/book';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';

function BookFinderContent() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { activeReadingBook } = useReadingProgress();

  // Persist active view across browser refreshes
  const [activeView, setActiveView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem('biblio_active_view') as AppView;
      return saved || 'discover';
    } catch {
      return 'discover';
    }
  });

  const handleViewChange = (view: AppView) => {
    setActiveView(view);
    try {
      localStorage.setItem('biblio_active_view', view);
    } catch {}
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProfileUser, setSelectedProfileUser] = useState<{ id: string; username: string } | null>(null);

  const {
    query,
    setQuery,
    books,
    isLoading,
    error,
    hasSearched,
    handleSearch,
    clearSearch,
  } = useBookSearch();

  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Automatically reset non-discover views to discover only on explicit logout after auth check completes
  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && activeView !== 'discover') {
      setActiveView('discover');
      try {
        localStorage.setItem('biblio_active_view', 'discover');
      } catch {}
    }
  }, [isAuthenticated, isAuthLoading, activeView]);

  // Wrapper for new searches: requires login before executing search
  const triggerNewSearch = (newQuery?: string) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setSelectedCategory('all');
    handleSearch(newQuery);
  };

  // Compute displayed books with memoized sorting and filtering
  const displayedBooks = useMemo(() => {
    let sourceBooks = books;

    // Category filtering on subjects/title
    if (selectedCategory !== 'all') {
      const cat = selectedCategory.toLowerCase();
      sourceBooks = sourceBooks.filter((b) => {
        const titleMatch = (b.title || '').toLowerCase().includes(cat);
        const subjectMatch = (b.subjects || []).some((s) => s.toLowerCase().includes(cat));
        return titleMatch || subjectMatch;
      });
    }

    if (sortOrder === 'none') {
      return sourceBooks;
    }

    return [...sourceBooks].sort((a, b) => {
      if (sortOrder === 'az') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortOrder === 'za') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (sortOrder === 'year') {
        const yearA = a.firstPublishYear || 0;
        const yearB = b.firstPublishYear || 0;
        return yearB - yearA;
      }
      return 0;
    });
  }, [books, selectedCategory, sortOrder]);

  const isBrowsingDashboard = !hasSearched && books.length === 0;

  if (isAuthLoading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
          darkMode ? 'bg-[#0b0f17] text-gray-100' : 'bg-slate-50 text-gray-900'
        }`}
      >
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <BookOpen className="w-7 h-7 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Restoring library session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? 'bg-[#0b0f17] text-gray-100' : 'bg-slate-50 text-gray-900'
      }`}
    >
      {/* 1. TOP NAVBAR - Full Width Header (Brand & Global Controls) */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        favoritesCount={favorites.length}
        activeView={activeView}
        onViewChange={handleViewChange}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onSelectUser={(user) => setSelectedProfileUser(user)}
      />

      {/* 2. APPLICATION SHELL: SIDEBAR (Starts BELOW Navbar) + MAIN CONTENT */}
      <div className="flex-1 flex flex-row relative min-w-0">
        {/* Left Sidebar (Below Top Navbar) */}
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          favoritesCount={favorites.length}
          darkMode={darkMode}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Main Application Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`}
        >
          {activeView === 'reader' ? (
            /* Interactive Full-Page Reader View */
            <main className="flex-grow flex flex-col px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
              <ReaderView
                onBack={() => handleViewChange('discover')}
                darkMode={darkMode}
                onToggleFavorite={(key) => {
                  const targetBook =
                    activeReadingBook && activeReadingBook.key === key
                      ? activeReadingBook
                      : favorites.find((f) => f.key === key);
                  if (targetBook) toggleFavorite(targetBook);
                }}
                isFavorite={activeReadingBook ? isFavorite(activeReadingBook.key) : false}
              />
            </main>
          ) : activeView === 'currently-reading' ? (
            /* Currently Reading Dashboard */
            <main className="flex-grow flex flex-col items-center px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
              <CurrentlyReadingView
                onOpenReader={() => handleViewChange('reader')}
                onNavigateToDiscover={() => handleViewChange('discover')}
                darkMode={darkMode}
              />
            </main>
          ) : activeView === 'completed' ? (
            /* Completed Books View */
            <main className="flex-grow flex flex-col items-center px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
              <CompletedView
                onOpenReader={() => handleViewChange('reader')}
                onNavigateToDiscover={() => handleViewChange('discover')}
                darkMode={darkMode}
              />
            </main>
          ) : activeView === 'favorites' ? (
            /* Dedicated Favorites Page */
            <main className="flex-grow flex flex-col items-center px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
              <FavoritesView
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onSelectBook={setSelectedBook}
                onNavigateToDiscover={() => handleViewChange('discover')}
                onOpenReader={() => handleViewChange('reader')}
                darkMode={darkMode}
              />
            </main>
          ) : activeView === 'bookshelf' ? (
            /* My Bookshelf Page */
            <main className="flex-grow flex flex-col items-center px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
              <BookshelfView
                darkMode={darkMode}
                onNavigateToDiscover={() => handleViewChange('discover')}
                onOpenReader={() => handleViewChange('reader')}
                onSelectBook={setSelectedBook}
                isFavorite={(key) => isFavorite(key)}
                onToggleFavorite={toggleFavorite}
              />
            </main>
          ) : activeView === 'recommendations' ? (
            /* Recommendations Page */
            <main className="flex-grow flex flex-col px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
              <RecommendationSection
                onSelectBook={(workId) => {
                  setSelectedBook({
                    key: `/works/${workId.replace('/works/', '')}`,
                    title: 'Loading Book...',
                    authors: [],
                    firstPublishYear: null,
                    coverUrl: null,
                    description: null,
                    editionCount: 1,
                    subjects: [],
                  });
                }}
                onOpenReader={() => handleViewChange('reader')}
                darkMode={darkMode}
              />
            </main>
          ) : activeView === 'feed' ? (
            /* Social Community Feed */
            <main className="flex-grow flex flex-col px-4 sm:px-8 py-8 max-w-5xl w-full mx-auto">
              <SocialFeed
                darkMode={darkMode}
                onSelectBook={(workId: string) => {
                  setSelectedBook({
                    key: `/works/${workId.replace('/works/', '')}`,
                    title: 'Loading Book...',
                    authors: [],
                    firstPublishYear: null,
                    coverUrl: null,
                    description: null,
                    editionCount: 1,
                    subjects: [],
                  });
                }}
                onOpenReader={(book: Book) => {
                  setSelectedBook(book);
                  handleViewChange('reader');
                }}
                onSelectUser={(user) => setSelectedProfileUser(user)}
              />
            </main>
          ) : (
            /* Discover & Search Hub */
            <main className="flex-grow flex flex-col items-center px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
              {/* Discovery Engine Dashboard (Hero with central search bar - no duplicate stacked bar) */}
              {isBrowsingDashboard ? (
                <div className="w-full">
                  <DiscoveryDashboard
                    query={query}
                    onQueryChange={setQuery}
                    onSearch={triggerNewSearch}
                    onClear={clearSearch}
                    isLoading={isLoading}
                    onSelectBook={setSelectedBook}
                    isFavorite={(key) => isFavorite(key)}
                    onToggleFavorite={toggleFavorite}
                    onOpenReader={(book) => {
                      setSelectedBook(book);
                      handleViewChange('reader');
                    }}
                    darkMode={darkMode}
                  />
                </div>
              ) : (
                /* Search Results View (With top search bar and filter controls) */
                <div className="w-full">
                  {/* Back to Discovery Dashboard Button */}
                  <div className="w-full flex items-center justify-between mb-4">
                    <button
                      onClick={() => {
                        clearSearch();
                        setSelectedCategory('all');
                      }}
                      className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                        darkMode
                          ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Discovery Home</span>
                    </button>

                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Showing results for <span className="text-indigo-500 font-bold">"{query}"</span>
                    </p>
                  </div>

                  {/* Primary Search Bar Component for Active Search Results */}
                  <div className="w-full max-w-3xl mb-4 mx-auto">
                    <SearchBar
                      query={query}
                      onQueryChange={setQuery}
                      onSearch={() => triggerNewSearch()}
                      onClear={clearSearch}
                      isLoading={isLoading}
                    />
                  </div>

                  <FilterPanel
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    totalDisplayed={displayedBooks.length}
                  />

                  {error && <ErrorBanner message={error} onRetry={() => handleSearch()} />}

                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : displayedBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {displayedBooks.map((book) => (
                        <BookCard
                          key={book.key}
                          book={book}
                          isFavorite={isFavorite(book.key)}
                          onToggleFavorite={toggleFavorite}
                          onSelectBook={setSelectedBook}
                          onOpenReader={(b) => {
                            setSelectedBook(b);
                            handleViewChange('reader');
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      type="no-results"
                      query={query}
                      onActionClick={() => {
                        clearSearch();
                        setSelectedCategory('all');
                      }}
                    />
                  )}
                </div>
              )}
            </main>
          )}

          {/* Book Detail Modal */}
          <BookDetailModal
            book={selectedBook}
            isOpen={selectedBook !== null}
            onClose={() => setSelectedBook(null)}
            isFavorite={selectedBook ? isFavorite(selectedBook.key) : false}
            onToggleFavorite={toggleFavorite}
            onOpenReader={() => handleViewChange('reader')}
            darkMode={darkMode}
          />

          {/* Public Profile & Follower Management Modal */}
          {selectedProfileUser && (
            <PublicProfileModal
              isOpen={selectedProfileUser !== null}
              onClose={() => setSelectedProfileUser(null)}
              userId={selectedProfileUser.id}
              username={selectedProfileUser.username}
              onSelectUser={(user) => setSelectedProfileUser(user)}
              onSelectBook={(workId) => {
                setSelectedBook({
                  key: `/works/${workId.replace('/works/', '')}`,
                  title: 'Loading Book...',
                  authors: [],
                  firstPublishYear: null,
                  coverUrl: null,
                  description: null,
                  editionCount: 1,
                  subjects: [],
                });
                setSelectedProfileUser(null);
              }}
              darkMode={darkMode}
            />
          )}

          {/* Authentication Modal */}
          <AuthModal darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BookshelfProvider>
          <FavoritesProvider>
            <ReadingProgressProvider>
              <BookFinderContent />
            </ReadingProgressProvider>
          </FavoritesProvider>
        </BookshelfProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
