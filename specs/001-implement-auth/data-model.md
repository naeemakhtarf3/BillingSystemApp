# Data Model: User Authentication System

**Feature**: 001-implement-auth  
**Date**: 2025-01-27

## Overview

This document defines the data models, type definitions, and state structures for the authentication system. All models are TypeScript interfaces/types for use in the React Native frontend.

## Entities

### User

Represents an authenticated clinic staff member.

**TypeScript Definition**:
```typescript
interface User {
  id: string | number;           // Unique identifier
  email: string;                   // Email address (used as username for login)
  name: string;                    // Display name (e.g., "Dr. Sarah Johnson")
  role: UserRole;                  // Assigned role
  created_at: string;              // ISO 8601 timestamp of account creation
}
```

**Type**: `UserRole`
```typescript
type UserRole = 'admin' | 'doctor' | 'billing_staff' | 'receptionist';
```

**Validation Rules**:
- `id`: Required, must be non-empty
- `email`: Required, must be non-empty string (format validation handled by backend)
- `name`: Required, must be non-empty string
- `role`: Required, must be one of the four defined roles
- `created_at`: Required, ISO 8601 format timestamp

**State Lifecycle**:
- **Initial**: `null` (not authenticated)
- **After Login**: User object populated from `/api/v1/auth/me` response
- **After Logout**: User set to `null`
- **Persistence**: Stored in AsyncStorage with key `@auth:user`

---

### Authentication Tokens

Represents session credentials for API access.

**TypeScript Definition**:
```typescript
interface AuthTokens {
  access_token: string;             // Short-lived JWT token for API requests
  refresh_token: string;           // Long-lived token for obtaining new access tokens (not used for refresh in this feature)
  token_type: string;               // Token type, typically "Bearer"
}
```

**Validation Rules**:
- `access_token`: Required, must be non-empty string
- `refresh_token`: Required, must be non-empty string (stored but not actively used per spec)
- `token_type`: Required, typically "Bearer"

**State Lifecycle**:
- **Initial**: `null` (no tokens)
- **After Login**: Tokens populated from `/api/v1/auth/login` response
- **After Logout**: Tokens set to `null`
- **On Token Expiration**: Tokens cleared, user redirected to login (FR-020)
- **Persistence**: Stored in AsyncStorage with key `@auth:tokens`

**Usage**:
- `access_token` included in `Authorization` header: `Bearer ${access_token}`
- `refresh_token` stored but not used for automatic refresh (per spec clarification)
- Tokens cleared on logout or expiration

---

### Authentication State

Represents the complete authentication context state managed globally.

**TypeScript Definition**:
```typescript
interface AuthState {
  user: User | null;               // Current authenticated user or null
  tokens: AuthTokens | null;        // Current authentication tokens or null
  isAuthenticated: boolean;         // Computed flag: user !== null && tokens !== null
  loading: boolean;                 // Loading indicator for auth operations
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**State Transitions**:

```
Initial State:
  user: null
  tokens: null
  isAuthenticated: false
  loading: false

During Login (loading):
  user: null
  tokens: null
  isAuthenticated: false
  loading: true

After Successful Login:
  user: User object
  tokens: AuthTokens object
  isAuthenticated: true
  loading: false

After Failed Login:
  user: null
  tokens: null
  isAuthenticated: false
  loading: false

After Logout:
  user: null
  tokens: null
  isAuthenticated: false
  loading: false

After Token Expiration:
  user: null
  tokens: null
  isAuthenticated: false
  loading: false
```

**Computed Properties**:
- `isAuthenticated`: Derived from `user !== null && tokens !== null`
- Not stored explicitly but computed as needed

**Persistence**:
- Both `user` and `tokens` persisted separately in AsyncStorage
- State restored on app initialization (FR-017, FR-018)
- If restoration fails (invalid tokens), state reset to initial (FR-021)

---

## Storage Schema

### AsyncStorage Keys

| Key | Type | Purpose | Example |
|-----|------|---------|---------|
| `@auth:tokens` | `AuthTokens` (JSON) | Store authentication tokens | `{"access_token": "...", "refresh_token": "...", "token_type": "Bearer"}` |
| `@auth:user` | `User` (JSON) | Store user profile | `{"id": 1, "email": "admin@clinic.com", "name": "Dr. Sarah Johnson", "role": "admin", "created_at": "2025-01-01T00:00:00Z"}` |

**Storage Operations**:
- **Write**: On successful login, store both tokens and user
- **Read**: On app initialization, read both tokens and user
- **Delete**: On logout or token expiration, clear both keys
- **Error Handling**: If read fails or data corrupted, clear keys and reset to initial state

---

## Type Definitions

Complete TypeScript type definitions file structure:

**File**: `src/types/auth.ts`

```typescript
export type UserRole = 'admin' | 'doctor' | 'billing_staff' | 'receptionist';

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// API Request/Response Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}
```

---

## Validation and Constraints

### Frontend Validation

- **Type Validation**: TypeScript strict mode ensures type safety at compile time
- **Runtime Validation**: Backend API validates all data; frontend assumes valid responses
- **Error Handling**: All API errors result in generic "Login failed" message (FR-010)

### Data Integrity

- **Consistency**: `isAuthenticated` must match `user !== null && tokens !== null`
- **Sync**: User and tokens must be stored/cleared together
- **Recovery**: Corrupted storage handled by clearing both keys and resetting state

---

## Relationships

```
AuthState
  ├── user: User | null
  ├── tokens: AuthTokens | null
  ├── isAuthenticated: boolean (computed)
  └── loading: boolean

User
  └── role: UserRole (enum: admin | doctor | billing_staff | receptionist)

AuthTokens
  ├── access_token: string (used for API Authorization header)
  ├── refresh_token: string (stored but not actively used)
  └── token_type: string (typically "Bearer")
```

---

## State Management Flow

1. **App Initialization**:
   - Read `@auth:tokens` and `@auth:user` from AsyncStorage
   - If both exist, populate AuthState and set `isAuthenticated = true`
   - Attempt to fetch user profile to validate tokens
   - If fetch fails, clear state and show login screen

2. **Login Flow**:
   - Set `loading = true`
   - Call login API
   - On success: Store tokens and user in state and AsyncStorage
   - Set `isAuthenticated = true`, `loading = false`
   - Navigate to dashboard

3. **Logout Flow**:
   - Clear user and tokens from state
   - Clear AsyncStorage keys
   - Set `isAuthenticated = false`
   - Navigate to login screen

4. **Token Expiration**:
   - Detect via API 401/403 response
   - Clear user and tokens from state
   - Clear AsyncStorage keys
   - Set `isAuthenticated = false`
   - Navigate to login screen

