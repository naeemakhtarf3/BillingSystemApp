<!--
Sync Impact Report
Version: N/A → 1.0.0 (initial creation)
Modified Principles: N/A (new document)
Added Sections: All sections
Removed Sections: N/A
Templates Requiring Updates:
  ⚠ pending - .specify/templates/plan-template.md
  ⚠ pending - .specify/templates/spec-template.md
  ⚠ pending - .specify/templates/tasks-template.md
  ⚠ pending - .specify/templates/commands/*.md
Follow-up TODOs: None
-->

# Project Constitution

**Version:** 1.0.0  
**Project:** Mobile Clinic Billing System  
**Ratification Date:** 2025-01-27  
**Last Amended:** 2025-01-27

## Purpose

This constitution establishes the non-negotiable principles, standards, and governance procedures that govern all development activities, architectural decisions, and code contributions to the Mobile Clinic Billing System. All agents, developers, and stakeholders MUST adhere to these principles without exception.

## Principles

### Separation of Frontend and Backend

The system MUST maintain strict separation between the React Native mobile frontend and the FastAPI backend. The frontend MUST communicate exclusively through well-defined REST API endpoints. Direct database access from the mobile application is FORBIDDEN. All business logic, data validation, and database operations MUST reside in the backend.

**Rationale:** Separation ensures security, maintainability, and scalability. Business logic centralization prevents inconsistencies and simplifies updates. This architecture supports multiple client types (mobile, web) without duplicating core functionality.

---

### React Native CLI with Native Tailwind

The mobile frontend MUST be built using React Native CLI (not Expo) and MUST use Tailwind CSS via `twrnc` (tailwind-react-native-classnames) for styling. All UI components MUST be fully responsive and support both iOS and Android platforms. Dark mode support MUST be implemented using React Native's color scheme detection.

**Rationale:** React Native CLI provides full native module access and production-ready builds. Tailwind via twrnc ensures consistent, maintainable styling with utility-first approach. Responsive design guarantees usability across device sizes.

---

### FastAPI RESTful Backend

The backend MUST be implemented using FastAPI (Python 3.11+) and MUST expose RESTful API endpoints following OpenAPI/Swagger specifications. All endpoints MUST use Pydantic models for request/response validation. Error handling MUST return consistent JSON error responses with appropriate HTTP status codes.

**Rationale:** FastAPI provides automatic API documentation, type safety via Pydantic, and high performance. RESTful design ensures interoperability and standard HTTP semantics. Type validation prevents runtime errors and improves developer experience.

---

### PostgreSQL with SQLAlchemy ORM

All persistent data MUST be stored in PostgreSQL. Database access MUST be performed exclusively through SQLAlchemy ORM. Direct SQL queries are FORBIDDEN except for performance-critical operations that cannot be achieved with ORM. All database schemas MUST be versioned using Alembic migrations.

**Rationale:** PostgreSQL provides ACID compliance, complex query capabilities, and robust data integrity. SQLAlchemy ORM ensures database-agnostic code, prevents SQL injection, and maintains data model consistency. Migration versioning enables safe schema evolution.

---

### JWT-Based Authentication with Role-Based Access Control

Authentication MUST use JWT (JSON Web Tokens) for stateless session management. The system MUST implement role-based access control (RBAC) with at least four roles: Admin, Doctor, Billing Staff, and Receptionist. All API endpoints MUST verify JWT tokens and enforce role-based permissions. Token refresh mechanisms MUST be implemented for session continuity.

**Rationale:** JWT enables stateless authentication, improving scalability and performance. RBAC ensures users can only access features appropriate to their role, maintaining security and compliance. Stateless tokens simplify backend architecture and support mobile offline scenarios.

---

### Offline Support with Optimistic Updates

The mobile application MUST support offline operation using React Native's AsyncStorage for local data caching. A retry queue mechanism MUST be implemented to synchronize offline changes when connectivity is restored. Critical operations (billing, payments) MUST provide optimistic UI updates with eventual consistency guarantees.

**Rationale:** Healthcare settings may have unreliable network connectivity. Offline support ensures continuous operation during network outages. Optimistic updates improve perceived performance while eventual consistency maintains data integrity across clients.

---

### TypeScript with Strict Type Checking

All frontend code MUST be written in TypeScript with strict type checking enabled. All backend Python code MUST use type hints. Type definitions MUST be shared between frontend and backend where possible. Any type assertions or `any` types MUST be justified with inline comments.

**Rationale:** Type safety prevents runtime errors, improves code maintainability, and enhances developer productivity through IDE autocomplete. Shared types ensure API contract consistency between frontend and backend.

---

### Security and Data Protection

All API communications MUST use HTTPS/TLS encryption. Sensitive data (passwords, tokens) MUST NEVER be stored in plain text. Authentication credentials MUST be hashed using industry-standard algorithms (bcrypt, Argon2). Patient health information MUST comply with applicable data protection regulations (HIPAA, GDPR where applicable). All API endpoints MUST implement rate limiting and input sanitization.

**Rationale:** Healthcare billing systems handle sensitive patient and financial data. Encryption and secure storage protect against data breaches. Compliance with regulations is legally mandatory and prevents severe penalties.

---

## Governance

### Amendment Procedure

Constitution amendments require the following process:

1. Proposed changes MUST be documented in a pull request with clear justification
2. All affected stakeholders (architects, lead developers) MUST review the proposal
3. If the change modifies existing principles (not just additions), it requires unanimous approval
4. New principles or clarifications require majority approval (2/3 of stakeholders)
5. Version number MUST be incremented according to semantic versioning rules
6. The amendment date MUST be updated to the current date upon ratification
7. All dependent templates and documentation MUST be updated to reflect changes

Amendments that break backward compatibility (removing principles, changing core architecture) are considered MAJOR version changes and require extraordinary justification.

### Versioning Policy

Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** increment: Removal of principles, backward-incompatible governance changes, or fundamental architectural principle modifications
- **MINOR** increment: Addition of new principles, expansion of existing principles with new mandatory requirements, or new governance sections
- **PATCH** increment: Clarifications, typo fixes, wording improvements that do not change meaning or requirements

The current version MUST be displayed at the top of this document and in all references.

### Compliance Review

All code contributions MUST be reviewed for constitution compliance before merge. Automated checks SHOULD be implemented where possible (linting, type checking, security scanning). Manual review MUST verify:

- Architecture adheres to separation of concerns
- TypeScript/Python type checking passes
- API endpoints follow RESTful conventions
- Database operations use SQLAlchemy ORM
- Authentication and authorization are properly implemented
- Offline support mechanisms are in place for mobile features

Quarterly compliance audits SHOULD be conducted to identify and address deviations. Non-compliant code MUST be refactored to meet constitution standards.

---

## Notes

- **Testing:** Explicit tests are not required per project specifications. However, type checking and linting serve as automated quality gates.

- **Backend Location:** The FastAPI backend is assumed to be in a separate repository or directory structure. Frontend-backend contract must be maintained through shared API specifications.

- **Role Definitions:**
  - **Admin:** Full system access, user management, audit logs
  - **Doctor:** Patient records, appointment scheduling, service entry
  - **Billing Staff:** Invoice creation, payment processing, financial reports
  - **Receptionist:** Patient registration, appointment booking, basic profile updates

- **Offline Priority:** Operations are prioritized by business criticality:
  1. Patient registration and profile updates (high priority)
  2. Appointment scheduling (high priority)
  3. Invoice generation (medium priority, may require server-side PDF generation)
  4. Payment processing (low priority, should always require network connection for security)
