/**
 * Invoice Type Definitions
 * 
 * TypeScript types for invoice data and financial metrics calculations
 */

export interface Invoice {
  id: number;
  invoice_number: string;
  patient_id: number;
  total_amount_cents: number;
  status: 'paid' | 'unpaid' | 'pending' | string; // string for extensibility
  created_at?: string; // ISO 8601 date string
  updated_at?: string; // ISO 8601 date string
  currency?: string; // ISO 4217 currency code
  due_date?: string; // ISO 8601 date string
  paid_at?: string; // ISO 8601 date string
}

export interface FinancialMetrics {
  outstandingRevenue: number; // in cents
  paidRevenue: number; // in cents
  totalRevenue: number; // in cents
}

export interface FinancialMetricsDisplay {
  outstandingRevenue: string; // formatted as "$X,XXX.XX"
  paidRevenue: string; // formatted as "$X,XXX.XX"
  totalRevenue: string; // formatted as "$X,XXX.XX"
}

