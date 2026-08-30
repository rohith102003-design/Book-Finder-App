import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendationPreferencesModal } from './RecommendationPreferencesModal';
import { recommendationService } from '../../services/recommendationService';

jest.mock('../../services/recommendationService');

describe('RecommendationPreferencesModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(
      <RecommendationPreferencesModal
        isOpen={false}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );

    expect(
      screen.queryByText('Recommendation Preferences')
    ).not.toBeInTheDocument();
  });

  it('renders modal form when open and allows closing', async () => {
    (recommendationService.getProfile as jest.Mock).mockResolvedValue(null);
    const handleClose = jest.fn();

    render(
      <RecommendationPreferencesModal
        isOpen={true}
        onClose={handleClose}
        onSaved={jest.fn()}
      />
    );

    expect(screen.getByText('Recommendation Preferences')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
