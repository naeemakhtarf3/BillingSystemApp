# Research: Invoice Financial Metrics Dashboard

**Feature**: Invoice Financial Metrics Dashboard  
**Date**: 2024-12-19  
**Phase**: 0 - Outline & Research

## Overview

This document consolidates research findings and technical decisions for implementing invoice financial metrics calculation on the dashboard. All NEEDS CLARIFICATION items from the technical context have been resolved through analysis of existing codebase patterns and industry best practices.

## Technical Decisions

### API Integration Pattern

**Decision**: Use the same pattern as `authApi.ts` for invoice API service

**Rationale**: 
- Consistency with existing codebase architecture
- Proven pattern for handling platform-specific API URLs (Android emulator vs iOS simulator)
- Established error handling and response parsing patterns
- Maintains separation of concerns (API logic in dedicated service files)

**Alternatives Considered**:
- Direct fetch calls in DashboardScreen component - **Rejected**: Violates separation of concerns, harder to test and reuse
- Third-party HTTP library (axios) - **Rejected**: Adds dependency, native fetch is sufficient and already used in codebase

**Implementation Notes**:
- Follow `authApi.ts` pattern: platform-specific base URL detection, consistent error handling
- Use JWT tokens from AuthContext for authenticated API calls
- Handle network errors with user-friendly messages

---

### Currency Conversion and Formatting

**Decision**: Convert cents to dollars by dividing by 100, format using standard JavaScript number formatting

**Rationale**:
- Simple mathematical operation: `dollars = cents / 100`
- Standard accounting practice for financial systems
- No external library needed for basic conversion
- Format using `Intl.NumberFormat` or simple `toFixed(2)` for display

**Alternatives Considered**:
- Store amounts in dollars in backend - **Rejected**: Backend uses cents (standard practice), frontend conversion is appropriate
- Currency formatting library (currency.js) - **Rejected**: Unnecessary dependency for simple division and formatting

**Implementation Notes**:
- Ensure consistent currency handling across all three metrics
- Handle edge cases: negative values, null/undefined, very large numbers
- Format with 2 decimal places for display: `$12,450.00`

---

### Error Handling Strategy

**Decision**: Graceful degradation with user-friendly error states, no crashes

**Rationale**:
- Aligns with FR-009 and FR-010 requirements
- Maintains dashboard usability even when invoice API is unavailable
- User experience priority: show error state rather than breaking entire dashboard

**Alternatives Considered**:
- Crash and show error screen - **Rejected**: Violates user story requirement for graceful handling
- Silent failure with no indication - **Rejected**: Users need feedback about missing data

**Implementation Notes**:
- Network errors: Show "Unable to load financial data" message with retry option
- Invalid data: Log error, display zero values or "N/A" with appropriate messaging
- Timeout handling: Implement reasonable timeout (e.g., 10 seconds) with fallback

---

### State Management Approach

**Decision**: Use React hooks (useState, useEffect) with optional context if shared state needed

**Rationale**:
- Dashboard screen is primary consumer - local state sufficient initially
- Context only needed if multiple screens need invoice data
- Aligns with existing pattern (AuthContext for authentication, local state for screen-specific data)

**Alternatives Considered**:
- Global state management (Redux, Zustand) - **Rejected**: Overkill for single screen feature, adds complexity
- Context from start - **Rejected**: YAGNI principle, can add later if needed

**Implementation Notes**:
- Use `useState` for metrics data and loading/error states
- Use `useEffect` for API call on component mount
- Consider InvoiceContext later if other screens need this data

---

### Performance Optimization

**Decision**: Client-side aggregation with Array.reduce(), no backend aggregation endpoint required initially

**Rationale**:
- Success criteria: Handle up to 10,000 invoices
- Modern mobile devices can efficiently process 10k array items
- Simple aggregation logic: O(n) complexity is acceptable
- Reduces backend complexity (can add aggregation endpoint later if needed)

**Alternatives Considered**:
- Backend aggregation endpoint - **Rejected**: Adds backend work, client-side sufficient for MVP
- Virtualization for invoice list - **Not Applicable**: We're not displaying invoice list, only aggregated metrics

**Implementation Notes**:
- Use `Array.reduce()` for efficient single-pass aggregation
- Filter by status, then sum amounts
- Consider memoization if recalculations become frequent (React.useMemo)

---

### Offline Support Strategy

**Decision**: Cache invoice data in AsyncStorage, read-only metrics in offline mode

**Rationale**:
- Aligns with constitution requirement for offline support
- Financial metrics are read-only data (display only, no mutations)
- AsyncStorage provides simple key-value storage for cached API response
- Users can view last known metrics when offline

**Alternatives Considered**:
- No offline support - **Rejected**: Violates constitution requirement
- Full offline invoice management - **Rejected**: Out of scope, metrics are display-only

**Implementation Notes**:
- Cache API response with timestamp
- On mount: Check cache first, then fetch fresh data
- Display cached data if fetch fails (offline scenario)
- Cache expiry: Consider 5-15 minute TTL for freshness

---

### Type Safety and Data Validation

**Decision**: Define strict TypeScript types for Invoice and FinancialMetrics, validate API response

**Rationale**:
- Constitution requires strict TypeScript with type checking
- Prevents runtime errors from unexpected API response shapes
- Improves developer experience with autocomplete and type checking
- Aligns with existing `types/auth.ts` pattern

**Alternatives Considered**:
- Use `any` types - **Rejected**: Violates constitution, loses type safety benefits
- Runtime validation library (zod) - **Considered but deferred**: Basic TypeScript types sufficient for MVP, can add runtime validation later if needed

**Implementation Notes**:
- Define `Invoice` interface matching API response structure
- Define `FinancialMetrics` interface for calculated values
- Handle null/undefined fields gracefully in type definitions
- Type guard functions for runtime validation if needed

---

## Integration Points

### Existing Code Patterns

1. **API Service Pattern** (`src/api/authApi.ts`):
   - Platform-specific base URL detection
   - JWT token authentication headers
   - Error handling with try/catch
   - Response parsing and type conversion

2. **Context Pattern** (`src/context/AuthContext.tsx`):
   - React Context for shared state
   - Custom hooks for consuming context
   - Provider component wrapping app

3. **Type Definitions** (`src/types/auth.ts`):
   - Shared interfaces for API contracts
   - Export for reuse across components

4. **Dashboard Screen** (`src/screens/DashboardScreen.tsx`):
   - Existing KPI display pattern with hardcoded data
   - Replace hardcoded `kpiData` with calculated values
   - Maintain existing UI structure and styling

### Backend API Assumptions

- Endpoint: `GET /api/v1/invoices/`
- Authentication: Bearer token in Authorization header
- Response format: JSON array of invoice objects
- Invoice object fields: `id`, `invoice_number`, `patient_id`, `total_amount_cents`, `status`, plus other fields
- Status values: `"paid"`, `"unpaid"`, `"pending"` (exact strings to be confirmed via API contract)

---

## Unresolved Items

None - All technical decisions resolved based on existing patterns and requirements.

---

## Next Steps

1. Generate API contract (OpenAPI spec) for invoices endpoint
2. Define TypeScript types for Invoice and FinancialMetrics
3. Implement invoiceApi.ts following authApi.ts pattern
4. Update DashboardScreen to use calculated metrics
5. Add AsyncStorage caching for offline support

