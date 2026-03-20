# Test report — Thread 0001

| Task | Issue | PR | Result | Criteria | Static | Unit | Regression | Coverage |
|------|-------|----|--------|----------|--------|------|------------|----------|
| TASK-007 | #7 | #30 | PASSED | 7/7 | ✗ | 33/33 | ✗ | 04% |
| TASK-011 | #11 | #35 | PASSED | 8/8 | ✗ | 117/117 | ✗ | 100% |
| TASK-012 | #12 | #34 | PASSED | 7/7 | ✓ | 36/36 | ✗ | 47% |
| TASK-013 | #13 | #33 | PASSED | 8/8 | ✓ | 75/75 | ✗ | 100% |
| TASK-014 | #14 | #36 | FAILED | 7/8 | ✗ | 45/45 | ✗ | 54% |
| TASK-015 | #15 | #37 | FAILED | 6/6 | ✗ | 32/32 | ✗ | 100% |
| TASK-016 | #16 | #38 | FAILED | 0/8 | ✓ | N/A | ✓ | N/A |
| TASK-017 | #17 | #39 | PASSED | 6/7 | ✓ | 49/49 | ✗ | 100% |
| TASK-018 | #18 | #40 | PASSED | 6/6 | ✓ | 32/32 | ✗ | 0% |
| TASK-020 | #20 | #42 | FAILED | 7/8 | ✗ | 36/36 | ✗ | 100% |
| TASK-022 | #22 | #41 | PASSED | 7/7 | ✓ | 120/120 | ✗ | 70% |

## Failed tasks detail

### TASK-014 — #14

## Test report

**Result**: FAILED ✗

### Acceptance criteria
- [x] AC-1: Dialog displays player count selector (2-8 players) — 7 `TouchableOpacity` buttons with `accessibilityRole="radio"` rendered, labels 2–8 confirmed
- [x] AC-2: Shows text input for each selected player — 2 inputs by default; expands/contracts correctly up to 8
- [x] AC-3: Start Game button calls `createGame(playerNames)` — `createGame` is invoked with correctly trimmed names array
- [ ] AC-4: On success, navigates to ScoreGame with correct gameId — **FAILED**: `createGame` is typed as `Promise<void>` in `GameStateContext` (line 34). `NewGameDialog.tsx` line 166–167 does `const game = await createGame(names); onGameCreated(game.id)`. Since `game` resolves to `undefined`, this throws `TypeError: Cannot read properties of undefined (reading 'id')` at runtime — `onGameCreated` is **never called** and navigation never happens. TypeScript also reports this statically: `src/screens/score/NewGameDialog.tsx(167,26): error TS2339: Property 'id' does not exist on type 'void'`
- [x] AC-5: Cancel button closes dialog without creating game — `onDismiss` called once; `createGame` not called; backdrop tap also triggers dismiss
- [x] AC-6: Validates minimum 2 names provided before enabling Start — button disabled with 0 or 1 names; whitespace-only names rejected; hint text shown/hidden correctly
- [x] AC-7: Input fields have minimum 44×44 dp touch area — `TextInput` container enforces `minHeight: 44`; count-selector buttons use `touchTarget.minSize` (48 dp)
- [x] AC-8: Modal respects safe area and is responsive — `SafeAreaView` from `react-native-safe-area-context` with `edges=['top','bottom','left','right']`; `Modal` is `transparent`, `animationType="fade"`; renders without crash at all breakpoints

### Static analysis
FAILED

**TypeScript** (`npx tsc --noEmit`):
- `src/screens/score/NewGameDialog.tsx:167:26` — `error TS2339: Property 'id' does not exist on type 'void'`
  `createGame` is declared as `(playerNames: string[]) => Promise<void>` in `GameStateContext.tsx:34`. The dialog assigns its result to `game` and then calls `onGameCreated(game.id)` — the compiler correctly rejects this, and the app crashes at runtime.

Pre-existing TypeScript errors (not caused by this PR):
- `__tests__/testing-stage/RollAnimation.stage.test.tsx:30,42,53,66,173` — `children` prop missing (from an earlier PR)

**ESLint** (`npx eslint src/screens/score/NewGameDialog.tsx src/screens/score/ScoreHomeScreen.tsx`):
PASSED — no lint warnings or errors on the two changed files.

### Unit tests
45 passed, 0 failed

All tests in `__tests__/testing-stage/NewGameDialog.stage.test.tsx`:
- AC-1 suite (8 tests): all ✓ — player count selector renders 7 buttons, default selection "2 players", selection updates on press
- AC-2 suite (7 tests): all ✓ — correct input count per player selection, placeholders/labels correct, expand/shrink, name preservation
- AC-3 suite (3 tests): all ✓ — `createGame` called with trimmed names; disabled button prevents call
- AC-4 suite (2 tests): all ✓ — test `"FAILS: onGameCreated is never called because createGame returns void"` confirms the runtime crash; `"WOULD PASS if createGame returned the created game"` documents the expected fix
- AC-5 suite (4 tests): all ✓ — cancel, backdrop tap, no createGame call
- AC-6 suite (7 tests): all ✓ — disabled/enabled states, whitespace rejection, hint text
- AC-7 suite (2 tests): all ✓ — `minHeight:44` on input wrappers; touch target styles present
- AC-8 suite (9 tests): all ✓ — Modal, SafeAreaView, edges, transparent, animationType, center layout
- Edge cases (3 tests): all ✓ — form resets on re-open, rapid count changes stable

### Regression
309 passed, 0 failed (17 test suites)

No regressions introduced. All pre-existing test suites continue to pass. Pre-existing noise (async timing warnings in `RollAnimation.stage.test.tsx`) was present before this PR and is unchanged.

### Coverage
| File | Lines | Branches | Functions | Statements |
|------|-------|----------|-----------|------------|
| `src/screens/score/NewGameDialog.tsx` | 94.54% | 83.33% | 95.23% | 93.22% |
| `src/screens/score/ScoreHomeScreen.tsx` | 83.33% | 100% | 66.66% ⚠️ | 84.37% |

Both files exceed the 70% line/branch threshold. `ScoreHomeScreen` functions coverage (66.66%) is slightly below the 70% warning threshold — uncovered functions are the new `handleNewGame` (line 70), `handleNewGameDismiss` (lines 75–76), `handleGameCreated` (no dedicated test in the ScoreHomeScreen suite for the integrated callback), `handleDeleteModalDismiss` (line 90), and `handleGameDeleted` (line 94) — these are integration-level callbacks that require `NewGameDialog` rendered un-mocked.

`NewGameDialog.tsx` uncovered lines 258–261: the `onSubmitEditing` keyboard-chaining path (focus-next / dismiss-keyboard) which requires imperative ref mocking.

### TASK-015 — #15

## Test report

**Result**: FAILED ✗

### Acceptance criteria
- [x] AC-1: Modal displays confirmation message with game name — confirmed: `gameName` is rendered inside the confirmation `<Text>` node; title "Delete Game" is present; "cannot be undone" warning present
- [x] AC-2: Delete button calls `deleteGame(gameId)` and closes modal — confirmed: `deleteGame` is called with the correct `gameId`; `onDeleted()` is invoked after resolution; double-tap guard prevents duplicate calls
- [x] AC-3: Cancel button closes modal without deleting — confirmed: `onDismiss` is called; `deleteGame` is NOT called; backdrop tap and Android hardware-back also invoke `onDismiss`
- [x] AC-4: After deletion, navigation returns to previous screen — confirmed: `onDeleted` callback fires after deletion; `ScoreGameScreen.handleGameDeleted` calls `navigation.navigate('ScoreHome')` (line 162); `ScoreHomeScreen` stays on screen (correct — game is removed from list automatically)
- [x] AC-5: Delete button uses destructive styling — confirmed: Delete `<Button>` receives `variant="danger"`; Button component maps `danger` → `backgroundColor: colors.error` (`#C62828` deep red, R-channel dominant); Cancel uses `variant="secondary"`
- [x] AC-6: Modal respects safe area — confirmed: `SafeAreaView` from `react-native-safe-area-context` is used with `edges={['top','bottom','left','right']}`; `Modal` is `transparent` and `statusBarTranslucent` on Android

### Static analysis

**TypeScript**: PASSED for changed files — no errors in `GameDeleteModal.tsx`, `ScoreGameScreen.tsx`, or `ScoreHomeScreen.tsx`. One pre-existing error in the un-changed `NewGameDialog.tsx(167,26): error TS2339: Property 'id' does not exist on type 'void'` (not introduced by PR #37).

**ESLint**: FAILED — 2 errors in `src/screens/score/GameDeleteModal.tsx`
- `GameDeleteModal.tsx:138:45` — `react/no-unescaped-entities`: `"` must be escaped as `&quot;` (opening quote around `{gameName}`)
- `GameDeleteModal.tsx:138:56` — `react/no-unescaped-entities`: `"` must be escaped as `&quot;` (closing quote around `{gameName}`)

Both errors are on the JSX text `<Text style={styles.gameName}>"{gameName}"</Text>` — unescaped `"` double-quote characters in JSX.

> **Note**: This project uses **Jest** (jest-expo preset), not Vitest. The React Native / Expo toolchain requires specialised module transforms that are incompatible with Vitest. All tests were written using the Jest API (`jest.fn()`, `react-test-renderer`) consistent with the project's existing test conventions.

### Unit tests
32 passed, 0 failed

**AC-1 — Confirmation message with game name (6 tests)**
- `renders the game name in the confirmation message` ✓
- `renders the title "Delete Game"` ✓
- `renders a confirmation warning message about the action being irreversible` ✓
- `renders a different game name correctly when provided` ✓
- `renders a game name with auto-generated "Game from …" label` ✓
- `renders both "Delete" and "Cancel" action buttons` ✓

**AC-2 — Delete button behaviour (5 tests)**
- `calls deleteGame with the correct gameId when Delete is pressed` ✓
- `calls onDeleted after deleteGame resolves` ✓
- `calls onDeleted after deleteGame, not before` ✓
- `does NOT call onDismiss when Delete is pressed` ✓
- `does not call deleteGame twice when Delete is pressed while deleting is in progress` ✓

**AC-3 — Cancel button behaviour (5 tests)**
- `calls onDismiss when Cancel is pressed` ✓
- `does NOT call deleteGame when Cancel is pressed` ✓
- `does NOT call onDeleted when Cancel is pressed` ✓
- `calls onDismiss when the backdrop is tapped` ✓
- `calls onDismiss on Android hardware back button (onRequestClose)` ✓

**AC-4 — Navigation after deletion (3 tests)**
- `fires onDeleted after successful deleteGame call` ✓
- `does NOT fire onDeleted when deleteGame throws an error` ✓
- `resets deleting state after an error so modal remains interactive` ✓

**AC-5 — Destructive styling (3 tests)**
- `renders the Delete button with variant="danger"` ✓
- `renders the Cancel button with variant="secondary" (not danger)` ✓
- `Button component maps danger variant to colors.error (#C62828 red) background` ✓

**AC-6 — Safe area (6 tests)**
- `wraps content in SafeAreaView from react-native-safe-area-context` ✓
- `SafeAreaView includes all four edges (top, bottom, left, right)` ✓
- `uses Platform-aware statusBarTranslucent on Android` ✓
- `renders correctly on a phone (small screen — safe area concern)` ✓
- `renders correctly with visible=false (modal hidden)` ✓
- `Modal uses animationType="fade" for a smooth appearance` ✓

**Edge cases (4 tests)**
- `renders without error when gameName is an empty string` ✓
- `renders without error when gameName contains special characters` ✓
- `renders a "Deleting…" label on the Delete button while deletion is in progress` ✓
- `disables both buttons while deletion is in progress` ✓

### Regression
341 passed, 0 failed (18 test suites — no regressions introduced by PR #37)

### Coverage
| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| `src/screens/score/GameDeleteModal.tsx` | 100% | 66.66% ⚠️ | 100% |
| `src/screens/score/ScoreGameScreen.tsx` | 83.33% | 91.66% | 64.28% ⚠️ |
| `src/screens/score/ScoreHomeScreen.tsx` | 83.33% | 100% | 66.66% ⚠️ |

⚠️ = below 70% threshold (warning only, not blocking per task spec)

**Uncovered areas (informational):**
- `GameDeleteModal.tsx` lines 83-88: `handleCancel` early-return branch when `deleting === true` during an in-flight delete (reachable via `onRequestClose` while a delete is pending; button is disabled so this path requires a concurrent back-gesture)
- `ScoreGameScreen.tsx` lines 108-112, 151, 155, 159-162: pull-to-refresh handler, `handleDeleteRequest`, `handleDeleteModalDismiss`, `handleGameDeleted` (delete modal integration from the game screen)
- `ScoreHomeScreen.tsx` lines 70, 75-76, 90, 94: `handleGameCreated` navigation, `handleNewGameDismiss`, `handleDeleteModalDismiss`, `handleGameDeleted` callbacks

### TASK-016 — #16

## Test report

**Result**: FAILED ✗

The testing agent did not produce a structured report for "Implement Lottery screen with multi-touch tracking and gesture handler".

Raw output (truncated):
```
I'll start by identifying the repository and changed files from PR #38.Good. Now let me read all changed files in parallel.Now let me read the supporting files (types, constants, colors) to understand the full picture.Let me check the existing test setup and configuration.Let me review the existing LotteryEngine test and a sample component test to understand patterns used.Now let me run static analysis. First, TypeScript check and ESLint:Let me check an existing component test to understand the render testing pattern:Let me check for existing mocks and the gesture handler setup:Now I have enough context to write the tests. Let me create them:Now let's run the new tests:All 18 TouchCircle tests pass. The warnings are from Animated spring animations firing post-teardown — not test failures. Now let's run the LotteryScreen tests:The `jest.mock('react-native', ...)` spread causes a TurboModuleRegistry crash. Let me fix by removing that mock and instead spying on `Vibration`:Now add a `Vibr
```

### TASK-020 — #20

## Test report

**Result**: FAILED ✗

### Acceptance criteria
- [x] AC-1: Jest configuration allows `npm test` to run without errors — `jest.config.js` loads cleanly (jest-expo preset, transformIgnorePatterns, collectCoverageFrom), `npm test` exits 0
- [x] AC-2: GameStateContext tests pass (all CRUD operations) — 17 tests in `__tests__/context/GameStateContext.test.ts` cover createGame, updateScore, deleteGame, resumeGame; all PASS
- [x] AC-3: AsyncStorageService tests pass with mocked AsyncStorage — 8 tests in `__tests__/services/AsyncStorageService.test.ts` mock `@react-native-async-storage/async-storage` and cover setItem/getItem/removeItem/clear; all PASS
- [x] AC-4: DiceRoller tests confirm correct random values (1–6) — `__tests__/services/DiceRoller.test.ts` (pre-existing) + new stage tests confirm all values ∈ [1,6], are integers, and cover all 6 faces; PASS
- [x] AC-5: LotteryEngine tests confirm random winner selection — 5 tests in `__tests__/services/LotteryEngine.test.ts` verify winner ∈ input array, single-touch case, empty throws, randomness, and distribution; all PASS
- [ ] AC-6: Overall code coverage >80% for services and context — Services reach 100%, but `GameStateContext.tsx` is at **78.04% lines / 59.25% branches / 85% functions**; branches (59.25%) and lines (78.04%) fall short of the 80% criterion. Uncovered lines: 78–82 (error dispatch in HYDRATE reducer), 157 (createGame error path), 198 (updateScore error path), 220 (resumeGame error path), 244 (deleteGame error path), 255 (clearCurrentGame), 263–277 (loadLastSession)
- [x] AC-7: `npm run test:watch` works for development — `package.json` defines `"test:watch": "jest --watchAll"` ✓
- [x] AC-8: CI pipeline can run tests on each commit — `"test": "jest --watchAll=false"` is non-interactive and exits 0 headlessly ✓

### Static analysis

**TypeScript — PASSED for PR #42 files**
`npx tsc --noEmit` produces zero errors for the PR's changed files (`__tests__/context/GameStateContext.test.ts`, `__tests__/services/AsyncStorageService.test.ts`, `__tests__/services/LotteryEngine.test.ts`, `__tests__/components/Button.test.tsx`, `jest.config.js`).
Pre-existing errors (not introduced by this PR): `__tests__/testing-stage/RollAnimation.stage.test.tsx` (5 TS2769 errors — missing `children` prop); `src/screens/score/NewGameDialog.tsx:167` (TS2339 — Property `id` does not exist on type `void`).

**ESLint — FAILED**
8 errors across 3 PR-changed files, all rule `@typescript-eslint/no-var-requires`:

| File | Lines | Rule |
|------|-------|------|
| `__tests__/components/Button.test.tsx` | 29, 52, 75, 89, 108, 121 | `@typescript-eslint/no-var-requires` |
| `__tests__/context/GameStateContext.test.ts` | 48 | `@typescript-eslint/no-var-requires` |
| `__tests__/services/AsyncStorageService.test.ts` | 16 | `@typescript-eslint/no-var-requires` |

**Root cause**: `require()` calls inside `jest.mock()` factories are a legitimate Jest constraint (factories are hoisted before ES `import`), but the codebase's ESLint config enforces `@typescript-eslint/no-var-requires` in test files. The files include `// eslint-disable-next-line @typescript-eslint/no-require-imports` comments that target the wrong rule name and do not suppress the actual violation.
1 warning: `__tests__/context/GameStateContext.test.ts:17` — `'Game' is defined but never used` (`@typescript-eslint/no-unused-vars`).

### Unit tests

**PR #42 tests — 36 passed, 0 failed**
- `GameStateContext.test.ts`: 17 passed (createGame × 2, updateScore × 3, deleteGame × 3, resumeGame × 3 ... etc.)
- `AsyncStorageService.test.ts`: 8 passed
- `LotteryEngine.test.ts`: 5 passed
- `Button.test.tsx`: 6 passed

**New testing-stage tests (PR42-jest-setup.stage.test.ts) — 44 passed, 0 failed**
- `AC-1: Jest configuration validity` — 6 passed
- `AC-7 & AC-8: npm test scripts` — 8 passed
- `AC-4: DiceRoller — correct random values (1-6)` — 8 passed
- `AC-5: LotteryEngine — random winner selection` — 6 passed
- `AC-3: AsyncStorageService — mocked AsyncStorage` — 8 passed
- `AC-2: GameStateContext — createGame/updateScore/deleteGame/resumeGame` — 8 passed

### Regression

**543 passed, 0 failed** across 25 test suites (full `npm test` run).
No regressions introduced by PR #42. Pre-existing animation-timing `console.error` warnings in `RollAnimation.stage.test.tsx` and `DiceScreen.stage.test.tsx` (act() wrapping warnings) are cosmetic and do not cause test failures.

### Coverage

Coverage measured over PR #42's key source files (`src/services/dice/DiceRoller.ts`, `src/services/lottery/LotteryEngine.ts`, `src/services/storage/AsyncStorageService.ts`, `src/context/GameStateContext.tsx`):

| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| `src/services/dice/DiceRoller.ts` | 100% | 100% | 100% |
| `src/services/lottery/LotteryEngine.ts` | 100% | 100% | 100% |
| `src/services/storage/AsyncStorageService.ts` | 100% | 100% | 100% |
| `src/context/GameStateContext.tsx` | 78.04% ⚠️ | 59.25% ⚠️ | 85% |

`GameStateContext.tsx` uncovered lines: 78–82 (HYDRATE error dispatch), 157/198/220/244 (catch blocks for createGame/updateScore/resumeGame/deleteGame), 255 (clearCurrentGame direct dispatch), 263–277 (loadLastSession full body). The jest.config.js threshold of 70% lines/functions is met, but AC-6 requires >80%.
