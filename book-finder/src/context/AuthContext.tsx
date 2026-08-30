import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import axios from 'axios';
import {
  apiClient,
  API_BASE_URL,
  setAccessToken,
  setOnSessionExpiredCallback,
} from '../services/apiClient';
import { User, TokenResponse, RegistrationResponse, ApiEnvelope } from '../types/auth';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot-password' | 'verify-email';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot-password' | 'verify-email') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string, clientId?: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<RegistrationResponse>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<string>;
  forgotPassword: (email: string) => Promise<{ message: string; reset_token?: string }>;
  resetPassword: (email: string, resetToken: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot-password' | 'verify-email'>('login');

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot-password' | 'verify-email' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Update token both in module memory (for Axios interceptor) and React state
  const updateToken = useCallback((token: string | null) => {
    setAccessToken(token);
    setAccessTokenState(token);
  }, []);

  // Silent session refresh on application mount
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await axios.post<ApiEnvelope<TokenResponse>>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      if (response.data?.success && response.data?.data) {
        const token = response.data.data.access_token;
        const userData = response.data.data.user;

        updateToken(token);
        setUser(userData);
        return true;
      }
      return false;
    } catch {
      updateToken(null);
      setUser(null);
      return false;
    }
  }, [updateToken]);

  // Initial authentication probe
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoading(true);
      await refreshSession();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Hook session expiration callback from apiClient
    setOnSessionExpiredCallback(() => {
      updateToken(null);
      setUser(null);
    });

    return () => {
      isMounted = false;
    };
  }, [refreshSession, updateToken]);

  // User Login (Standard)
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await apiClient.post<ApiEnvelope<TokenResponse>>('/auth/login', {
        email,
        password,
      });

      if (response.data?.success && response.data?.data) {
        const token = response.data.data.access_token;
        const userData = response.data.data.user;

        updateToken(token);
        setUser(userData);
        closeAuthModal();
      } else {
        throw new Error('Authentication failed.');
      }
    },
    [updateToken, closeAuthModal]
  );

  // User Login via Google OAuth
  const loginWithGoogle = useCallback(
    async (credential: string, clientId?: string): Promise<void> => {
      const response = await apiClient.post<ApiEnvelope<TokenResponse>>('/auth/google', {
        credential,
        client_id: clientId,
      });

      if (response.data?.success && response.data?.data) {
        const token = response.data.data.access_token;
        const userData = response.data.data.user;

        updateToken(token);
        setUser(userData);
        closeAuthModal();
      } else {
        throw new Error('Google authentication failed.');
      }
    },
    [updateToken, closeAuthModal]
  );

  // User Registration (Creates unverified account and dispatches 6-digit email code)
  const register = useCallback(
    async (email: string, username: string, password: string): Promise<RegistrationResponse> => {
      const response = await apiClient.post<ApiEnvelope<RegistrationResponse>>('/auth/register', {
        email,
        username,
        password,
      });

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error('Registration failed.');
    },
    []
  );

  // Email Verification (Validates 6-digit code, activates account, and starts session)
  const verifyEmail = useCallback(
    async (email: string, code: string): Promise<void> => {
      const response = await apiClient.post<ApiEnvelope<TokenResponse>>('/auth/verify-email', {
        email,
        code,
      });

      if (response.data?.success && response.data?.data) {
        const token = response.data.data.access_token;
        const userData = response.data.data.user;

        updateToken(token);
        setUser(userData);
        closeAuthModal();
      } else {
        throw new Error('Email verification failed.');
      }
    },
    [updateToken, closeAuthModal]
  );

  // Resend Email Verification Code
  const resendVerification = useCallback(
    async (email: string): Promise<string> => {
      const response = await apiClient.post<ApiEnvelope<{ message: string }>>(
        '/auth/resend-verification',
        { email }
      );

      if (response.data?.success && response.data?.data?.message) {
        return response.data.data.message;
      }
      return 'Verification code sent.';
    },
    []
  );

  // Password Reset Request (Forgot Password)
  const forgotPassword = useCallback(
    async (email: string): Promise<{ message: string; reset_token?: string }> => {
      const response = await apiClient.post<
        ApiEnvelope<{ message: string; email: string; reset_token?: string }>
      >('/auth/forgot-password', { email });

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error('Failed to request password reset.');
    },
    []
  );

  // Password Reset Execution
  const resetPassword = useCallback(
    async (email: string, resetToken: string, newPassword: string): Promise<void> => {
      const response = await apiClient.post<ApiEnvelope<{ message: string }>>('/auth/reset-password', {
        email,
        reset_token: resetToken,
        new_password: newPassword,
      });

      if (!response.data?.success) {
        throw new Error('Failed to reset password.');
      }
    },
    []
  );

  // User Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Even if network fails, proceed with local teardown
    } finally {
      updateToken(null);
      setUser(null);
    }
  }, [updateToken]);

  const value: AuthContextType = {
    user,
    accessToken: accessTokenState,
    isAuthenticated: !!user && !!accessTokenState,
    isLoading,
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    loginWithGoogle,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
