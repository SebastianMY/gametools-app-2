# Game Companion

A cross-platform mobile app for iOS and Android that provides essential tools for board game and card game players: a dice roller, score tracker, and multi-touch lottery picker.

> **Architecture document:** [docs/architecture/architecture_approved_0001.md](docs/architecture/architecture_approved_0001.md)
> **Specification:** [docs/requirements/spec_0001.md](docs/requirements/spec_0001.md)

---

## Features

### 🎲 Dice Roller
- Roll 1–6 standard six-sided dice (d6)
- Smooth spin animation with individual die results
- Running total prominently displayed
- Roll again instantly without resetting the count

### 📊 Score Tracker
- Create unlimited saved games with 2–8 players
- Quick increment / decrement buttons: +1, +5, +10 (and −1, −5, −10)
- Custom score entry via tap on the current score
- Automatic persistence — scores survive app restarts
- Resume any previous game from the saved games list
- Delete games with a confirmation prompt

### 🎯 Lottery (Player Picker)
- Full-screen multi-touch surface — each player places a finger
- Supports 2–8 simultaneous touches
- 3-second stability countdown resets if touches change
- Haptic feedback on countdown completion
- Random winner highlighted with grow animation; others fade out

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | React Native (via Expo ~52) |
| Build & Release | Expo EAS Build |
| Navigation | React Navigation v6 |
| State management | React Context + custom hooks |
| Persistence | AsyncStorage (key-value, JSON) |
| Animations | React Native Animated API |
| Multi-touch gestures | React Native Gesture Handler |
| Haptics | Expo Haptics |
| Linting | ESLint + Prettier |
| Testing | Jest + jest-expo |

---

## Getting Started

See **[docs/SETUP.md](docs/SETUP.md)** for full prerequisites and troubleshooting.

### Quick start

```bash
# 1. Clone the repository
git clone <repository-url>
cd game-companion

# 2. Install dependencies
npm install

# 3. Start the development server
npm start          # opens Expo Go / Metro bundler
npm run ios        # open in iOS simulator (requires Xcode on macOS)
npm run android    # open in Android emulator (requires Android Studio)
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Open on iOS simulator |
| `npm run android` | Open on Android emulator |
| `npm run web` | Open in browser (limited functionality) |
| `npm test` | Run Jest test suite |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Prettier format all source files |
| `npm run format:check` | Check formatting without writing |
| `npm run type-check` | TypeScript type check (no emit) |

---

## Building for Release

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for full Expo EAS Build instructions and App Store / Google Play submission steps.

```bash
# Install EAS CLI (once)
npm install -g eas-cli
eas login

# Build for iOS (TestFlight / App Store)
eas build --platform ios

# Build for Android (Google Play)
eas build --platform android
```

---

## Project Structure

```
game-companion/
├── App.tsx                     # Expo entry point
├── app.json                    # Expo configuration (name, version, bundle IDs)
├── src/
│   ├── App.tsx                 # Root component with Context providers
│   ├── context/                # GameStateContext + custom hooks
│   ├── navigation/             # React Navigation stack
│   ├── screens/                # Feature screens (Dice, Score, Lottery, Home)
│   ├── components/             # Reusable UI components per feature
│   ├── services/               # Business logic (DiceRoller, LotteryEngine, Storage)
│   ├── types/                  # TypeScript interfaces (Game, Player, Touch)
│   ├── utils/                  # Colors, animations, accessibility helpers
│   └── styles/                 # Design tokens, responsive utilities
├── __tests__/                  # Jest test suite
└── docs/                       # Project documentation
```

Full folder structure with file descriptions: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Contributing

See **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** for the branching strategy, commit conventions, and pull request process.

---

## License

MIT — see [LICENSE](LICENSE) for details.
