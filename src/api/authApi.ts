/**
 * Authentication API Service
 * 
 * Handles communication with the backend authentication API endpoints
 */

import { Platform } from 'react-native';
import { LoginRequest, LoginResponse, UserResponse, AuthTokens } from '../types/auth';

// Platform-specific API URL
// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator can use localhost
// For physical devices, replace with your computer's IP address
const getApiBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 to access host machine
    // For physical device, replace with your computer's IP (e.g., 'http://192.168.1.100:8000/api/v1')
    return 'http://10.0.2.2:8000/api/v1';
  }
  // iOS simulator - localhost works
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Login with username and password
 * @param username - User email or username
 * @param password - User password
 * @returns Authentication tokens
 * @throws Error with message "Login failed" for any error
 */
export async function login(username: string, password: string): Promise<AuthTokens> {
  try {
    const loginUrl = `${API_BASE_URL}/auth/login`;
    console.log('Login API URL:', loginUrl);
    console.log('Login Request:', { username, password: '***' });
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password } as LoginRequest),
    });

    console.log('Login API Response Status:', response.status, response.statusText);
    console.log('Login API Response OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login API Error Response:', errorText);
      console.error('Login API Status:', response.status, response.statusText);
      throw new Error('Login failed');
    }

    const data: LoginResponse = await response.json();
    console.log('Login API Success:', data);
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
    };
  } catch (error) {
    // Log detailed error for debugging
    console.error('Login API Exception:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // All errors result in generic "Login failed" message per spec
    throw new Error('Login failed');
  }
}

/**
 * Fetch current user profile using access token
 * @param accessToken - JWT access token
 * @returns User object
 * @throws Error with message "Login failed" for any error
 */
export async function fetchUser(accessToken: string): Promise<UserResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Detect token expiration (401/403)
      if (response.status === 401 || response.status === 403) {
        throw new Error('Token expired');
      }
      throw new Error('Login failed');
    }

    const user: UserResponse = await response.json();
    return user;
  } catch (error) {
    // Re-throw token expiration errors, otherwise generic message
    if (error instanceof Error && error.message === 'Token expired') {
      throw error;
    }
    throw new Error('Login failed');
  }
}

