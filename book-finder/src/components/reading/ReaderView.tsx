import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  List,
  Clock,
  Star,
  Play,
  Calendar,
  Compass,
  Users,
  Flame,
  BookMarked,
} from 'lucide-react';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { useBookshelf } from '../../context/BookshelfContext';
import { AuthContext } from '../../context/AuthContext';
import { getBookReadingState } from '../../utils/readingState';
import { CompletionModal } from './CompletionModal';

interface ReaderViewProps {
  onBack: () => void;
  darkMode?: boolean;
  onToggleFavorite?: (bookKey: string) => void;
  isFavorite?: boolean;
  initialMode?: 'overview' | 'reading';
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  onBack,
  darkMode = false,
  onToggleFavorite,
  isFavorite = false,
  initialMode = 'overview',
}) => {
  const {
    activeReadingBook,
    activeReadingContent,
    currentLessonIndex,
    completeLesson,
    jumpToLesson,
    completeBook,
    readAgain,
    getProgress,
  } = useReadingProgress();

  const { isInBookshelf, addToBookshelf } = useBookshelf();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext ? authContext.isAuthenticated : true;
  const openAuthModal = authContext?.openAuthModal || (() => {});

  // Two-stage view mode: 'overview' (Hero & Editorial About This Book) | 'reading' (Focused Reader without background cover)
  const [viewMode, setViewMode] = useState<'overview' | 'reading'>(initialMode);
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddingShelf, setIsAddingShelf] = useState<boolean>(false);

  const readerTopRef = useRef<HTMLDivElement>(null);
  const readingSectionRef = useRef<HTMLDivElement>(null);

  const book = activeReadingBook;
  const content = activeReadingContent;

  const currentProgress = book ? getProgress(book.key) : undefined;
  const readingState = book ? getBookReadingState(book, currentProgress) : null;
  const completedLessonIds = currentProgress ? currentProgress.completedLessonIds : [];

  const totalLessons = content ? content.lessons.length : 0;
  const currentLesson = content && content.lessons[currentLessonIndex]
    ? content.lessons[currentLessonIndex]
    : null;

  const isCurrentLessonCompleted = currentLesson
    ? completedLessonIds.includes(currentLesson.id)
    : false;

  const isFirstLesson = currentLessonIndex === 0;
  const isFinalLesson = currentLessonIndex === totalLessons - 1;
  const isSavedInShelf = book ? isInBookshelf(book.key) : false;

  // Scroll to top when view mode changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      // Ignore jsdom environments
    }
  }, [viewMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleBookshelfToggle = async () => {
    if (!book) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!isSavedInShelf) {
      setIsAddingShelf(true);
      try {
        await addToBookshelf(book);
        showToast('Saved to My Bookshelf ✓');
      } finally {
        setIsAddingShelf(false);
      }
    }
  };

  const handleStartReading = () => {
    setViewMode('reading');
  };

  const handleMarkCompleteAndAdvance = () => {
    if (!currentLesson) return;

    const nextIndex = currentLessonIndex + 1;
    completeLesson(currentLesson.id, isFinalLesson ? currentLessonIndex : nextIndex);
    showToast(`Lesson ${currentLesson.lessonNumber} completed ✓`);

    if (isFinalLesson) {
      setShowCompletionModal(true);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      jumpToLesson(currentLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < totalLessons - 1) {
      jumpToLesson(currentLessonIndex + 1);
    }
  };

  if (!book || !content || !currentLesson || !readingState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
        <BookOpen className="w-12 h-12 text-indigo-500 animate-pulse" />
        <h2 className="text-xl font-bold">No Active Book Selected</h2>
        <p className="text-sm text-gray-500 max-w-md">
          Please select a book from your bookshelf or catalog to begin reading.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-indigo-600/20"
        >
          Return to Bookshelf
        </button>
      </div>
    );
  }

  const authorsText = book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author';
  const progressPercent = currentProgress ? currentProgress.progressPercentage : 0;
  const totalReadMinutes = content.lessons.reduce((acc, curr) => acc + (curr.estimatedMinutes || 5), 0);

  return (
    <div className="w-full flex flex-col items-center pb-24 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 1: BOOK OVERVIEW & EDITORIAL HERO BANNER                            */}
      {/* ========================================================================= */}
      {viewMode === 'overview' ? (
        <div className="w-full max-w-4xl flex flex-col space-y-8 animate-fadeIn">
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>

            {/* Quick Resume CTA in Top Header */}
            <button
              type="button"
              onClick={handleStartReading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{readingState.isReading ? `Resume Lesson ${readingState.currentLessonNumber}` : 'Read Book'}</span>
            </button>
          </div>

          {/* Cinematic Editorial Hero Banner (Inspired by harrypotter.com hero design) */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/20 bg-slate-950 min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-12">
            {/* Background Cover Image with Rich Dark Gradient Overlay */}
            {book.coverUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-xs scale-105 opacity-35"
                style={{ backgroundImage: `url(${book.coverUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 opacity-60" />
            )}

            {/* Multi-layered Vignette and Gradient Overlay for Pristine Editorial Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090d16]/90 via-[#090d16]/50 to-transparent" />

            {/* Foreground Content Layer */}
            <div className="relative z-10 space-y-4 max-w-2xl">
              {/* Category & Status Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                  {content.genre || 'Epic Literature'}
                </span>

                {content.sourceType === 'curated-guide' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Curated Master Guide
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 bg-blue-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/30 shadow-sm">
                    <BookMarked className="w-3 h-3 text-blue-400" /> Study Guide Companion
                  </span>
                )}

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                    readingState.state === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : readingState.state === 'reading'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                      : 'bg-white/10 text-gray-200 border-white/20'
                  }`}
                >
                  {readingState.statusBadge}
                </span>
              </div>

              {/* Title & Author */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                  {book.title}
                </h1>
                <p className="text-lg sm:text-xl font-bold text-indigo-300 drop-shadow">
                  By {authorsText}
                </p>
              </div>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-xl line-clamp-3">
                {content.summary}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-300">
                {book.firstPublishYear && (
                  <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Est. {book.firstPublishYear}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{totalLessons} Lessons</span>
                </span>
                <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-indigo-300" />
                  <span>~{totalReadMinutes} mins</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                {/* Primary Start / Continue Button */}
                <button
                  type="button"
                  onClick={handleStartReading}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {readingState.isReading
                      ? `Continue Reading (Lesson ${readingState.currentLessonNumber})`
                      : readingState.isCompleted
                      ? 'Read Again'
                      : 'Start Reading'}
                  </span>
                </button>

                {/* Bookshelf Button */}
                <button
                  type="button"
                  onClick={handleBookshelfToggle}
                  disabled={isAddingShelf}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm backdrop-blur-md border transition-all cursor-pointer ${
                    isSavedInShelf
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  {isSavedInShelf ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>In Bookshelf</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-indigo-300" />
                      <span>{isAddingShelf ? 'Saving...' : '+ Bookshelf'}</span>
                    </>
                  )}
                </button>

                {/* Favorite Star Button */}
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(book.key)}
                    className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all cursor-pointer ${
                      isFavorite
                        ? 'bg-yellow-400 text-gray-950 border-yellow-400 shadow-lg shadow-yellow-400/20'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300 border-white/20'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-gray-950 text-gray-950' : 'fill-none'}`} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section: "About This Book" Editorial Deep Dive */}
          <section
            className={`p-6 sm:p-10 rounded-3xl border transition-all space-y-6 ${
              darkMode
                ? 'bg-[#0f172a]/80 border-gray-800 text-gray-200'
                : 'bg-white border-gray-200 text-gray-800 shadow-sm'
            }`}
          >
            {/* Section Header */}
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  About This Book
                </h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">Reader’s Guide</span>
            </div>

            {/* Narrative Overview Paragraphs */}
            <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {content.aboutThisBook && content.aboutThisBook.length > 0 ? (
                content.aboutThisBook.map((para, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))
              ) : (
                <p className="leading-relaxed">{content.summary}</p>
              )}
            </div>

            {/* Structured Thematic Cards (Setting, Characters, Conflict) */}
            {content.aboutBook && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {content.aboutBook.setting && (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-500 font-bold text-xs uppercase tracking-wider">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Setting & World</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {content.aboutBook.setting}
                    </p>
                  </div>
                )}

                {content.aboutBook.mainConflict && (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Central Conflict</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {content.aboutBook.mainConflict}
                    </p>
                  </div>
                )}

                {content.aboutBook.keyCharacters && content.aboutBook.keyCharacters.length > 0 && (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 space-y-2 sm:col-span-2">
                    <div className="flex items-center gap-1.5 text-blue-500 font-bold text-xs uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      <span>Key Figures & Archetypes</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                      {content.aboutBook.keyCharacters.slice(0, 6).map((char, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section: Reading Curriculum Preview */}
          <section
            className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-4 ${
              darkMode ? 'bg-[#0f172a]/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Reading Curriculum ({totalLessons} Lessons)
                </h3>
              </div>
              <span className="text-xs text-indigo-500 font-bold">
                {completedLessonIds.length} / {totalLessons} Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {content.lessons.map((l, idx) => {
                const isComp = completedLessonIds.includes(l.id);
                const isCur = idx === currentLessonIndex;

                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      jumpToLesson(idx);
                      setViewMode('reading');
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl text-left text-xs transition-all cursor-pointer border ${
                      isCur
                        ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-md'
                        : isComp
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-gray-50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="mt-0.5 flex-shrink-0">
                      {isComp ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : isCur ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {l.lessonNumber}. {l.title}
                      </p>
                      <p className="text-[10px] opacity-75 truncate">{l.chapterTitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Call to Action */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleStartReading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {readingState.isReading
                    ? `Continue Reading (Chapter ${currentLesson.chapterNumber || 1} • Lesson ${currentLesson.lessonNumber})`
                    : 'Start Reading Chapter 1'}
                </span>
              </button>
            </div>
          </section>
        </div>
      ) : (
        /* ========================================================================= */
        /* STAGE 2: DEDICATED FOCUSED READER (NO BACKGROUND COVER TAKE-OVER)        */
        /* ========================================================================= */
        <div className="w-full flex flex-col items-center animate-fadeIn">
          {/* Top Sticky Header */}
          <div
            ref={readerTopRef}
            className={`sticky top-16 z-30 w-full max-w-4xl px-4 py-3.5 rounded-2xl border backdrop-blur-xl shadow-md flex items-center justify-between gap-4 transition-colors mb-8 ${
              darkMode
                ? 'bg-[#0f172a]/90 border-gray-800 text-white'
                : 'bg-white/90 border-gray-200 text-gray-900'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Back to Book Overview Button */}
              <button
                type="button"
                onClick={() => setViewMode('overview')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors cursor-pointer flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Book Overview</span>
              </button>

              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold truncate max-w-[200px] sm:max-w-md">
                  {book.title}
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {currentLesson.chapterTitle} • Lesson {currentLesson.lessonNumber} of {totalLessons}
                </p>
              </div>
            </div>

            {/* Right Controls: Progress & Contents Drawer Toggle */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-16 sm:w-28 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-500 font-mono">
                  {progressPercent}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsOutlineOpen((prev) => !prev)}
                title="Toggle Guide Contents"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <List className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Contents</span>
                {isOutlineOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Expandable Guide Outline Drawer */}
          {isOutlineOpen && (
            <div
              className={`w-full max-w-4xl p-6 mb-8 rounded-3xl border shadow-xl transition-all ${
                darkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Guide Outline ({totalLessons} Lessons)
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-500">
                  {completedLessonIds.length} / {totalLessons} Completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {content.lessons.map((lesson, idx) => {
                  const isComp = completedLessonIds.includes(lesson.id);
                  const isCurrent = idx === currentLessonIndex;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => {
                        jumpToLesson(idx);
                        setIsOutlineOpen(false);
                      }}
                      className={`flex items-start gap-2.5 p-3 rounded-2xl text-left text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white font-bold shadow-md'
                          : isComp
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isComp ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {lesson.lessonNumber}. {lesson.title}
                        </p>
                        <p className="text-[10px] opacity-75 truncate">{lesson.chapterTitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Focused Long-Form Reading Document (750px max width) */}
          <article ref={readingSectionRef} className="w-full max-w-3xl flex flex-col space-y-8">
            {/* Chapter & Lesson Title Header */}
            <div className="space-y-2 border-b border-gray-200 dark:border-gray-800 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-indigo-500 dark:text-indigo-400 uppercase">
                  {currentLesson.chapterTitle}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentLesson.estimatedMinutes || 5} min read</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-50 leading-snug">
                {currentLesson.title}
              </h1>

              {currentLesson.subtitle && (
                <p className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400">
                  {currentLesson.subtitle}
                </p>
              )}
            </div>

            {/* Continuous Educational Prose */}
            <div className="space-y-6 text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-serif sm:font-sans">
              {currentLesson.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Optional Final Lesson Synthesis */}
            {isFinalLesson && currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border space-y-4 my-8 transition-all ${
                  darkMode ? 'bg-[#0f172a]/90 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-100'
                }`}
              >
                <div className="flex items-center gap-2 text-indigo-500">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider">
                    Key Takeaways & Syntheses
                  </h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {currentLesson.keyTakeaways.map((takeaway, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>

                {currentLesson.reflectionQuestion && (
                  <div className="pt-3 border-t border-indigo-500/20">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                      Final Reflection
                    </h4>
                    <p className="text-xs sm:text-sm italic text-gray-600 dark:text-gray-300">
                      "{currentLesson.reflectionQuestion}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Lesson Navigation & Complete Toolbar */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Previous Lesson Button */}
              <button
                type="button"
                onClick={handlePreviousLesson}
                disabled={isFirstLesson}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Lesson</span>
              </button>

              {/* Center/Right Action: Mark Complete & Advance */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {!isFinalLesson ? (
                  <>
                    <button
                      type="button"
                      onClick={handleNextLesson}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                    >
                      <span>Skip to Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleMarkCompleteAndAdvance}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isCurrentLessonCompleted ? 'Next Lesson →' : 'Mark Complete & Continue →'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleMarkCompleteAndAdvance}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Award className="w-5 h-5" />
                    <span>🎉 Finish & Complete Book</span>
                  </button>
                )}
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <CompletionModal
          book={book}
          onClose={() => {
            setShowCompletionModal(false);
            setViewMode('overview');
          }}
          onReadAgain={() => {
            setShowCompletionModal(false);
            readAgain(book);
            setViewMode('reading');
          }}
          onSubmitReview={(review) => {
            completeBook(review);
            setShowCompletionModal(false);
            setViewMode('overview');
          }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
