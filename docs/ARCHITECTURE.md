# Architecture Overview

> **Full architecture document (canonical reference):**
> [`docs/architecture/architecture_approved_0001.md`](architecture/architecture_approved_0001.md)
>
> This file is a navigational summary. All design decisions are recorded in the canonical document above.

---

## Architectural Style

**Modular Monolith with Feature-Based Organization**

Game Companion is a single React Native application organized by feature (Dice, Score, Lottery) rather than by technical layer. All features share one navigation stack, one state management layer, and one local storage implementation. There is no backend, no cloud sync, and no network dependency of any kind.

---

## Folder Structure

```
game-companion/
├── App.tsx                              # Expo entry point
├── app.json                             # Expo configuration (version, bundle IDs, SDK)
├── package.json                         # Dependencies and npm scripts
├── tsconfig.json                        # TypeScript configuration
│
├── src/
│   ├── App.tsx                          # Root component; mounts Context providers + Navigator
│   │
│   ├── context/
│   │   ├── GameStateContext.tsx         # Global game state (games list, current game)
│   │   └── hooks/
│   │       ├── useGameState.ts          # Typed hook to access GameStateContext
│   │       ├── usePersistence.ts        # Debounced AsyncStorage write effect
│   │       └── useSessionRestore.ts     # Restores last active game on app launch
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx            # React Navigation native stack definition
│   │   └── types.ts                     # Navigation param list types
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx               # Main menu — links to Dice, Score, Lottery
│   │   ├── dice/
│   │   │   └── DiceScreen.tsx           # Dice rolling interface
│   │   ├── score/
│   │   │   ├── ScoreHomeScreen.tsx      # Saved games list
│   │   │   ├── ScoreGameScreen.tsx      # Active game with per-player score controls
│   │   │   ├── NewGameDialog.tsx        # Modal — enter player names
│   │   │   └── GameDeleteModal.tsx      # Confirmation dialog for game deletion
│   │   └── lottery/
│   │       └── LotteryScreen.tsx        # Multi-touch player selection surface
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx               # Reusable accessible button
│   │   │   ├── Card.tsx                 # Card container
│   │   │   ├── TextInput.tsx            # Accessible text input with label
│   │   │   └── ScreenContainer.tsx      # SafeAreaView + consistent padding wrapper
│   │   ├── dice/
│   │   │   ├── DiceDisplay.tsx          # Single die value display
│   │   │   ├── DiceCountSelector.tsx    # +/− selector for dice count
│   │   │   └── RollAnimation.tsx        # Spinning animation overlay
│   │   ├── score/
│   │   │   ├── PlayerRow.tsx            # Player name + score + increment controls
│   │   │   ├── ScoreIncrement.tsx       # +1 / +5 / +10 button group
│   │   │   └── GameListItem.tsx         # Saved game row in the games list
│   │   └── lottery/
│   │       ├── TouchCircle.tsx          # Colored circle per active finger
│   │       ├── TouchSurface.tsx         # Full-screen touch tracking surface
│   │       └── WinnerAnnouncement.tsx   # Winner display with grow animation
│   │
│   ├── services/
│   │   ├── storage/
│   │   │   ├── AsyncStorageService.ts   # Low-level AsyncStorage read/write
│   │   │   ├── GameRepository.ts        # Game-specific serialization/deserialization
│   │   │   └── SessionManager.ts        # Last-active-game-ID persistence
│   │   ├── dice/
│   │   │   └── DiceRoller.ts            # RNG algorithm: rollDice(count) → number[]
│   │   └── lottery/
│   │       └── LotteryEngine.ts         # Touch tracking + stability + winner selection
│   │
│   ├── types/
│   │   ├── Game.ts                      # Game interface (id, name, createdAt, players)
│   │   ├── Player.ts                    # Player interface (id, name, score)
│   │   ├── Touch.ts                     # Multi-touch tracking types
│   │   └── Navigation.ts                # Navigation param list re-exports
│   │
│   ├── utils/
│   │   ├── colors.ts                    # WCAG AA compliant color palette
│   │   ├── animations.ts                # Reusable Animated.Value configurations
│   │   ├── accessibility.ts             # Contrast check helpers, a11y labels
│   │   ├── constants.ts                 # App-wide constants (max players, debounce ms)
│   │   └── uuid.ts                      # UUID v4 generation
│   │
│   └── styles/
│       ├── theme.ts                     # Design tokens (colors, spacing, typography)
│       ├── globalStyles.ts              # Shared StyleSheet definitions
│       └── responsive.ts               # useWindowDimensions breakpoints and helpers
│
└── __tests__/
    ├── context/
    │   └── GameStateContext.test.ts
    ├── services/
    │   ├── AsyncStorageService.test.ts
    │   ├── DiceRoller.test.ts
    │   └── LotteryEngine.test.ts
    └── components/
        └── PlayerRow.test.tsx
```

---

## Key Design Decisions (ADRs)

All ADRs are recorded in full in [`architecture_approved_0001.md`](architecture/architecture_approved_0001.md). Summary below:

| ADR | Decision | Status |
|---|---|---|
| ADR-1 | React Context + custom hooks (not Redux/Zustand) for state management | Accepted |
| ADR-2 | AsyncStorage for persistence (not SQLite) | Accepted |
| ADR-3 | React Native Gesture Handler for multi-touch lottery | Accepted |
| ADR-4 | React Native Animated API for animations (not Reanimated 2) | Accepted |
| ADR-5 | Modular monolith — feature-based folder structure | Accepted |
| ADR-6 | Automatic persistence via debounced Context subscription (500 ms) | Accepted |
| ADR-7 | Expo EAS Build for iOS and Android (no local native build) | Accepted |
| ADR-8 | Navigation state stays in React Navigation, not Context | Accepted |
| ADR-9 | Fixed score increment buttons (+1, +5, +10) — no custom increments in v1 | Accepted |
| ADR-10 | Optional game names with auto-generated "Game from [Date]" labels | Accepted |
| ADR-11 | No undo functionality in v1 | Accepted |
| ADR-12 | Hard limit of 8 simultaneous touches in Lottery | Accepted |
| ADR-13 | d6 (six-sided dice) only in v1 | Accepted |
| ADR-14 | Single standard haptic pattern (100 ms medium vibration) | Accepted |
| ADR-15 | Graceful fallback to Score Home if last session game was deleted | Accepted |
| ADR-16 | Landscape orientation support via `useWindowDimensions()` | Accepted |
| ADR-17 | WCAG AA accessibility on all screens, no exemptions | Accepted |
| ADR-18 | Responsive layout scaling for v1; tablet-optimized layouts deferred to v2 | Accepted |

---

## Data Model

### Entities

| Entity | Fields | Storage |
|---|---|---|
| **Game** | `id` (UUID), `name` (string, optional), `createdAt` (ms timestamp), `lastModified` (ms timestamp), `players` (Player[]) | AsyncStorage key `@games` |
| **Player** | `id` (UUID), `name` (string, 1–50 chars), `score` (number, −999999 to 999999) | Nested inside Game |

### AsyncStorage Schema

**Key: `@games`** — JSON array of all saved Game objects.

```json
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
  }
]
```

**Key: `@lastActiveGameId`** — UUID string of the game to auto-restore on launch.

Dice results and Lottery outcomes are **not persisted** — they are ephemeral UI state.

---

## Component Interfaces

### GameStateContext API

```typescript
// Hook — read state
useGameState(): {
  games: Game[];
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
}

// Actions
createGame(playerNames: string[]): Promise<Game>
updateScore(gameId: string, playerId: string, newScore: number): Promise<void>
resumeGame(gameId: string): Promise<void>
deleteGame(gameId: string): Promise<void>
clearCurrentGame(): void
loadLastSession(): Promise<void>   // Called on app init
```

### Service Layer

```typescript
// DiceRoller
rollDice(count: number): number[]            // count 1–6; returns [1–6] values

// LotteryEngine
trackTouches(touches: TouchEvent[]): Touch[]
isStable(touches: Touch[], durationMs: number): boolean
selectWinner(touches: Touch[]): Touch

// AsyncStorageService
saveGames(games: Game[]): Promise<void>
loadGames(): Promise<Game[]>
saveLastGameId(gameId: string): Promise<void>
loadLastGameId(): Promise<string | null>
clearAll(): Promise<void>                    // Test utility
```

---

## Design Principles

1. **Simplicity First** — prefer built-in React Native APIs over third-party libraries unless a requirement demands otherwise.
2. **Offline by Default** — all data stored locally; no network assumptions.
3. **Persist Automatically** — game state saves without user action (FR-S7, FR-S12).
4. **Accessible from the Start** — WCAG AA compliance is a first-class requirement, not a retrofit.
5. **Single Device, Single App** — no syncing, no accounts, no cloud.
6. **Fast Onboarding** — UI is self-explanatory within 30 seconds.
