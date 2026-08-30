import { Book, OpenLibraryDoc, OpenLibrarySearchResponse } from '../types/book';

/**
 * Backend API & OpenLibrary Base URLs
 */
const BACKEND_API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const COVERS_BASE_URL = 'https://covers.openlibrary.org';

/**
 * Safely extracts publication year from diverse OpenLibrary formats
 */
export function extractPublishYear(doc: OpenLibraryDoc): number | null {
  if (typeof doc.first_publish_year === 'number') {
    return doc.first_publish_year;
  }
  if (Array.isArray(doc.publish_year) && doc.publish_year.length > 0) {
    const validYear = doc.publish_year.find((y) => typeof y === 'number');
    if (validYear) return validYear;
  }
  if (doc.publish_date) {
    const rawDate = Array.isArray(doc.publish_date) ? doc.publish_date[0] : doc.publish_date;
    if (typeof rawDate === 'string') {
      const match = rawDate.match(/\b(18|19|20)\d{2}\b/);
      if (match) return parseInt(match[0], 10);
    }
  }
  return null;
}

/**
 * Safely extracts description or first sentence
 */
export function extractDescription(doc: OpenLibraryDoc): string | null {
  if (typeof doc.description === 'string' && doc.description.trim()) {
    return doc.description.trim();
  }
  if (typeof doc.description === 'object' && doc.description !== null && 'value' in doc.description) {
    return doc.description.value.trim();
  }
  if (Array.isArray(doc.first_sentence) && doc.first_sentence.length > 0) {
    const sentence = doc.first_sentence[0];
    if (typeof sentence === 'string') return sentence;
    if (typeof sentence === 'object' && sentence !== null && 'value' in sentence) {
      return (sentence as { value: string }).value;
    }
  }
  return null;
}

/**
 * Normalizes raw OpenLibrary doc into clean domain Book object
 */
export function normalizeBookDoc(doc: OpenLibraryDoc): Book {
  const authors = Array.isArray(doc.author_name) && doc.author_name.length > 0
    ? doc.author_name
    : ['Unknown Author'];

  const coverUrl = doc.cover_i
    ? `${COVERS_BASE_URL}/b/id/${doc.cover_i}-L.jpg`
    : null;

  return {
    key: doc.key || `temp-${Math.random()}`,
    title: doc.title || 'Untitled Book',
    authors,
    firstPublishYear: extractPublishYear(doc),
    coverUrl,
    description: extractDescription(doc),
    editionCount: doc.edition_count || 1,
    subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 5) : [],
  };
}

export interface SearchResult {
  books: Book[];
  total: number;
}

interface BackendBookSearchItem {
  key: string;
  title: string;
  authors: string[];
  first_publish_year?: number | null;
  cover_url?: string | null;
  description?: string | null;
  edition_count: number;
  subjects?: string[];
}

interface BackendSearchEnvelope {
  success: boolean;
  data: {
    books: BackendBookSearchItem[];
    total: number;
    page: number;
    limit: number;
  };
  meta?: Record<string, unknown>;
}

/**
 * Searches books via FastAPI Backend Proxy with graceful fallback to OpenLibrary API
 */
export async function searchBooksByTitle(
  query: string,
  signal?: AbortSignal,
  limit: number = 24
): Promise<SearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { books: [], total: 0 };
  }

  const encodedQuery = encodeURIComponent(trimmed);
  const backendUrl = `${BACKEND_API_BASE_URL}/books/search?q=${encodedQuery}&limit=${limit}`;

  try {
    // Attempt to query via FastAPI backend proxy
    const response = await fetch(backendUrl, { signal });

    if (response.ok) {
      const payload: BackendSearchEnvelope = await response.json();
      if (payload.success && payload.data && Array.isArray(payload.data.books)) {
        return {
          books: payload.data.books.map((item) => ({
            key: item.key,
            title: item.title,
            authors: item.authors || ['Unknown Author'],
            firstPublishYear: item.first_publish_year ?? null,
            coverUrl: item.cover_url ?? null,
            description: item.description ?? null,
            editionCount: item.edition_count || 1,
            subjects: item.subjects || [],
          })),
          total: payload.data.total,
        };
      }
    }

    // If backend returns a non-ok HTTP status or in test environments where backend isn't mounted, fallback to OpenLibrary direct
    return await fetchFromOpenLibraryDirect(trimmed, signal, limit);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    // Network failure reaching backend -> fallback to direct OpenLibrary
    return await fetchFromOpenLibraryDirect(trimmed, signal, limit);
  }
}

/**
 * Direct OpenLibrary query fallback
 */
async function fetchFromOpenLibraryDirect(
  trimmedQuery: string,
  signal?: AbortSignal,
  limit: number = 24
): Promise<SearchResult> {
  const encodedQuery = encodeURIComponent(trimmedQuery);
  const directUrl = `${OPEN_LIBRARY_BASE_URL}/search.json?title=${encodedQuery}&limit=${limit}`;

  try {
    const response = await fetch(directUrl, { signal });

    if (!response.ok) {
      throw new Error(`OpenLibrary API responded with status ${response.status}: ${response.statusText}`);
    }

    const data: OpenLibrarySearchResponse = await response.json();
    const docs = Array.isArray(data.docs) ? data.docs : [];

    return {
      books: docs.map(normalizeBookDoc),
      total: data.numFound || docs.length,
    };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching books.');
  }
}
