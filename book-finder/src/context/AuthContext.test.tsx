import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from './AuthContext';
import { apiClient, getAccessToken, setAccessToken } from '../services/apiClient';

jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    get: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      post: jest.fn(),
      create: jest.fn(() => mockAxiosInstance),
      isAxiosError: jest.fn(),
    },
    post: jest.fn(),
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(),
  };
});

const TestAuthConsumer: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();

  if (isLoading) {
    return <div>Loading Auth...</div>;
  }

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Guest'}</div>
      {user && <div data-testid="username">{user.username}</div>}
      <button onClick={() => login('reader@example.com', 'SecurePassword123!')}>Login</button>
      <button onClick={() => register('new@example.com', 'new_user', 'SecurePassword123!')}>
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setAccessToken(null);
    jest.clearAllMocks();
  });

  it('initializes in guest mode when initial refresh fails (401)', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('Loading Auth...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    });

    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('restores authenticated session when initial refresh succeeds', async () => {
    const mockUser = {
      id: 'uuid-123',
      email: 'existing@example.com',
      username: 'existing_reader',
      role: 'USER',
      is_active: true,
      created_at: '2026-08-28T00:00:00Z',
      updated_at: '2026-08-28T00:00:00Z',
    };

    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          access_token: 'valid.mock.jwt',
          token_type: 'bearer',
          user: mockUser,
        },
      },
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('username')).toHaveTextContent('existing_reader');
    });

    expect(getAccessToken()).toBe('valid.mock.jwt');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('accessToken')).toBeNull();
  });

  it('successfully logs in a user and updates auth state', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('401'));

    const mockUser = {
      id: 'uuid-456',
      email: 'reader@example.com',
      username: 'alex_reads',
      role: 'USER',
      is_active: true,
      created_at: '2026-08-28T00:00:00Z',
      updated_at: '2026-08-28T00:00:00Z',
    };

    jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          access_token: 'login.jwt.token',
          token_type: 'bearer',
          user: mockUser,
        },
      },
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('username')).toHaveTextContent('alex_reads');
    });

    expect(getAccessToken()).toBe('login.jwt.token');
  });

  it('successfully logs out and clears authentication state', async () => {
    const mockUser = {
      id: 'uuid-789',
      email: 'logout@example.com',
      username: 'logout_user',
      role: 'USER',
      is_active: true,
      created_at: '2026-08-28T00:00:00Z',
      updated_at: '2026-08-28T00:00:00Z',
    };

    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          access_token: 'logout.jwt.token',
          token_type: 'bearer',
          user: mockUser,
        },
      },
    });

    jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { success: true, data: { message: 'Logged out successfully.' } },
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    });

    expect(getAccessToken()).toBeNull();
  });
});
