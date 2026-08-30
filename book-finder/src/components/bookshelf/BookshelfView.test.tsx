import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookshelfView } from './BookshelfView';
import { BookshelfProvider } from '../../context/BookshelfContext';
import { ReadingProgressProvider } from '../../context/ReadingProgressContext';
import { AuthProvider } from '../../context/AuthContext';
import { bookshelfService } from '../../services/bookshelfService';
import { BookshelfItem } from '../../types/bookshelf';
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

jest.mock('../../services/bookshelfService');

const mockItems: BookshelfItem[] = [
  {
    id: 'item-1',
    user_id: 'user-1',
    book_id: 'book-1',
    book: {
      id: 'book-1',
      openlibrary_work_id: 'OL_ITEM_1',
      title: 'Dune Part One',
      authors: ['Frank Herbert'],
      edition_count: 10,
      subjects: ['Sci-Fi'],
      created_at: '2026-08-28T00:00:00Z',
      updated_at: '2026-08-28T00:00:00Z',
    },
    status: 'WANT_TO_READ',
    current_page: 0,
    total_pages: 500,
    progress_percentage: 0.0,
    created_at: '2026-08-28T00:00:00Z',
    updated_at: '2026-08-28T00:00:00Z',
  },
  {
    id: 'item-2',
    user_id: 'user-1',
    book_id: 'book-2',
    book: {
      id: 'book-2',
      openlibrary_work_id: 'OL_ITEM_2',
      title: 'Neuromancer Matrix',
      authors: ['William Gibson'],
      edition_count: 5,
      subjects: ['Cyberpunk'],
      created_at: '2026-08-28T00:00:00Z',
      updated_at: '2026-08-28T00:00:00Z',
    },
    status: 'READING',
    current_page: 150,
    total_pages: 300,
    progress_percentage: 50.0,
    created_at: '2026-08-28T00:00:00Z',
    updated_at: '2026-08-28T00:00:00Z',
  },
];

describe('BookshelfView', () => {
  beforeEach(() => {
    localStorage.clear();
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        data: {
          access_token: 'auth.token',
          user: { id: 'user-1', username: 'alex', email: 'alex@test.com', role: 'USER' },
        },
      },
    });

    (bookshelfService.getBookshelf as jest.Mock).mockResolvedValue({
      items: mockItems,
      total: 2,
      want_to_read_count: 1,
      reading_count: 1,
      completed_count: 0,
    });
    jest.clearAllMocks();
  });

  it('renders summary metrics, library cards, and state-based Read buttons', async () => {
    const handleOpenReader = jest.fn();

    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <BookshelfView onOpenReader={handleOpenReader} />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Dune Part One').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Neuromancer Matrix').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Total Books')).toBeInTheDocument();
    expect(screen.getAllByText(/not started/i).length).toBeGreaterThan(0);

    // Click Read button on Dune Part One
    const readButtons = screen.getAllByRole('button', { name: /^read$/i });
    expect(readButtons.length).toBeGreaterThan(0);
    fireEvent.click(readButtons[0]);
    expect(handleOpenReader).toHaveBeenCalled();
  });

  it('triggers onOpenReader when clicking anywhere on a library card', async () => {
    const handleOpenReader = jest.fn();

    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <BookshelfView onOpenReader={handleOpenReader} />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Dune Part One').length).toBeGreaterThan(0);
    });

    const cardTitles = screen.getAllByText('Dune Part One');
    fireEvent.click(cardTitles[0]);
    expect(handleOpenReader).toHaveBeenCalled();
  });

  it('filters items when filter tabs are clicked', async () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <BookshelfView />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Dune Part One').length).toBeGreaterThan(0);
    });

    // Click "Not Started" filter tab
    const notStartedFilterBtn = screen.getByRole('button', { name: /^not started \(\d+\)$/i });
    fireEvent.click(notStartedFilterBtn);

    expect(screen.getAllByText('Dune Part One').length).toBeGreaterThan(0);
  });

  it('displays empty state when filter has no books', async () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <BookshelfView />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Dune Part One').length).toBeGreaterThan(0);
    });

    // Click "Completed" filter button (0 items)
    const completedFilterBtn = screen.getByRole('button', { name: /^completed \(\d+\)$/i });
    fireEvent.click(completedFilterBtn);

    expect(screen.getByText(/no books found in "completed"/i)).toBeInTheDocument();
  });
});
