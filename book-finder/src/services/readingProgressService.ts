import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/auth';
import { Book } from '../types/book';
import { ReadingProgressRecord } from '../types/reading';
import {
  BookmarkBackendItem,
  BookmarkListBackendResponse,
  ReadingProgressBackendItem,
  ReadingProgressListBackendResponse,
} from '../types/readingProgress';

export const readingProgressService = {
  async getAllProgress(): Promise<{
    activeSessions: Record<string, ReadingProgressRecord>;
    completedBooks: ReadingProgressRecord[];
  }> {
    const response = await apiClient.get<ApiEnvelope<ReadingProgressListBackendResponse>>('/reading-progress');
    if (response.data?.success && response.data?.data) {
      const activeSessions: Record<string, ReadingProgressRecord> = {};
      const completedBooks: ReadingProgressRecord[] = [];

      const mapToRecord = (item: ReadingProgressBackendItem): ReadingProgressRecord => {
        const book: Book = {
          key: `/works/${item.book.openlibrary_work_id}`,
          title: item.book.title,
          authors: item.book.authors,
          firstPublishYear: item.book.first_publish_year,
          coverUrl: item.book.cover_url,
          editionCount: item.book.edition_count,
          description: item.book.description ?? null,
          subjects: item.book.subjects,
        };

        return {
          bookKey: book.key,
          book,
          currentLessonIndex: item.current_lesson_index,
          currentChapterIndex: item.current_chapter_index,
          completedLessonIds: item.completed_lesson_ids || [],
          progressPercentage: item.progress_percentage,
          startedAt: item.started_at,
          lastReadAt: item.last_read_at,
          isCompleted: item.is_completed,
          completedAt: item.completed_at || undefined,
        };
      };

      response.data.data.active_sessions.forEach((item) => {
        const record = mapToRecord(item);
        activeSessions[record.bookKey] = record;
      });

      response.data.data.completed_books.forEach((item) => {
        completedBooks.push(mapToRecord(item));
      });

      return { activeSessions, completedBooks };
    }

    return { activeSessions: {}, completedBooks: [] };
  },

  async saveProgress(record: ReadingProgressRecord): Promise<void> {
    const cleanWorkId = record.bookKey.replace('/works/', '').trim();
    await apiClient.post<ApiEnvelope<ReadingProgressBackendItem>>('/reading-progress', {
      openlibrary_work_id: cleanWorkId,
      title: record.book.title,
      authors: record.book.authors || [],
      cover_url: record.book.coverUrl,
      first_publish_year: record.book.firstPublishYear,
      description: record.book.description,
      edition_count: record.book.editionCount || 1,
      subjects: record.book.subjects || [],
      current_lesson_index: record.currentLessonIndex,
      current_chapter_index: record.currentChapterIndex,
      completed_lesson_ids: record.completedLessonIds,
      progress_percentage: record.progressPercentage,
      is_completed: record.isCompleted,
    });
  },

  async deleteProgress(bookKey: string): Promise<void> {
    const cleanWorkId = bookKey.replace('/works/', '').trim();
    await apiClient.delete<ApiEnvelope<{ message: string }>>(`/reading-progress/${cleanWorkId}`);
  },

  async getBookmarks(): Promise<BookmarkBackendItem[]> {
    const response = await apiClient.get<ApiEnvelope<BookmarkListBackendResponse>>('/bookmarks');
    if (response.data?.success && response.data?.data) {
      return response.data.data.items;
    }
    return [];
  },

  async saveBookmark(
    book: Book,
    chapterIndex: number,
    lessonIndex: number,
    lessonId: string,
    lessonTitle?: string
  ): Promise<BookmarkBackendItem | null> {
    const cleanWorkId = book.key.replace('/works/', '').trim();
    const response = await apiClient.post<ApiEnvelope<BookmarkBackendItem>>('/bookmarks', {
      openlibrary_work_id: cleanWorkId,
      title: book.title,
      authors: book.authors || [],
      cover_url: book.coverUrl,
      first_publish_year: book.firstPublishYear,
      description: book.description,
      edition_count: book.editionCount || 1,
      subjects: book.subjects || [],
      chapter_index: chapterIndex,
      lesson_index: lessonIndex,
      lesson_id: lessonId,
      lesson_title: lessonTitle,
    });
    return response.data?.data || null;
  },

  async removeBookmark(bookmarkId: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<{ message: string }>>(`/bookmarks/${bookmarkId}`);
  },
};
