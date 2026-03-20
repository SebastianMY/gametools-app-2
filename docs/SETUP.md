# Setup Guide

This guide walks through setting up the Game Companion development environment from scratch.

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.x LTS | [nodejs.org](https://nodejs.org) — use `nvm` for version management |
| npm | 9.x | Bundled with Node.js |
| Expo CLI | Latest | Installed globally via `npm install -g expo-cli` |
| EAS CLI | Latest | Required for production builds — `npm install -g eas-cli` |
| Git | 2.x | [git-scm.com](https://git-scm.com) |
| Watchman | Any | macOS/Linux only; speeds up Metro — `brew install watchman` |

### For iOS development (macOS only)
- Xcode 15+ (install from Mac App Store)
- Xcode Command Line Tools: `xcode-select --install`
- iOS Simulator included with Xcode

### For Android development
- Android Studio Hedgehog or later
- Android SDK (API level 30+, matching `minSdkVersion` in `app.json`)
- Set `ANDROID_HOME` environment variable to your SDK path

---

## Step-by-Step Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd game-companion
```

### 2. Install dependencies

```bash
npm install
```

This installs all runtime and dev dependencies declared in `package.json`.

### 3. Verify the environment

```bash
npx expo doctor
```

Expo Doctor reports any missing tools or configuration issues. Fix any errors before continuing.

### 4. Start the development server

```bash
npm start
```

The Metro bundler starts and displays a QR code plus menu options:

- Press **`i`** — open iOS Simulator
- Press **`a`** — open Android emulator
- Press **`w`** — open in browser (limited support)
- Scan the QR code with the **Expo Go** app on a physical device

### 5. Run on a specific platform

```bash
npm run ios       # iOS Simulator (macOS only, requires Xcode)
npm run android   # Android emulator (requires Android Studio + emulator running)
```

---

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npx jest --coverage
```

Tests live in `__tests__/` and mirror the `src/` folder structure. Coverage must remain above **80%** per the release checklist.

---

## Running the Linter

```bash
# Check for lint errors
npm run lint

# Auto-fix fixable issues
npm run lint:fix
```

ESLint is configured in `.eslintrc.json` and covers TypeScript + React + React Hooks rules.

```bash
# Check code formatting
npm run format:check

# Format all source files
npm run format
```

Prettier is configured in `.prettierrc.json`.

---

## TypeScript Type Check

```bash
npm run type-check
```

Runs `tsc --noEmit` using `tsconfig.json`. No compilation output is produced — only type errors are reported.

---

## Troubleshooting

### Metro bundler does not start

1. Ensure Node.js ≥18: `node --version`
2. Delete the Metro cache: `npx expo start --clear`
3. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

### iOS Simulator not available

- Confirm Xcode is installed: `xcode-select -p`
- If path is wrong: `sudo xcode-select --switch /Applications/Xcode.app`
- Open Xcode → Settings → Platforms and download an iOS runtime

### Android emulator not detected

- Ensure Android Studio is installed and an AVD (Android Virtual Device) is created
- Start the emulator before running `npm run android`
- Check `ANDROID_HOME` is set: `echo $ANDROID_HOME`
- Add `$ANDROID_HOME/emulator` and `$ANDROID_HOME/platform-tools` to your `PATH`

### `npm install` fails with permission errors

On macOS/Linux, avoid `sudo npm install`. Use `nvm` to install Node.js under your user account instead.

### AsyncStorage errors in tests

The test environment mocks `@react-native-async-storage/async-storage` automatically via `jest-expo`. If you see import errors, verify the `transformIgnorePatterns` in `package.json` includes the async-storage package.

### Expo Go QR code does not connect on physical device

- Ensure your development machine and phone are on the same Wi-Fi network
- Disable any VPN that may block local traffic
- Switch to tunnel mode: `npx expo start --tunnel` (requires `ngrok`)

---

## Environment Variables

The project currently has **no required environment variables** — all configuration is embedded in `app.json` and `package.json`.

If future secrets are needed, create a `.env` file (never commit it) and load values via `expo-constants` or a similar approach.
