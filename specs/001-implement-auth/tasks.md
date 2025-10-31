# Tasks: User Authentication System

**Input**: Design documents from `/specs/001-implement-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL per constitution. This task list does not include test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create directory structure: src/context/, src/api/, src/components/, src/types/ (if not exists)
- [ ] T002 Verify AsyncStorage dependency is installed: @react-native-community/async-storage
- [ ] T003 [P] Verify React Navigation dependencies are installed: @react-navigation/native, @react-navigation/native-stack
- [ ] T004 [P] Verify react-native-vector-icons is installed for icons

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create TypeScript type definitions in src/types/auth.ts (User, UserRole, AuthTokens, AuthState, AuthContextValue, LoginRequest, LoginResponse, UserResponse)
- [ ] T006 [P] Create API service structure in src/api/authApi.ts with placeholder functions (login and fetchUser)
- [ ] T007 Create AuthContext provider structure in src/context/AuthContext.tsx with initial state management (user, tokens, isAuthenticated, loading state)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Logs In Successfully (Priority: P1) 🎯 MVP

**Goal**: User can log in with credentials and be automatically navigated to dashboard with their profile information displayed

**Independent Test**: Launch app, enter valid credentials (admin@clinic.com / admin123) on login screen, verify loading indicator appears, verify successful navigation to dashboard with user name and role displayed in welcome message

### Implementation for User Story 1

- [ ] T008 [US1] Implement login function in src/api/authApi.ts that sends POST request to http://localhost:8000/api/v1/auth/login with username and password, returns AuthTokens
- [ ] T009 [US1] Implement fetchUser function in src/api/authApi.ts that sends GET request to http://localhost:8000/api/v1/auth/me with Bearer token in Authorization header, returns User object
- [ ] T010 [US1] Add error handling in src/api/authApi.ts that catches all errors (network, API, parsing) and throws generic "Login failed" error message
- [ ] T011 [US1] Implement login method in src/context/AuthContext.tsx that calls authApi.login, sets loading state, stores tokens in state, calls fetchUser, stores user in state, updates isAuthenticated flag
- [ ] T012 [US1] Add AsyncStorage persistence in src/context/AuthContext.tsx login method to store tokens under key @auth:tokens and user under key @auth:user
- [ ] T013 [US1] Update LoginScreen in src/screens/LoginScreen.tsx to add username and password input fields with default values (admin@clinic.com / admin123)
- [ ] T014 [US1] Implement handleLogin function in src/screens/LoginScreen.tsx that calls authContext.login, displays loading indicator on button during call, handles success by allowing navigation, handles error by showing Alert with "Login failed" message
- [ ] T015 [US1] Add loading state UI in src/screens/LoginScreen.tsx that displays loading indicator on login button when authentication is in progress
- [ ] T016 [US1] Update App.tsx to wrap app with AuthProvider from src/context/AuthContext.tsx
- [ ] T017 [US1] Implement navigation protection in App.tsx that conditionally renders LoginScreen if not authenticated, or MainTabs (Dashboard) if authenticated
- [ ] T018 [US1] Update DashboardScreen in src/screens/DashboardScreen.tsx to display welcome message at top showing user name and role from authContext (format: "Welcome, {name} ({role})")

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - user can log in and see dashboard with their information

---

## Phase 4: User Story 2 - User Views Profile and Logs Out (Priority: P2)

**Goal**: Authenticated user can view their profile information and securely log out, returning to login screen

**Independent Test**: After logging in, tap profile icon in top-right of dashboard, verify modal/popover displays with name, role, and logout button. Tap logout, verify all auth data cleared and navigation returns to login screen

### Implementation for User Story 2

- [ ] T019 [US2] Create UserProfileIcon component in src/components/UserProfileIcon.tsx that renders person icon from react-native-vector-icons
- [ ] T020 [US2] Add onPress handler in src/components/UserProfileIcon.tsx that displays modal/popover with user name, user role, and logout button
- [ ] T021 [US2] Implement logout functionality in src/components/UserProfileIcon.tsx that calls authContext.logout when logout button is tapped
- [ ] T022 [US2] Implement logout method in src/context/AuthContext.tsx that clears user and tokens from state, removes @auth:tokens and @auth:user from AsyncStorage, sets isAuthenticated to false
- [ ] T023 [US2] Add dismiss functionality in src/components/UserProfileIcon.tsx modal that closes modal when user taps outside or dismisses it
- [ ] T024 [US2] Add UserProfileIcon to DashboardScreen in src/screens/DashboardScreen.tsx in top-right corner, positioned as tappable TouchableOpacity

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - user can log in, view profile, and log out

---

## Phase 5: User Story 3 - App Restores Session on Restart (Priority: P3)

**Goal**: App automatically restores user session on restart if valid tokens exist, eliminating need to log in again

**Independent Test**: Log in successfully, completely close app, reopen app, verify loading indicator appears, verify automatic navigation to dashboard without login screen, verify user information is displayed correctly

### Implementation for User Story 3

- [ ] T025 [US3] Implement session restoration logic in src/context/AuthContext.tsx that checks AsyncStorage for @auth:tokens and @auth:user on initialization
- [ ] T026 [US3] Add restoration attempt in src/context/AuthContext.tsx that if tokens exist, sets isAuthenticated to true temporarily and attempts to fetch user profile using stored tokens
- [ ] T027 [US3] Handle restoration success in src/context/AuthContext.tsx by keeping user and tokens in state, maintaining isAuthenticated as true
- [ ] T028 [US3] Handle restoration failure in src/context/AuthContext.tsx by clearing tokens from AsyncStorage, resetting state to initial (user null, tokens null, isAuthenticated false)
- [ ] T029 [US3] Add loading indicator display in App.tsx during session restoration process (show loading while checking tokens and fetching user)
- [ ] T030 [US3] Implement token expiration detection in src/api/authApi.ts that detects 401/403 responses and throws appropriate error
- [ ] T031 [US3] Add token expiration handling in src/context/AuthContext.tsx that on API error (401/403), clears all auth state, removes AsyncStorage data, sets isAuthenticated to false, triggers navigation to login

**Checkpoint**: All user stories should now be independently functional - app can restore sessions, handle expiration, and provide complete authentication flow

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T032 [P] Verify TypeScript strict mode compliance for all new files (no any types without justification)
- [ ] T033 [P] Verify all components use twrnc for styling (check src/components/UserProfileIcon.tsx, updated screens)
- [ ] T034 [P] Verify dark mode support in all UI components using React Native color scheme detection
- [ ] T035 Add error boundary handling for AsyncStorage read failures in src/context/AuthContext.tsx
- [ ] T036 Verify navigation protection prevents access to protected screens when not authenticated
- [ ] T037 [P] Update documentation if needed (README, inline comments)
- [ ] T038 Verify quickstart.md validation - test all flows manually
- [ ] T039 Code cleanup and refactoring - remove console.logs, ensure consistent formatting

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - User Story 2 and 3 can theoretically start after US1 completes, but US2 needs US1 auth working, and US3 needs US1+US2
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. **This is the MVP**.
- **User Story 2 (P2)**: Depends on User Story 1 completion - Requires authentication system to be working (login, AuthContext, navigation protection)
- **User Story 3 (P3)**: Depends on User Story 1 and 2 completion - Requires full authentication flow and logout functionality to test session restoration

### Within Each User Story

- Type definitions (Phase 2) before implementation
- API functions before Context integration
- Context implementation before screen updates
- Core implementation before UI integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003 and T004 can run in parallel (checking dependencies)
- **Phase 2**: T005, T006, T007 can all run in parallel (different files)
- **Phase 6**: T032, T033, T034, T037 can run in parallel (different files, verification tasks)

**Note**: Most tasks within a user story have dependencies (e.g., API before Context, Context before Screens), so limited parallelization within stories. However, once a story completes, next story can begin.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all foundational tasks together (different files, no dependencies):
Task: "Create TypeScript type definitions in src/types/auth.ts"
Task: "Create API service structure in src/api/authApi.ts"
Task: "Create AuthContext provider structure in src/context/AuthContext.tsx"
```

---

## Parallel Example: Phase 6 (Polish)

```bash
# Launch all polish verification tasks together:
Task: "Verify TypeScript strict mode compliance for all new files"
Task: "Verify all components use twrnc for styling"
Task: "Verify dark mode support in all UI components"
Task: "Update documentation if needed"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T008-T018)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Launch app → See login screen
   - Enter credentials → See loading indicator
   - Verify navigation to dashboard
   - Verify welcome message displays user name and role
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
   - Test: Login → Tap profile icon → See modal → Tap logout → Return to login
4. Add User Story 3 → Test independently → Deploy/Demo
   - Test: Login → Close app → Reopen app → Auto-navigate to dashboard
5. Each story adds value without breaking previous stories

### Sequential Strategy (Recommended)

With single developer or focused team:

1. Complete Setup + Foundational together (Phase 1-2)
2. Implement User Story 1 fully (Phase 3)
3. Test and validate User Story 1 independently
4. Implement User Story 2 fully (Phase 4)
5. Test and validate User Stories 1+2 together
6. Implement User Story 3 fully (Phase 5)
7. Test complete authentication flow
8. Polish and finalize (Phase 6)

---

## Task Summary

**Total Task Count**: 39 tasks

**Breakdown by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 3 tasks
- Phase 3 (User Story 1): 11 tasks
- Phase 4 (User Story 2): 6 tasks
- Phase 5 (User Story 3): 7 tasks
- Phase 6 (Polish): 8 tasks

**Breakdown by User Story**:
- User Story 1 (P1): 11 tasks
- User Story 2 (P2): 6 tasks
- User Story 3 (P3): 7 tasks

**Parallel Opportunities**: 7 tasks can run in parallel (mostly in Setup, Foundational, and Polish phases)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 18 tasks

**Independent Test Criteria**:
- **User Story 1**: Launch app → Login with credentials → Verify dashboard with user info
- **User Story 2**: Login → Tap profile icon → View profile → Logout → Verify return to login
- **User Story 3**: Login → Close app → Reopen app → Verify auto-navigation to dashboard

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify TypeScript compilation after each task or logical group
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks include explicit file paths for clarity
- Error handling is integrated into relevant tasks (generic "Login failed" messages per spec)
- AsyncStorage operations are integrated into Context tasks (not separate)

---

**Task Generation Complete**: Ready for implementation. Start with Phase 1 and work sequentially through MVP (User Story 1).

