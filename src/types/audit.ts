/**
 * Audit Log Type Definitions
 * 
 * TypeScript types for audit log entries and display formatting
 */

export interface AuditLogEntry {
  id: string | number;
  actor_type: string;
  actor_id: string | number;
  action: string;
  target_type: string;
  target_id: string | number;
  details?: AuditLogDetails | null;
  created_at: string; // ISO 8601 timestamp
}

export interface AuditLogDetails {
  refund_id?: string;
  amount?: number; // in cents
  invoice_id?: number;
  invoice_number?: string;
  [key: string]: unknown; // Allow additional fields
}

export interface DisplayAuditEntry {
  id: string;
  title: string;
  user: string;
  target: string;
  time: string;
  icon: string;
  type: 'info' | 'danger' | 'warning';
  details?: string;
}

