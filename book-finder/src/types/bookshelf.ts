export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

export interface BookshelfBook {
  id: string;
  openlibrary_work_id: string;
  title: string;
  authors: string[];
  first_publish_year?: number | null;
  cover_url?: string | null;
  description?: string | null;
  edition_count: number;
  subjects: string[];
  created_at: string;
  updated_at: string;
}

export interface BookshelfItem {
  id: string;
  user_id: string;
  book_id: string;
  book: BookshelfBook;
  status: ReadingStatus;
  current_page: number;
  total_pages: number;
  progress_percentage: number;
  rating?: number | null;
  notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookshelfStats {
  total: number;
  wantToRead: number;
  reading: number;
  completed: number;
}

export interface BookshelfListResponse {
  items: BookshelfItem[];
  total: number;
  want_to_read_count: number;
  reading_count: number;
  completed_count: number;
}

export interface AddBookshelfItemPayload {
  openlibrary_work_id: string;
  title: string;
  authors?: string[];
  cover_url?: string | null;
  first_publish_year?: number | null;
  description?: string | null;
  edition_count?: number;
  subjects?: string[];
  status?: ReadingStatus;
  current_page?: number;
  total_pages?: number;
  notes?: string | null;
  rating?: number | null;
}

export interface UpdateStatusPayload {
  status: ReadingStatus;
}

export interface UpdateProgressPayload {
  current_page: number;
  total_pages?: number;
}
