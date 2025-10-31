# API Contracts: Authentication

**Feature**: 001-implement-auth  
**Date**: 2025-01-27

## Overview

This directory contains the API contract specifications for the authentication endpoints. The contracts define the expected request/response formats, error handling, and authentication mechanisms.

## Files

- **auth-api.yaml**: OpenAPI 3.0.3 specification for authentication endpoints

## Endpoints

### POST /api/v1/auth/login

Authenticate user with username and password credentials.

**Request**:
- Body: `{ username: string, password: string }`
- Content-Type: `application/json`

**Response**:
- Success (200): `{ access_token, refresh_token, token_type }`
- Error (401): Invalid credentials
- Error (422): Validation error
- Error (500): Server error

### GET /api/v1/auth/me

Retrieve authenticated user's profile information.

**Request**:
- Headers: `Authorization: Bearer {access_token}`

**Response**:
- Success (200): `{ id, email, name, role, created_at }`
- Error (401): Invalid or expired token
- Error (403): Insufficient permissions
- Error (500): Server error

## Error Handling

All errors return JSON with format:
```json
{
  "detail": "Error message"
}
```

Frontend displays generic "Login failed" message for all error types per specification (FR-010).

## Authentication

- Uses JWT Bearer tokens
- Token obtained via `/auth/login` endpoint
- Token included in `Authorization` header: `Bearer {access_token}`
- Token expiration triggers logout (no automatic refresh per spec)

## Usage

These contracts serve as:
1. **Documentation**: API specification for developers
2. **Validation**: Expected request/response formats
3. **Testing**: Contract testing reference
4. **Integration**: Frontend-backend contract agreement

## Generating Client Code

The OpenAPI specification can be used to generate TypeScript client code using tools like:
- `@openapitools/openapi-generator-cli`
- `swagger-codegen`
- `openapi-typescript`

Example:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i auth-api.yaml \
  -g typescript-fetch \
  -o src/api/generated
```

