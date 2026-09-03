import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  ReadingProgressProvider,
  useReadingProgress,
} from './ReadingProgressContext';
import { Book } from '../types/book';

const mockBook: Book = {
  key: '/works/OL82563W',
  title: "Harry Potter and the Philosopher's Stone",
  authors: ['J.K. Rowling'],
  firstPublishYear: 1997,
  coverUrl: null,
  description: 'The journey of the Boy Who Lived',
  editionCount: 25,
  subjects: ['Fantasy', 'Magic'],
};

describe('ReadingProgressContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts reading a book and sets active lesson index to 0', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReadingProgressProvider>{children}</ReadingProgressProvider>
    );

    const { result } = renderHook(() => useReadingProgress(), { wrapper });

    expect(result.current.isBookReading(mockBook.key)).toBe(false);

    act(() => {
      result.current.startOrContinueReading(mockBook);
    });

    expect(result.current.isBookReading(mockBook.key)).toBe(true);
    expect(result.current.activeReadingBook?.title).toBe("Harry Potter and the Philosopher's Stone");
    expect(result.current.currentLessonIndex).toBe(0);
    expect(result.current.activeReadingContent?.totalLessons).toBeGreaterThan(15);
  });

  it('completes a lesson and updates progress percentage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReadingProgressProvider>{children}</ReadingProgressProvider>
    );

    const { result } = renderHook(() => useReadingProgress(), { wrapper });

    act(() => {
      result.current.startOrContinueReading(mockBook);
    });

    act(() => {
      result.current.completeLesson('hp1-l1', 1);
    });

    const progress = result.current.getProgress(mockBook.key);
    expect(progress?.completedLessonIds).toContain('hp1-l1');
    expect(progress?.progressPercentage).toBeGreaterThan(0);
    expect(result.current.currentLessonIndex).toBe(1);
  });

  it('completes a book and moves to completedBooks with review', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReadingProgressProvider>{children}</ReadingProgressProvider>
    );

    const { result } = renderHook(() => useReadingProgress(), { wrapper });

    act(() => {
      result.current.startOrContinueReading(mockBook);
    });

    act(() => {
      result.current.completeBook({ rating: 5, reviewText: 'Pure magic!' });
    });

    expect(result.current.isBookCompleted(mockBook.key)).toBe(true);
    expect(result.current.completedBooks.length).toBe(1);
    expect(result.current.completedBooks[0].review?.rating).toBe(5);
    expect(result.current.completedBooks[0].review?.reviewText).toBe('Pure magic!');
  });

  it('proves that startOrContinueReading does not modify bookshelf', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReadingProgressProvider>{children}</ReadingProgressProvider>
    );

    const { result } = renderHook(() => useReadingProgress(), { wrapper });

    act(() => {
      result.current.startOrContinueReading(mockBook);
    });

    expect(result.current.activeReadingBook?.key).toBe(mockBook.key);
    expect(result.current.isBookReading(mockBook.key)).toBe(true);
  });
});
