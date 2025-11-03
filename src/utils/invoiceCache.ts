/**
 * Invoice Cache Utilities
 * 
 * Functions for caching invoice data in AsyncStorage for offline support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Invoice } from '../types/invoice';

const CACHE_KEY = '@invoice_data_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedInvoiceData {
  invoices: Invoice[];
  timestamp: number;
  expiresAt: number;
}

/**
 * Save invoices to cache
 */
export async function saveInvoiceCache(invoices: Invoice[]): Promise<void> {
  const now = Date.now();
  const cacheData: CachedInvoiceData = {
    invoices,
    timestamp: now,
    expiresAt: now + CACHE_TTL,
  };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}

/**
 * Load invoices from cache if not expired
 * @returns Cached invoices or null if cache expired/not found
 */
export async function loadInvoiceCache(): Promise<Invoice[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: CachedInvoiceData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now > cacheData.expiresAt) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cacheData.invoices;
  } catch (error) {
    console.error('Error loading invoice cache:', error);
    return null;
  }
}

