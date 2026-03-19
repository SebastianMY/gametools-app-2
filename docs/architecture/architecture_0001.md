# Architecture Document: Game Companion Mobile App

## 1. Architecture Overview

**Style:** Modular Monolith with Feature-Based Organization

This is a **single-application architecture** organized by feature (Dice, Score, Lottery) rather than technical layers. All features run in one React Native process with a shared navigation stack and unified state management.

**Why this approach:**
- The three features (Dice, Score, Lottery) have no independent scaling requirements; all run on the same device
- No backend or service mesh needed; offline-first design eliminates distributed system complexity
- Feature-based organization allows clear ownership and reduces cognitive load
- Expo's managed build system handles both iOS and Android from a single codebase
- Minimal cross-feature dependencies enable future modularization if needed

**No separate services, no backend API, no cloud sync.** Everything lives on the device.

---

## 2. Architecture Decision Records (ADRs)

### ADR-1: State Management with React Context + Custom Hooks (Not Redux/Zustand)

**Decision:** Use React Context API with custom hooks for state management instead of Redux, Zustand, or MobX.

**Context:**
- Requirements specify automatic persistence after every score change (FR-S7) and session restoration (FR-S12)
- Game state is relatively simple: a list of games, each containing player names and scores (no nested relationships requiring normalization)
- No requirement for time-travel debugging, complex middleware, or devtools integration
- Target users are game players, not developers; the app must be lightweight and fast

**Alternatives Considered:**
1. **Redux** – Provides devtools and middleware, but adds significant boilerplate (reducers, actions, selectors) for a simple state shape. Overkill for three screens with straightforward data mutations.
2. **Zustand** – Lighter than Redux but still unnecessary abstraction. File count and bundle size increase without corresponding benefit.
3. **MobX** – Adds decorator complexity and implicit reactivity; harder to reason about data flow in a small team.
4. **Props drilling + useState** – No centralized state; makes automatic persistence harder to implement cleanly across multiple screens.

**Trade-offs:**
- **Accepted:** Less out-of-the-box debugging than Redux; requires manual devtools integration if heavy debugging becomes necessary in future
- **Accepted:** No built-in middleware for logging or persistence; we implement these as custom hooks
- **Gained:** Simpler codebase, faster time-to-first-feature, easier for new developers to understand

**Status:** Accepted

---

### ADR-2: AsyncStorage for Persistence (Not SQLite)

**Decision:** Use AsyncStorage (React Native's default key-value store) for all game state persistence, not SQLite.

**Context:**
- Data model is simple: a collection of games, each with metadata (id, createdAt, lastModified) and a players array (name, score)
- No requirement for complex queries (filtering by score, date ranges, statistics) in v1
- FR-S7 requires atomic writes after every score change; both AsyncStorage and SQLite can provide this
- AsyncStorage requires zero configuration; SQLite adds setup complexity and native module management
- App must work offline and store locally; no syncing or replication needed

**Alternatives Considered:**
1. **SQLite** – Structured query language, better for complex queries, but overkill when games are just JSON blobs. Adds build complexity (native modules) and maintenance burden.
2. **Realm** – Similar to SQLite; designed for complex relational queries we don't have.
3. **MMKV** – Slightly faster than AsyncStorage but less portable; not worth the compatibility trade-off.
4. **File system (JSON files)** – Manual JSON parsing/serialization is error-prone; AsyncStorage handles encoding automatically.

**Trade-offs:**
- **Accepted:** AsyncStorage is key-value only; if future versions need analytics queries (e.g., "average score per player across all games"), we will migrate to SQLite
- **Accepted:** Requires manual JSON serialization/deserialization, but this is straightforward for our simple schema
- **Gained:** Zero additional native module dependencies; faster Expo build times; simpler code

**Status:** Accepted

---

### ADR-3: React Native Gesture Handler for Multi-Touch Lottery Feature

**Decision:** Use React Native Gesture Handler (Swipe, Pan, and multi-touch tracking) for the Lottery/player selection feature instead of PanResponder.

**Context:**
- FR-L1 requires reliable multi-touch detection (2–8 simultaneous fingers)
- FR-L4 requires stable touch monitoring for 3 seconds with reset logic if touches change
- PanResponder (React Native built-in) handles single gestures well but is fragile with multi-touch concurrency
- Gesture Handler is the community standard for complex gesture recognition in React Native
- Both iOS and Android support native multi-touch; Gesture Handler abstracts OS differences

**Alternatives Considered:**
1. **PanResponder** – Simpler, built-in, but has known issues with multi-touch stability. State tracking across multiple fingers is error-prone.
2. **Native iOS/Android code** – Precise but requires native module development; conflicts with Expo managed builds
3. **Low-level touch events** – React Native's `onTouchStart`, `onTouchMove`, `onTouchEnd` exist but are less reliable than Gesture Handler

**Trade-offs:**
- **Accepted:** Gesture Handler is a third-party dependency; Expo manages it well, but adds ~50 KB to bundle
- **Accepted:** Slight learning curve for the team, but well-documented
- **Gained:** Robust multi-touch stability; iOS/Android parity; ability to detect touch changes in real-time for the 3-second countdown reset (FR-L9)

**Status:** Accepted

---

### ADR-4: React Native Animated API for Dice and Circle Animations

**Decision:** Use React Native's built-in Animated API for dice rolling and circle animations instead of Reanimated 2.

**Context:**
- NFR-P1 requires 60 FPS animations consistently
- Animation requirements are straightforward: spinning dice, growing circles, fade-out effects
- Animated API is built-in, zero additional dependency
- Reanimated 2 is more powerful (thread-safe, better performance for complex interactions) but adds complexity and build steps

**Alternatives Considered:**
1. **Reanimated 2** – Runs on native thread, slightly better performance, but requires native build configuration (conflicts with Expo managed builds unless using Expo SDK v50+). More complexity than needed for v1.
2. **Lottie** – Great for pre-designed animations but requires design assets; our animations are simple procedural effects
3. **React Native Skia** – Powerful graphics library but overkill for basic animations; adds significant bundle size

**Trade-offs:**
- **Accepted:** Main thread animations may feel less fluid on low-end Android devices; acceptable for game targeting casual players
- **Accepted:** If performance testing shows frame drops, we can migrate to Reanimated 2 in v1.1
- **Gained:** Zero additional dependencies; ships with React Native out of the box; works with Expo without extra configuration

**Status:** Accepted

---

### ADR-5: Modular Monolith (Feature-Based Folder Structure, Not Microservices)

**Decision:** Organize code by feature (Dice, Score, Lottery) with shared utilities and components, all in a single React Native app. Do not attempt to extract independent services.

**Context:**
- All three features run on a single mobile device; no distributed deployment or scaling needed
- Users expect a single cohesive app; switching between features must be instant
- Requirements specify no backend or cloud services; microservices add network latency and operational overhead we don't need
- Team is likely small; microservices would fragment the codebase and slow development

**Alternatives Considered:**
1. **Layered architecture (Presentation, Business Logic, Data)** – Common in enterprise but creates horizontal slices that make feature work slower. A developer modifying Score feature must touch three layers; error-prone.
2. **Microservices** – Overkill for a mobile app; adds inter-process communication, deployment, and debugging complexity without benefit
3. **Monolithic ball of mud** – No structure; impossible to scale the team

**Trade-offs:**
- **Accepted:** Feature modules share React Context state; tight coupling. If two features need to coordinate (e.g., Dice rolls feeding into Score), logic lives in a shared hook rather than a service boundary
- **Gained:** Fast feature development, simple to reason about, easy to add new features without re-architecting

**Status:** Accepted

---

### ADR-6: Automatic Persistence via Context State Subscription + Debouncing

**Decision:** Persist game state automatically after every user action (score update) using a Context listener and debounced writes to AsyncStorage, not a separate persistence service or middleware.

**Context:**
- FR-S7 requires automatic persistence after every score change
- FR-R2 requires atomic writes (no partial updates)
- Naive approach (write on every state change) causes excessive I/O; debouncing reduces writes while maintaining data integrity
- Context API allows us to attach side effects to state changes declaratively

**Alternatives Considered:**
1. **Redux middleware (redux-persist)** – Automatic persistence via middleware, but we rejected Redux in ADR-1
2. **Custom persistence service** – Decoupled from state management, but requires manual synchronization; error-prone
3. **Write on every action** – Simple but causes performance issues (AsyncStorage writes are I/O-bound)

**Trade-offs:**
- **Accepted:** Debouncing (default 500ms) means game state is not persisted *immediately* after a score change; if app crashes in the 500ms window, the last score update may be lost. Acceptable because users rarely force-close mid-gameplay
- **Gained:** Efficient persistence; no jank from write latency; state and storage remain in sync declaratively

**Status:** Accepted

---

### ADR-7: Expo EAS Build for iOS and Android (Not Local Native Build)

**Decision:** Use Expo's managed build service (EAS Build) for iOS and Android compilation, not local Xcode/Android Studio native builds.

**Context:**
- Specification requires iOS 14.0+ and Android 11.0+ (NFR-C1, NFR-C2)
- Team does not need to modify native code (no native modules beyond Expo's built-in support)
- EAS Build abstracts iOS provisioning profiles, signing certificates, and Android keystore management
- Single command deploys to App Store and Google Play

**Alternatives Considered:**
1. **Local Xcode + Android Studio** – Full control but requires macOS for iOS builds; complex certificate management; slow CI/CD setup
2. **Native Expo Go app** – Fast for development but requires App Store/Play Store to distribute full-featured app
3. **Firebase App Distribution** – Good for beta testing but not for production release

**Trade-offs:**
- **Accepted:** Builds run on Expo's servers (no local native toolchain required); slight delay vs. local builds but acceptable for scheduled releases
- **Accepted:** Vendor lock-in to Expo; migrating to local builds later requires infrastructure investment
- **Gained:** No local environment setup (Xcode, Android SDK, provisioning profiles); faster onboarding; built-in CI/CD

**Status:** Accepted

---

### ADR-8: No Global State for UI Concerns; Use Component-Local State for Screen Transitions

**Decision:** Keep navigation state (current screen) and temporary UI state (e.g., "show roll results") in local component state using React Navigation, not in Context/global store.

**Context:**
- React Navigation already handles screen stack state; duplicating this in Context adds complexity
- UI state like "is the dice animation playing?" is ephemeral; persisting it is unnecessary
- Keeps global Context focused on **persistent business logic** (games, players, scores) separate from transient **UI concerns** (current screen, animation status)

**Alternatives Considered:**
1. **Store all navigation in Context** – Possible but redundant with React Navigation; two sources of truth for screen state
2. **Redux for everything** – Covered in ADR-1; rejected

**Trade-offs:**
- **Accepted:** Navigation logic doesn't live in Redux devtools (if we later add Redux); acceptable given we rejected Redux for state management
- **Gained:** Smaller Context payload; faster re-renders; cleaner separation of concerns

**Status:** Accepted

---

## 3. System Components

### Component: Navigation Stack (using React Navigation)

**Responsibility:** Routes between Home screen and three feature screens (Dice, Score, Lottery). Manages browser-like back button and navigation history.

**Key Interfaces:**
- **Consumes:** Navigation state (from React Navigation library)
- **Exposes:** Navigation methods to all feature screens (navigate, goBack, etc.)
- **Dependencies:** React Navigation, React Native

---

### Component: Dice Feature Module

**Responsibility:** Dice rolling UI and logic. Displays selected dice count, animates roll, shows individual results and total sum.

**Key Interfaces:**
- **Exposes (Screens):**
  - `DiceScreen` – Main dice interface with count selector, roll button, and results display
- **Consumes:**
  - Navigation context (to return to home)
  - System random number generator (Math.random for fair rolling)
  - React Native Animated API (for roll animation)
  - Expo Haptics (optional; for roll confirmation)
- **Dependencies:** React Navigation, React Native Animated, Expo

**No persistence required** – Dice results are ephemeral; users don't expect dice rolls to be saved.

---

### Component: Score Feature Module

**Responsibility:** Game creation, player score tracking, game resumption, and game deletion. Manages multiple saved games.

**Key Interfaces:**
- **Exposes (Screens):**
  - `ScoreHomeScreen` – List of saved games with "New Game" button
  - `ScoreGameScreen` – Active game interface with players, scores, and increment/decrement buttons
  - `ScoreNewGameDialog` – Player name input for new games
- **Consumes:**
  - `GameStateContext` (global) – Stores list of games and current active game; pushes persistence to AsyncStorage
  - Navigation context
  - AsyncStorage (via context)
- **Dependencies:** React Navigation, React Context, AsyncStorage

**Persistence:** All game state (players, scores) persists via GameStateContext debounced writes to AsyncStorage.

---

### Component: Lottery Feature Module

**Responsibility:** Multi-touch player selection. Detects simultaneous touches, displays colored circles, monitors stability for 3 seconds, randomly selects a winner.

**Key Interfaces:**
- **Exposes (Screens):**
  - `LotteryScreen` – Full-screen touch surface with colored circles and winner announcement
- **Consumes:**
  - React Native Gesture Handler (multi-touch tracking)
  - React Native Animated API (circle growth/fade)
  - Expo Vibration API (haptic feedback on countdown completion)
- **Dependencies:** React Navigation, React Native Gesture Handler, Expo Vibration

**No persistence required** – Lottery selections are transient; results reset on app navigation.

---

### Component: Game State Context (Global)

**Responsibility:** Single source of truth for all saved games, current active game, and player scores. Handles automatic persistence to AsyncStorage with debouncing.

**Key Interfaces:**
- **Exposes:**
  - `useGameState()` – Hook providing access to games list and current game
  - `createGame(players: Player[]): Game` – Creates new game
  - `updateScore(gameId: string, playerId: string, newScore: number)` – Updates a player's score
  - `resumeGame(gameId: string)` – Loads game as current
  - `deleteGame(gameId: string)` – Removes game from storage
  - `loadLastSessionGame(): Promise<Game | null>` – Restores last active game on app launch
- **Consumes:**
  - AsyncStorage (direct writes via debounced effect)
- **Dependencies:** React Context API, AsyncStorage, Expo

---

### Component: Storage Service Layer

**Responsibility:** Encapsulates all AsyncStorage operations for games. Handles JSON serialization/deserialization and atomic writes.

**Key Interfaces:**
- **Exposes (Internal to Context):**
  - `saveGames(games: Game[]): Promise<void>` – Atomically persists all games
  - `loadGames(): Promise<Game[]>` – Restores games from storage
  - `loadLastGameId(): Promise<string | null>` – Retrieves ID of last active game
  - `saveLastGameId(gameId: string): Promise<void>` – Records current active game
- **Consumes:**
  - AsyncStorage
  - Utilities (JSON serialization, UUID generation)
- **Dependencies:** AsyncStorage

---

### Component: Utilities & Shared Services

**Responsibility:** Common functions used across modules.

**Modules:**
- **UUID Generator** – Creates unique game IDs
- **Color Palette** – Pre-defined colors for Lottery circles
- **Accessibility Utilities** – WCAG AA compliant color contrast checks
- **Animation Helpers** – Reusable Animated.Value configurations for dice and circles

**Dependencies:** React Native, Expo

---

## 4. Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| **Runtime** | React Native | Cross-platform iOS/Android from single codebase; specified in requirements |
| **Build System** | Expo (EAS Build) | Managed CI/CD, no local Xcode/Android Studio setup required; handles iOS/Android complexity |
| **Navigation** | React Navigation v6+ | Community standard for React Native; stack and tab navigation; deep linking support |
| **State Management** | React Context + Custom Hooks | Minimal dependencies, sufficient for simple persistent state (games and scores) |
| **Persistence** | AsyncStorage | Key-value store built into React Native; zero configuration; suitable for JSON game state |
| **Animations** | React Native Animated API | Built-in, 60 FPS capable, sufficient for dice rolling and circle effects |
| **Multi-Touch Gestures** | React Native Gesture Handler | Robust multi-touch tracking with stability monitoring; community standard |
| **Haptic Feedback** | Expo Vibration API | Built into Expo; provides device vibration for lottery countdown |
| **Styling** | React Native StyleSheet + Design Tokens | Built-in StyleSheet API; design tokens (colors, spacing) for consistency |
| **Linting** | ESLint + Prettier | Standard JS/TS code quality tooling |
| **Testing** | Jest + Detox (optional) | Jest for unit/integration tests; Detox for e2e testing (v1.1+) |
| **Language** | TypeScript | Type safety reduces bugs; better IDE support; specification-driven development |

---

## 5. Folder Structure

```
game-companion/
├── app.json                           # Expo configuration
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── .eslintrc.json                     # ESLint configuration
├── .prettierrc.json                   # Prettier formatting rules
│
├── src/
│   ├── App.tsx                        # Root component; sets up Context providers
│   │
│   ├── context/
│   │   ├── GameStateContext.tsx       # Global game state (games list, current game)
│   │   └── hooks/
│   │       ├── useGameState.ts        # Hook to access game state context
│   │       └── usePersistence.ts      # Hook for debounced AsyncStorage writes
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx             # Main menu with access to Dice, Score, Lottery
│   │   ├── dice/
│   │   │   └── DiceScreen.tsx         # Dice rolling interface
│   │   ├── score/
│   │   │   ├── ScoreHomeScreen.tsx    # List of saved games
│   │   │   ├── ScoreGameScreen.tsx    # Active game with score tracking
│   │   │   ├── NewGameDialog.tsx      # Modal for entering player names
│   │   │   └── GameDeleteModal.tsx    # Confirmation dialog for game deletion
│   │   └── lottery/
│   │       └── LotteryScreen.tsx      # Multi-touch player selection
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx             # Reusable button component
│   │   │   ├── Card.tsx               # Card container
│   │   │   ├── TextInput.tsx          # Accessible text input
│   │   │   └── ScreenContainer.tsx    # Safe area + consistent padding
│   │   ├── dice/
│   │   │   ├── DiceDisplay.tsx        # Individual die value display
│   │   │   ├── DiceCountSelector.tsx  # Increment/decrement buttons for dice count
│   │   │   └── RollAnimation.tsx      # Spinning dice animation
│   │   ├── score/
│   │   │   ├── PlayerRow.tsx          # Single player name + score + controls
│   │   │   ├── ScoreIncrement.tsx     # +1, +5, +10 buttons
│   │   │   └── GameListItem.tsx       # Saved game entry in list
│   │   └── lottery/
│   │       ├── TouchCircle.tsx        # Colored circle representing a finger
│   │       ├── TouchSurface.tsx       # Full-screen touch tracking
│   │       └── WinnerAnnouncement.tsx # Winner display with animation
│   │
│   ├── services/
│   │   ├── storage/
│   │   │   ├── AsyncStorageService.ts # AsyncStorage abstraction
│   │   │   └── GameRepository.ts      # Game-specific storage logic
│   │   ├── lottery/
│   │   │   └── LotteryEngine.ts       # Touch tracking and winner selection logic
│   │   └── dice/
│   │       └── DiceRoller.ts          # Dice rolling algorithm
│   │
│   ├── types/
│   │   ├── Game.ts                    # Game interface definition
│   │   ├── Player.ts                  # Player interface definition
│   │   └── Touch.ts                   # Multi-touch tracking types
│   │
│   ├── utils/
│   │   ├── colors.ts                  # Color palette (WCAG AA compliant)
│   │   ├── animations.ts              # Reusable animation configurations
│   │   ├── accessibility.ts           # A11y utilities (contrast checks, labels)
│   │   ├── uuid.ts                    # UUID generation
│   │   └── constants.ts               # App-wide constants
│   │
│   ├── styles/
│   │   ├── theme.ts                   # Design tokens (colors, spacing, typography)
│   │   ├── globalStyles.ts            # Shared StyleSheet definitions
│   │   └── responsive.ts              # Breakpoints and responsive utilities
│   │
│   └── navigation/
│       ├── RootNavigator.tsx          # Root navigation stack setup
│       └── types.ts                   # Navigation type definitions
│
├── __tests__/
│   ├── context/
│   │   └── GameStateContext.test.ts
│   ├── services/
│   │   ├── AsyncStorageService.test.ts
│   │   ├── DiceRoller.test.ts
│   │   └── LotteryEngine.test.ts
│   └── components/
│       └── PlayerRow.test.ts
│
├── .env.example                       # Example environment variables (if any)
├── .gitignore                         # Git ignore rules
└── README.md                          # Project documentation

```

**Folder Philosophy:**
- **By feature** (dice, score, lottery): Easier to locate and modify related code
- **Shared** (components, services, types, utils): Code used across features
- **Testing colocated**: Mirror `__tests__` structure matches `src` structure
- **Type safety**: Dedicated `types/` folder for interfaces; TypeScript prevents invalid data shapes

---

## 6. High-Level Data Model

### Primary Entities

| Entity | Fields | Type | Notes |
|--------|--------|------|-------|
| **Game** | `id` (UUID), `name` (string, optional), `createdAt` (timestamp), `lastModified` (timestamp), `players` (Player[]) | JSON (AsyncStorage) | Root entity for a saved game session |
| **Player** | `id` (UUID), `name` (string, 1-50 chars), `score` (number, -999999 to 999999) | Nested in Game | Individual player within a game |

### Relationships

```
Game (1) ──────────────(N) Player
  - Each game has 2-8 players
  - Deleting a game cascades to all its players
  - Players have no independent identity outside a game
```

### Storage Schema (AsyncStorage)

**Key: `@games`**
```
Value: JSON array of Game objects
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Friday Poker",
    "createdAt": 1710864000000,
    "lastModified": 1710864120000,
    "players": [
      { "id": "...", "name": "Alice", "score": 150 },
      { "id": "...", "name": "Bob", "score": 120 }
    ]
  },
  ...
]
```

**Key: `@lastActiveGameId`**
```
Value: UUID of the game to restore on app launch
"550e8400-e29b-41d4-a716-446655440000"
```

### No Additional Storage

- **Dice rolls:** Ephemeral; not persisted
- **Lottery results:** Ephemeral; not persisted
- **User preferences:** Out of scope for v1
- **Statistics:** Out of scope for v1

---

## 7. API / Interface Boundaries

### External (User-Facing) Routes / Screens

| Screen | Route | Purpose | Parameters |
|--------|-------|---------|-----------|
| Home | `/` | Main menu with three section buttons | None |
| Dice | `/dice` | Dice rolling interface | None |
| Score Home | `/score` | List of saved games | None |
| Score Game | `/score/:gameId` | Active game with score tracking | `gameId` – Game ID to load/resume |
| Lottery | `/lottery` | Multi-touch player selection | None |

### Internal (Component-to-Context) Interface

**GameStateContext API:**

```typescript
// Hook to access game state
useGameState(): {
  games: Game[],
  currentGame: Game | null,
  loading: boolean,
  error: string | null
}

// Actions
createGame(playerNames: string[]): Promise<Game>
updateScore(gameId: string, playerId: string, newScore: number): Promise<void>
resumeGame(gameId: string): Promise<void>
deleteGame(gameId: string): Promise<void>
clearCurrentGame(): void
loadLastSession(): Promise<void>  // Called on app init
```

### Service Layer Interfaces

**DiceRoller Service:**

```typescript
rollDice(count: number): number[]  // Returns array of [1-6] values
```

**LotteryEngine Service:**

```typescript
// Track active touches
trackTouches(touches: TouchEvent[]): Touch[]

// Check if touches are stable for N seconds
isStable(touches: Touch[], durationMs: number): boolean

// Select random winner
selectWinner(touches: Touch[]): Touch
```

**AsyncStorageService:**

```typescript
saveGames(games: Game[]): Promise<void>
loadGames(): Promise<Game[]>
saveLastGameId(gameId: string): Promise<void>
loadLastGameId(): Promise<string | null>
clearAll(): Promise<void>  // For testing
```

### No External API Calls

- ✅ No REST/GraphQL endpoints
- ✅ No cloud services
- ✅ No authentication servers
- ✅ No analytics backends
- ✅ No CDNs or asset servers

---

## 8. Open Questions

1. **Score Increment Button Amounts:**
   - Should increment buttons always be "+1, +5, +10"? Or should users customize per game?
   - **Impact:** Affects UI design and complexity. Recommend fixed buttons for v1; customization in v2.

2. **Game Naming:**
   - Should saved games require a name (e.g., "Friday Poker"), or are they identified by timestamp only?
   - **Impact:** Affects storage schema and list display. Recommend optional names with auto-generated label if omitted (e.g., "Game from March 19, 2026").

3. **Undo Functionality:**
   - Can users undo the last N score changes, or is there no undo?
   - **Impact:** Affects state management (need to track score history). Recommend no undo for v1 (simplicity); users can manually correct scores.

4. **Lottery Player Limit:**
   - The spec mentions "typically 2–8 players." Should we enforce 8-finger maximum, or allow more fingers and pick from however many touch?
   - **Impact:** Touch tracking complexity. Recommend enforcing 8 for now; constraint is reasonable for typical board game groups.

5. **Dice Non-Standard Faces:**
   - Does the app need d4, d8, d10, d12, or d20? Or only standard d6?
   - **Impact:** Animation and display logic. Recommend d6 only for v1; extend in v2.

6. **Vibration Customization:**
   - Should vibration intensity/duration be configurable in settings, or is one standard haptic feedback sufficient?
   - **Impact:** Adds settings screen (out of scope v1). Recommend single vibration for v1.

7. **Last Session Restoration Edge Case:**
   - If the last active game is deleted while the app is running, and user minimizes the app, should we restore a deleted game on reopen, or gracefully handle the missing game?
   - **Impact:** Affects persistence logic and error handling. Recommend: store game ID only; if game missing on reload, fall back to game list.

8. **Landscape Orientation:**
   - Should all three features support landscape mode, or just some (e.g., Dice may benefit from landscape)?
   - **Impact:** Layout complexity. Recommend landscape support for all screens; test thoroughly on tablets.

9. **Accessibility Scoping:**
   - Does WCAG AA apply to all features equally, or are there features where AA is critical and others where it's lower priority?
   - **Impact:** Testing effort allocation. Recommend equal priority; all features must pass AA.

10. **Tablet UI Differences:**
    - Should the app display differently on 10" tablets vs. 5" phones, or use responsive scaling of the phone UI?
    - **Impact:** Layout and navigation design. Recommend responsive scaling (single layout) for v1; tablet-optimized layout in v2.

---

## 9. Design Principles

1. **Simplicity First:** Prefer built-in React Native APIs over third-party libraries unless justified by requirements.
2. **Offline by Default:** All data stored locally; never assume network access.
3. **Persist Automatically:** Game state saves without user action (FR-S7, FR-S12).
4. **Accessible from the Start:** Implement WCAG AA compliance during development, not as a post-release fix.
5. **Single Device, Single App:** No syncing, no accounts, no cloud. Users are co-located on one device.
6. **Fast Onboarding:** Minimal tutorials; UI should be self-explanatory in 30 seconds.

---

## 10. Migration Path (Post-v1)

If future requirements change, the architecture supports these extensions:

- **Cloud Sync (v2):** Add Replicache or similar layer to sync games to cloud without redesigning storage
- **Statistics (v2):** Migrate to SQLite for historical queries; keep AsyncStorage as cache
- **User Accounts (v2):** Add Redux (or keep Context) for auth state; separate per-user game collections
- **Custom Game Rules (v2):** Add a "game mode" enum; Score module checks mode to apply custom logic
- **Bluetooth (v3):** Add react-native-ble-plx; communicate with other devices (out of current scope)

**The modular monolith structure prevents need to restructure when these are added.**

---

## 11. Deployment & Release Checklist

Before each release:

- [ ] ESLint and Prettier pass without warnings
- [ ] All Jest tests pass; >80% code coverage
- [ ] Detox e2e tests pass on iOS and Android simulators
- [ ] Manual testing on real iOS and Android devices (phone + tablet)
- [ ] WCAG AA audit: colors, text size, touch targets, screen reader labels
- [ ] Performance: frame rate stable at 60 FPS, app startup <2s, load last game <500ms
- [ ] Backup game data, test persistence across app versions
- [ ] Expo EAS Build succeeds for both iOS and Android
- [ ] App Store and Google Play submission requirements met (privacy policy, screenshots, description)

---

## 12. Success Metrics (Post-Launch)

- **Adoption:** App downloads and DAU
- **Retention:** 30-day retention rate >40%
- **Performance:** Average session length, time before first dice roll
- **Stability:** Crash-free sessions >99%, data loss incidents 0
- **Accessibility:** No accessibility-related negative reviews
- **User Feedback:** Net Promoter Score (NPS) >50

---

**Document Status:** Final  
**Last Updated:** 2026-03-19  
**Architecture Review:** Ready for implementation