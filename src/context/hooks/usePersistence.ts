import { useEffect, useRef } from 'react';

import { GameRepository } from '../../services/storage/GameRepository';
import { Game } from '../../types';

/**
 * Custom hook that automatically persists the games array to AsyncStorage
 * with debouncing to prevent excessive I/O (FR-S7, ADR-6).
 *
 * @param games       - Current games array from GameStateContext state.
 * @param lastGameId  - ID of the last active game to persist for session restoration.
 * @param onLoad      - Callback invoked on mount with games and lastGameId loaded from
 *                      storage. Allows GameStateContext to hydrate its state without
 *                      blocking the initial render (async effect).
 * @param debounceMs  - Debounce window in milliseconds (default: 500 ms). Writes are
 *                      coalesced so only the final state within each window is saved.
 */
export function usePersistence(
  games: Game[],
  lastGameId: string | null,
  onLoad: (games: Game[], lastGameId: string | null) => void,
  debounceMs: number = 500,
): void {
  // Keep a stable reference to the latest onLoad callback so the mount
  // effect does not need onLoad as a dependency (avoids re-running if the
  // caller re-creates the function on every render).
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  // --- Mount: load persisted state and hydrate context ---
  useEffect(() => {
    let cancelled = false;

    const loadPersistedData = async (): Promise<void> => {
      try {
        const [loadedGames, loadedLastGameId] = await Promise.all([
          GameRepository.loadGames(),
          GameRepository.loadLastGameId(),
        ]);

        if (!cancelled) {
          onLoadRef.current(loadedGames, loadedLastGameId);
        }
      } catch (error) {
        // Log only — no UI error for persistence failures (ADR-6)
        console.error('[usePersistence] Failed to load persisted data:', error);
      }
    };

    loadPersistedData();

    return () => {
      cancelled = true;
    };
    // Run only on mount; onLoadRef is a stable ref so it is safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Debounced save: persist whenever games changes ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      GameRepository.saveGames(games).catch((error) => {
        // Log only — no UI error for persistence failures (ADR-6)
        console.error('[usePersistence] Failed to save games:', error);
      });
    }, debounceMs);

    // Cancel the pending timeout when games changes again or on unmount.
    return () => {
      clearTimeout(timerId);
    };
  }, [games, debounceMs]);

  // --- Persist lastGameId whenever it changes ---
  useEffect(() => {
    if (lastGameId === null) {
      return;
    }

    GameRepository.saveLastGameId(lastGameId).catch((error) => {
      console.error('[usePersistence] Failed to save last game ID:', error);
    });
  }, [lastGameId]);
}
