# Implementation Plan: Invoice Financial Metrics Dashboard

**Branch**: `002-invoice-financial-metrics` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-invoice-financial-metrics/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements real-time financial metrics calculation on the dashboard by fetching invoice data from the FastAPI backend API endpoint (`http://localhost:8000/api/v1/invoices/`) and computing three key metrics: Outstanding Revenue (unpaid/pending invoices), Paid Revenue (paid invoices), and Total Revenue (all invoices). The implementation will handle currency conversion from cents to dollars, manage API errors gracefully, and ensure optimal performance for large datasets (up to 10,000 invoices).

## Technical Context

**Language/Version**: TypeScript 5.8.3 (strict mode enabled)  
**Primary Dependencies**: React Native 0.82.1, React 19.1.1, twrnc 4.10.1 (Tailwind CSS), React Native AsyncStorage 2.2.0  
**Storage**: AsyncStorage (local caching for offline support), Backend PostgreSQL (via FastAPI REST API)  
**Testing**: Jest 29.6.3 (type checking via TypeScript compiler, no explicit test files per project specs)  
**Target Platform**: iOS and Android mobile platforms via React Native CLI  
**Project Type**: Mobile application (React Native CLI, not Expo)  
**Performance Goals**: Dashboard metrics load within 3 seconds, handle up to 10,000 invoices without degradation  
**Constraints**: Must work offline with AsyncStorage caching, support dark mode, maintain strict TypeScript type safety, follow RESTful API patterns  
**Scale/Scope**: Single feature addition to existing dashboard screen, API integration with backend FastAPI service

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gates

- ✅ **Separation of Frontend and Backend**: Feature uses REST API endpoint (`/api/v1/invoices/`) for data access, no direct database access from mobile app
- ✅ **React Native CLI with Native Tailwind**: Feature integrates into existing React Native CLI app using twrnc for styling
- ✅ **FastAPI RESTful Backend**: Backend API endpoint assumed to exist and follow RESTful conventions (OpenAPI spec will be created)
- ✅ **PostgreSQL with SQLAlchemy ORM**: Backend database access handled by FastAPI backend (not mobile app concern)
- ✅ **JWT-Based Authentication**: API calls will use JWT tokens from existing AuthContext (consistent with authApi.ts pattern)
- ✅ **Offline Support with Optimistic Updates**: Feature will cache invoice data in AsyncStorage and support offline viewing (read-only for financial metrics)
- ✅ **TypeScript with Strict Type Checking**: All code will use TypeScript with strict typing, shared types between API and components
- ✅ **Security and Data Protection**: API calls use HTTPS/TLS (production), sensitive data never stored in plain text, rate limiting handled by backend

**Gate Status**: ✅ ALL GATES PASSED - No violations detected

### Post-Phase 1 Design Check

*Re-evaluated after Phase 1 design artifacts created*

- ✅ **Separation of Frontend and Backend**: Implementation uses REST API (`/api/v1/invoices/`), no direct database access. API contract defined in `contracts/invoices-api.yaml`.
- ✅ **React Native CLI with Native Tailwind**: Feature integrates into existing DashboardScreen using twrnc for styling, no changes to build configuration needed.
- ✅ **FastAPI RESTful Backend**: API contract follows OpenAPI 3.0.3 specification, RESTful conventions maintained. Backend implementation assumed to exist.
- ✅ **PostgreSQL with SQLAlchemy ORM**: Backend database concerns (not part of mobile app implementation).
- ✅ **JWT-Based Authentication**: Invoice API calls use JWT tokens from AuthContext, consistent with existing authApi.ts pattern.
- ✅ **Offline Support with Optimistic Updates**: AsyncStorage caching implemented for invoice data with 5-minute TTL. Read-only metrics support offline viewing.
- ✅ **TypeScript with Strict Type Checking**: All types defined in `src/types/invoice.ts` with strict interfaces. No `any` types used.
- ✅ **Security and Data Protection**: API calls use HTTPS in production (localhost for dev), JWT authentication, sensitive data never stored in plain text.

**Gate Status**: ✅ ALL GATES PASSED - No violations detected after Phase 1 design

## Project Structure

### Documentation (this feature)

```text
specs/002-invoice-financial-metrics/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── invoices-api.yaml  # OpenAPI specification for invoices endpoint
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Mobile application structure (Option 3 variant). The project uses React Native CLI with a mobile-first architecture. Backend API is assumed to be in a separate repository.

```text
src/
├── api/
│   ├── authApi.ts          # Existing authentication API (reference pattern)
│   └── invoiceApi.ts       # NEW: Invoice API service
├── components/
│   ├── UserProfileIcon.tsx
│   └── [existing components]
├── context/
│   ├── AuthContext.tsx     # Existing auth context (reference pattern)
│   └── InvoiceContext.tsx  # NEW: Invoice data context (optional, may use hooks instead)
├── lib/
│   └── tailwind.ts         # Existing Tailwind configuration
├── screens/
│   ├── DashboardScreen.tsx # MODIFY: Add financial metrics display
│   └── [existing screens]
├── types/
│   ├── auth.ts             # Existing auth types (reference pattern)
│   └── invoice.ts          # NEW: Invoice and financial metrics types
└── types.ts
```

**Structure Rationale**: 
- Follows existing project structure with `src/api/` for API services
- Maintains separation of concerns (API, types, components, screens)
- Consistent with existing `authApi.ts` pattern for API integration
- Type definitions in dedicated `types/` directory for reusability
- Optional context for state management, may use React hooks instead

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All implementation decisions align with constitution principles.
