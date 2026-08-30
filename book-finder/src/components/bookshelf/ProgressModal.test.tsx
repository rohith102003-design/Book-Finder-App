import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgressModal } from './ProgressModal';
import { BookshelfProvider, useBookshelf } from '../../context/BookshelfContext';
import { AuthProvider } from '../../context/AuthContext';
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

const mockShelfItem: BookshelfItem = {
  id: 'item-123',
  user_id: 'user-123',
  book_id: 'book-123',
  book: {
    id: 'book-123',
    openlibrary_work_id: 'OL_TEST_W',
    title: 'Progress Testing Novel',
    authors: ['Author Testing'],
    edition_count: 1,
    subjects: ['Fiction'],
    created_at: '2026-08-28T00:00:00Z',
    updated_at: '2026-08-28T00:00:00Z',
  },
  status: 'READING',
  current_page: 50,
  total_pages: 200,
  progress_percentage: 25.0,
  created_at: '2026-08-28T00:00:00Z',
  updated_at: '2026-08-28T00:00:00Z',
};

describe('ProgressModal', () => {
  beforeEach(() => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Guest'));
    jest.clearAllMocks();
  });

  it('renders modal with instant percentage preview', () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ProgressModal
            item={mockShelfItem}
            isOpen={true}
            onClose={jest.fn()}
          />
        </BookshelfProvider>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /update reading progress/i })).toBeInTheDocument();
    expect(screen.getByText('Progress Testing Novel')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('updates percentage preview on page input change', () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ProgressModal
            item={mockShelfItem}
            isOpen={true}
            onClose={jest.fn()}
          />
        </BookshelfProvider>
      </AuthProvider>
    );

    const currentPageInput = screen.getByLabelText(/current page/i);
    fireEvent.change(currentPageInput, { target: { value: '100' } });

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('handles total pages = 0 safely without division by zero', () => {
    const zeroTotalItem = { ...mockShelfItem, current_page: 10, total_pages: 0 };
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ProgressModal
            item={zeroTotalItem}
            isOpen={true}
            onClose={jest.fn()}
          />
        </BookshelfProvider>
      </AuthProvider>
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('rejects current page greater than total pages', async () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ProgressModal
            item={mockShelfItem}
            isOpen={true}
            onClose={jest.fn()}
          />
        </BookshelfProvider>
      </AuthProvider>
    );

    const currentPageInput = screen.getByLabelText(/current page/i);
    fireEvent.change(currentPageInput, { target: { value: '250' } });

    fireEvent.click(screen.getByRole('button', { name: /save progress/i }));

    await waitFor(() => {
      expect(screen.getByText(/current page cannot exceed total pages/i)).toBeInTheDocument();
    });
  });
});
