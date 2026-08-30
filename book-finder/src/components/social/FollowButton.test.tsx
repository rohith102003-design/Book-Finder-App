import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FollowButton } from './FollowButton';
import { AuthProvider } from '../../context/AuthContext';
import { socialService } from '../../services/socialService';

jest.mock('../../services/socialService');

describe('FollowButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders follow button in default state and toggles on click', async () => {
    (socialService.getFollowStatus as jest.Mock).mockResolvedValue(false);
    (socialService.followUser as jest.Mock).mockResolvedValue({
      id: 'fol-1',
      follower_id: 'user-1',
      following_id: 'user-2',
      created_at: new Date().toISOString(),
    });

    render(
      <AuthProvider>
        <FollowButton targetUserId="target-user-1" initialIsFollowing={false} />
      </AuthProvider>
    );

    const followBtn = screen.getByRole('button', { name: 'Follow' });
    expect(followBtn).toBeInTheDocument();

    fireEvent.click(followBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
    });
  });
});
