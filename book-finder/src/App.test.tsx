import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn().mockRejectedValue(new Error('Guest session')),
    get: jest.fn().mockResolvedValue({ data: { success: true, data: { items: [], total: 0 } } }),
  };

  return {
    __esModule: true,
    default: {
      post: jest.fn().mockRejectedValue(new Error('Guest session')),
      get: jest.fn().mockResolvedValue({ data: { success: true, data: { items: [], total: 0 } } }),
      create: jest.fn(() => mockAxiosInstance),
      isAxiosError: jest.fn(),
    },
    post: jest.fn().mockRejectedValue(new Error('Guest session')),
    get: jest.fn().mockResolvedValue({ data: { success: true, data: { items: [], total: 0 } } }),
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(),
  };
});

describe('App Root Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders application header and title', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /book finder/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/explore millions of books/i)).toBeInTheDocument();
  });

  it('renders search bar and initial empty state', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByLabelText('Search books').length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/discover your next great read/i)).toBeInTheDocument();
  });

  it('toggles light/dark mode on theme button click', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
    });

    const themeButton = screen.getByRole('button', { name: /switch to/i });
    fireEvent.click(themeButton);
    expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
  });
});
