import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from './BookCard';
import { Book } from '../types/book';
import { AuthProvider } from '../context/AuthContext';
import { BookshelfProvider } from '../context/BookshelfContext';
import { ReadingProgressProvider } from '../context/ReadingProgressContext';
import axios from 'axios';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    create: jest.fn(() => ({
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      post: jest.fn(),
      get: jest.fn(),
    })),
    isAxiosError: jest.fn(),
  },
  post: jest.fn(),
  create: jest.fn(() => ({
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    post: jest.fn(),
    get: jest.fn(),
  })),
  isAxiosError: jest.fn(),
}));

const mockBook: Book = {
  key: '/works/OL123W',
  title: 'Brave New World',
  authors: ['Aldous Huxley'],
  firstPublishYear: 1932,
  coverUrl: 'https://covers.openlibrary.org/b/id/123-L.jpg',
  description: 'A dystopian vision of the future.',
  editionCount: 15,
  subjects: ['Dystopia', 'Sci-Fi'],
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <BookshelfProvider>
        <ReadingProgressProvider>{ui}</ReadingProgressProvider>
      </BookshelfProvider>
    </AuthProvider>
  );
};

describe('BookCard Component', () => {
  beforeEach(() => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Guest'));
    jest.clearAllMocks();
  });

  it('renders book information correctly', () => {
    renderWithProviders(
      <BookCard
        book={mockBook}
        isFavorite={false}
        onToggleFavorite={jest.fn()}
        onSelectBook={jest.fn()}
      />
    );

    expect(screen.getByText('Brave New World')).toBeInTheDocument();
    expect(screen.getByText('Aldous Huxley')).toBeInTheDocument();
    expect(screen.getByText('1932')).toBeInTheDocument();
    expect(screen.getByText(/Read/)).toBeInTheDocument();
  });

  it('triggers onSelectBook when card is clicked', () => {
    const handleSelect = jest.fn();
    renderWithProviders(
      <BookCard
        book={mockBook}
        isFavorite={false}
        onToggleFavorite={jest.fn()}
        onSelectBook={handleSelect}
      />
    );

    fireEvent.click(screen.getByText('Brave New World'));
    expect(handleSelect).toHaveBeenCalledWith(mockBook);
  });

  it('triggers onToggleFavorite without selecting card when star is clicked', () => {
    const handleSelect = jest.fn();
    const handleToggleFavorite = jest.fn();

    renderWithProviders(
      <BookCard
        book={mockBook}
        isFavorite={false}
        onToggleFavorite={handleToggleFavorite}
        onSelectBook={handleSelect}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');
    fireEvent.click(favoriteButton);

    expect(handleToggleFavorite).toHaveBeenCalledWith(mockBook);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
