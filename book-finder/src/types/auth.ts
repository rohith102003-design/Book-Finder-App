export type UserRole = 'USER' | 'ADMIN';
export type AuthProviderType = 'LOCAL' | 'GOOGLE';

export interface User {
  id: string;
  email: string;
  username: string;
  auth_provider?: AuthProviderType;
  email_verified: boolean;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegistrationResponse {
  message: string;
  email: string;
  email_verified: boolean;
  user: User;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface GoogleAuthPayload {
  credential: string;
  client_id?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}
