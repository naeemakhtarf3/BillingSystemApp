# Quickstart Guide: Invoice Financial Metrics Dashboard

**Feature**: Invoice Financial Metrics Dashboard  
**Date**: 2024-12-19  
**Phase**: 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for implementing the invoice financial metrics feature in the dashboard. It covers API integration, data processing, UI integration, and offline support.

## Prerequisites

- React Native CLI project set up
- Backend API endpoint `GET /api/v1/invoices/` available and accessible
- Authentication context (`AuthContext`) with valid JWT tokens
- Existing dashboard screen (`DashboardScreen.tsx`) with KPI display components

## Implementation Steps

### Step 1: Define TypeScript Types

Create `src/types/invoice.ts` with Invoice and FinancialMetrics interfaces:

```typescript
export interface Invoice {
  id: number;
  invoice_number: string;
  patient_id: number;
  total_amount_cents: number;
  status: 'paid' | 'unpaid' | 'pending' | string;
  created_at?: string;
  updated_at?: string;
  currency?: string;
  due_date?: string;
  paid_at?: string;
}

export interface FinancialMetrics {
  outstandingRevenue: number; // in cents
  paidRevenue: number; // in cents
  totalRevenue: number; // in cents
}

export interface FinancialMetricsDisplay {
  outstandingRevenue: string;
  paidRevenue: string;
  totalRevenue: string;
}
```

---

### Step 2: Create Invoice API Service

Create `src/api/invoiceApi.ts` following the pattern from `authApi.ts`:

```typescript
import { Platform } from 'react-native';
import { Invoice } from '../types/invoice';

const getApiBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
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
      if (response.status === 401 || response.status === 403) {
        throw new Error('Token expired');
      }
      throw new Error('Failed to fetch invoices');
    }

    const invoices: Invoice[] = await response.json();
    return invoices;
  } catch (error) {
    if (error instanceof Error && error.message === 'Token expired') {
      throw error;
    }
    throw new Error('Failed to fetch invoices');
  }
}
```

---

### Step 3: Implement Financial Metrics Calculation

Create utility function to calculate metrics from invoice array:

```typescript
// src/utils/financialMetrics.ts
import { Invoice, FinancialMetrics } from '../types/invoice';

/**
 * Calculate financial metrics from invoice array
 * @param invoices - Array of invoice objects
 * @returns Financial metrics in cents
 */
export function calculateFinancialMetrics(invoices: Invoice[]): FinancialMetrics {
  // Filter out invalid invoices (missing required fields)
  const validInvoices = invoices.filter(
    inv => 
      inv.id != null && 
      inv.total_amount_cents != null && 
      inv.status != null
  );

  // Calculate Outstanding Revenue (unpaid + pending)
  const outstandingRevenue = validInvoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.total_amount_cents || 0), 0);

  // Calculate Paid Revenue
  const paidRevenue = validInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total_amount_cents || 0), 0);

  // Calculate Total Revenue (all invoices)
  const totalRevenue = validInvoices
    .reduce((sum, inv) => sum + (inv.total_amount_cents || 0), 0);

  return {
    outstandingRevenue,
    paidRevenue,
    totalRevenue,
  };
}

/**
 * Convert cents to formatted currency string
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "$12,450.00")
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Convert financial metrics to display format
 * @param metrics - Metrics in cents
 * @returns Formatted metrics for display
 */
export function formatFinancialMetrics(
  metrics: FinancialMetrics
): FinancialMetricsDisplay {
  return {
    outstandingRevenue: formatCurrency(metrics.outstandingRevenue),
    paidRevenue: formatCurrency(metrics.paidRevenue),
    totalRevenue: formatCurrency(metrics.totalRevenue),
  };
}
```

---

### Step 4: Add AsyncStorage Caching

Create cache utility for offline support:

```typescript
// src/utils/invoiceCache.ts
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
```

---

### Step 5: Update Dashboard Screen

Modify `src/screens/DashboardScreen.tsx` to use real data:

```typescript
// Add imports
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchInvoices } from '../api/invoiceApi';
import { calculateFinancialMetrics, formatFinancialMetrics } from '../utils/financialMetrics';
import { saveInvoiceCache, loadInvoiceCache } from '../utils/invoiceCache';
import { Invoice, FinancialMetricsDisplay } from '../types/invoice';

// Replace hardcoded kpiData with state
const DashboardScreen = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30D');
  const [metrics, setMetrics] = useState<FinancialMetricsDisplay>({
    outstandingRevenue: '$0.00',
    paidRevenue: '$0.00',
    totalRevenue: '$0.00',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useAuth();
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    loadInvoiceData();
  }, []);

  const loadInvoiceData = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to load from cache first for instant display
      const cachedInvoices = await loadInvoiceCache();
      if (cachedInvoices) {
        updateMetrics(cachedInvoices);
      }

      // Fetch fresh data
      const invoices = await fetchInvoices(accessToken);
      await saveInvoiceCache(invoices);
      updateMetrics(invoices);
    } catch (err) {
      console.error('Error loading invoices:', err);
      
      // Try to use cache if fetch failed
      const cachedInvoices = await loadInvoiceCache();
      if (cachedInvoices) {
        updateMetrics(cachedInvoices);
      } else {
        setError('Unable to load financial data');
        // Set zero values as fallback
        setMetrics({
          outstandingRevenue: '$0.00',
          paidRevenue: '$0.00',
          totalRevenue: '$0.00',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetrics = (invoices: Invoice[]) => {
    const calculated = calculateFinancialMetrics(invoices);
    const formatted = formatFinancialMetrics(calculated);
    setMetrics(formatted);
  };

  // Update kpiData to use real metrics
  const kpiData = [
    { 
      title: 'Outstanding', 
      value: metrics.outstandingRevenue, 
      trend: '+2.5%', // TODO: Calculate actual trend
      trendColor: 'danger' as const, 
      icon: 'hourglass-top' 
    },
    { 
      title: 'Paid (Last 30 Days)', 
      value: metrics.paidRevenue, 
      trend: '+15.1%', // TODO: Calculate actual trend
      trendColor: 'success' as const, 
      icon: 'task-alt' 
    },
    { 
      title: 'Total Revenue', 
      value: metrics.totalRevenue, 
      trend: '+8.2%', // TODO: Calculate actual trend
      trendColor: 'success' as const, 
      icon: 'trending-up' 
    },
  ];

  // Rest of component remains the same...
  // (render logic unchanged, kpiData now uses real values)
};
```

---

## Error Handling

The implementation handles various error scenarios:

1. **Network Errors**: Falls back to cached data if available
2. **Token Expiration**: Throws error (handled by AuthContext)
3. **Invalid Data**: Filters out invalid invoices, calculates with valid ones
4. **Empty Response**: Returns zero values for all metrics

## Testing Checklist

- [ ] Dashboard loads and displays metrics from API
- [ ] Metrics update correctly with real invoice data
- [ ] Empty invoice array shows zero values
- [ ] Network failure falls back to cache
- [ ] Cache expires after 5 minutes
- [ ] Invalid invoices are excluded from calculations
- [ ] Currency formatting displays correctly ($X,XXX.XX)
- [ ] Offline mode shows cached data
- [ ] Token expiration handled gracefully

## Performance Considerations

- Client-side aggregation is efficient for up to 10,000 invoices
- Cache provides instant display on subsequent loads
- Single-pass aggregation (O(n) complexity)
- Consider memoization if calculations become frequent

## Future Enhancements

- Add trend calculation (compare with previous period)
- Implement pagination if dataset exceeds 10,000 invoices
- Add refresh/pull-to-refresh functionality
- Multi-currency support with conversion rates
- Real-time updates via WebSocket (optional)

## Related Files

- `specs/002-invoice-financial-metrics/data-model.md` - Entity definitions
- `specs/002-invoice-financial-metrics/contracts/invoices-api.yaml` - API specification
- `src/api/authApi.ts` - Reference implementation pattern

