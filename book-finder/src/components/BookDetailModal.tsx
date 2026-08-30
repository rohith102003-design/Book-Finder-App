import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, BookOpen, Layers, Users, Bookmark, Check, Play, CheckCircle2, List } from 'lucide-react';
import { Book } from '../types/book';
import { useAuth } from '../context/AuthContext';
import { useBookshelf } from '../context/BookshelfContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { getReadingContentForBook } from '../data/reading/bookReadingRegistry';
import { getBookReadingState } from '../utils/readingState';
import { ReviewSection } from './reviews/ReviewSection';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
  darkMode: boolean;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenReader,
  darkMode,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { isInBookshelf, addToBookshelf } = useBookshelf();
  const { getProgress, startOrContinueReading } = useReadingProgress();
  const [imageError, setImageError] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Reset image error state on book change
  useEffect(() => {
    setImageError(false);
  }, [book?.key]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const authorsText = book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author';
  const isSavedInShelf = isInBookshelf(book.key);
  const readingRecord = getProgress(book.key);
  const readingState = getBookReadingState(book, readingRecord);
  const readingContent = getReadingContentForBook(book);

  const handleBookshelfAction = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!isSavedInShelf) {
      setIsAdding(true);
      try {
        await addToBookshelf(book);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleReadAction = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    startOrContinueReading(book);
    onClose();
    if (onOpenReader) {
      onOpenReader(book);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-6 ${
            darkMode ? 'bg-gray-900 text-white border border-gray-800' : 'bg-white text-gray-900 border border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details modal"
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header & Cover Grid */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Cover Image */}
            <div className="w-full sm:w-48 flex-shrink-0 flex justify-center">
              <div className="w-40 sm:w-48 h-60 sm:h-72 rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 relative">
                {book.coverUrl && !imageError ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
                    <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs font-medium">No Cover Available</span>
                  </div>
                )}

                {/* Reading Status Pill */}
                {readingState.state !== 'not_started' && (
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-md">
                    {readingState.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                        <span>Finished</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current text-white" />
                        <span>Reading ({readingState.progressPercent}%)</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Details & Actions */}
            <div className="flex-grow space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                {readingContent.genre || 'Literature Guide'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {book.title}
              </h2>

              <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>By {authorsText}</span>
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold pt-1">
                {book.firstPublishYear && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Calendar className="w-3.5 h-3.5" />
                    Published: {book.firstPublishYear}
                  </span>
                )}

                {book.editionCount > 1 && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Layers className="w-3.5 h-3.5" />
                    {book.editionCount} Editions
                  </span>
                )}
              </div>

              {/* Action Buttons: Start Reading + Bookshelf + Favorites */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                {/* Primary Read Button */}
                <button
                  type="button"
                  onClick={handleReadAction}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{readingState.label}</span>
                </button>

                {/* Bookshelf Button */}
                <button
                  type="button"
                  onClick={handleBookshelfAction}
                  disabled={isAdding}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-xs transition-all cursor-pointer ${
                    isSavedInShelf
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {isSavedInShelf ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Shelf Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>{isAdding ? 'Adding...' : '+ Bookshelf'}</span>
                    </>
                  )}
                </button>

                {/* Favorites Button */}
                <button
                  type="button"
                  onClick={() => onToggleFavorite(book)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-xs transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-950 shadow-yellow-400/20'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-gray-950' : 'fill-none'}`} />
                  <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: ABOUT THIS BOOK */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              About This Book
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {readingContent.summary}
            </p>
          </div>

          {/* Section 2: WHAT YOU'LL EXPLORE (Curriculum / Reading Guide Preview) */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  What You'll Explore ({readingContent.totalLessons} Lessons)
                </h3>
              </div>
              <span className="text-[11px] font-medium text-gray-400">
                {readingContent.totalChapters} Chapters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {readingContent.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-xs flex items-start gap-2 border border-gray-100 dark:border-gray-800/60"
                >
                  <span className="text-[10px] font-mono font-bold text-indigo-500 mt-0.5">
                    {lesson.lessonNumber}.
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {lesson.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{lesson.chapterTitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleReadAction}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Guide</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>

          {/* Section 3: Community Reviews & Ratings */}
          <ReviewSection
            workId={book.key}
            bookTitle={book.title}
            darkMode={darkMode}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
