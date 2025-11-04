# Data Model: Audit Log API Integration

**Feature**: Audit Log API Integration  
**Date**: 2024-12-19  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data entities, relationships, and validation rules for the audit log API integration feature. The model describes both the API data structures and the display formatting requirements.

## Entities

### AuditLogEntry

Represents a single audit log record containing information about a system action performed by an actor on a target resource.

**Source**: Backend API endpoint `GET /api/v1/audit/`

**Attributes**:

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `id` | `string` or `number` | Yes | Unique audit log entry identifier | Non-empty value |
| `actor_type` | `string` | Yes | Type of entity that performed the action | Examples: "user", "system", "api" |
| `actor_id` | `string` or `number` | Yes | Identifier of the actor | Non-empty value |
| `action` | `string` | Yes | Action performed | Examples: "create", "update", "delete", "view" |
| `target_type` | `string` | Yes | Type of entity that was acted upon | Examples: "invoice", "patient", "payment" |
| `target_id` | `string` or `number` | Yes | Identifier of the target resource | Non-empty value |
| `details` | `object` | Optional | Additional contextual information about the action | May contain nested fields like `refund_id`, `amount`, etc. |
| `created_at` | `string` (ISO 8601) | Yes | Timestamp when the action occurred | Valid ISO 8601 date string |

**Validation Rules**:

1. **Null/Undefined Handling**: 
   - Required fields (`id`, `actor_type`, `actor_id`, `action`, `target_type`, `target_id`, `created_at`) MUST NOT be null or undefined
   - Optional fields (`details`) MAY be null, undefined, or missing
   - Missing required fields should result in exclusion from display (not error) as per FR-010 and FR-011

2. **Details Object Structure**:
   - `details` is a flexible object that may contain various fields depending on the action type
   - Common fields: `refund_id` (string), `amount` (number in cents), `invoice_id` (number), etc.
   - Details object structure may vary between different action types
   - Missing or null details should be handled gracefully (display "No additional details" or omit details section)

3. **Timestamp Validation**:
   - `created_at` must be a valid ISO 8601 date string
   - Invalid timestamps should be handled gracefully (display "Invalid date" or use fallback)
   - Timezone handling: Display in user's local timezone

4. **Action Type Values**:
   - Common action types: "create", "update", "delete", "view", "send", "generate", "login", "logout"
   - Action types may vary and are not restricted to a fixed set
   - Unknown action types should be displayed as-is without breaking the UI

5. **Actor and Target Types**:
   - Actor types: "user", "system", "api", "automation", etc.
   - Target types: "invoice", "patient", "payment", "appointment", etc.
   - Types are flexible and may vary based on backend implementation

**State Transitions**:

Audit log entries are immutable records with no state transitions. Once created, they represent historical events that cannot be modified.

**Relationships**:

- AuditLogEntry references Actor (`actor_type` + `actor_id` → Actor entity)
- AuditLogEntry references Target (`target_type` + `target_id` → Target entity)
- AuditLogEntry may contain references in `details` object (e.g., `refund_id`, `invoice_id`)

---

### DisplayAuditEntry

Transformed audit log entry formatted for UI display.

**Source**: Derived from AuditLogEntry

**Attributes**:

| Field | Type | Description | Transformation |
|-------|------|-------------|----------------|
| `id` | `string` | Unique identifier | Direct from AuditLogEntry.id |
| `title` | `string` | Human-readable action description | Generated from `action` + `target_type` (e.g., "Invoice Generated") |
| `user` | `string` | Actor display name | Generated from `actor_type` + `actor_id` (e.g., "Dr. Emily Carter" or "System Automation") |
| `target` | `string` | Target display description | Generated from `target_type` + `target_id` (e.g., "Patient ID 12345" or "Invoice #INV-001") |
| `time` | `string` | Formatted timestamp | Formatted from `created_at` (relative or absolute format) |
| `icon` | `string` | MaterialIcons icon name | Mapped from `action` type |
| `type` | `'info' \| 'danger' \| 'warning'` | Visual indicator type | Mapped from `action` type (e.g., "delete" → "danger") |
| `details` | `string` | Formatted nested details | Parsed from `details` object (e.g., "Refund ID: REF-123, Amount: $150.00") |

**Display Formatting Rules**:

1. **Title Generation**:
   - Format: `{Action} {Target Type}` (capitalized)
   - Examples: "Invoice Generated", "Patient Record Viewed", "Bill Sent"
   - Action verbs should be past tense for audit log context

2. **User Display**:
   - Format: Actor type + identifier
   - For "user" actor type: Display user name if available, otherwise "User {actor_id}"
   - For "system" actor type: Display "System Automation" or "System"
   - For other types: Display "{actor_type} {actor_id}"

3. **Target Display**:
   - Format: `{Target Type} {Identifier}`
   - Examples: "Patient ID 12345", "Invoice #INV-001", "IP: 192.168.1.101"
   - Use appropriate prefixes based on target type (e.g., "#" for invoices, "ID" for patients)

4. **Timestamp Formatting**:
   - Recent entries (< 24 hours): Relative format ("2 hours ago", "Just now", "5 minutes ago")
   - Older entries: Absolute format ("Dec 19, 2024 at 10:45 AM", "Yesterday at 3:30 PM")
   - Timezone: Display in user's local timezone

5. **Details Formatting**:
   - Parse `details` object into key-value pairs
   - Format: `{Key}: {Value}` (e.g., "Refund ID: REF-123", "Amount: $150.00")
   - Format amounts as currency if present (divide by 100 for cents to dollars)
   - Handle missing details: Display "No additional details" or omit section

6. **Icon and Type Mapping**:
   - "create" → "add" icon, "info" type
   - "update" → "edit" icon, "info" type
   - "delete" → "delete" icon, "danger" type
   - "view" → "visibility" icon, "info" type
   - "send" → "send" icon, "info" type
   - "login"/"logout" → "lock"/"lock-open" icon, "info" type
   - Default: "info" icon, "info" type

---

## API Response Structure

### GET /api/v1/audit/

**Request**:
- Method: `GET`
- Headers: `Authorization: Bearer {access_token}`
- Query Parameters: None (for MVP, filtering/pagination may be added later)

**Response**:
- Status Code: `200 OK` on success
- Content-Type: `application/json`
- Body: Array of AuditLogEntry objects

**Error Responses**:
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User lacks permission to view audit logs
- `500 Internal Server Error`: Server-side error
- Network errors: Connection timeout, unreachable server

**Example Response**:

```json
[
  {
    "id": "1",
    "actor_type": "user",
    "actor_id": 42,
    "action": "create",
    "target_type": "invoice",
    "target_id": 123,
    "details": {
      "invoice_number": "INV-2024-001",
      "amount_cents": 15000
    },
    "created_at": "2024-12-19T14:30:00Z"
  },
  {
    "id": "2",
    "actor_type": "user",
    "actor_id": 43,
    "action": "view",
    "target_type": "patient",
    "target_id": 567,
    "details": null,
    "created_at": "2024-12-19T13:15:00Z"
  },
  {
    "id": "3",
    "actor_type": "system",
    "actor_id": "automation",
    "action": "send",
    "target_type": "invoice",
    "target_id": 124,
    "details": {
      "refund_id": "REF-123",
      "amount_cents": 5000
    },
    "created_at": "2024-12-19T12:00:00Z"
  }
]
```

**Empty Response**:

```json
[]
```

---

## Data Flow

### Fetch Flow

1. User navigates to Audit Log screen
2. Component mounts, triggers API call via `auditApi.fetchAuditLogs(accessToken)`
3. API service makes authenticated GET request to `/api/v1/audit/`
4. Response parsed and validated
5. AuditLogEntry array transformed to DisplayAuditEntry array
6. DisplayAuditEntry array rendered in FlatList

### Error Handling Flow

1. API call fails (network error, authentication error, server error)
2. Error caught in API service
3. Error type determined (network, auth, server)
4. Error state set in component
5. Appropriate error message displayed to user
6. Retry option provided (if applicable)

### Empty State Flow

1. API returns empty array `[]`
2. Component detects empty array
3. Empty state message displayed: "No audit entries available"

---

## TypeScript Type Definitions

```typescript
// src/types/audit.ts

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

## Validation Rules Summary

1. **Required Fields**: All required fields must be present and non-null
2. **Optional Fields**: Details may be null, undefined, or missing
3. **Timestamp Format**: ISO 8601 format, handle invalid timestamps gracefully
4. **Type Flexibility**: Actor types, target types, and action types are flexible
5. **Malformed Data**: Skip invalid entries, log warnings, don't break UI
6. **Performance**: Handle up to 500 entries efficiently
7. **Error Handling**: Graceful degradation for all error scenarios

