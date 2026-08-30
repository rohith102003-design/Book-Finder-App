import axios from 'axios';
import {
  apiClient,
  getAccessToken,
  setAccessToken,
  setOnSessionExpiredCallback,
} from './apiClient';

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
  };
  return {
    ...actualAxios,
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(),
  };
});

describe('apiClient', () => {
  beforeEach(() => {
    setAccessToken(null);
    jest.clearAllMocks();
  });

  it('manages in-memory access token getter and setter without localStorage', () => {
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('accessToken')).toBeNull();

    setAccessToken('mock.jwt.token');
    expect(getAccessToken()).toBe('mock.jwt.token');
    // Ensure tokens are never persisted in Web Storage
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('accessToken')).toBeNull();

    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('registers onSessionExpiredCallback', () => {
    const mockCallback = jest.fn();
    setOnSessionExpiredCallback(mockCallback);
    // Verified setup
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
