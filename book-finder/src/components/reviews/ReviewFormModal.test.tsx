import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewFormModal } from './ReviewFormModal';

describe('ReviewFormModal', () => {
  it('renders create mode and handles successful submission', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    const handleClose = jest.fn();

    render(
      <ReviewFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        workId="OL123W"
      />
    );

    expect(screen.getByText('Write a Review')).toBeInTheDocument();

    const titleInput = screen.getByLabelText('Headline / Title (Optional)');
    const contentInput = screen.getByLabelText(/Review Content/i);
    const submitBtn = screen.getByRole('button', { name: 'Post Review' });

    fireEvent.change(titleInput, { target: { value: 'Great Book' } });
    fireEvent.change(contentInput, { target: { value: 'Superb worldbuilding and story.' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        openlibrary_work_id: 'OL123W',
        rating: 5,
        title: 'Great Book',
        content: 'Superb worldbuilding and story.',
        contains_spoilers: false,
      });
    });

    expect(handleClose).toHaveBeenCalled();
  });

  it('validates minimum content length (< 5 characters)', async () => {
    const handleSubmit = jest.fn();
    render(
      <ReviewFormModal
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={handleSubmit}
        workId="OL123W"
      />
    );

    const contentInput = screen.getByLabelText(/Review Content/i);
    fireEvent.change(contentInput, { target: { value: 'Hi' } });

    const submitBtn = screen.getByRole('button', { name: 'Post Review' });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('Review content must be at least 5 characters long.')
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
