/**
 * Raw OpenLibrary Search API document schema
 */
export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  publish_year?: number[];
  publish_date?: string[] | string;
  cover_i?: number;
  first_sentence?: string[] | { type: string; value: string };
  description?: string | { type: string; value: string };
  edition_count?: number;
  subject?: string[];
  language?: string[];
  isbn?: string[];
}

/**
 * Raw OpenLibrary Search API envelope
 */
export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenLibraryDoc[];
}

/**
 * Normalized domain entity for a Book
 */
export interface Book {
  key: string;
  title: string;
  authors: string[];
  firstPublishYear: number | null;
  coverUrl: string | null;
  description: string | null;
  editionCount: number;
  subjects: string[];
}

/**
 * Filter & sort configuration
 */
export type SortOrder = 'none' | 'az' | 'za' | 'year';

export interface FilterOptions {
  sortOrder: SortOrder;
  showFavoritesOnly: boolean;
}
