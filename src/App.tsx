import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { GameStateProvider } from './context/GameStateContext';
import RootNavigator from './navigation/RootNavigator';
import { theme } from './styles/theme';

/**
 * Root application component.
 *
 * Wraps the app with:
 *   - GameStateProvider     — global game state (games list, current game, persistence)
 *   - NavigationContainer   — provides navigation context to the whole tree
 *
 * Deep linking is architecture-ready via the `linking` prop; a full
 * `LinkingOptions` configuration can be added once URL schemes are confirmed.
 */
export default function App(): React.JSX.Element {
  return (
    <GameStateProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={theme.colors.primary} />
        <RootNavigator />
      </NavigationContainer>
    </GameStateProvider>
  );
}
