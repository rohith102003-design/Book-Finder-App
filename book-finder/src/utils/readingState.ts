import { Book } from '../types/book';
import { ReadingProgressRecord } from '../types/reading';
import { getReadingContentForBook } from '../data/reading/bookReadingRegistry';

export type ReadingState = 'not_started' | 'reading' | 'completed';

export interface ReadingStateInfo {
  state: ReadingState;
  label: 'Read' | 'Continue Reading' | 'Read Again';
  statusBadge: string;
  progressPercent: number;
  currentLessonIndex: number;
  currentLessonNumber: number;
  currentChapterTitle?: string;
  currentLessonTitle?: string;
  totalLessons: number;
  isCompleted: boolean;
  isReading: boolean;
}

/**
 * Universal helper to calculate reading state, button labels, progress, and badges
 * across Bookshelf, Discover, Favorites, Reader, and Modals.
 */
export function getBookReadingState(
  book: Book,
  progressRecord?: ReadingProgressRecord
): ReadingStateInfo {
  const content = getReadingContentForBook(book);
  const totalLessons = content.totalLessons || content.lessons.length || 1;

  if (progressRecord?.isCompleted) {
    return {
      state: 'completed',
      label: 'Read Again',
      statusBadge: 'Completed ✓',
      progressPercent: 100,
      currentLessonIndex: 0,
      currentLessonNumber: 1,
      currentChapterTitle: content.chapters[0]?.title,
      currentLessonTitle: content.lessons[0]?.title,
      totalLessons,
      isCompleted: true,
      isReading: false,
    };
  }

  if (progressRecord && !progressRecord.isCompleted) {
    const idx = Math.max(0, Math.min(progressRecord.currentLessonIndex, totalLessons - 1));
    const lesson = content.lessons[idx];
    const completedCount = progressRecord.completedLessonIds?.length || 0;
    const computedPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const percent = progressRecord.progressPercentage > 0 ? progressRecord.progressPercentage : computedPercent;

    return {
      state: 'reading',
      label: 'Continue Reading',
      statusBadge: `Reading • ${percent}%`,
      progressPercent: percent,
      currentLessonIndex: idx,
      currentLessonNumber: lesson?.lessonNumber || idx + 1,
      currentChapterTitle: lesson?.chapterTitle,
      currentLessonTitle: lesson?.title,
      totalLessons,
      isCompleted: false,
      isReading: true,
    };
  }

  // Not started
  return {
    state: 'not_started',
    label: 'Read',
    statusBadge: 'Not Started',
    progressPercent: 0,
    currentLessonIndex: 0,
    currentLessonNumber: 1,
    currentChapterTitle: content.chapters[0]?.title,
    currentLessonTitle: content.lessons[0]?.title,
    totalLessons,
    isCompleted: false,
    isReading: false,
  };
}
