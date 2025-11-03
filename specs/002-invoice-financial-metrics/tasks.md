# Tasks: Invoice Financial Metrics Dashboard

**Input**: Design documents from `/specs/002-invoice-financial-metrics/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL per project specifications. No explicit test tasks included, but type checking via TypeScript compiler serves as validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Mobile app**: `src/` at repository root
- Paths follow React Native CLI structure: `src/api/`, `src/types/`, `src/utils/`, `src/screens/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [x] T001 Verify existing project structure matches plan.md requirements
- [x] T002 Verify AsyncStorage dependency is installed in package.json
- [x] T003 [P] Verify TypeScript configuration supports strict mode

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create Invoice type definitions in src/types/invoice.ts (Invoice, FinancialMetrics, FinancialMetricsDisplay interfaces)
- [x] T005 [P] Create invoiceApi.ts service structure in src/api/invoiceApi.ts (platform-specific base URL, fetchInvoices function skeleton)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Real-Time Financial Metrics (Priority: P1) 🎯 MVP

**Goal**: Display accurate financial metrics (Outstanding Revenue, Paid Revenue, Total Revenue) on the dashboard calculated from current invoice data

**Independent Test**: Access the dashboard and verify that all three revenue metrics are displayed with correct values based on current invoice data from the API

### Implementation for User Story 1

- [x] T006 [US1] Implement fetchInvoices function in src/api/invoiceApi.ts (complete API call with JWT authentication, error handling, platform-specific URL)
- [x] T007 [P] [US1] Create calculateFinancialMetrics function in src/utils/financialMetrics.ts (filter invalid invoices, sum by status for Outstanding/Paid/Total)
- [x] T008 [P] [US1] Create formatCurrency function in src/utils/financialMetrics.ts (convert cents to dollars, format as $X,XXX.XX)
- [x] T009 [US1] Create formatFinancialMetrics function in src/utils/financialMetrics.ts (convert FinancialMetrics to FinancialMetricsDisplay)
- [x] T010 [US1] Update DashboardScreen.tsx to add useState hooks for metrics, loading, and error states
- [x] T011 [US1] Update DashboardScreen.tsx to add useEffect hook that calls fetchInvoices on mount
- [x] T012 [US1] Update DashboardScreen.tsx to calculate and format metrics from fetched invoices
- [x] T013 [US1] Update DashboardScreen.tsx to replace hardcoded kpiData values with calculated metrics
- [x] T014 [US1] Update DashboardScreen.tsx imports (add useAuth, fetchInvoices, calculateFinancialMetrics, formatFinancialMetrics, Invoice, FinancialMetricsDisplay)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - dashboard displays real financial metrics from API

---

## Phase 4: User Story 2 - Handle API Failures Gracefully (Priority: P2)

**Goal**: Dashboard handles API failures without crashing and displays appropriate error states or fallback values

**Independent Test**: Simulate API failures (network errors, server errors) and verify that the dashboard displays appropriate error states or fallback values without breaking the user experience

### Implementation for User Story 2

- [x] T015 [P] [US2] Create saveInvoiceCache function in src/utils/invoiceCache.ts (save invoices to AsyncStorage with timestamp and TTL)
- [x] T016 [P] [US2] Create loadInvoiceCache function in src/utils/invoiceCache.ts (load cached invoices if not expired, return null if expired/missing)
- [x] T017 [US2] Update DashboardScreen.tsx loadInvoiceData to try loading from cache first for instant display
- [x] T018 [US2] Update DashboardScreen.tsx loadInvoiceData to save successful API responses to cache
- [x] T019 [US2] Update DashboardScreen.tsx loadInvoiceData to fallback to cache if API fetch fails
- [x] T020 [US2] Update DashboardScreen.tsx to handle API errors gracefully (set error state, show fallback $0.00 values if no cache)
- [x] T021 [US2] Update DashboardScreen.tsx to handle malformed JSON responses (try/catch around response.json())
- [x] T022 [US2] Update DashboardScreen.tsx to handle null/undefined invoice fields (filter invalid invoices in calculateFinancialMetrics)
- [x] T023 [US2] Update DashboardScreen.tsx imports (add saveInvoiceCache, loadInvoiceCache)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - dashboard handles errors gracefully and uses offline cache

---

## Phase 5: User Story 3 - View Accurate Currency Representation (Priority: P2)

**Goal**: Financial metrics displayed in standard currency format (dollars) with proper decimal places

**Independent Test**: Verify that amounts stored in cents are correctly converted and displayed in standard currency format (dollars with appropriate decimal places)

### Implementation for User Story 3

- [x] T024 [US3] Verify formatCurrency function in src/utils/financialMetrics.ts uses Intl.NumberFormat with USD currency and 2 decimal places
- [x] T025 [US3] Update formatCurrency to handle negative values correctly (display negative currency amounts)
- [x] T026 [US3] Verify calculateFinancialMetrics maintains currency consistency (all calculations in cents, single currency assumed)
- [x] T027 [US3] Add validation in calculateFinancialMetrics to handle very large numbers (beyond JavaScript safe integer range) appropriately
- [x] T028 [US3] Update DashboardScreen.tsx to ensure all three metrics display formatted currency consistently ($X,XXX.XX pattern)

**Checkpoint**: All user stories should now be independently functional - currency formatting is accurate and consistent

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T029 [P] Verify all TypeScript types are strict (no any types, proper interfaces)
- [x] T030 [P] Verify error handling covers all edge cases from spec.md (empty array, null status, negative amounts, unknown statuses, large datasets, timeouts, malformed JSON, missing currency fields, duplicate invoices)
- [x] T031 Code cleanup and refactoring (ensure consistent code style with existing codebase)
- [x] T032 Verify performance: dashboard loads metrics within 3 seconds with up to 10,000 invoices
- [x] T033 Verify offline support: cached data displays when network is unavailable
- [x] T034 Run quickstart.md validation: verify implementation matches integration guide steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 with error handling but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 currency formatting but independently testable

### Within Each User Story

- Types before implementation
- API service before dashboard integration
- Utility functions can be created in parallel
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Utility functions within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch utility functions in parallel for User Story 1:
Task: "Create calculateFinancialMetrics function in src/utils/financialMetrics.ts" [P]
Task: "Create formatCurrency function in src/utils/financialMetrics.ts" [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently - dashboard displays real metrics
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Error resilience)
4. Add User Story 3 → Test independently → Deploy/Demo (Currency accuracy)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Core metrics)
   - Developer B: User Story 2 (Error handling) - can start in parallel
   - Developer C: User Story 3 (Currency formatting) - can start in parallel
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify type checking passes after each task
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All currency calculations stay in cents until final display formatting
- Cache TTL: 5 minutes (300,000 milliseconds)
- Handle edge cases: empty arrays, null values, invalid statuses, negative amounts, large datasets

