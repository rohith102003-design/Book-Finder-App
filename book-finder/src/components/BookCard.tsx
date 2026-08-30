import React, { useState } from 'react';
import { Star, BookOpen, Calendar, Users, Bookmark, Check, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Book } from '../types/book';
import { useAuth } from '../context/AuthContext';
import { useBookshelf } from '../context/BookshelfContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { getBookReadingState } from '../utils/readingState';

interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  onToggleFavorite: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isFavorite,
  onToggleFavorite,
  onSelectBook,
  onOpenReader,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { isInBookshelf, addToBookshelf } = useBookshelf();
  const { getProgress, startOrContinueReading } = useReadingProgress();
  const [imageError, setImageError] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const authorsText = book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author';
  const isSavedInShelf = isInBookshelf(book.key);
  const readingRecord = getProgress(book.key);
  const readingState = getBookReadingState(book, readingRecord);

  const handleBookshelfAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    startOrContinueReading(book);
    if (onOpenReader) {
      onOpenReader(book);
    }
  };

  const hasValidCover = book.coverUrl && !imageError;

  return (
    <div
      onClick={() => onSelectBook(book)}
      className="group relative flex flex-col justify-between bg-white dark:bg-gray-800/90 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-200 dark:border-gray-700/80 cursor-pointer h-full"
    >
      {/* Cover Image Container with Consistent Fixed Height */}
      <div className="relative w-full h-64 bg-slate-900 overflow-hidden flex items-center justify-center select-none">
        {hasValidCover ? (
          <img
            src={book.coverUrl!}
            alt={book.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Styled Professional Fallback Cover */
          <div className="w-full h-full p-4 flex flex-col items-center justify-between text-center bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/20 text-gray-300">
            <div className="w-full flex justify-start">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400/80 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                BiblioTrack
              </span>
            </div>

            <div className="flex flex-col items-center justify-center my-auto space-y-2">
              <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-extrabold tracking-wider text-gray-200 uppercase">
                  Book Cover
                </span>
                <span className="block text-[9px] font-bold tracking-widest text-indigo-400 uppercase">
                  Unavailable
                </span>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-gray-400 line-clamp-1 w-full px-2">
              {book.title}
            </p>
          </div>
        )}

        {/* Floating Actions: Bookshelf & Favorites */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {/* Bookshelf Quick Save Button */}
          <button
            type="button"
            onClick={handleBookshelfAction}
            aria-label={isSavedInShelf ? 'In Bookshelf' : 'Add to bookshelf'}
            className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all cursor-pointer ${
              isSavedInShelf
                ? 'bg-indigo-600 text-white scale-105 shadow-indigo-600/40'
                : 'bg-black/60 hover:bg-black/80 text-white hover:scale-105'
            }`}
          >
            {isSavedInShelf ? (
              <Check className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Favorites Star Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(book);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all cursor-pointer ${
              isFavorite
                ? 'bg-yellow-400 text-gray-950 scale-105 shadow-yellow-400/40'
                : 'bg-black/60 hover:bg-black/80 text-white hover:scale-105'
            }`}
          >
            <Star
              className={`w-4 h-4 ${isFavorite ? 'fill-gray-950 text-gray-950' : 'fill-none'}`}
            />
          </button>
        </div>

        {/* Publication Year Badge */}
        {book.firstPublishYear && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1 border border-white/10 z-10">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{book.firstPublishYear}</span>
          </div>
        )}

        {/* Reading Status Pill (Floating over cover) */}
        {readingState.state !== 'not_started' && (
          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1 border border-indigo-400/30 z-10 shadow-md">
            {readingState.isCompleted ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                <span>Finished</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 fill-current text-white" />
                <span>{readingState.progressPercent}%</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Card Body Details */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <h3
            title={book.title}
            className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug line-clamp-2 mb-1 group-hover:text-indigo-500 transition-colors"
          >
            {book.title}
          </h3>

          <p
            title={authorsText}
            className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <span>{authorsText}</span>
          </p>
        </div>

        {/* Card Footer Actions: Primary Read Button + Bookshelf Quick Add */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
          {/* Primary Interactive Read Button */}
          <button
            type="button"
            onClick={handleReadClick}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                <span>Continue</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Read</span>
              </>
            )}
          </button>

          {/* Bookshelf Status / Add Button */}
          <button
            type="button"
            onClick={handleBookshelfAction}
            disabled={isAdding}
            className={`text-xs font-semibold px-2.5 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              isSavedInShelf
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
            title={isSavedInShelf ? 'In Bookshelf' : 'Add to Bookshelf'}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSavedInShelf ? 'Saved' : '+ Shelf'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
