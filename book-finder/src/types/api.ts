import { Book } from './book';

export interface SearchState {
  query: string;
  books: Book[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  totalResults: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
