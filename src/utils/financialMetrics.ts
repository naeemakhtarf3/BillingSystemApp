/**
 * Financial Metrics Calculation Utilities
 * 
 * Functions for calculating and formatting financial metrics from invoice data
 */

import { Invoice, FinancialMetrics, FinancialMetricsDisplay } from '../types/invoice';

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
      typeof inv.total_amount_cents === 'number' &&
      inv.status != null
  );

  // Handle very large numbers by using Number.isSafeInteger check
  // For values beyond safe integer range, JavaScript will lose precision
  // In practice, 10,000 invoices * $1M = $10B = 1,000,000,000,000 cents (within safe range)

  // Calculate Outstanding Revenue (unpaid + pending)
  const outstandingRevenue = validInvoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.total_amount_cents || 0), 0);

  // Calculate Paid Revenue
  const paidRevenue = validInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total_amount_cents || 0), 0);

  // Calculate Total Revenue (all invoices, includes negative amounts for refunds)
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
 * @param cents - Amount in cents (can be negative for refunds/credits)
 * @returns Formatted string (e.g., "$12,450.00" or "-$12,450.00")
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  // Intl.NumberFormat automatically handles negative values correctly
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

