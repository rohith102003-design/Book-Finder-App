import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

describe('NotificationBell', () => {
  it('renders notification button icon', () => {
    render(
      <AuthProvider>
        <NotificationProvider>
          <NotificationBell />
        </NotificationProvider>
      </AuthProvider>
    );

    const bellBtn = screen.getByRole('button', { name: 'Notifications' });
    expect(bellBtn).toBeInTheDocument();
  });
});
