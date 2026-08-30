import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoritesView } from './FavoritesView';
import { AuthProvider } from '../../context/AuthContext';
import { BookshelfProvider } from '../../context/BookshelfContext';
import { ReadingProgressProvider } from '../../context/ReadingProgressContext';
import { Book } from '../../types/book';

const mockFavorites: Book[] = [
  {
    key: '/works/OL123W',
    title: 'Dune',
    authors: ['Frank Herbert'],
    firstPublishYear: 1965,
    coverUrl: 'https://covers.openlibrary.org/b/id/123-M.jpg',
    description: 'Epic science fiction novel',
    editionCount: 10,
    subjects: ['Sci-Fi', 'Space'],
  },
  {
    key: '/works/OL456W',
    title: 'Harry Potter',
    authors: ['J.K. Rowling'],
    firstPublishYear: 1997,
    coverUrl: null,
    description: 'Fantasy magic novel',
    editionCount: 20,
    subjects: ['Fantasy', 'Magic'],
  },
];

describe('FavoritesView Component', () => {
  it('renders favorite books and header correctly', () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <FavoritesView
              favorites={mockFavorites}
              onToggleFavorite={jest.fn()}
              onSelectBook={jest.fn()}
              onNavigateToDiscover={jest.fn()}
            />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    expect(screen.getByText('My Favorites')).toBeInTheDocument();
    expect(screen.getByText('2 Books Saved')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dune' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Harry Potter' })).toBeInTheDocument();
  });

  it('renders empty state when favorites is empty', () => {
    const handleNavigate = jest.fn();
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <FavoritesView
              favorites={[]}
              onToggleFavorite={jest.fn()}
              onSelectBook={jest.fn()}
              onNavigateToDiscover={handleNavigate}
            />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    expect(screen.getByText('No Favorite Books Yet')).toBeInTheDocument();
    const discoverBtn = screen.getByRole('button', { name: /discover books/i });
    fireEvent.click(discoverBtn);
    expect(handleNavigate).toHaveBeenCalled();
  });
});
