# Tasks: Audit Log API Integration

**Input**: Design documents from `/specs/003-audit-api-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure verification and preparation

- [x] T001 Verify existing project structure matches plan.md requirements
- [x] T002 [P] Review existing API patterns in src/api/authApi.ts and src/api/invoiceApi.ts for consistency
- [x] T003 [P] Review existing type definitions in src/types/ for consistency

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create TypeScript type definitions for AuditLogEntry in src/types/audit.ts
- [x] T005 [P] Create TypeScript type definitions for AuditLogDetails in src/types/audit.ts
- [x] T006 [P] Create TypeScript type definitions for DisplayAuditEntry in src/types/audit.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Real-Time Audit Log Entries (Priority: P1) 🎯 MVP

**Goal**: Transform the Audit Log screen from static demo data to functional feature that fetches and displays real audit log entries from the API endpoint.

**Independent Test**: Open the Audit Log screen and verify that audit entries are displayed from the API. The test delivers value by showing real system activity instead of placeholder data.

### Implementation for User Story 1

- [x] T007 [US1] Create audit API service following invoiceApi.ts pattern in src/api/auditApi.ts
- [x] T008 [US1] Implement fetchAuditLogs function with JWT authentication in src/api/auditApi.ts
- [x] T009 [US1] Add platform-specific API URL detection (Android emulator vs iOS simulator) in src/api/auditApi.ts
- [x] T010 [US1] Implement basic error handling for network and authentication errors in src/api/auditApi.ts
- [x] T011 [US1] Add useState hooks for audit entries, loading state, and error state in src/screens/AuditLogScreen.tsx
- [x] T012 [US1] Add useEffect hook to fetch audit logs on component mount in src/screens/AuditLogScreen.tsx
- [x] T013 [US1] Integrate useAuth hook to access JWT tokens from AuthContext in src/screens/AuditLogScreen.tsx
- [x] T014 [US1] Replace static logData array with API-fetched entries in src/screens/AuditLogScreen.tsx
- [x] T015 [US1] Add loading indicator (ActivityIndicator) during API fetch in src/screens/AuditLogScreen.tsx
- [x] T016 [US1] Implement empty state message when API returns empty array in src/screens/AuditLogScreen.tsx
- [x] T017 [US1] Update FlatList to use API data instead of static data in src/screens/AuditLogScreen.tsx
- [x] T018 [US1] Ensure LogItem component displays id, title, user, target, and time fields from API data in src/screens/AuditLogScreen.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can see audit log entries from the API.

---

## Phase 4: User Story 2 - Handle API Errors Gracefully (Priority: P2)

**Goal**: Ensure the Audit Log screen handles all API failure scenarios gracefully without crashing, providing user-friendly error messages and retry functionality.

**Independent Test**: Simulate API failures (network errors, server errors, authentication errors) and verify the screen displays appropriate error messages without crashing. The test delivers value by ensuring the application remains usable during API outages.

### Implementation for User Story 2

- [x] T019 [US2] Enhance error handling in fetchAuditLogs to detect token expiration (401/403) in src/api/auditApi.ts
- [x] T020 [US2] Enhance error handling in fetchAuditLogs to detect server errors (500) in src/api/auditApi.ts
- [x] T021 [US2] Enhance error handling in fetchAuditLogs to detect network errors in src/api/auditApi.ts
- [x] T022 [US2] Create error state UI component with error message display in src/screens/AuditLogScreen.tsx
- [x] T023 [US2] Implement user-friendly error message for network errors with retry button in src/screens/AuditLogScreen.tsx
- [x] T024 [US2] Implement authentication error message for 401/403 errors in src/screens/AuditLogScreen.tsx
- [x] T025 [US2] Implement server error message for 500 errors with retry option in src/screens/AuditLogScreen.tsx
- [x] T026 [US2] Add retry functionality that calls loadAuditLogs function in src/screens/AuditLogScreen.tsx
- [x] T027 [US2] Handle component unmounting to prevent state updates on unmounted components in src/screens/AuditLogScreen.tsx
- [x] T028 [US2] Ensure error messages display within 1 second of error occurring (per SC-003) in src/screens/AuditLogScreen.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Error handling is complete and graceful.

---

## Phase 5: User Story 3 - Display Formatted Audit Entry Details (Priority: P2)

**Goal**: Enhance audit log entry display with properly formatted timestamps, clearly displayed nested details, and appropriate visual indicators for different action types.

**Independent Test**: Verify that audit entries display with formatted timestamps (e.g., "2 hours ago", "Yesterday", "Dec 19, 2024 at 10:45 AM"), nested details are clearly presented (e.g., refund_id and amount shown in a readable format), and different action types use appropriate visual indicators. The test delivers value by making audit data comprehensible and actionable.

### Implementation for User Story 3

- [x] T029 [P] [US3] Create timestamp formatting utility function formatTimestamp in src/utils/auditFormatting.ts
- [x] T030 [P] [US3] Implement relative time formatting for recent entries (< 24 hours) in src/utils/auditFormatting.ts
- [x] T031 [P] [US3] Implement absolute time formatting for older entries in src/utils/auditFormatting.ts
- [x] T032 [P] [US3] Create action-to-icon mapping function getActionIcon in src/utils/auditFormatting.ts
- [x] T033 [P] [US3] Create action-to-type mapping function getActionType in src/utils/auditFormatting.ts
- [x] T034 [P] [US3] Create nested details formatting function formatDetails in src/utils/auditFormatting.ts
- [x] T035 [P] [US3] Implement currency formatting for amount fields in details in src/utils/auditFormatting.ts
- [x] T036 [P] [US3] Create data transformation utility function transformAuditEntry in src/utils/auditTransform.ts
- [x] T037 [P] [US3] Implement title generation from action and target_type in src/utils/auditTransform.ts
- [x] T038 [P] [US3] Implement user display string generation from actor_type and actor_id in src/utils/auditTransform.ts
- [x] T039 [P] [US3] Implement target display string generation from target_type and target_id in src/utils/auditTransform.ts
- [x] T040 [P] [US3] Create transformAuditEntries function to transform array of entries in src/utils/auditTransform.ts
- [x] T041 [P] [US3] Add validation to filter out invalid entries in transformAuditEntries in src/utils/auditTransform.ts
- [x] T042 [US3] Integrate transformAuditEntries in AuditLogScreen to transform API entries before display in src/screens/AuditLogScreen.tsx
- [x] T043 [US3] Update LogItem component to display formatted timestamp from time field in src/screens/AuditLogScreen.tsx
- [x] T044 [US3] Update LogItem component to display formatted details from details field in src/screens/AuditLogScreen.tsx
- [x] T045 [US3] Update LogItem component to use icon and type from transformed entry for visual indicators in src/screens/AuditLogScreen.tsx
- [x] T046 [US3] Handle missing or null details gracefully in LogItem component in src/screens/AuditLogScreen.tsx
- [x] T047 [US3] Handle invalid timestamps gracefully with fallback display in src/utils/auditFormatting.ts
- [x] T048 [US3] Ensure all action types have appropriate icon and color mapping in src/utils/auditFormatting.ts

**Checkpoint**: All user stories should now be independently functional. Audit log entries are fully formatted and user-friendly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure robustness

- [x] T049 [P] Add error logging for invalid entries (console.warn) in src/utils/auditTransform.ts
- [x] T050 [P] Add error logging for API failures in src/api/auditApi.ts
- [x] T051 [P] Verify all required fields validation works correctly per FR-010 and FR-011
- [x] T052 [P] Verify performance with large datasets (up to 500 entries) per SC-005
- [x] T053 [P] Verify FlatList virtualization works correctly for performance
- [x] T054 [P] Verify timestamp formatting accuracy for entries within last 7 days per SC-006
- [x] T055 [P] Verify malformed API responses are handled gracefully per SC-007
- [x] T056 [P] Verify component cleanup on unmount prevents memory leaks
- [x] T057 [P] Review TypeScript type safety - ensure no `any` types used
- [x] T058 [P] Verify all error scenarios are covered (network, auth, server, empty, invalid data)
- [x] T059 Run quickstart.md validation checklist
- [x] T060 Code cleanup and refactoring for consistency with existing codebase patterns

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start immediately after Foundational
  - User Story 2 (P2) can start in parallel with US1 or after US1
  - User Story 3 (P2) can start in parallel with US2 or after US2
  - User Story 3 depends on US1 for data transformation (but can be developed in parallel)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 error handling
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 data display

### Within Each User Story

- API service before screen integration
- Utility functions can be developed in parallel
- Screen integration after utilities are ready
- Error handling after basic integration works
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks (T004, T005, T006) can run in parallel
- Once Foundational phase completes:
  - User Story 1 can start immediately
  - User Story 2 can start in parallel with US1 (different files)
  - User Story 3 utility tasks (T029-T041) can run in parallel with US1/US2
- All utility tasks in US3 marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# All foundational type definitions can be created in parallel:
T004: Create AuditLogEntry types in src/types/audit.ts
T005: Create AuditLogDetails types in src/types/audit.ts
T006: Create DisplayAuditEntry types in src/types/audit.ts
```

---

## Parallel Example: User Story 3

```bash
# All formatting and transformation utilities can be developed in parallel:
T029-T031: Timestamp formatting functions in src/utils/auditFormatting.ts
T032-T033: Icon and type mapping functions in src/utils/auditFormatting.ts
T034-T035: Details formatting functions in src/utils/auditFormatting.ts
T036-T041: Transformation functions in src/utils/auditTransform.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify existing structure)
2. Complete Phase 2: Foundational (create type definitions)
3. Complete Phase 3: User Story 1 (API integration and basic display)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Open Audit Log screen
   - Verify entries load from API
   - Verify empty state works
   - Verify basic error handling
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Basic API integration complete
   - Users can see audit entries
3. Add User Story 2 → Test independently → Deploy/Demo
   - Error handling complete
   - Application remains usable during API outages
4. Add User Story 3 → Test independently → Deploy/Demo
   - Formatted timestamps and details
   - Visual indicators for action types
5. Add Polish phase → Final validation → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (API service + screen integration)
   - Developer B: User Story 2 (error handling) - can start in parallel
   - Developer C: User Story 3 utilities (formatting/transformation) - can start in parallel
3. Stories complete and integrate independently
4. Polish phase can be worked on by any developer after their story is complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks follow strict checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- Tests are NOT included per project specifications (type checking via TypeScript compiler)

---

## Task Summary

- **Total Tasks**: 60
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (User Story 1)**: 12 tasks
- **Phase 4 (User Story 2)**: 10 tasks
- **Phase 5 (User Story 3)**: 20 tasks
- **Phase 6 (Polish)**: 12 tasks

**Parallel Opportunities**: 
- Phase 2: All 3 tasks can run in parallel
- Phase 3: Most tasks are sequential (API service → screen integration)
- Phase 4: Most tasks are sequential (error handling enhancement)
- Phase 5: 13 utility tasks can run in parallel (T029-T041), then 7 integration tasks
- Phase 6: All tasks can run in parallel

**Suggested MVP Scope**: User Story 1 only (Phases 1-3) - 18 tasks total

