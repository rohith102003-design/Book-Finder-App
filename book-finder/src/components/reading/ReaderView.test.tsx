import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReaderView } from './ReaderView';
import { ReadingProgressProvider, useReadingProgress } from '../../context/ReadingProgressContext';
import { BookshelfProvider } from '../../context/BookshelfContext';
import { Book } from '../../types/book';

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

const HelperReader: React.FC<{ onBack: () => void; initialMode?: 'overview' | 'reading' }> = ({
  onBack,
  initialMode = 'overview',
}) => {
  const { startOrContinueReading } = useReadingProgress();

  React.useEffect(() => {
    startOrContinueReading(mockBook);
  }, [startOrContinueReading]);

  return <ReaderView onBack={onBack} initialMode={initialMode} />;
};

describe('ReaderView Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Stage 1 Book Overview with cinematic hero, About This Book, and Back to Library', async () => {
    const handleBack = jest.fn();

    render(
      <BookshelfProvider>
        <ReadingProgressProvider>
          <HelperReader onBack={handleBack} initialMode="overview" />
        </ReadingProgressProvider>
      </BookshelfProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Harry Potter and the Philosopher's Stone").length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/About This Book/i)).toBeInTheDocument();
    expect(screen.getByText(/Reading Curriculum/i)).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /back to library/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalled();
  });

  it('transitions from Stage 1 Overview to Stage 2 Focused Reader when clicking Read Book', async () => {
    render(
      <BookshelfProvider>
        <ReadingProgressProvider>
          <HelperReader onBack={jest.fn()} initialMode="overview" />
        </ReadingProgressProvider>
      </BookshelfProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /resume lesson|continue reading/i }).length).toBeGreaterThan(0);
    });

    // Click Continue Reading / Resume button in Overview
    const continueBtns = screen.getAllByRole('button', { name: /resume lesson|continue reading/i });
    fireEvent.click(continueBtns[0]);

    // Now in Stage 2 (Focused Reader)
    await waitFor(() => {
      expect(screen.getByText(/Introduction to the Wizarding World & Literary Context/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /book overview/i })).toBeInTheDocument();

    // Advance lesson
    const nextBtn = screen.getByRole('button', { name: /mark complete & continue/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/Life at Privet Drive/i)).toBeInTheDocument();
    });
  });
});
