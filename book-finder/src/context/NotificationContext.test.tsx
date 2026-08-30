import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {
  NotificationProvider,
  useNotifications,
} from './NotificationContext';
import { AuthProvider } from './AuthContext';
import { notificationService } from '../services/notificationService';

jest.mock('../services/notificationService');

const TestConsumer: React.FC = () => {
  const { unreadCount, notifications } = useNotifications();
  return (
    <div>
      <span data-testid="unread-count">{unreadCount}</span>
      <span data-testid="items-count">{notifications.length}</span>
    </div>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides notification state and methods', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      items: [],
      unread_count: 0,
    });

    render(
      <AuthProvider>
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });
});
