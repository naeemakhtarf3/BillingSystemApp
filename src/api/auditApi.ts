/**
 * Audit Log API Service
 * 
 * Handles communication with the backend audit log API endpoints
 */

import { Platform } from 'react-native';
import { AuditLogEntry } from '../types/audit';

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
 * Fetch all audit log entries from the API
 * @param accessToken - JWT access token
 * @returns Array of audit log entry objects
 * @throws Error on API failure
 */
export async function fetchAuditLogs(accessToken: string): Promise<AuditLogEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/audit/`, {
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
      // Detect server errors (500, 502, 503, etc.)
      if (response.status >= 500) {
        throw new Error('Server error');
      }
      // Other errors
      throw new Error('Failed to fetch audit logs');
    }

    const entries: AuditLogEntry[] = await response.json();
    return entries;
  } catch (error) {
    // Log API failures for debugging
    console.error('Audit API error:', error);
    
    // Re-throw specific errors
    if (error instanceof Error) {
      if (error.message === 'Token expired' || error.message === 'Server error') {
        throw error;
      }
      // Network errors (fetch failures, timeouts, etc.)
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Network error');
      }
    }
    // Generic error for unknown cases
    throw new Error('Failed to fetch audit logs');
  }
}

