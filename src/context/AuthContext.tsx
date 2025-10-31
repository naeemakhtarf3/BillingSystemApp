/**
 * Authentication Context
 * 
 * Provides global authentication state management using React Context API
 * Handles login, logout, session persistence, and token management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextValue, User, AuthTokens } from '../types/auth';
import { login as loginApi, fetchUser as fetchUserApi } from '../api/authApi';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  TOKENS: '@auth:tokens',
  USER: '@auth:user',
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Computed: isAuthenticated
  const isAuthenticated = user !== null && tokens !== null;

  /**
   * Login function
   * Authenticates user, stores tokens and user data, persists to AsyncStorage
   */
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);

      // Call login API
      const authTokens = await loginApi(username, password);

      // Fetch user profile using access token
      const userData = await fetchUserApi(authTokens.access_token);

      // Update state
      setTokens(authTokens);
      setUser(userData);

      // Persist to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(authTokens));
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      console.log('userData', userData);
      
    } catch (error) {
      // Clear state on error
      setTokens(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   * Clears authentication state and removes data from AsyncStorage
   */
  const logout = async (): Promise<void> => {
    try {
      // Clear state
      setTokens(null);
      setUser(null);

      // Remove from AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKENS);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      // Log error but continue with logout
      console.error('Error during logout:', error);
    }
  };

  /**
   * Session restoration on app initialization
   * Checks AsyncStorage for stored tokens and validates them
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        setLoading(true);

        // Check for stored tokens and user
        const storedTokens = await AsyncStorage.getItem(STORAGE_KEYS.TOKENS);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (storedTokens && storedUser) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          const parsedUser: User = JSON.parse(storedUser);

          // Temporarily set state to authenticated
          setTokens(parsedTokens);
          setUser(parsedUser);

          // Validate tokens by fetching user profile
          try {
            const userData = await fetchUserApi(parsedTokens.access_token);
            // Success: keep tokens and updated user data
            setUser(userData);
            // Update stored user data
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
          } catch (error) {
            // Validation failed: clear everything
            setTokens(null);
            setUser(null);
            await AsyncStorage.removeItem(STORAGE_KEYS.TOKENS);
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
      } catch (error) {
        // Error reading storage: clear state
        console.error('Error restoring session:', error);
        setTokens(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Handle token expiration during active session
   * Detects 401/403 errors and clears authentication state
   */
  const handleTokenExpiration = async (): Promise<void> => {
    try {
      // Clear state
      setTokens(null);
      setUser(null);

      // Remove from AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKENS);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error handling token expiration:', error);
    }
  };

  // Expose token expiration handler (will be used by API interceptor in future)
  // For now, authApi handles it and throws, we catch it in login/context usage

  const value: AuthContextValue = {
    user,
    tokens,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

