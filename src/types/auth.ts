/**
 * Authentication Type Definitions
 * 
 * TypeScript types for the authentication system including User, Tokens, and State management
 */

export type UserRole = 'admin' | 'doctor' | 'billing_staff' | 'receptionist';

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// API Request/Response Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

