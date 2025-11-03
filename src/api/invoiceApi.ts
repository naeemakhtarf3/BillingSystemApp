/**
 * Invoice API Service
 * 
 * Handles communication with the backend invoice API endpoints
 */

import { Platform } from 'react-native';
import { Invoice } from '../types/invoice';

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
 * Fetch all invoices from the API
 * @param accessToken - JWT access token
 * @returns Array of invoice objects
 * @throws Error on API failure
 */
export async function fetchInvoices(accessToken: string): Promise<Invoice[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/`, {
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
      throw new Error('Failed to fetch invoices');
    }

    const invoices: Invoice[] = await response.json();
    return invoices;
  } catch (error) {
    // Re-throw token expiration errors, otherwise generic message
    if (error instanceof Error && error.message === 'Token expired') {
      throw error;
    }
    throw new Error('Failed to fetch invoices');
  }
}

