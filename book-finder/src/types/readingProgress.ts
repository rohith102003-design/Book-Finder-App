export interface ReadingProgressBackendItem {
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
  current_lesson_index: number;
  current_chapter_index: number;
  completed_lesson_ids: string[];
  progress_percentage: number;
  is_completed: boolean;
  started_at: string;
  last_read_at: string;
  completed_at: string | null;
}

export interface ReadingProgressListBackendResponse {
  active_sessions: ReadingProgressBackendItem[];
  completed_books: ReadingProgressBackendItem[];
}

export interface BookmarkBackendItem {
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
  chapter_index: number;
  lesson_index: number;
  lesson_id: string;
  lesson_title: string | null;
  created_at: string;
}

export interface BookmarkListBackendResponse {
  items: BookmarkBackendItem[];
  total: number;
}
