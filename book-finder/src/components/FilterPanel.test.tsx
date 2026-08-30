import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';

describe('FilterPanel Component', () => {
  it('renders displayed count, sort button, and category filter chips', () => {
    render(
      <FilterPanel
        sortOrder="none"
        onSortChange={jest.fn()}
        totalDisplayed={12}
        selectedCategory="all"
        onSelectCategory={jest.fn()}
      />
    );

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
  });

  it('cycles sort order on sort button click', () => {
    const handleSortChange = jest.fn();
    render(
      <FilterPanel
        sortOrder="none"
        onSortChange={handleSortChange}
        totalDisplayed={5}
        selectedCategory="all"
        onSelectCategory={jest.fn()}
      />
    );

    const sortButton = screen.getByRole('button', { name: /sort:/i });
    fireEvent.click(sortButton);

    expect(handleSortChange).toHaveBeenCalledWith('az');
  });

  it('triggers onSelectCategory when a category chip is clicked', () => {
    const handleSelectCategory = jest.fn();
    render(
      <FilterPanel
        sortOrder="none"
        onSortChange={jest.fn()}
        totalDisplayed={10}
        selectedCategory="all"
        onSelectCategory={handleSelectCategory}
      />
    );

    const fictionChip = screen.getByRole('button', { name: 'Fiction' });
    fireEvent.click(fictionChip);

    expect(handleSelectCategory).toHaveBeenCalledWith('fiction');
  });
});
