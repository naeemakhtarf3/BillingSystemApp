# Research: Audit Log API Integration

**Feature**: Audit Log API Integration  
**Date**: 2024-12-19  
**Phase**: 0 - Outline & Research

## Overview

This document consolidates research findings and technical decisions for implementing API integration on the Audit Log screen. All technical decisions have been resolved through analysis of existing codebase patterns, API integration best practices, and user experience requirements.

## Technical Decisions

### API Integration Pattern

**Decision**: Use the same pattern as `authApi.ts` and `invoiceApi.ts` for audit API service

**Rationale**: 
- Consistency with existing codebase architecture
- Proven pattern for handling platform-specific API URLs (Android emulator vs iOS simulator)
- Established error handling and response parsing patterns
- Maintains separation of concerns (API logic in dedicated service files)
- JWT token authentication already integrated in existing API services

**Alternatives Considered**:
- Direct fetch calls in AuditLogScreen component - **Rejected**: Violates separation of concerns, harder to test and reuse
- Third-party HTTP library (axios) - **Rejected**: Adds dependency, native fetch is sufficient and already used in codebase

**Implementation Notes**:
- Follow `invoiceApi.ts` pattern: platform-specific base URL detection, consistent error handling
- Use JWT tokens from AuthContext for authenticated API calls
- Handle network errors, authentication errors, and server errors gracefully
- Return typed audit log entries from API service

---

### Timestamp Formatting Strategy

**Decision**: Use relative time formatting for recent entries (last 24 hours), absolute time for older entries

**Rationale**:
- User-friendly display: "2 hours ago" is more intuitive than "2024-12-19T14:30:00Z"
- Aligns with FR-004 requirement for user-friendly timestamp formatting
- Common pattern in audit logs and activity feeds
- Balance between readability (relative) and precision (absolute)

**Alternatives Considered**:
- Always use absolute timestamps - **Rejected**: Less user-friendly for recent entries
- Always use relative timestamps - **Rejected**: Loses precision for older entries, harder to sort chronologically
- Custom formatting library (date-fns, moment) - **Rejected**: Adds dependency, native Date API sufficient for MVP

**Implementation Notes**:
- Recent entries (< 24 hours): Format as "X minutes/hours ago", "Just now"
- Older entries: Format as "Dec 19, 2024 at 10:45 AM" or "Yesterday at 3:30 PM"
- Use JavaScript Date API for calculations and formatting
- Handle timezone considerations (display in user's local timezone)

---

### Nested Details Display Strategy

**Decision**: Parse and display nested details object with clear labels and formatting

**Rationale**:
- Aligns with FR-005 requirement for clear nested details display
- Audit log entries may contain contextual information (refund_id, amount, etc.)
- Structured display improves comprehension
- Flexible approach handles varying detail structures

**Alternatives Considered**:
- Display raw JSON - **Rejected**: Not user-friendly, violates requirement
- Hide nested details - **Rejected**: Loses important contextual information
- Collapsible details section - **Considered but deferred**: Can add later if needed, simple display sufficient for MVP

**Implementation Notes**:
- Parse `details` object from API response
- Display key-value pairs with clear labels (e.g., "Refund ID: REF-123")
- Format amounts as currency if present (e.g., "Amount: $150.00")
- Handle missing or null details gracefully
- Support common detail fields: refund_id, amount, invoice_id, etc.

---

### Error Handling Strategy

**Decision**: Graceful degradation with user-friendly error states, loading indicators, and retry functionality

**Rationale**:
- Aligns with FR-006, FR-007, and FR-008 requirements
- Maintains screen usability even when API is unavailable
- User experience priority: show error state rather than breaking entire screen
- Provides clear feedback about failure reasons

**Alternatives Considered**:
- Crash and show error screen - **Rejected**: Violates user story requirement for graceful handling
- Silent failure with no indication - **Rejected**: Users need feedback about missing data
- Generic error for all failures - **Rejected**: Different error types (network, auth, server) need different handling

**Implementation Notes**:
- Network errors: Show "Unable to load audit log" message with retry button
- Authentication errors (401/403): Show "Authentication required" message, may trigger logout
- Server errors (500): Show "Server error occurred" message with retry option
- Loading state: Show ActivityIndicator while fetching data
- Empty state: Show "No audit entries" message when API returns empty array
- Timeout handling: Implement reasonable timeout (e.g., 10 seconds) with fallback

---

### State Management Approach

**Decision**: Use React hooks (useState, useEffect) for local screen state

**Rationale**:
- AuditLogScreen is primary consumer - local state sufficient
- Aligns with existing pattern (AuthContext for authentication, local state for screen-specific data)
- Simple and maintainable for single-screen feature
- No shared state needed across screens

**Alternatives Considered**:
- Global state management (Redux, Zustand) - **Rejected**: Overkill for single screen feature, adds complexity
- Context for audit log state - **Rejected**: YAGNI principle, can add later if needed
- State management library - **Rejected**: React hooks sufficient for this use case

**Implementation Notes**:
- Use `useState` for audit entries array, loading state, error state
- Use `useEffect` for API call on component mount
- Use `useAuth` hook to access JWT tokens from AuthContext
- Handle component unmounting to prevent state updates on unmounted components

---

### Data Parsing and Validation

**Decision**: Define strict TypeScript types for AuditLogEntry, validate API response structure

**Rationale**:
- Constitution requires strict TypeScript with type checking
- Prevents runtime errors from unexpected API response shapes
- Improves developer experience with autocomplete and type checking
- Aligns with existing `types/auth.ts` and `types/invoice.ts` patterns
- Handles missing/null fields gracefully as per FR-010 and FR-011

**Alternatives Considered**:
- Use `any` types - **Rejected**: Violates constitution, loses type safety benefits
- Runtime validation library (zod) - **Considered but deferred**: Basic TypeScript types sufficient for MVP, can add runtime validation later if needed

**Implementation Notes**:
- Define `AuditLogEntry` interface matching API response structure
- Handle optional fields (details, created_at variations) in type definitions
- Type guard functions for runtime validation if needed
- Parse nested details object safely
- Handle malformed data gracefully (skip invalid entries, log warnings)

---

### Performance Optimization Strategy

**Decision**: Efficient rendering with FlatList, minimize re-renders, optimize API call timing

**Rationale**:
- Success criteria: Handle up to 500 entries without performance degradation
- FlatList provides virtualization for large lists
- React Native best practice for scrollable lists
- Minimize unnecessary re-renders for smooth scrolling

**Alternatives Considered**:
- ScrollView with all items rendered - **Rejected**: Poor performance with large lists, no virtualization
- Pagination on initial load - **Considered but deferred**: Can add later if needed, 500 entries manageable for MVP
- Infinite scroll - **Considered but deferred**: Out of scope for MVP, can add later if needed

**Implementation Notes**:
- Use FlatList for rendering audit entries (already in place)
- Implement proper keyExtractor for list items
- Use React.memo for LogItem component if needed
- Optimize API call: only fetch on mount, not on every render
- Consider debouncing if search functionality is added later

---

### Offline Support Strategy

**Decision**: Optional caching in AsyncStorage for offline viewing, read-only audit logs

**Rationale**:
- Aligns with constitution requirement for offline support
- Audit logs are read-only data (display only, no mutations)
- AsyncStorage provides simple key-value storage for cached API response
- Users can view last known audit entries when offline

**Alternatives Considered**:
- No offline support - **Rejected**: Violates constitution requirement
- Full offline audit log management - **Rejected**: Out of scope, audit logs are display-only
- Real-time sync - **Rejected**: Out of scope for MVP, audit logs don't need real-time updates

**Implementation Notes**:
- Cache API response with timestamp (optional enhancement)
- On mount: Fetch fresh data, fallback to cache if fetch fails
- Display cached data if fetch fails (offline scenario)
- Cache expiry: Consider 5-15 minute TTL for freshness
- Note: Per spec, offline support is optional enhancement, not strict requirement

---

### Action Type Visualization

**Decision**: Map action types to appropriate icons and colors for visual distinction

**Rationale**:
- Aligns with FR-003 requirement and User Story 3 acceptance criteria
- Improves user comprehension and quick scanning of audit log
- Visual indicators help users identify action types at a glance
- Existing UI already has icon support via MaterialIcons

**Alternatives Considered**:
- No visual distinction - **Rejected**: Violates requirement for appropriate visual indicators
- Color coding only - **Rejected**: Icons provide additional context, existing UI uses both
- Custom icon set - **Rejected**: MaterialIcons already available and sufficient

**Implementation Notes**:
- Map action types to icons: "create" → add icon, "update" → edit icon, "delete" → delete icon, "view" → visibility icon
- Use existing danger/primary color scheme for different action types
- Maintain consistency with existing LogItem component styling
- Handle unknown action types gracefully (default icon)

---

## Integration Points

### Existing Code Patterns

1. **API Service Pattern** (`src/api/invoiceApi.ts`, `src/api/authApi.ts`):
   - Platform-specific base URL detection
   - JWT token authentication headers
   - Error handling with try/catch
   - Response parsing and type conversion
   - Token expiration detection (401/403 handling)

2. **Screen Pattern** (`src/screens/InvoicesScreen.tsx`):
   - useState for data, loading, error states
   - useEffect for API calls on mount
   - useAuth hook for accessing tokens
   - Loading indicators and error messages
   - Empty state handling

3. **Type Definitions** (`src/types/invoice.ts`, `src/types/auth.ts`):
   - Shared interfaces for API contracts
   - Export for reuse across components
   - Strict typing with optional fields

4. **AuditLogScreen** (`src/screens/AuditLogScreen.tsx`):
   - Existing UI structure with FlatList
   - LogItem component for individual entries
   - Search and filter UI (non-functional currently)
   - Static data to be replaced with API integration

### Backend API Assumptions

- Endpoint: `GET /api/v1/audit/`
- Authentication: Bearer token in Authorization header
- Response format: JSON array of audit log entry objects
- Audit log entry fields: `id`, `actor_type`, `actor_id`, `action`, `target_type`, `target_id`, `details` (object), `created_at` (ISO 8601 timestamp)
- Details object may contain: `refund_id`, `amount`, and other contextual fields
- Action types: Common values like "create", "update", "delete", "view", but may vary

---

## Unresolved Items

None - All technical decisions resolved based on existing patterns and requirements.

---

## Next Steps

1. Generate API contract (OpenAPI spec) for audit endpoint
2. Define TypeScript types for AuditLogEntry
3. Implement auditApi.ts following invoiceApi.ts pattern
4. Update AuditLogScreen to use API data instead of static data
5. Implement timestamp formatting utility
6. Implement nested details parsing and display
7. Add error handling and loading states
8. Optional: Add AsyncStorage caching for offline support

