import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ReviewSection } from './ReviewSection';
import { reviewService } from '../../services/reviewService';
import { AuthProvider } from '../../context/AuthContext';

jest.mock('../../services/reviewService');

const mockSummary = {
  book_id: 'book-1',
  openlibrary_work_id: 'OL123W',
  average_rating: 4.5,
  total_reviews: 2,
  rating_distribution: {
    one_star: 0,
    two_star: 0,
    three_star: 0,
    four_star: 1,
    five_star: 1,
  },
  reviews: [
    {
      id: 'rev-1',
      user_id: 'user-1',
      book_id: 'book-1',
      rating: 5,
      title: 'Top Tier',
      content: 'Brilliant storyline.',
      contains_spoilers: false,
      likes_count: 0,
      author: {
        id: 'user-1',
        username: 'alice',
        is_verified_reader: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

describe('ReviewSection', () => {
  beforeEach(() => {
    (reviewService.getBookReviews as jest.Mock).mockResolvedValue(mockSummary);
    (reviewService.getMyReview as jest.Mock).mockResolvedValue(null);
  });

  it('renders rating summary and reviews stream correctly', async () => {
    render(
      <AuthProvider>
        <ReviewSection workId="OL123W" bookTitle="Dune" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('Based on 2 reviews')).toBeInTheDocument();
      expect(screen.getByText('Top Tier')).toBeInTheDocument();
      expect(screen.getByText('Brilliant storyline.')).toBeInTheDocument();
    });
  });

  it('renders empty state when there are no reviews', async () => {
    (reviewService.getBookReviews as jest.Mock).mockResolvedValue({
      book_id: 'book-2',
      openlibrary_work_id: 'OL999W',
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: {
        one_star: 0,
        two_star: 0,
        three_star: 0,
        four_star: 0,
        five_star: 0,
      },
      reviews: [],
    });

    render(
      <AuthProvider>
        <ReviewSection workId="OL999W" bookTitle="Empty Book" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No reviews yet for Empty Book')).toBeInTheDocument();
    });
  });
});
