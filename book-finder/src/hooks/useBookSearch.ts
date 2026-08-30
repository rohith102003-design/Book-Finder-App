import { useState, useRef, useCallback, useEffect } from 'react';
import { Book } from '../types/book';
import { searchBooksByTitle } from '../services/openLibrary';

interface UseBookSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  books: Book[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  totalResults: number;
  handleSearch: (explicitQuery?: string) => Promise<void>;
  clearSearch: () => void;
}

export function useBookSearch(): UseBookSearchReturn {
  const [query, setQuery] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number>(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setBooks([]);
      setError(null);
      setIsLoading(false);
      setHasSearched(false);
      setTotalResults(0);
      return;
    }

    // Abort any in-flight request to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await searchBooksByTitle(trimmed, controller.signal);
      setBooks(result.books);
      setTotalResults(result.total);
      setIsLoading(false);
    } catch (err: unknown) {
      // If the request was deliberately aborted, do not update state
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to search for books.';
      setError(message);
      setIsLoading(false);
    }
  }, []);

  // Clean up any pending request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = async (explicitQuery?: string) => {
    const target = explicitQuery !== undefined ? explicitQuery : query;
    if (explicitQuery !== undefined) {
      setQuery(explicitQuery);
    }
    await executeSearch(target);
  };

  const clearSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setQuery('');
    setBooks([]);
    setError(null);
    setIsLoading(false);
    setHasSearched(false);
    setTotalResults(0);
  };

  return {
    query,
    setQuery,
    books,
    isLoading,
    error,
    hasSearched,
    totalResults,
    handleSearch,
    clearSearch,
  };
}
