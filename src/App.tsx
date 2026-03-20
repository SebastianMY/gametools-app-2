import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { GameStateProvider } from './context/GameStateContext';
import { useSessionRestore } from './context/hooks/useSessionRestore';
import RootNavigator from './navigation/RootNavigator';
import { theme } from './styles/theme';

/**
 * Inner component rendered inside NavigationContainer so that
 * useSessionRestore can call useNavigation() to access the navigation context.
 * Returns null — exists solely to trigger the session restore side-effect.
 */
function AppStartup(): null {
  useSessionRestore();
  return null;
}

/**
 * Root application component.
 *
 * Wraps the app with:
 *   - GameStateProvider     — global game state (games list, current game, persistence)
 *   - NavigationContainer   — provides navigation context to the whole tree
 *   - AppStartup            — restores the last active game session on launch (ADR-15)
 *
 * Deep linking is architecture-ready via the `linking` prop; a full
 * `LinkingOptions` configuration can be added once URL schemes are confirmed.
 */
export default function App(): React.JSX.Element {
  return (
    <GameStateProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={theme.colors.primary} />
        <AppStartup />
        <RootNavigator />
      </NavigationContainer>
    </GameStateProvider>
  );
}
