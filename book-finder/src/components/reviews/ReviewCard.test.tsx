import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewCard } from './ReviewCard';
import { Review } from '../../types/review';
import { AuthProvider } from '../../context/AuthContext';
import { socialService } from '../../services/socialService';

jest.mock('../../services/socialService');

const mockReview: Review = {
  id: 'rev-123',
  user_id: 'user-1',
  book_id: 'book-1',
  rating: 5,
  title: 'Sensational Read',
  content: 'One of the best books I have ever read.',
  contains_spoilers: false,
  likes_count: 3,
  author: {
    id: 'user-1',
    username: 'alice_reader',
    is_verified_reader: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ReviewCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (socialService.getReviewLikeStatus as jest.Mock).mockResolvedValue(false);
  });

  it('renders normal review with verified reader badge and helpful button', () => {
    render(
      <AuthProvider>
        <ReviewCard review={mockReview} currentUserId="user-2" />
      </AuthProvider>
    );

    expect(screen.getByText('@alice_reader')).toBeInTheDocument();
    expect(screen.getByText('Verified Reader')).toBeInTheDocument();
    expect(screen.getByText('Sensational Read')).toBeInTheDocument();
    expect(
      screen.getByText('One of the best books I have ever read.')
    ).toBeInTheDocument();
    expect(screen.getByText('Helpful')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
    expect(screen.queryByLabelText('Edit review')).not.toBeInTheDocument();
  });

  it('renders spoiler warning and reveals content on click', () => {
    const spoilerReview: Review = {
      ...mockReview,
      contains_spoilers: true,
    };

    render(
      <AuthProvider>
        <ReviewCard review={spoilerReview} currentUserId="user-2" />
      </AuthProvider>
    );

    expect(screen.getByText('This review contains plot spoilers')).toBeInTheDocument();
    expect(
      screen.queryByText('One of the best books I have ever read.')
    ).not.toBeInTheDocument();

    const showButton = screen.getByRole('button', { name: 'Show Spoiler Review' });
    fireEvent.click(showButton);

    expect(
      screen.getByText('One of the best books I have ever read.')
    ).toBeInTheDocument();
  });

  it('shows edit and delete actions only for the review owner', () => {
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <AuthProvider>
        <ReviewCard
          review={mockReview}
          currentUserId="user-1"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </AuthProvider>
    );

    const editBtn = screen.getByLabelText('Edit review');
    const delBtn = screen.getByLabelText('Delete review');

    expect(editBtn).toBeInTheDocument();
    expect(delBtn).toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockReview);

    fireEvent.click(delBtn);
    expect(handleDelete).toHaveBeenCalledWith('rev-123');
  });

  it('handles helpful button click', async () => {
    (socialService.likeReview as jest.Mock).mockResolvedValue({
      id: 'like-1',
      review_id: 'rev-123',
      user_id: 'user-2',
      created_at: new Date().toISOString(),
    });

    render(
      <AuthProvider>
        <ReviewCard review={mockReview} currentUserId="user-2" />
      </AuthProvider>
    );

    const helpfulBtn = screen.getByRole('button', { name: 'Helpful vote' });
    fireEvent.click(helpfulBtn);

    await waitFor(() => {
      expect(screen.getByText('Helpful')).toBeInTheDocument();
    });
  });
});
