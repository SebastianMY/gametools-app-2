import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { RootStackParamList } from '../../navigation/types';
import { SessionManager } from '../../services/storage/SessionManager';
import { useGameState } from './useGameState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Restores the last active game session on app launch (ADR-15, FR-S12).
 *
 * Must be called from a component rendered inside NavigationContainer so
 * that useNavigation() can access the navigation context.
 *
 * Behaviour:
 * - Waits for GameStateContext hydration to complete before acting.
 * - Runs once per app lifecycle (guarded by a ref).
 * - If the last game ID exists and the game is in the games array:
 *     sets it as currentGame and navigates to ScoreGame.
 * - If the last game ID exists but the game was deleted:
 *     navigates to ScoreHome and shows an alert (ADR-15).
 * - If no last game ID exists: does nothing; app starts on Home.
 *
 * The restore runs asynchronously and does not block the initial render,
 * keeping app startup time under 1 second.
 */
export function useSessionRestore(): void {
  const { games, loading, resumeGame } = useGameState();
  const navigation = useNavigation<NavigationProp>();
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    // Wait for context hydration before attempting restore
    if (loading) return;

    // Only restore once per app lifecycle to prevent repeated navigation
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const restore = async (): Promise<void> => {
      const lastGameId = await SessionManager.getLastGameId();
      if (!lastGameId) return;

      const game = games.find((g) => g.id === lastGameId);

      if (game) {
        // Game still exists — resume and navigate to it
        await resumeGame(game.id);
        navigation.navigate('ScoreGame', { gameId: game.id });
      } else {
        // Game was deleted — fall back to ScoreHome (ADR-15)
        await SessionManager.clearLastGameId();
        navigation.navigate('ScoreHome');
        Alert.alert('Last game was deleted; here are your saved games');
      }
    };

    restore().catch((error) => {
      console.error('[useSessionRestore] Failed to restore session:', error);
    });
  }, [loading, games, resumeGame, navigation]);
}
