import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ReadingAnalyticsModal } from './ReadingAnalyticsModal';
import { analyticsService } from '../../services/analyticsService';
import { AuthProvider } from '../../context/AuthContext';
import { BookshelfProvider } from '../../context/BookshelfContext';
import { ReadingProgressProvider } from '../../context/ReadingProgressContext';
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

jest.mock('../../services/analyticsService');

const mockAnalytics = {
  total_books_completed: 12,
  total_pages_read: 4500,
  average_personal_rating: 4.8,
  active_goal: {
    id: 'goal-1',
    user_id: 'user-1',
    year: 2026,
    target_books: 20,
    completed_books: 12,
    progress_percentage: 60.0,
    is_completed: false,
  },
  monthly_breakdown: [
    { month: 1, books_completed: 2, pages_read: 800 },
    { month: 2, books_completed: 1, pages_read: 350 },
    { month: 3, books_completed: 3, pages_read: 1200 },
    { month: 4, books_completed: 0, pages_read: 0 },
    { month: 5, books_completed: 0, pages_read: 0 },
    { month: 6, books_completed: 2, pages_read: 750 },
    { month: 7, books_completed: 1, pages_read: 400 },
    { month: 8, books_completed: 3, pages_read: 1000 },
    { month: 9, books_completed: 0, pages_read: 0 },
    { month: 10, books_completed: 0, pages_read: 0 },
    { month: 11, books_completed: 0, pages_read: 0 },
    { month: 12, books_completed: 0, pages_read: 0 },
  ],
  top_genres: [
    { genre: 'Sci-Fi', count: 6 },
    { genre: 'Fantasy', count: 4 },
  ],
};

describe('ReadingAnalyticsModal', () => {
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
    jest.clearAllMocks();
  });

  it('renders analytics overview metrics and monthly distribution', async () => {
    (analyticsService.getAnalyticsOverview as jest.Mock).mockResolvedValue(mockAnalytics);

    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <ReadingAnalyticsModal isOpen={true} onClose={jest.fn()} year={2026} />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Reading Analytics & Insights')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('4,500')).toBeInTheDocument();
      expect(screen.getByText('4.8 ★')).toBeInTheDocument();
      expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
      expect(screen.getByText('Fantasy')).toBeInTheDocument();
    });
  });
});
