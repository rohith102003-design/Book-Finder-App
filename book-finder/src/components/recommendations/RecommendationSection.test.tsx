import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecommendationSection } from './RecommendationSection';
import { AuthProvider } from '../../context/AuthContext';
import { BookshelfProvider } from '../../context/BookshelfContext';
import { ReadingProgressProvider } from '../../context/ReadingProgressContext';

describe('RecommendationSection', () => {
  it('renders recommendations section', () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <RecommendationSection />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Recommended For You')).toBeInTheDocument();
    expect(screen.getByText('Customize Preferences')).toBeInTheDocument();
  });
});
