import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BookshelfProvider, useBookshelf } from './BookshelfContext';
import { AuthProvider } from './AuthContext';
import { bookshelfService } from '../services/bookshelfService';
import { BookshelfItem } from '../types/bookshelf';
import axios from 'axios';

jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      post: jest.fn(),
      create: jest.fn(() => mockAxiosInstance),
      isAxiosError: jest.fn(),
    },
    post: jest.fn(),
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(),
  };
});

jest.mock('../services/bookshelfService', () => ({
  bookshelfService: {
    getBookshelf: jest.fn(),
    getBookshelfItem: jest.fn(),
    addToBookshelf: jest.fn(),
    updateStatus: jest.fn(),
    updateProgress: jest.fn(),
    removeFromBookshelf: jest.fn(),
  },
}));

const mockItem: BookshelfItem = {
  id: 'shelf-item-1',
  user_id: 'user-uuid-1',
  book_id: 'book-uuid-1',
  book: {
    id: 'book-uuid-1',
    openlibrary_work_id: 'OL_TEST_W',
    title: 'Test Bookshelf Title',
    authors: ['Author One'],
    edition_count: 1,
    subjects: ['Fiction'],
    created_at: '2026-08-28T00:00:00Z',
    updated_at: '2026-08-28T00:00:00Z',
  },
  status: 'WANT_TO_READ',
  current_page: 0,
  total_pages: 200,
  progress_percentage: 0.0,
  created_at: '2026-08-28T00:00:00Z',
  updated_at: '2026-08-28T00:00:00Z',
};

const TestBookshelfConsumer: React.FC = () => {
  const {
    bookshelf,
    stats,
    isLoading,
    addToBookshelf,
    updateStatus,
    updateProgress,
    removeFromBookshelf,
    isInBookshelf,
  } = useBookshelf();

  return (
    <div>
      <div data-testid="is-loading">{isLoading ? 'YES' : 'NO'}</div>
      <div data-testid="total-count">{stats.total}</div>
      <div data-testid="is-in-shelf">{isInBookshelf('OL_TEST_W') ? 'YES' : 'NO'}</div>
      {bookshelf.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          <span>{item.book.title}</span>
          <span>{item.status}</span>
          <span>{item.progress_percentage}%</span>
        </div>
      ))}
      <button
        onClick={async () => {
          await addToBookshelf({
            key: '/works/OL_TEST_W',
            title: 'Test Bookshelf Title',
            authors: ['Author One'],
            firstPublishYear: 2020,
            coverUrl: null,
            description: null,
            editionCount: 1,
            subjects: [],
          });
        }}
      >
        Add Book
      </button>
      <button
        onClick={async () => {
          await updateStatus('shelf-item-1', 'READING');
        }}
      >
        Set Reading
      </button>
      <button
        onClick={async () => {
          await updateProgress('shelf-item-1', 100, 200);
        }}
      >
        Set Progress
      </button>
      <button
        onClick={async () => {
          await removeFromBookshelf('shelf-item-1');
        }}
      >
        Remove Book
      </button>
    </div>
  );
};

describe('BookshelfContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes in guest mode with empty bookshelf without calling API', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Guest'));

    render(
      <AuthProvider>
        <BookshelfProvider>
          <TestBookshelfConsumer />
        </BookshelfProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-in-shelf')).toHaveTextContent('NO');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('NO');
    });

    expect(bookshelfService.getBookshelf).not.toHaveBeenCalled();
  });

  it('hydrates user bookshelf when user session exists', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          access_token: 'auth.token',
          user: { id: 'user-uuid-1', username: 'bookworm', email: 'bw@test.com', role: 'USER' },
        },
      },
    });

    (bookshelfService.getBookshelf as jest.Mock).mockResolvedValueOnce({
      items: [mockItem],
      total: 1,
      want_to_read_count: 1,
      reading_count: 0,
      completed_count: 0,
    });

    render(
      <AuthProvider>
        <BookshelfProvider>
          <TestBookshelfConsumer />
        </BookshelfProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-count')).toHaveTextContent('1');
      expect(screen.getByTestId('is-in-shelf')).toHaveTextContent('YES');
      expect(screen.getByText('Test Bookshelf Title')).toBeInTheDocument();
    });

    expect(bookshelfService.getBookshelf).toHaveBeenCalledTimes(1);
  });

  it('supports adding, updating status, updating progress, and removing items', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          access_token: 'auth.token',
          user: { id: 'user-uuid-1', username: 'bookworm', email: 'bw@test.com', role: 'USER' },
        },
      },
    });

    (bookshelfService.getBookshelf as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      want_to_read_count: 0,
      reading_count: 0,
      completed_count: 0,
    });

    render(
      <AuthProvider>
        <BookshelfProvider>
          <TestBookshelfConsumer />
        </BookshelfProvider>
      </AuthProvider>
    );

    // Wait for initial session refresh & initial getBookshelf to complete
    await waitFor(() => {
      expect(bookshelfService.getBookshelf).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('is-loading')).toHaveTextContent('NO');
      expect(screen.getByTestId('total-count')).toHaveTextContent('0');
    });

    // 1. Add Book
    (bookshelfService.addToBookshelf as jest.Mock).mockResolvedValueOnce(mockItem);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add Book' }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('total-count')).toHaveTextContent('1');
      expect(screen.getByTestId('is-in-shelf')).toHaveTextContent('YES');
    });

    // 2. Update Status
    const readingItem = { ...mockItem, status: 'READING' as const };
    (bookshelfService.updateStatus as jest.Mock).mockResolvedValueOnce(readingItem);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Set Reading' }));
    });

    await waitFor(() => {
      expect(screen.getByText('READING')).toBeInTheDocument();
    });

    // 3. Update Progress
    const progressedItem = {
      ...readingItem,
      current_page: 100,
      progress_percentage: 50.0,
    };
    (bookshelfService.updateProgress as jest.Mock).mockResolvedValueOnce(progressedItem);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Set Progress' }));
    });

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    // 4. Remove
    (bookshelfService.removeFromBookshelf as jest.Mock).mockResolvedValueOnce(undefined);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Remove Book' }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('total-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-in-shelf')).toHaveTextContent('NO');
    });
  });

  it('gracefully reconciles state when addToBookshelf receives HTTP 409 DUPLICATE_BOOKSHELF_ITEM', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          access_token: 'auth.token',
          user: { id: 'user-uuid-1', username: 'bookworm', email: 'bw@test.com', role: 'USER' },
        },
      },
    });

    (bookshelfService.getBookshelf as jest.Mock)
      .mockResolvedValueOnce({
        items: [],
        total: 0,
        want_to_read_count: 0,
        reading_count: 0,
        completed_count: 0,
      })
      .mockResolvedValueOnce({
        items: [mockItem],
        total: 1,
        want_to_read_count: 1,
        reading_count: 0,
        completed_count: 0,
      });

    const error409 = {
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          error: {
            code: 'DUPLICATE_BOOKSHELF_ITEM',
            message: 'This book is already present in your bookshelf.',
          },
        },
      },
    };
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
    (bookshelfService.addToBookshelf as jest.Mock).mockRejectedValueOnce(error409);

    render(
      <AuthProvider>
        <BookshelfProvider>
          <TestBookshelfConsumer />
        </BookshelfProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('NO');
      expect(screen.getByTestId('total-count')).toHaveTextContent('0');
    });

    // Click Add Book which triggers 409
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add Book' }));
    });

    // State should reconcile and show book in shelf
    await waitFor(() => {
      expect(screen.getByTestId('total-count')).toHaveTextContent('1');
      expect(screen.getByTestId('is-in-shelf')).toHaveTextContent('YES');
      expect(screen.getByText('Test Bookshelf Title')).toBeInTheDocument();
    });
  });
});
