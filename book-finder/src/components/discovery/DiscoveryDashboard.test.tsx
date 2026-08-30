import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiscoveryDashboard } from './DiscoveryDashboard';
import { AuthProvider } from '../../context/AuthContext';
import { BookshelfProvider } from '../../context/BookshelfContext';
import { ReadingProgressProvider } from '../../context/ReadingProgressContext';

describe('DiscoveryDashboard Component', () => {
  const defaultProps = {
    query: '',
    onQueryChange: jest.fn(),
    onSearch: jest.fn(),
    onClear: jest.fn(),
    isLoading: false,
    onSelectBook: jest.fn(),
    isFavorite: jest.fn().mockReturnValue(false),
    onToggleFavorite: jest.fn(),
  };

  it('renders hero, quick searches, genre grid and how it works', () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <DiscoveryDashboard {...defaultProps} />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Discover Your Next Great Read')).toBeInTheDocument();
    expect(screen.getByText('Explore by Genre')).toBeInTheDocument();
    expect(screen.getByText('Trending This Week')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('Harry Potter')).toBeInTheDocument();
  });

  it('triggers search when a quick search chip is clicked', () => {
    const handleSearch = jest.fn();
    const handleQueryChange = jest.fn();

    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <DiscoveryDashboard
              {...defaultProps}
              onSearch={handleSearch}
              onQueryChange={handleQueryChange}
            />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    const duneChip = screen.getByRole('button', { name: 'Dune' });
    fireEvent.click(duneChip);

    expect(handleQueryChange).toHaveBeenCalledWith('Dune');
    expect(handleSearch).toHaveBeenCalledWith('Dune');
  });
});
