import { Book } from './book';

export type ContentType = 'fiction' | 'technical' | 'self-help' | 'history' | 'biography' | 'mystery' | 'fantasy' | 'classic' | 'general';
export type LessonType = 'reading' | 'concept' | 'character' | 'worldbuilding' | 'turning-point' | 'theme' | 'conflict' | 'climax' | 'resolution' | 'reflection' | 'takeaways' | 'exercise';

export interface ReadingQuiz {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface ReadingLesson {
  id: string;
  lessonNumber: number;
  chapterNumber?: number;
  chapterTitle: string;
  title: string;
  subtitle?: string;
  type: LessonType;
  estimatedMinutes?: number;
  content: string[]; // Long-form multi-paragraph educational reading prose
  keyTakeaways?: string[]; // Optional, primarily for final lesson or milestone summaries
  reflectionQuestion?: string; // Optional reflection prompt
  quiz?: ReadingQuiz;
}

export interface ReadingChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle?: string;
  description?: string;
  lessons: ReadingLesson[];
}

export interface BookIntroduction {
  setting?: string;
  premise: string;
  keyCharacters?: string[];
  mainConflict?: string;
  centralThemes?: string[];
  whatToExpect?: string;
  overviewParagraphs?: string[];
}

export interface ReadingBookContent {
  bookId: string; // OpenLibrary work ID or title slug
  title: string;
  author: string;
  genre?: string;
  publishedYear?: string | number;
  coverUrl?: string | null;
  contentType: ContentType;
  sourceType: 'curated-guide' | 'dynamic-companion';
  source?: string;
  summary: string; // Concise synopsis for hero overview
  aboutThisBook?: string[]; // Multi-paragraph rich editorial introduction to the book
  aboutBook?: BookIntroduction; // Structured breakdown of setting, characters, conflict, themes, expectations
  totalChapters: number;
  totalLessons: number;
  chapters: ReadingChapter[];
  lessons: ReadingLesson[]; // Flat list of lessons for continuous linear reader flow
}

export interface ReadingProgressRecord {
  bookKey: string;
  book: Book;
  currentLessonIndex: number;
  currentChapterIndex: number;
  completedLessonIds: string[];
  progressPercentage: number;
  startedAt: string;
  lastReadAt: string;
  isCompleted: boolean;
  completedAt?: string;
  review?: {
    rating: number;
    reviewText: string;
    submittedAt: string;
  };
}

export interface ReadingProgressContextType {
  activeSessions: Record<string, ReadingProgressRecord>;
  completedBooks: ReadingProgressRecord[];
  isLoading: boolean;
  activeReadingBook: Book | null;
  activeReadingContent: ReadingBookContent | null;
  currentLessonIndex: number;
  startOrContinueReading: (book: Book) => void;
  completeLesson: (lessonId: string, nextLessonIndex?: number) => void;
  jumpToLesson: (lessonIndex: number) => void;
  completeBook: (review?: { rating: number; reviewText: string }) => void;
  readAgain: (book: Book) => void;
  removeFromReading: (bookKey: string) => void;
  getProgress: (bookKey: string) => ReadingProgressRecord | undefined;
  isBookReading: (bookKey: string) => boolean;
  isBookCompleted: (bookKey: string) => boolean;
  closeReader: () => void;
}

