/**
 * Jest configuration for the game-companion React Native app.
 *
 * Uses the jest-expo preset which handles React Native module transforms,
 * Expo module mocking, and the correct test environment for RN components.
 */
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  // Per-directory thresholds for the core business logic that has unit tests.
  // Screens, navigation, and UI components are excluded from enforcement here
  // as they require integration/e2e tests (Detox, planned for v1.1).
  coverageThreshold: {
    './src/services/dice/DiceRoller.ts': {
      lines: 80,
      functions: 80,
    },
    './src/services/lottery/LotteryEngine.ts': {
      lines: 80,
      functions: 80,
    },
    './src/services/storage/AsyncStorageService.ts': {
      lines: 80,
      functions: 80,
    },
    './src/context/GameStateContext.tsx': {
      lines: 70,
      functions: 70,
    },
  },
};
