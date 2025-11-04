# Quickstart Guide: Audit Log API Integration

**Feature**: Audit Log API Integration  
**Date**: 2024-12-19  
**Phase**: 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for implementing API integration on the Audit Log screen. It covers API service creation, data transformation, UI integration, error handling, and timestamp formatting.

## Prerequisites

- React Native CLI project set up
- Backend API endpoint `GET /api/v1/audit/` available and accessible
- Authentication context (`AuthContext`) with valid JWT tokens
- Existing Audit Log screen (`AuditLogScreen.tsx`) with static data
- MaterialIcons library available (already in project)

## Implementation Steps

### Step 1: Define TypeScript Types

Create `src/types/audit.ts` with AuditLogEntry and DisplayAuditEntry interfaces:

```typescript
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
```

---

### Step 2: Create Audit API Service

Create `src/api/auditApi.ts` following the pattern from `invoiceApi.ts`:

```typescript
/**
 * Audit Log API Service
 * 
 * Handles communication with the backend audit log API endpoints
 */

import { Platform } from 'react-native';
import { AuditLogEntry } from '../types/audit';

// Platform-specific API URL
const getApiBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
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
      throw new Error('Failed to fetch audit logs');
    }

    const entries: AuditLogEntry[] = await response.json();
    return entries;
  } catch (error) {
    // Re-throw token expiration errors, otherwise generic message
    if (error instanceof Error && error.message === 'Token expired') {
      throw error;
    }
    throw new Error('Failed to fetch audit logs');
  }
}
```

---

### Step 3: Create Timestamp Formatting Utility

Create utility function to format timestamps:

```typescript
// src/utils/auditFormatting.ts

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
```

---

### Step 4: Create Data Transformation Utility

Create utility to transform API entries to display format:

```typescript
// src/utils/auditTransform.ts

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
 * @returns Display audit entry
 */
export function transformAuditEntry(entry: AuditLogEntry): DisplayAuditEntry | null {
  // Validate required fields
  if (!entry.id || !entry.action || !entry.target_type || !entry.target_id || !entry.created_at) {
    console.warn('Invalid audit log entry:', entry);
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
```

---

### Step 5: Update AuditLogScreen

Modify `src/screens/AuditLogScreen.tsx` to use API data:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from '../lib/tailwind';
import { useAuth } from '../context/AuthContext';
import { fetchAuditLogs } from '../api/auditApi';
import { transformAuditEntries } from '../utils/auditTransform';
import { DisplayAuditEntry } from '../types/audit';

type LogItemProps = DisplayAuditEntry;

const LogItem: React.FC<LogItemProps> = ({ title, user, target, time, icon, type, details }) => {
    const isDark = useColorScheme() === 'dark';
    const isDanger = type === 'danger';
    const iconColor = isDanger ? tw.color('danger') : (isDark ? tw.color('text-dark') : tw.color('text-light'));
    const iconBg = isDanger ? 'bg-danger/10' : 'bg-primary/20';

    return (
        <View style={tw`flex-col gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-sm border border-border-light/50 dark:border-border-dark/50`}>
            <View style={tw`flex-row items-start gap-4`}>
                <View style={tw`items-center justify-center rounded-full shrink-0 size-10 ${iconBg}`}>
                    <Icon name={icon} size={24} color={iconColor} />
                </View>
                <View style={tw`flex-1 flex-col justify-center`}>
                    <Text style={tw`text-base font-medium text-text-light dark:text-text-dark`}>{title}</Text>
                    <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>by {user}</Text>
                    <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>Target: {target}</Text>
                    {details && (
                        <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70 mt-1`}>{details}</Text>
                    )}
                </View>
                <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>{time}</Text>
            </View>
        </View>
    );
};

const AuditLogScreen = () => {
    const [entries, setEntries] = useState<DisplayAuditEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { accessToken } = useAuth();
    const isDark = useColorScheme() === 'dark';
    const iconColor = isDark ? tw.color('text-dark') : tw.color('text-light');
    const placeholderColor = isDark ? tw.color('border-dark') : tw.color('border-light');

    useEffect(() => {
        loadAuditLogs();
    }, []);

    const loadAuditLogs = async () => {
        if (!accessToken) {
            setError('Authentication required');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const apiEntries = await fetchAuditLogs(accessToken);
            const displayEntries = transformAuditEntries(apiEntries);
            setEntries(displayEntries);
        } catch (err) {
            console.error('Error loading audit logs:', err);
            
            if (err instanceof Error && err.message === 'Token expired') {
                setError('Authentication expired. Please log in again.');
            } else if (err instanceof Error && err.message.includes('401') || err.message.includes('403')) {
                setError('You do not have permission to view audit logs.');
            } else {
                setError('Unable to load audit logs. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={tw`flex-1 items-center justify-center p-8`}>
                    <ActivityIndicator size="large" color={tw.color('primary')} />
                    <Text style={tw`mt-4 text-text-light dark:text-text-dark`}>Loading audit logs...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={tw`flex-1 items-center justify-center p-8`}>
                    <Icon name="error-outline" size={48} color={tw.color('danger')} />
                    <Text style={tw`mt-4 text-center text-text-light dark:text-text-dark`}>{error}</Text>
                    <TouchableOpacity 
                        style={tw`mt-4 px-6 py-3 bg-primary rounded-lg`}
                        onPress={loadAuditLogs}
                    >
                        <Text style={tw`text-white font-medium`}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (entries.length === 0) {
            return (
                <View style={tw`flex-1 items-center justify-center p-8`}>
                    <Icon name="info-outline" size={48} color={iconColor} />
                    <Text style={tw`mt-4 text-center text-text-light dark:text-text-dark`}>
                        No audit entries available
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={entries}
                renderItem={({ item }) => <LogItem {...item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                ItemSeparatorComponent={() => <View style={tw`h-3`} />}
            />
        );
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-background-light dark:bg-background-dark`}>
            <View style={tw`flex-row items-center p-4 border-b border-border-light/50 dark:border-border-dark/50`}>
                <Text style={tw`flex-1 text-lg font-bold text-text-light dark:text-text-dark`}>Audit Log</Text>
                <TouchableOpacity style={tw`w-12 items-end`}>
                    <Icon name="more-vert" size={24} color={iconColor} />
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <>
                        <View style={tw`px-4 py-3`}>
                            <View style={tw`flex-row items-center rounded-lg bg-slate-200 dark:bg-slate-800 h-12 px-4`}>
                                <Icon name="search" size={24} color={placeholderColor} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={tw`flex-1 h-full text-base text-text-light dark:text-text-dark`}
                                    placeholder="Search by user, action, or resource..."
                                    placeholderTextColor={placeholderColor}
                                />
                            </View>
                        </View>
                        <View style={tw`flex-row gap-3 px-4 py-2`}>
                            <TouchableOpacity style={tw`flex-row h-8 items-center justify-center gap-x-2 rounded-lg bg-primary/20 pl-2 pr-4`}>
                                <Icon name="tune" size={18} color={tw.color('primary')} />
                                <Text style={tw`text-primary text-sm font-medium`}>Filter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={tw`flex-row h-8 items-center justify-center gap-x-2 rounded-lg bg-slate-200 dark:bg-slate-800 pl-2 pr-4`}>
                                <Icon name="file-download" size={18} color={iconColor} />
                                <Text style={tw`text-sm font-medium text-text-light dark:text-text-dark`}>Export</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={tw`p-4 pt-2`}>
                            <View style={tw`w-full border-t border-border-light/50 dark:border-border-dark/50`}></View>
                        </View>
                    </>
                }
                data={entries}
                renderItem={({ item }) => <LogItem {...item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                ItemSeparatorComponent={() => <View style={tw`h-3`} />}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={tw`items-center justify-center p-8`}>
                            <ActivityIndicator size="large" color={tw.color('primary')} />
                            <Text style={tw`mt-4 text-text-light dark:text-text-dark`}>Loading...</Text>
                        </View>
                    ) : error ? (
                        <View style={tw`items-center justify-center p-8`}>
                            <Icon name="error-outline" size={48} color={tw.color('danger')} />
                            <Text style={tw`mt-4 text-center text-text-light dark:text-text-dark`}>{error}</Text>
                            <TouchableOpacity 
                                style={tw`mt-4 px-6 py-3 bg-primary rounded-lg`}
                                onPress={loadAuditLogs}
                            >
                                <Text style={tw`text-white font-medium`}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={tw`items-center justify-center p-8`}>
                            <Icon name="info-outline" size={48} color={iconColor} />
                            <Text style={tw`mt-4 text-center text-text-light dark:text-text-dark`}>
                                No audit entries available
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

export default AuditLogScreen;
```

---

## Error Handling

The implementation handles various error scenarios:

1. **Network Errors**: Displays user-friendly error message with retry option
2. **Token Expiration (401/403)**: Shows authentication error, may trigger logout
3. **Server Errors (500)**: Shows generic server error message with retry
4. **Empty Response**: Shows "No audit entries available" message
5. **Invalid Data**: Filters out invalid entries, logs warnings, continues with valid entries
6. **Missing Fields**: Handles gracefully, uses fallback values or omits fields

## Testing Checklist

- [ ] Audit Log screen loads and displays entries from API
- [ ] Timestamps format correctly (relative for recent, absolute for older)
- [ ] Nested details display correctly (refund_id, amount, etc.)
- [ ] Action types map to correct icons and colors
- [ ] Empty state displays when API returns empty array
- [ ] Network error shows error message with retry
- [ ] Authentication error handled gracefully
- [ ] Invalid entries are filtered out (doesn't break UI)
- [ ] Loading indicator shows during API call
- [ ] Component unmounting doesn't cause state updates

## Performance Considerations

- FlatList provides virtualization for large lists (efficient for 500+ entries)
- Single-pass transformation (O(n) complexity)
- Timestamp formatting is lightweight (native Date API)
- Consider memoization if re-renders become frequent

## Future Enhancements

- Add search functionality (filter entries by user, action, target)
- Add filter functionality (filter by action type, date range)
- Add pagination or infinite scroll for very large datasets
- Add export functionality (CSV, PDF)
- Add pull-to-refresh functionality
- Fetch user names for actor_id (instead of "User 42")
- Add offline caching with AsyncStorage
- Add real-time updates via WebSocket (optional)

## Related Files

- `specs/003-audit-api-integration/data-model.md` - Entity definitions
- `specs/003-audit-api-integration/contracts/audit-api.yaml` - API specification
- `src/api/invoiceApi.ts` - Reference implementation pattern
- `src/api/authApi.ts` - Reference implementation pattern

