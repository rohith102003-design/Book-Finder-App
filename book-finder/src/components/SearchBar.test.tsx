import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar Component', () => {
  it('renders input with value and placeholder', () => {
    render(
      <SearchBar
        query="The Hobbit"
        onQueryChange={jest.fn()}
        onSearch={jest.fn()}
        onClear={jest.fn()}
      />
    );

    const input = screen.getByLabelText('Search books') as HTMLInputElement;
    expect(input.value).toBe('The Hobbit');
  });

  it('triggers onQueryChange when user types', () => {
    const handleQueryChange = jest.fn();
    render(
      <SearchBar
        query=""
        onQueryChange={handleQueryChange}
        onSearch={jest.fn()}
        onClear={jest.fn()}
      />
    );

    const input = screen.getByLabelText('Search books');
    fireEvent.change(input, { target: { value: 'Foundation' } });

    expect(handleQueryChange).toHaveBeenCalledWith('Foundation');
  });

  it('triggers onSearch when Enter key is pressed', () => {
    const handleSearch = jest.fn();
    render(
      <SearchBar
        query="Neuromancer"
        onQueryChange={jest.fn()}
        onSearch={handleSearch}
        onClear={jest.fn()}
      />
    );

    const input = screen.getByLabelText('Search books');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  it('triggers onClear when clear button is clicked', () => {
    const handleClear = jest.fn();
    render(
      <SearchBar
        query="Clear me"
        onQueryChange={jest.fn()}
        onSearch={jest.fn()}
        onClear={handleClear}
      />
    );

    const clearButton = screen.getByLabelText('Clear search query');
    fireEvent.click(clearButton);

    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('disables search button when query is empty', () => {
    render(
      <SearchBar
        query=""
        onQueryChange={jest.fn()}
        onSearch={jest.fn()}
        onClear={jest.fn()}
      />
    );

    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
  });
});
