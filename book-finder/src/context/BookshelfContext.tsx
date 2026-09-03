import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { bookshelfService } from '../services/bookshelfService';
import {
  BookshelfItem,
  BookshelfStats,
  ReadingStatus,
} from '../types/bookshelf';
import { Book } from '../types/book';

interface BookshelfContextType {
  bookshelf: BookshelfItem[];
  stats: BookshelfStats;
  isLoading: boolean;
  error: string | null;
  fetchBookshelf: () => Promise<void>;
  addToBookshelf: (
    book: Book,
    status?: ReadingStatus,
    totalPages?: number
  ) => Promise<BookshelfItem>;
  updateStatus: (itemId: string, status: ReadingStatus) => Promise<BookshelfItem>;
  updateProgress: (
    itemId: string,
    currentPage: number,
    totalPages?: number
  ) => Promise<BookshelfItem>;
  removeFromBookshelf: (itemId: string) => Promise<void>;
  isInBookshelf: (workId: string) => boolean;
  getBookshelfItem: (workId: string) => BookshelfItem | undefined;
}

const BookshelfContext = createContext<BookshelfContextType | undefined>(undefined);

export const BookshelfProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isAuthenticated = authContext ? authContext.isAuthenticated : true;
  const [bookshelf, setBookshelf] = useState<BookshelfItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compute aggregate stats from local state or backend
  const stats: BookshelfStats = useMemo(() => {
    const wantToRead = bookshelf.filter((i) => i.status === 'WANT_TO_READ').length;
    const reading = bookshelf.filter((i) => i.status === 'READING').length;
    const completed = bookshelf.filter((i) => i.status === 'COMPLETED').length;
    return {
      total: bookshelf.length,
      wantToRead,
      reading,
      completed,
    };
  }, [bookshelf]);

  // Fetch bookshelf from API
  const fetchBookshelf = useCallback(async () => {
    if (!isAuthenticated) {
      setBookshelf([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await bookshelfService.getBookshelf();
      setBookshelf(response.items);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch bookshelf.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Hydrate bookshelf on authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookshelf();
    } else {
      setBookshelf([]);
      setIsLoading(false);
      setError(null);
    }
  }, [isAuthenticated, user, fetchBookshelf]);

  // Helper checks
  const isInBookshelf = useCallback(
    (workId: string): boolean => {
      const cleanId = workId.replace('/works/', '');
      return bookshelf.some(
        (item) =>
          item.book.openlibrary_work_id === cleanId ||
          item.book.openlibrary_work_id === workId
      );
    },
    [bookshelf]
  );

  const getBookshelfItem = useCallback(
    (workId: string): BookshelfItem | undefined => {
      const cleanId = workId.replace('/works/', '');
      return bookshelf.find(
        (item) =>
          item.book.openlibrary_work_id === cleanId ||
          item.book.openlibrary_work_id === workId
      );
    },
    [bookshelf]
  );

  // Add book to personal bookshelf
  const addToBookshelf = useCallback(
    async (
      book: Book,
      status: ReadingStatus = 'WANT_TO_READ',
      totalPages: number = 0
    ): Promise<BookshelfItem> => {
      const cleanId = book.key.replace('/works/', '').trim();
      try {
        const item = await bookshelfService.addToBookshelf({
          openlibrary_work_id: cleanId,
          title: book.title,
          authors: book.authors,
          cover_url: book.coverUrl,
          first_publish_year: book.firstPublishYear,
          description: book.description,
          edition_count: book.editionCount,
          subjects: book.subjects,
          status,
          current_page: 0,
          total_pages: totalPages,
        });

        setBookshelf((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
        return item;
      } catch (err: unknown) {
        // If duplicate item error occurs (HTTP 409), reconcile local state with server
        const is409 =
          (axios.isAxiosError && axios.isAxiosError(err) && (err.response?.status === 409 || (err.response?.data as any)?.error?.code === 'DUPLICATE_BOOKSHELF_ITEM')) ||
          (err && typeof err === 'object' && 'response' in err && (err as any).response?.status === 409) ||
          (err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.error?.code === 'DUPLICATE_BOOKSHELF_ITEM');

        if (is409) {
          try {
            const freshList = await bookshelfService.getBookshelf();
            if (freshList && Array.isArray(freshList.items)) {
              setBookshelf(freshList.items);
              const existingItem = freshList.items.find(
                (i) =>
                  i.book.openlibrary_work_id === cleanId ||
                  i.book.openlibrary_work_id === book.key
              );
              if (existingItem) {
                return existingItem;
              }
            }
          } catch {
            // Ignore sub-error
          }

          // Return a fallback representation of the existing bookshelf item to reconcile state
          const fallbackItem: BookshelfItem = {
            id: `shelf-${cleanId}`,
            user_id: '',
            book_id: `book-${cleanId}`,
            book: {
              id: `book-${cleanId}`,
              openlibrary_work_id: cleanId,
              title: book.title,
              authors: book.authors,
              edition_count: book.editionCount,
              subjects: book.subjects,
              cover_url: book.coverUrl,
              description: book.description,
              first_publish_year: book.firstPublishYear,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            status,
            current_page: 0,
            total_pages: totalPages,
            progress_percentage: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setBookshelf((prev) => [
            fallbackItem,
            ...prev.filter(
              (i) =>
                i.book.openlibrary_work_id !== cleanId &&
                i.book.openlibrary_work_id !== book.key
            ),
          ]);
          return fallbackItem;
        }
        throw err;
      }
    },
    []
  );

  // Update reading status
  const updateStatus = useCallback(
    async (itemId: string, status: ReadingStatus): Promise<BookshelfItem> => {
      const updated = await bookshelfService.updateStatus(itemId, status);
      setBookshelf((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
      return updated;
    },
    []
  );

  // Update reading progress
  const updateProgress = useCallback(
    async (
      itemId: string,
      currentPage: number,
      totalPages?: number
    ): Promise<BookshelfItem> => {
      const updated = await bookshelfService.updateProgress(itemId, currentPage, totalPages);
      setBookshelf((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
      return updated;
    },
    []
  );

  // Remove from personal bookshelf
  const removeFromBookshelf = useCallback(async (itemId: string): Promise<void> => {
    await bookshelfService.removeFromBookshelf(itemId);
    setBookshelf((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const value: BookshelfContextType = {
    bookshelf,
    stats,
    isLoading,
    error,
    fetchBookshelf,
    addToBookshelf,
    updateStatus,
    updateProgress,
    removeFromBookshelf,
    isInBookshelf,
    getBookshelfItem,
  };

  return <BookshelfContext.Provider value={value}>{children}</BookshelfContext.Provider>;
};

export const useBookshelf = (): BookshelfContextType => {
  const context = useContext(BookshelfContext);
  if (!context) {
    throw new Error('useBookshelf must be used within a BookshelfProvider');
  }
  return context;
};
