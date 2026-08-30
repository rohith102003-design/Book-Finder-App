import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CurrentlyReadingView } from './CurrentlyReadingView';
import { ReadingProgressProvider, useReadingProgress } from '../../context/ReadingProgressContext';
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

const HelperComponent: React.FC<{ onOpenReader: (b: Book) => void; onNavigateToDiscover: () => void }> = ({
  onOpenReader,
  onNavigateToDiscover,
}) => {
  const { startOrContinueReading } = useReadingProgress();

  React.useEffect(() => {
    startOrContinueReading(mockBook);
  }, [startOrContinueReading]);

  return (
    <CurrentlyReadingView
      onOpenReader={onOpenReader}
      onNavigateToDiscover={onNavigateToDiscover}
    />
  );
};

describe('CurrentlyReadingView Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when no active reading books', () => {
    const handleDiscover = jest.fn();
    render(
      <ReadingProgressProvider>
        <CurrentlyReadingView
          onOpenReader={jest.fn()}
          onNavigateToDiscover={handleDiscover}
        />
      </ReadingProgressProvider>
    );

    expect(screen.getByText('No Books In Progress')).toBeInTheDocument();
    const discoverBtn = screen.getByRole('button', { name: /explore & discover books/i });
    fireEvent.click(discoverBtn);
    expect(handleDiscover).toHaveBeenCalled();
  });

  it('renders active reading cards and continues reading on click', async () => {
    const handleOpenReader = jest.fn();
    const handleDiscover = jest.fn();

    render(
      <ReadingProgressProvider>
        <HelperComponent
          onOpenReader={handleOpenReader}
          onNavigateToDiscover={handleDiscover}
        />
      </ReadingProgressProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Currently Reading')).toBeInTheDocument();
      expect(screen.getByText('1 Active Book')).toBeInTheDocument();
    });

    expect(screen.getByText("Harry Potter and the Philosopher's Stone")).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: /continue reading/i });
    fireEvent.click(continueBtn);
    expect(handleOpenReader).toHaveBeenCalledWith(mockBook);
  });
});
