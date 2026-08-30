import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ReadingGoalWidget } from './ReadingGoalWidget';
import { analyticsService } from '../../services/analyticsService';

jest.mock('../../services/analyticsService');

describe('ReadingGoalWidget', () => {
  it('renders goal progress when goal exists', async () => {
    (analyticsService.getReadingGoal as jest.Mock).mockResolvedValue({
      id: 'goal-1',
      user_id: 'user-1',
      year: 2026,
      target_books: 20,
      completed_books: 14,
      progress_percentage: 70.0,
      is_completed: false,
    });

    render(<ReadingGoalWidget currentYear={2026} />);

    await waitFor(() => {
      expect(screen.getByText('2026 Reading Challenge')).toBeInTheDocument();
      expect(screen.getByText('14 of 20 books completed')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
    });
  });

  it('renders inline creation form when no goal exists', async () => {
    (analyticsService.getReadingGoal as jest.Mock).mockResolvedValue(null);

    render(<ReadingGoalWidget currentYear={2026} />);

    await waitFor(() => {
      expect(screen.getByText('Target Books for 2026')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Set Challenge' })).toBeInTheDocument();
    });
  });
});
