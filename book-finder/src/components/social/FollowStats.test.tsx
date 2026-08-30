import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FollowStats } from './FollowStats';
import { AuthProvider } from '../../context/AuthContext';
import { socialService } from '../../services/socialService';

jest.mock('../../services/socialService');

describe('FollowStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders follower and following counts', async () => {
    (socialService.getFollowStats as jest.Mock).mockResolvedValue({
      followers_count: 42,
      following_count: 15,
      is_following: false,
    });

    render(
      <AuthProvider>
        <FollowStats userId="user-99" username="test_reader" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('@test_reader')).toBeInTheDocument();
    });
  });
});
