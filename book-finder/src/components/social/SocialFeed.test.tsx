import React from 'react';
import { render, screen } from '@testing-library/react';
import { SocialFeed } from './SocialFeed';
import { AuthProvider } from '../../context/AuthContext';
import { BookshelfProvider } from '../../context/BookshelfContext';
import { ReadingProgressProvider } from '../../context/ReadingProgressContext';
import { socialService } from '../../services/socialService';

jest.mock('../../services/socialService');

describe('SocialFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign in prompt when unauthenticated', () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <SocialFeed />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Community Social Feed')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sign In to View Feed' })
    ).toBeInTheDocument();
  });
});
