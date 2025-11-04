/**
 * Audit Log Formatting Utilities
 * 
 * Functions for formatting timestamps, icons, types, and nested details for audit log entries
 */

/**
 * Format timestamp to user-friendly relative or absolute format
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted timestamp string
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Recent entries (< 24 hours): Relative format
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      // Yesterday
      return `Yesterday at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else {
      // Older entries: Absolute format
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
}

/**
 * Map action type to MaterialIcons icon name
 * @param action - Action type string
 * @returns Icon name
 */
export function getActionIcon(action: string): string {
  const iconMap: Record<string, string> = {
    create: 'add',
    update: 'edit',
    delete: 'delete',
    view: 'visibility',
    send: 'send',
    generate: 'receipt-long',
    login: 'lock',
    logout: 'lock-open',
  };
  return iconMap[action.toLowerCase()] || 'info';
}

/**
 * Map action type to visual indicator type
 * @param action - Action type string
 * @returns Visual type ('info', 'danger', 'warning')
 */
export function getActionType(action: string): 'info' | 'danger' | 'warning' {
  const typeMap: Record<string, 'info' | 'danger' | 'warning'> = {
    delete: 'danger',
    remove: 'danger',
    cancel: 'warning',
  };
  return typeMap[action.toLowerCase()] || 'info';
}

/**
 * Format nested details object to readable string
 * @param details - Details object
 * @returns Formatted string
 */
export function formatDetails(details: Record<string, unknown> | null | undefined): string | undefined {
  if (!details || typeof details !== 'object') {
    return undefined;
  }

  const parts: string[] = [];

  // Format common fields
  if (details.refund_id) {
    parts.push(`Refund ID: ${details.refund_id}`);
  }
  if (details.amount !== undefined && typeof details.amount === 'number') {
    const dollars = details.amount / 100;
    parts.push(`Amount: ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars)}`);
  }
  if (details.invoice_id) {
    parts.push(`Invoice ID: ${details.invoice_id}`);
  }
  if (details.invoice_number) {
    parts.push(`Invoice: ${details.invoice_number}`);
  }

  // Format other fields
  Object.entries(details).forEach(([key, value]) => {
    if (['refund_id', 'amount', 'invoice_id', 'invoice_number'].includes(key)) {
      return; // Already handled
    }
    if (value !== null && value !== undefined) {
      parts.push(`${key}: ${String(value)}`);
    }
  });

  return parts.length > 0 ? parts.join(', ') : undefined;
}

