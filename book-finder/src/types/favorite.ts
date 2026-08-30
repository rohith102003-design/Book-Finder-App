import { Book } from './book';

export interface FavoriteItem {
  id: string;
  user_id: string;
  book_id: string;
  book: {
    id: string;
    openlibrary_work_id: string;
    title: string;
    authors: string[];
    cover_url: string | null;
    first_publish_year: number | null;
    description: string | null;
    edition_count: number;
    subjects: string[];
  };
  created_at: string;
}

export interface FavoriteCreatePayload {
  openlibrary_work_id: string;
  title: string;
  authors: string[];
  cover_url?: string | null;
  first_publish_year?: number | null;
  description?: string | null;
  edition_count?: number;
  subjects?: string[];
}

export interface FavoriteListResponse {
  items: FavoriteItem[];
  total: number;
}
