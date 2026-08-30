import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompletedView } from './CompletedView';
import { ReadingProgressProvider, useReadingProgress } from '../../context/ReadingProgressContext';
import { Book } from '../../types/book';

const mockBook: Book = {
  key: '/works/OL262758W',
  title: 'The Hobbit',
  authors: ['J.R.R. Tolkien'],
  firstPublishYear: 1937,
  coverUrl: null,
  description: 'Bilbo Baggins journey',
  editionCount: 15,
  subjects: ['Fantasy'],
};

const HelperComponent: React.FC<{ onOpenReader: (b: Book) => void }> = ({ onOpenReader }) => {
  const { startOrContinueReading, completeBook } = useReadingProgress();

  React.useEffect(() => {
    startOrContinueReading(mockBook);
    completeBook({ rating: 5, reviewText: 'Fantastic adventure!' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CompletedView
      onOpenReader={onOpenReader}
      onNavigateToDiscover={jest.fn()}
    />
  );
};

describe('CompletedView Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when no books completed', () => {
    render(
      <ReadingProgressProvider>
        <CompletedView
          onOpenReader={jest.fn()}
          onNavigateToDiscover={jest.fn()}
        />
      </ReadingProgressProvider>
    );

    expect(screen.getByText('No Completed Books Yet')).toBeInTheDocument();
  });

  it('renders completed book and review snippet', () => {
    const handleOpenReader = jest.fn();

    render(
      <ReadingProgressProvider>
        <HelperComponent onOpenReader={handleOpenReader} />
      </ReadingProgressProvider>
    );

    expect(screen.getByText('Completed Books')).toBeInTheDocument();
    expect(screen.getByText('1 Book Completed')).toBeInTheDocument();
    expect(screen.getByText('The Hobbit')).toBeInTheDocument();
    expect(screen.getByText('"Fantastic adventure!"')).toBeInTheDocument();

    const readAgainBtn = screen.getByRole('button', { name: /read again/i });
    fireEvent.click(readAgainBtn);
    expect(handleOpenReader).toHaveBeenCalledWith(mockBook);
  });
});
