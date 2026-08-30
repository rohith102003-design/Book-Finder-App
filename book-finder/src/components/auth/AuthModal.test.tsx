import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthModal } from './AuthModal';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import axios from 'axios';

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

const TestModalContainer: React.FC = () => {
  const { openAuthModal, isLoading } = useAuth();
  return (
    <div>
      {isLoading && <div data-testid="loading-auth">Loading...</div>}
      <button onClick={() => openAuthModal('login')}>Open Login</button>
      <button onClick={() => openAuthModal('register')}>Open Register</button>
      <AuthModal />
    </div>
  );
};

const renderWithAuth = async () => {
  let view: ReturnType<typeof render>;
  await act(async () => {
    view = render(
      <AuthProvider>
        <TestModalContainer />
      </AuthProvider>
    );
  });
  return view!;
};

describe('AuthModal', () => {
  beforeEach(() => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Guest'));
    jest.clearAllMocks();
  });

  it('renders and switches tabs between Sign In and Register', async () => {
    await renderWithAuth();

    // Open Modal
    fireEvent.click(screen.getByText('Open Login'));

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /sign in/i }).length).toBeGreaterThan(0);
    expect(screen.queryByPlaceholderText('booklover42')).not.toBeInTheDocument();

    // Switch to Register tab
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('booklover42')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('toggles password visibility on eye button click', async () => {
    await renderWithAuth();

    fireEvent.click(screen.getByText('Open Login'));

    const passwordInput = screen.getByPlaceholderText('••••••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('validates email address format on submit', async () => {
    await renderWithAuth();

    fireEvent.click(screen.getByText('Open Register'));

    fireEvent.change(screen.getByPlaceholderText('name@gmail.com'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('booklover42'), {
      target: { value: 'validuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'ValidPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it('closes dialog on close button click', async () => {
    await renderWithAuth();

    fireEvent.click(screen.getByText('Open Login'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
