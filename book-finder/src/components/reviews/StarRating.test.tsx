import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders read-only rating correctly', () => {
    render(<StarRating rating={4} maxRating={5} />);
    const ratingEl = screen.getByLabelText('Rating: 4 out of 5 stars');
    expect(ratingEl).toBeInTheDocument();
  });

  it('handles interactive rating selection via clicks', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={3} interactive={true} onChange={handleChange} />);

    const fiveStarRadio = screen.getByRole('radio', { name: '5 stars' });
    fireEvent.click(fiveStarRadio);

    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it('handles keyboard navigation (Enter key) on interactive stars', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={2} interactive={true} onChange={handleChange} />);

    const fourStarRadio = screen.getByRole('radio', { name: '4 stars' });
    fireEvent.keyDown(fourStarRadio, { key: 'Enter', code: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
