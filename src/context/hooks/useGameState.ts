import { useContext } from 'react';

import { GameStateContext } from '../GameStateContext';

/**
 * Hook to access the global GameStateContext.
 *
 * Must be used within a {@link GameStateProvider}. Throws if called outside
 * of the provider tree so that missing providers are caught at development time.
 */
export function useGameState() {
  const context = useContext(GameStateContext);

  if (context === null) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }

  return context;
}
