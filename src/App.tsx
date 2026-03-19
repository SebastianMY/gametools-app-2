import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import RootNavigator from './navigation/RootNavigator';
import { theme } from './styles/theme';

/**
 * Root application component.
 *
 * Wraps the app with:
 *   - NavigationContainer   — provides navigation context to the whole tree
 *   - Provider stubs        — placeholders for GameStateContext (TASK-007)
 *                             and any additional context providers (TASK-008)
 *
 * Deep linking is architecture-ready via the `linking` prop; a full
 * `LinkingOptions` configuration can be added once URL schemes are confirmed.
 */
export default function App(): React.JSX.Element {
  return (
    // GameStateContext.Provider will be inserted here by TASK-007
    // Additional context providers (e.g., ThemeContext) added by TASK-008
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <RootNavigator />
    </NavigationContainer>
  );
}
