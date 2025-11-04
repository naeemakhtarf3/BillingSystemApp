/**
 * Audit Log Transformation Utilities
 * 
 * Functions for transforming API audit log entries to display format
 */

import { AuditLogEntry, DisplayAuditEntry } from '../types/audit';
import { formatTimestamp, getActionIcon, getActionType, formatDetails } from './auditFormatting';

/**
 * Generate title from action and target type
 */
function generateTitle(action: string, targetType: string): string {
  const actionCapitalized = action.charAt(0).toUpperCase() + action.slice(1);
  const targetCapitalized = targetType.charAt(0).toUpperCase() + targetType.slice(1);
  return `${targetCapitalized} ${actionCapitalized}`;
}

/**
 * Generate user display string from actor
 */
function generateUser(actorType: string, actorId: string | number): string {
  if (actorType === 'user') {
    return `User ${actorId}`; // TODO: Fetch user name if available
  } else if (actorType === 'system') {
    return 'System Automation';
  } else {
    return `${actorType} ${actorId}`;
  }
}

/**
 * Generate target display string
 */
function generateTarget(targetType: string, targetId: string | number): string {
  if (targetType === 'invoice') {
    return `Invoice #${targetId}`;
  } else if (targetType === 'patient') {
    return `Patient ID ${targetId}`;
  } else if (targetType === 'ip') {
    return `IP: ${targetId}`;
  } else {
    return `${targetType} ${targetId}`;
  }
}

/**
 * Transform API audit log entry to display format
 * @param entry - API audit log entry
 * @returns Display audit entry or null if invalid
 */
export function transformAuditEntry(entry: AuditLogEntry): DisplayAuditEntry | null {
  // Validate required fields
  if (!entry.id || !entry.action || !entry.target_type || !entry.target_id || !entry.created_at) {
    console.warn('Invalid audit log entry: missing required fields', entry);
    return null;
  }

  return {
    id: String(entry.id),
    title: generateTitle(entry.action, entry.target_type),
    user: generateUser(entry.actor_type, entry.actor_id),
    target: generateTarget(entry.target_type, entry.target_id),
    time: formatTimestamp(entry.created_at),
    icon: getActionIcon(entry.action),
    type: getActionType(entry.action),
    details: formatDetails(entry.details),
  };
}

/**
 * Transform array of API entries to display format
 * Filters out invalid entries
 */
export function transformAuditEntries(entries: AuditLogEntry[]): DisplayAuditEntry[] {
  return entries
    .map(transformAuditEntry)
    .filter((entry): entry is DisplayAuditEntry => entry !== null);
}

