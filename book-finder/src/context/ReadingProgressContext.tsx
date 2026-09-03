import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Book } from '../types/book';
import {
  ReadingProgressRecord,
  ReadingProgressContextType,
} from '../types/reading';
import { AuthContext } from './AuthContext';
import { readingProgressService } from '../services/readingProgressService';
import { reviewService } from '../services/reviewService';
import { getReadingContentForBook } from '../data/reading/bookReadingRegistry';

const ReadingProgressContext = createContext<ReadingProgressContextType | undefined>(undefined);

export { getReadingContentForBook };

export const ReadingProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isAuthenticated = authContext ? authContext.isAuthenticated : true;

  // 1. Active reading sessions mapped by bookKey
  const [activeSessions, setActiveSessions] = useState<Record<string, ReadingProgressRecord>>({});

  // 2. Completed books history
  const [completedBooks, setCompletedBooks] = useState<ReadingProgressRecord[]>([]);

  // 3. Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Active reading book and active lesson index in reader view
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);

  // Hydrate user-isolated reading progress from backend
  const fetchAllProgress = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setActiveSessions({});
      setCompletedBooks([]);
      setActiveReadingBook(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const serverData = await readingProgressService.getAllProgress();
      setActiveSessions(serverData.activeSessions);
      setCompletedBooks(serverData.completedBooks);

      try {
        localStorage.setItem(
          `biblio_reading_sessions_${user.id}`,
          JSON.stringify(serverData.activeSessions)
        );
        localStorage.setItem(
          `biblio_completed_books_${user.id}`,
          JSON.stringify(serverData.completedBooks)
        );
      } catch {}
    } catch {
      // Fallback to local cache if offline
      try {
        const savedSessions = localStorage.getItem(`biblio_reading_sessions_${user.id}`);
        if (savedSessions) {
          setActiveSessions(JSON.parse(savedSessions));
        }
      } catch {}

      try {
        const savedCompleted = localStorage.getItem(`biblio_completed_books_${user.id}`);
        if (savedCompleted) {
          setCompletedBooks(JSON.parse(savedCompleted));
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAllProgress();
    } else {
      setActiveSessions({});
      setCompletedBooks([]);
      setActiveReadingBook(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, fetchAllProgress]);

  // Computed content for currently active reading book
  const activeReadingContent = useMemo(() => {
    if (!activeReadingBook) return null;
    return getReadingContentForBook(activeReadingBook);
  }, [activeReadingBook]);

  // Read progress lookup helper
  const getProgress = useCallback(
    (bookKey: string): ReadingProgressRecord | undefined => {
      if (!isAuthenticated) return undefined;
      return activeSessions[bookKey] || completedBooks.find((b) => b.bookKey === bookKey);
    },
    [activeSessions, completedBooks, isAuthenticated]
  );

  const isBookReading = useCallback(
    (bookKey: string): boolean => {
      if (!isAuthenticated) return false;
      return !!activeSessions[bookKey];
    },
    [activeSessions, isAuthenticated]
  );

  const isBookCompleted = useCallback(
    (bookKey: string): boolean => {
      if (!isAuthenticated) return false;
      return completedBooks.some((b) => b.bookKey === bookKey);
    },
    [completedBooks, isAuthenticated]
  );

  // Start reading or resume reading a book
  const startOrContinueReading = useCallback(
    (book: Book) => {
      if (!isAuthenticated) {
        authContext?.openAuthModal('login');
        return;
      }

      const existingProgress = activeSessions[book.key];
      const content = getReadingContentForBook(book);

      let targetLessonIdx = 0;
      if (existingProgress) {
        targetLessonIdx = Math.max(
          0,
          Math.min(existingProgress.currentLessonIndex, content.lessons.length - 1)
        );
      }

      setActiveReadingBook(book);
      setCurrentLessonIndex(targetLessonIdx);

      // Create session if first time
      if (!existingProgress) {
        const now = new Date().toISOString();
        const initialRecord: ReadingProgressRecord = {
          bookKey: book.key,
          book,
          currentLessonIndex: 0,
          currentChapterIndex: 0,
          completedLessonIds: [],
          progressPercentage: 0,
          startedAt: now,
          lastReadAt: now,
          isCompleted: false,
        };

        setActiveSessions((prev) => {
          const next = {
            ...prev,
            [book.key]: initialRecord,
          };
          if (user) {
            try {
              localStorage.setItem(
                `biblio_reading_sessions_${user.id}`,
                JSON.stringify(next)
              );
            } catch {}
          }
          return next;
        });

        // Persist to backend reading progress
        readingProgressService.saveProgress(initialRecord).catch(() => {});
      }
    },
    [activeSessions, authContext, isAuthenticated, user]
  );

  // Complete a lesson and advance progress
  const completeLesson = useCallback(
    (lessonId: string, nextLessonIndex?: number) => {
      if (!activeReadingBook) return;

      const bookKey = activeReadingBook.key;
      const content = getReadingContentForBook(activeReadingBook);
      const totalLessons = content.lessons.length;

      setActiveSessions((prev) => {
        const current = prev[bookKey] || {
          bookKey,
          book: activeReadingBook,
          currentLessonIndex: 0,
          currentChapterIndex: 0,
          completedLessonIds: [],
          progressPercentage: 0,
          startedAt: new Date().toISOString(),
          lastReadAt: new Date().toISOString(),
          isCompleted: false,
        };

        const completedSet = new Set(current.completedLessonIds);
        completedSet.add(lessonId);
        const updatedCompletedIds = Array.from(completedSet);

        const newPercentage =
          totalLessons > 0 ? Math.round((updatedCompletedIds.length / totalLessons) * 100) : 0;

        let nextIdx = current.currentLessonIndex;
        if (typeof nextLessonIndex === 'number') {
          nextIdx = nextLessonIndex;
        }

        const safeNextIdx = Math.max(0, Math.min(nextIdx, totalLessons - 1));
        const nextLesson = content.lessons[safeNextIdx];

        const updatedRecord: ReadingProgressRecord = {
          ...current,
          completedLessonIds: updatedCompletedIds,
          progressPercentage: newPercentage,
          currentLessonIndex: safeNextIdx,
          currentChapterIndex: nextLesson
            ? (nextLesson.chapterNumber || 1) - 1
            : current.currentChapterIndex,
          lastReadAt: new Date().toISOString(),
        };

        const nextSessions = {
          ...prev,
          [bookKey]: updatedRecord,
        };

        if (user) {
          try {
            localStorage.setItem(
              `biblio_reading_sessions_${user.id}`,
              JSON.stringify(nextSessions)
            );
          } catch {}
        }

        // Async backend sync
        readingProgressService.saveProgress(updatedRecord).catch(() => {});

        return nextSessions;
      });

      if (typeof nextLessonIndex === 'number') {
        setCurrentLessonIndex(nextLessonIndex);
      }
    },
    [activeReadingBook, user]
  );

  // Jump to specific lesson index
  const jumpToLesson = useCallback(
    (lessonIndex: number) => {
      if (!activeReadingBook) return;

      const content = getReadingContentForBook(activeReadingBook);
      const safeIndex = Math.max(0, Math.min(lessonIndex, content.lessons.length - 1));
      const targetLesson = content.lessons[safeIndex];

      setActiveSessions((prev) => {
        const current = prev[activeReadingBook.key];
        if (!current) return prev;

        const updatedRecord: ReadingProgressRecord = {
          ...current,
          currentLessonIndex: safeIndex,
          currentChapterIndex: (targetLesson?.chapterNumber || 1) - 1,
          lastReadAt: new Date().toISOString(),
        };

        const nextSessions = {
          ...prev,
          [activeReadingBook.key]: updatedRecord,
        };

        if (user) {
          try {
            localStorage.setItem(
              `biblio_reading_sessions_${user.id}`,
              JSON.stringify(nextSessions)
            );
          } catch {}
        }

        // Async backend sync
        readingProgressService.saveProgress(updatedRecord).catch(() => {});

        return nextSessions;
      });

      setCurrentLessonIndex(safeIndex);
    },
    [activeReadingBook, user]
  );

  // Complete entire book, record review, and sync with backend
  const completeBook = useCallback(
    (review?: { rating: number; reviewText: string }) => {
      setActiveReadingBook((currentBook) => {
        if (!currentBook) return null;

        const now = new Date().toISOString();
        const content = getReadingContentForBook(currentBook);
        const allLessonIds = content.lessons.map((l: { id: string }) => l.id);

        const completedRecord: ReadingProgressRecord = {
          bookKey: currentBook.key,
          book: currentBook,
          currentLessonIndex: content.lessons.length - 1,
          currentChapterIndex: content.chapters.length - 1,
          completedLessonIds: allLessonIds,
          progressPercentage: 100,
          startedAt: now,
          lastReadAt: now,
          isCompleted: true,
          completedAt: now,
          review: review
            ? {
                rating: review.rating,
                reviewText: review.reviewText,
                submittedAt: now,
              }
            : undefined,
        };

        setCompletedBooks((prev) => {
          const filtered = prev.filter((i) => i.bookKey !== currentBook.key);
          const nextCompleted = [completedRecord, ...filtered];
          if (user) {
            try {
              localStorage.setItem(
                `biblio_completed_books_${user.id}`,
                JSON.stringify(nextCompleted)
              );
            } catch {}
          }
          return nextCompleted;
        });

        setActiveSessions((prev) => {
          const next = { ...prev };
          delete next[currentBook.key];
          if (user) {
            try {
              localStorage.setItem(
                `biblio_reading_sessions_${user.id}`,
                JSON.stringify(next)
              );
            } catch {}
          }
          return next;
        });

        // Sync completed state to backend reading_progress
        readingProgressService.saveProgress(completedRecord).catch(() => {});

        // Background server synchronization
        const cleanId = currentBook.key.replace('/works/', '').trim();

        if (review && review.rating > 0) {
          reviewService
            .createReview({
              openlibrary_work_id: cleanId,
              rating: review.rating,
              title: `Completed ${currentBook.title}`,
              content: review.reviewText || 'Completed 100% of the reading guide lessons.',
            })
            .catch(() => {});
        }

        return currentBook;
      });
    },
    [user]
  );

  // Read Again: starts a fresh reading session at Lesson 0 while preserving history in completedBooks
  const readAgain = useCallback(
    (book: Book) => {
      const now = new Date().toISOString();
      const newSession: ReadingProgressRecord = {
        bookKey: book.key,
        book,
        currentLessonIndex: 0,
        currentChapterIndex: 0,
        completedLessonIds: [],
        progressPercentage: 0,
        startedAt: now,
        lastReadAt: now,
        isCompleted: false,
      };

      setActiveSessions((prev) => {
        const next = {
          ...prev,
          [book.key]: newSession,
        };
        if (user) {
          try {
            localStorage.setItem(
              `biblio_reading_sessions_${user.id}`,
              JSON.stringify(next)
            );
          } catch {}
        }
        return next;
      });

      setActiveReadingBook(book);
      setCurrentLessonIndex(0);

      readingProgressService.saveProgress(newSession).catch(() => {});
    },
    [user]
  );

  // Remove from active reading
  const removeFromReading = useCallback(
    (bookKey: string) => {
      setActiveSessions((prev) => {
        const next = { ...prev };
        delete next[bookKey];
        if (user) {
          try {
            localStorage.setItem(
              `biblio_reading_sessions_${user.id}`,
              JSON.stringify(next)
            );
          } catch {}
        }
        return next;
      });
      setActiveReadingBook((current) => (current && current.key === bookKey ? null : current));
      readingProgressService.deleteProgress(bookKey).catch(() => {});
    },
    [user]
  );

  const closeReader = useCallback(() => {
    setActiveReadingBook(null);
  }, []);

  const value: ReadingProgressContextType = {
    activeSessions,
    completedBooks,
    isLoading,
    activeReadingBook,
    activeReadingContent,
    currentLessonIndex,
    startOrContinueReading,
    completeLesson,
    jumpToLesson,
    completeBook,
    readAgain,
    removeFromReading,
    getProgress,
    isBookReading,
    isBookCompleted,
    closeReader,
  };

  return (
    <ReadingProgressContext.Provider value={value}>
      {children}
    </ReadingProgressContext.Provider>
  );
};

export const useReadingProgress = (): ReadingProgressContextType => {
  const context = useContext(ReadingProgressContext);
  if (!context) {
    throw new Error('useReadingProgress must be used within a ReadingProgressProvider');
  }
  return context;
};
