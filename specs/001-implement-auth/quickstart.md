# Quick Start: User Authentication System

**Feature**: 001-implement-auth  
**Date**: 2025-01-27

## Overview

This guide helps developers quickly understand and start working with the authentication system implementation. It covers key concepts, file structure, and common usage patterns.

## Architecture

The authentication system uses:
- **React Context API** for global state management
- **AsyncStorage** for token/user persistence
- **React Navigation** for protected routes
- **JWT tokens** for API authentication

## File Structure

```
src/
├── context/
│   └── AuthContext.tsx      # Global authentication context and provider
├── api/
│   └── authApi.ts           # API service functions (login, fetchUser)
├── components/
│   └── UserProfileIcon.tsx  # Reusable profile icon component
├── screens/
│   ├── LoginScreen.tsx      # Login screen (updated)
│   └── DashboardScreen.tsx  # Dashboard screen (updated)
└── types/
    └── auth.ts              # TypeScript type definitions

App.tsx                       # Main app with auth flow (updated)
```

## Key Components

### 1. AuthContext

**Location**: `src/context/AuthContext.tsx`

Provides global authentication state and methods:
- `user`: Current authenticated user (or null)
- `tokens`: JWT tokens (or null)
- `isAuthenticated`: Computed boolean flag
- `loading`: Loading state for auth operations
- `login(username, password)`: Login function
- `logout()`: Logout function

**Usage**:
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    // Show login UI
  }
  
  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button onPress={logout} title="Logout" />
    </View>
  );
}
```

### 2. Auth API Service

**Location**: `src/api/authApi.ts`

Functions for API communication:
- `login(username, password)`: POST to `/api/v1/auth/login`
- `fetchUser(accessToken)`: GET to `/api/v1/auth/me`

**Usage**:
```typescript
import { login, fetchUser } from '../api/authApi';

// Login
const tokens = await login('admin@clinic.com', 'admin123');

// Fetch user profile
const user = await fetchUser(tokens.access_token);
```

### 3. Protected Navigation

**Location**: `App.tsx`

Navigation guards based on authentication state:
- If `!isAuthenticated`: Show LoginScreen
- If `isAuthenticated`: Show MainTabs (Dashboard, etc.)

**Pattern**:
```typescript
{isAuthenticated ? (
  <Stack.Screen name="Main" component={MainTabs} />
) : (
  <Stack.Screen name="Auth" component={LoginScreen} />
)}
```

## Authentication Flow

### Login Flow

1. User enters credentials in LoginScreen
2. `handleLogin()` calls `authContext.login(username, password)`
3. AuthContext sets `loading = true`
4. `authApi.login()` sends POST request to backend
5. On success: Store tokens in state and AsyncStorage
6. `authApi.fetchUser()` retrieves user profile
7. Store user in state and AsyncStorage
8. Set `isAuthenticated = true`, navigate to Dashboard

### Session Restoration Flow

1. App starts, `App.tsx` mounts
2. AuthContext reads tokens and user from AsyncStorage
3. If tokens exist: Set `isAuthenticated = true` temporarily
4. Display loading indicator
5. `authApi.fetchUser()` validates tokens
6. On success: Navigate to Dashboard
7. On failure: Clear state, show LoginScreen

### Logout Flow

1. User taps logout in UserProfileIcon component
2. `authContext.logout()` called
3. Clear user and tokens from state
4. Clear AsyncStorage keys (`@auth:tokens`, `@auth:user`)
5. Set `isAuthenticated = false`
6. Navigate to LoginScreen

### Token Expiration Flow

1. API call receives 401/403 response
2. AuthContext detects authentication failure
3. Clear user and tokens from state
4. Clear AsyncStorage
5. Set `isAuthenticated = false`
6. Navigate to LoginScreen

## Type Definitions

All types defined in `src/types/auth.ts`:

```typescript
type UserRole = 'admin' | 'doctor' | 'billing_staff' | 'receptionist';

interface User {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
}
```

## Common Patterns

### Checking Authentication Status

```typescript
const { isAuthenticated } = useAuth();

if (isAuthenticated) {
  // User is logged in
} else {
  // User needs to login
}
```

### Accessing User Information

```typescript
const { user } = useAuth();

if (user) {
  console.log(user.name);  // "Dr. Sarah Johnson"
  console.log(user.role);  // "admin"
  console.log(user.email); // "admin@clinic.com"
}
```

### Handling Login Errors

```typescript
try {
  await login(username, password);
  // Login successful, navigation handled automatically
} catch (error) {
  // Generic "Login failed" message displayed
  // Error details logged for debugging
}
```

### Adding Token to API Requests

```typescript
const { tokens } = useAuth();

fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${tokens?.access_token}`,
    'Content-Type': 'application/json',
  },
});
```

## Storage Keys

AsyncStorage keys used:
- `@auth:tokens`: Stores JWT tokens (JSON)
- `@auth:user`: Stores user profile (JSON)

## Error Handling

- **API Errors**: All authentication errors show generic "Login failed" message
- **Network Errors**: Handled gracefully with generic message
- **Storage Errors**: Fallback to login screen if storage read fails
- **Token Expiration**: Automatic logout and redirect to login

## Testing Credentials

Default test credentials (development only):
- Username: `admin@clinic.com`
- Password: `admin123`

**Note**: These are pre-filled in LoginScreen for testing convenience.

## Development Checklist

Before implementing:
- [ ] Review [spec.md](./spec.md) for requirements
- [ ] Review [data-model.md](./data-model.md) for data structures
- [ ] Review [contracts/auth-api.yaml](./contracts/auth-api.yaml) for API details
- [ ] Ensure backend API is running at `http://localhost:8000/api/v1`
- [ ] Install required dependencies (AsyncStorage, React Navigation)

During implementation:
- [ ] Create `src/types/auth.ts` with type definitions
- [ ] Create `src/context/AuthContext.tsx` with provider
- [ ] Create `src/api/authApi.ts` with API functions
- [ ] Create `src/components/UserProfileIcon.tsx`
- [ ] Update `src/screens/LoginScreen.tsx`
- [ ] Update `src/screens/DashboardScreen.tsx`
- [ ] Update `App.tsx` with auth flow

After implementation:
- [ ] Test login flow with valid credentials
- [ ] Test login flow with invalid credentials
- [ ] Test session restoration on app restart
- [ ] Test logout flow
- [ ] Test token expiration handling
- [ ] Verify navigation protection
- [ ] Verify AsyncStorage persistence

## API Endpoints

- **Login**: `POST http://localhost:8000/api/v1/auth/login`
- **Get User**: `GET http://localhost:8000/api/v1/auth/me`

See [contracts/auth-api.yaml](./contracts/auth-api.yaml) for complete API specification.

## Next Steps

1. Review the [research.md](./research.md) for architectural decisions
2. Review the [plan.md](./plan.md) for implementation details
3. Check [tasks.md](./tasks.md) for development tasks (generated by `/speckit.tasks`)

## Troubleshooting

**Issue**: Tokens not persisting after app restart
- **Solution**: Verify AsyncStorage keys are correct (`@auth:tokens`, `@auth:user`)

**Issue**: Navigation not protecting screens
- **Solution**: Ensure `App.tsx` checks `isAuthenticated` before rendering protected screens

**Issue**: Login succeeds but user not displayed
- **Solution**: Verify `fetchUser()` is called after login and user stored in state

**Issue**: Generic error messages not displaying
- **Solution**: Check error handling in `authApi.ts` wraps all errors with generic message

---

**Quick Reference**: See [data-model.md](./data-model.md) for complete data structures and [contracts/](./contracts/) for API specifications.

