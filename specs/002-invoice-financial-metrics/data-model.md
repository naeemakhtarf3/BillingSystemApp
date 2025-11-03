# Data Model: Invoice Financial Metrics

**Feature**: Invoice Financial Metrics Dashboard  
**Date**: 2024-12-19  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data entities, relationships, and validation rules for the invoice financial metrics feature. The model describes both the API data structures and the derived calculated metrics.

## Entities

### Invoice

Represents a billing document containing financial transaction data from the backend API.

**Source**: Backend API endpoint `GET /api/v1/invoices/`

**Attributes**:

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `id` | `number` | Yes | Unique invoice identifier | Must be positive integer |
| `invoice_number` | `string` | Yes | Human-readable invoice number | Non-empty string |
| `patient_id` | `number` | Yes | Associated patient identifier | Must be positive integer |
| `total_amount_cents` | `number` | Yes | Invoice amount in cents | Can be negative (refunds), integer |
| `status` | `string` | Yes | Payment status | One of: `"paid"`, `"unpaid"`, `"pending"`, or other values |
| `created_at` | `string` (ISO 8601) | Optional | Invoice creation timestamp | Valid ISO 8601 date string if present |
| `updated_at` | `string` (ISO 8601) | Optional | Last update timestamp | Valid ISO 8601 date string if present |
| `currency` | `string` | Optional | Currency code (e.g., "USD") | ISO 4217 currency code if present |
| `due_date` | `string` (ISO 8601) | Optional | Invoice due date | Valid ISO 8601 date string if present |
| `paid_at` | `string` (ISO 8601) | Optional | Payment completion timestamp | Valid ISO 8601 date string if present, typically only for paid invoices |

**Validation Rules**:

1. **Null/Undefined Handling**: 
   - Required fields (`id`, `invoice_number`, `patient_id`, `total_amount_cents`, `status`) MUST NOT be null or undefined
   - Optional fields MAY be null, undefined, or missing
   - Missing required fields should result in exclusion from calculations (not error)

2. **Status Values**:
   - Primary statuses: `"paid"`, `"unpaid"`, `"pending"`
   - Other statuses may exist in API response (e.g., `"cancelled"`, `"refunded"`)
   - Status matching is case-sensitive
   - Unknown statuses should be handled gracefully (excluded from "Outstanding" and "Paid" calculations)

3. **Amount Validation**:
   - `total_amount_cents` must be a valid number (integer)
   - Negative values are allowed (represent refunds or credits)
   - Very large values (beyond JavaScript safe integer range) should be handled with appropriate precision

4. **Currency Consistency**:
   - If `currency` field is present and inconsistent across invoices, all calculations assume same currency
   - For MVP: Assume single currency (USD) for all invoices
   - Future enhancement: Multi-currency support with conversion rates

**State Transitions**:

Invoice status represents payment state but does not have explicit state machine in this feature (handled by backend):

```
[unpaid] → [pending] → [paid]
   ↓
[cancelled] (if applicable)
```

**Relationships**:

- Invoice belongs to Patient (`patient_id` → Patient.id)
- Invoice may have Payments (implied by `status`, not modeled in this feature)

---

### FinancialMetrics

Aggregated calculations derived from invoice data, displayed on the dashboard.

**Source**: Calculated from Invoice array

**Attributes**:

| Field | Type | Description | Calculation |
|-------|------|-------------|-------------|
| `outstandingRevenue` | `number` | Total revenue from unpaid/pending invoices | Sum of `total_amount_cents` where `status` is `"unpaid"` or `"pending"` |
| `paidRevenue` | `number` | Total revenue from paid invoices | Sum of `total_amount_cents` where `status` is `"paid"` |
| `totalRevenue` | `number` | Total revenue from all invoices | Sum of `total_amount_cents` for all invoices regardless of status |

**Display Format**:

- All metrics are calculated in cents, then converted to dollars for display
- Display format: `$X,XXX.XX` (e.g., `$12,450.00`)
- Conversion: `dollars = cents / 100`
- Rounding: Standard JavaScript rounding (banker's rounding)

**Validation Rules**:

1. **Empty Invoice Array**:
   - All metrics should be `0` (zero dollars)
   - Display: `$0.00` for all three metrics

2. **Null/Invalid Invoices**:
   - Invoices with missing required fields are excluded from calculations
   - Metrics reflect sum of valid invoices only

3. **Negative Amounts**:
   - Negative `total_amount_cents` (refunds/credits) are included in totals
   - May result in negative revenue metrics (acceptable for financial accuracy)

4. **Calculation Accuracy**:
   - Use integer arithmetic where possible (work in cents)
   - Convert to dollars only for display
   - Ensure no floating-point precision errors in aggregation

---

## API Response Structure

### GET /api/v1/invoices/

**Request**:
- Method: `GET`
- Headers: `Authorization: Bearer {access_token}`
- Query Parameters: None (for MVP, pagination may be added later)

**Response**:
- Status Code: `200 OK`
- Content-Type: `application/json`
- Body: Array of Invoice objects

**Example Response**:

```json
[
  {
    "id": 1,
    "invoice_number": "INV-2024-001",
    "patient_id": 42,
    "total_amount_cents": 15000,
    "status": "paid",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T14:20:00Z",
    "currency": "USD",
    "due_date": "2024-01-30T00:00:00Z",
    "paid_at": "2024-01-16T14:20:00Z"
  },
  {
    "id": 2,
    "invoice_number": "INV-2024-002",
    "patient_id": 43,
    "total_amount_cents": 8500,
    "status": "pending",
    "created_at": "2024-01-20T09:15:00Z",
    "updated_at": "2024-01-20T09:15:00Z",
    "currency": "USD",
    "due_date": "2024-02-05T00:00:00Z"
  },
  {
    "id": 3,
    "invoice_number": "INV-2024-003",
    "patient_id": 44,
    "total_amount_cents": 23000,
    "status": "unpaid",
    "created_at": "2024-01-25T11:00:00Z",
    "updated_at": "2024-01-25T11:00:00Z",
    "currency": "USD",
    "due_date": "2024-02-10T00:00:00Z"
  }
]
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Valid token but insufficient permissions
- `500 Internal Server Error`: Backend error
- `503 Service Unavailable`: Backend temporarily unavailable

---

## TypeScript Type Definitions

### Invoice Interface

```typescript
interface Invoice {
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
```

### FinancialMetrics Interface

```typescript
interface FinancialMetrics {
  outstandingRevenue: number; // in cents
  paidRevenue: number; // in cents
  totalRevenue: number; // in cents
}

interface FinancialMetricsDisplay {
  outstandingRevenue: string; // formatted as "$X,XXX.XX"
  paidRevenue: string; // formatted as "$X,XXX.XX"
  totalRevenue: string; // formatted as "$X,XXX.XX"
}
```

---

## Edge Cases Handling

1. **Empty Array Response**: Return all metrics as 0
2. **Null Status**: Exclude invoice from Outstanding/Paid calculations, include in Total
3. **Invalid Amount**: Exclude invoice if `total_amount_cents` is not a valid number
4. **Missing Required Fields**: Exclude invoice from all calculations
5. **Very Large Dataset**: Performance acceptable up to 10,000 invoices (single-pass aggregation)
6. **Network Timeout**: Use cached data if available, show error state if no cache
7. **Malformed JSON**: Handle parse error gracefully, show error state

---

## Data Flow

```
Backend API (FastAPI)
    ↓
GET /api/v1/invoices/
    ↓
React Native fetch() → invoiceApi.ts
    ↓
Parse JSON → Invoice[]
    ↓
Calculate Metrics → FinancialMetrics
    ↓
Convert to Display Format → FinancialMetricsDisplay
    ↓
DashboardScreen.tsx → Display KPI Cards
```

---

## Caching Strategy

**AsyncStorage Cache Key**: `@invoice_data_cache`

**Cache Structure**:
```typescript
interface CachedInvoiceData {
  invoices: Invoice[];
  timestamp: number; // Unix timestamp in milliseconds
  expiresAt: number; // Cache expiry timestamp
}
```

**Cache TTL**: 5 minutes (300,000 milliseconds)

**Cache Usage**:
- Read from cache on mount (instant display)
- Fetch fresh data in background
- Update cache on successful fetch
- Use cache if fetch fails (offline mode)

