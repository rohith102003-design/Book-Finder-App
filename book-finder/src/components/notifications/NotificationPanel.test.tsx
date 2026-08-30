import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationPanel } from './NotificationPanel';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

describe('NotificationPanel', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <AuthProvider>
        <NotificationProvider>
          <NotificationPanel isOpen={false} onClose={jest.fn()} />
        </NotificationProvider>
      </AuthProvider>
    );

    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('renders notification panel when isOpen is true and triggers close', () => {
    const handleClose = jest.fn();

    render(
      <AuthProvider>
        <NotificationProvider>
          <NotificationPanel isOpen={true} onClose={handleClose} />
        </NotificationProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Notifications')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close panel');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
