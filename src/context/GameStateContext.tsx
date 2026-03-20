import React, {
  createContext,
  useCallback,
  useMemo,
  useReducer,
} from 'react';

import { GameRepository } from '../services/storage/GameRepository';
import { SessionManager } from '../services/storage/SessionManager';
import { Game, Player } from '../types';
import { usePersistence } from './hooks/usePersistence';

// ---------------------------------------------------------------------------
// UUID helper (RFC 4122 v4, no external dependency required)
// ---------------------------------------------------------------------------

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface GameStateContextValue {
  games: Game[];
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
  createGame: (playerNames: string[]) => Promise<void>;
  updateScore: (gameId: string, playerId: string, newScore: number) => Promise<void>;
  resumeGame: (gameId: string) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  clearCurrentGame: () => void;
  loadLastSession: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

interface State {
  games: Game[];
  currentGame: Game | null;
  lastGameId: string | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'HYDRATE'; games: Game[]; lastGameId: string | null }
  | { type: 'SET_GAMES'; games: Game[] }
  | { type: 'SET_CURRENT_GAME'; game: Game | null }
  | { type: 'SET_LAST_GAME_ID'; id: string | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        games: action.games,
        lastGameId: action.lastGameId,
        loading: false,
      };
    case 'SET_GAMES':
      return { ...state, games: action.games };
    case 'SET_CURRENT_GAME':
      return { ...state, currentGame: action.game };
    case 'SET_LAST_GAME_ID':
      return { ...state, lastGameId: action.id };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

const initialState: State = {
  games: [],
  currentGame: null,
  lastGameId: null,
  loading: true,
  error: null,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const GameStateContext = createContext<GameStateContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface GameStateProviderProps {
  children: React.ReactNode;
}

export function GameStateProvider({ children }: GameStateProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);

  // -------------------------------------------------------------------------
  // Persistence hook – hydrates state on mount, debounces writes on change
  // -------------------------------------------------------------------------

  const handleLoad = useCallback(
    (loadedGames: Game[], loadedLastGameId: string | null) => {
      dispatch({ type: 'HYDRATE', games: loadedGames, lastGameId: loadedLastGameId });
    },
    [],
  );

  usePersistence(state.games, state.lastGameId, handleLoad);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /**
   * Creates a new game, initialising every player at score 0.
   * Generates UUIDs for both the game and each player.
   */
  const createGame = useCallback(
    async (playerNames: string[]): Promise<void> => {
      const now = Date.now();
      const players: Player[] = playerNames.map((name) => ({
        id: generateUUID(),
        name,
        score: 0,
      }));

      const newGame: Game = {
        id: generateUUID(),
        createdAt: now,
        lastModified: now,
        players,
      };

      const updatedGames = [...state.games, newGame];

      try {
        await GameRepository.saveGames(updatedGames);
        await GameRepository.saveLastGameId(newGame.id);
        dispatch({ type: 'SET_GAMES', games: updatedGames });
        dispatch({ type: 'SET_CURRENT_GAME', game: newGame });
        dispatch({ type: 'SET_LAST_GAME_ID', id: newGame.id });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: 'Failed to create game.' });
      }
    },
    [state.games],
  );

  /**
   * Updates a single player's score within the current game and persists.
   */
  const updateScore = useCallback(
    async (gameId: string, playerId: string, newScore: number): Promise<void> => {
      const gameIndex = state.games.findIndex((g) => g.id === gameId);
      if (gameIndex === -1) return;

      const game = state.games[gameIndex];
      const playerIndex = game.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return;

      const updatedPlayers = game.players.map((p) =>
        p.id === playerId ? { ...p, score: newScore } : p,
      );

      const updatedGame: Game = {
        ...game,
        players: updatedPlayers,
        lastModified: Date.now(),
      };

      const updatedGames = state.games.map((g) =>
        g.id === gameId ? updatedGame : g,
      );

      try {
        await GameRepository.saveGames(updatedGames);
        dispatch({ type: 'SET_GAMES', games: updatedGames });

        // Keep currentGame in sync if it is the modified game
        if (state.currentGame?.id === gameId) {
          dispatch({ type: 'SET_CURRENT_GAME', game: updatedGame });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: 'Failed to update score.' });
      }
    },
    [state.games, state.currentGame],
  );

  /**
   * Loads a game from the games array and sets it as the current active game.
   * Also persists the game ID via SessionManager so it can be restored on
   * the next app launch (ADR-15).
   */
  const resumeGame = useCallback(
    async (gameId: string): Promise<void> => {
      const game = state.games.find((g) => g.id === gameId);
      if (!game) return;

      try {
        await GameRepository.saveLastGameId(gameId);
        await SessionManager.saveLastGameId(gameId);
        dispatch({ type: 'SET_CURRENT_GAME', game });
        dispatch({ type: 'SET_LAST_GAME_ID', id: gameId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: 'Failed to resume game.' });
      }
    },
    [state.games],
  );

  /**
   * Removes a game from the list, persists the change, and clears
   * currentGame if the deleted game was the active one (ADR-15).
   */
  const deleteGame = useCallback(
    async (gameId: string): Promise<void> => {
      const updatedGames = state.games.filter((g) => g.id !== gameId);

      try {
        await GameRepository.saveGames(updatedGames);
        dispatch({ type: 'SET_GAMES', games: updatedGames });

        if (state.currentGame?.id === gameId) {
          dispatch({ type: 'SET_CURRENT_GAME', game: null });
          dispatch({ type: 'SET_LAST_GAME_ID', id: null });
          await GameRepository.deleteLastGameId();
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: 'Failed to delete game.' });
      }
    },
    [state.games, state.currentGame],
  );

  /**
   * Clears the current game without affecting the saved games list.
   * Returns the user to the Score Home screen (ADR-8).
   */
  const clearCurrentGame = useCallback((): void => {
    dispatch({ type: 'SET_CURRENT_GAME', game: null });
  }, []);

  /**
   * Attempts to restore the last active game on app launch.
   * Falls back gracefully if the game no longer exists (ADR-15).
   */
  const loadLastSession = useCallback(async (): Promise<void> => {
    try {
      const lastGameId = await GameRepository.loadLastGameId();
      if (!lastGameId) return;

      const game = state.games.find((g) => g.id === lastGameId);
      if (game) {
        dispatch({ type: 'SET_CURRENT_GAME', game });
        dispatch({ type: 'SET_LAST_GAME_ID', id: lastGameId });
      } else {
        // Game was deleted — clear stale reference (ADR-15)
        await GameRepository.deleteLastGameId();
        dispatch({ type: 'SET_LAST_GAME_ID', id: null });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to load last session.' });
    }
  }, [state.games]);

  // -------------------------------------------------------------------------
  // Memoised context value
  // -------------------------------------------------------------------------

  const value = useMemo<GameStateContextValue>(
    () => ({
      games: state.games,
      currentGame: state.currentGame,
      loading: state.loading,
      error: state.error,
      createGame,
      updateScore,
      resumeGame,
      deleteGame,
      clearCurrentGame,
      loadLastSession,
    }),
    [
      state.games,
      state.currentGame,
      state.loading,
      state.error,
      createGame,
      updateScore,
      resumeGame,
      deleteGame,
      clearCurrentGame,
      loadLastSession,
    ],
  );

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}
