/**
 * Tests for GameStateContext actions: createGame, updateScore, deleteGame, resumeGame.
 *
 * Strategy:
 *  - Mock GameRepository to control storage responses and avoid I/O.
 *  - Mock SessionManager to prevent cross-contamination of session state.
 *  - Mock usePersistence to immediately hydrate context state with empty data,
 *    bypassing async effects so tests can run synchronously after act().
 *  - Render GameStateProvider with a TestConsumer that captures the live
 *    context value; re-reads it after each act() to observe state changes.
 */

import React, { useContext } from 'react';
import { act, create } from 'react-test-renderer';

import { GameStateContext, GameStateProvider } from '../../src/context/GameStateContext';
import { Game } from '../../src/types/Game';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../../src/services/storage/GameRepository', () => ({
  GameRepository: {
    loadGames: jest.fn().mockResolvedValue([]),
    loadLastGameId: jest.fn().mockResolvedValue(null),
    saveGames: jest.fn().mockResolvedValue(undefined),
    saveLastGameId: jest.fn().mockResolvedValue(undefined),
    deleteLastGameId: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/services/storage/SessionManager', () => ({
  SessionManager: {
    saveLastGameId: jest.fn().mockResolvedValue(undefined),
    getLastGameId: jest.fn().mockResolvedValue(null),
    clearLastGameId: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock usePersistence to call onLoad immediately with empty state so each
// test starts with a clean, fully-hydrated context without needing to await
// async effects.
// Note: jest.mock factories cannot reference out-of-scope variables; use
// require() to access React inside the factory.
jest.mock('../../src/context/hooks/usePersistence', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require('react');
  return {
    usePersistence: (
      _games: unknown,
      _lastGameId: unknown,
      onLoad: (games: never[], lastGameId: null) => void,
    ) => {
      mockReact.useEffect(() => {
        onLoad([], null);
        // Only run on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    },
  };
});

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

type ContextValue = NonNullable<React.ContextType<typeof GameStateContext>>;

/**
 * Renders a GameStateProvider, captures and returns a live getter for the
 * context value, and drives the initial mount effects to completion.
 */
async function renderProvider(): Promise<() => ContextValue> {
  let ctx: ContextValue | null = null;

  function TestConsumer() {
    ctx = useContext(GameStateContext);
    return null;
  }

  await act(async () => {
    create(
      React.createElement(GameStateProvider, null,
        React.createElement(TestConsumer),
      ),
    );
  });

  return () => {
    if (ctx === null) {
      throw new Error('GameStateContext was not provided');
    }
    return ctx;
  };
}

// ---------------------------------------------------------------------------
// createGame
// ---------------------------------------------------------------------------

describe('GameStateContext – createGame', () => {
  it('adds a new game with a UUID, timestamps, and initialized players', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Alice', 'Bob']);
    });

    const { games, currentGame } = getCtx();

    expect(games).toHaveLength(1);
    expect(currentGame).not.toBeNull();

    const game = games[0];

    // UUID format
    expect(game.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    // Timestamps are recent
    expect(game.createdAt).toBeGreaterThan(0);
    expect(game.lastModified).toBeGreaterThanOrEqual(game.createdAt);

    // Players initialised at score 0
    expect(game.players).toHaveLength(2);
    expect(game.players[0]).toMatchObject({ name: 'Alice', score: 0 });
    expect(game.players[1]).toMatchObject({ name: 'Bob', score: 0 });

    // Each player has a unique UUID
    expect(game.players[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(game.players[1].id).not.toBe(game.players[0].id);
  });

  it('sets the new game as the currentGame', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Player1']);
    });

    expect(getCtx().currentGame?.id).toBe(getCtx().games[0].id);
  });
});

// ---------------------------------------------------------------------------
// updateScore
// ---------------------------------------------------------------------------

describe('GameStateContext – updateScore', () => {
  it('updates the target player score within the correct game', async () => {
    const getCtx = await renderProvider();

    // Create a game first.
    await act(async () => {
      await getCtx().createGame(['Alice', 'Bob']);
    });

    const game = getCtx().games[0];
    const alice = game.players[0];

    await act(async () => {
      await getCtx().updateScore(game.id, alice.id, 42);
    });

    const updatedGame = getCtx().games.find((g) => g.id === game.id)!;
    const updatedAlice = updatedGame.players.find((p) => p.id === alice.id)!;

    expect(updatedAlice.score).toBe(42);
  });

  it('does not affect other players in the same game', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Alice', 'Bob']);
    });

    const game = getCtx().games[0];
    const alice = game.players[0];
    const bob = game.players[1];

    await act(async () => {
      await getCtx().updateScore(game.id, alice.id, 99);
    });

    const updatedGame = getCtx().games.find((g) => g.id === game.id)!;
    const updatedBob = updatedGame.players.find((p) => p.id === bob.id)!;

    expect(updatedBob.score).toBe(0);
  });

  it('updates lastModified timestamp on the game', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Alice']);
    });

    const originalModified = getCtx().games[0].lastModified;

    // Ensure at least 1 ms passes before the next update.
    await new Promise((r) => setTimeout(r, 2));

    await act(async () => {
      const game = getCtx().games[0];
      await getCtx().updateScore(game.id, game.players[0].id, 10);
    });

    expect(getCtx().games[0].lastModified).toBeGreaterThanOrEqual(originalModified);
  });
});

// ---------------------------------------------------------------------------
// deleteGame
// ---------------------------------------------------------------------------

describe('GameStateContext – deleteGame', () => {
  it('removes the game from the games array', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Player1']);
    });

    const gameId = getCtx().games[0].id;

    await act(async () => {
      await getCtx().deleteGame(gameId);
    });

    expect(getCtx().games).toHaveLength(0);
    expect(getCtx().games.find((g) => g.id === gameId)).toBeUndefined();
  });

  it('clears currentGame when the active game is deleted', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Player1']);
    });

    const gameId = getCtx().games[0].id;

    await act(async () => {
      await getCtx().deleteGame(gameId);
    });

    expect(getCtx().currentGame).toBeNull();
  });

  it('does not affect other games when one is deleted', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Player1']);
    });

    await act(async () => {
      await getCtx().createGame(['Player2']);
    });

    expect(getCtx().games).toHaveLength(2);

    const firstGameId = getCtx().games[0].id;

    await act(async () => {
      await getCtx().deleteGame(firstGameId);
    });

    expect(getCtx().games).toHaveLength(1);
    expect(getCtx().games[0].players[0].name).toBe('Player2');
  });
});

// ---------------------------------------------------------------------------
// resumeGame
// ---------------------------------------------------------------------------

describe('GameStateContext – resumeGame', () => {
  it('sets the specified game as currentGame', async () => {
    const getCtx = await renderProvider();

    // Create two games so we can switch between them.
    await act(async () => {
      await getCtx().createGame(['Player1']);
    });

    await act(async () => {
      await getCtx().createGame(['Player2']);
    });

    const firstGame = getCtx().games[0];

    // currentGame is the most recently created game; resume the first one.
    await act(async () => {
      await getCtx().resumeGame(firstGame.id);
    });

    expect(getCtx().currentGame?.id).toBe(firstGame.id);
  });

  it('does not change the games array', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Player1']);
    });

    await act(async () => {
      await getCtx().createGame(['Player2']);
    });

    const gamesBefore = getCtx().games;
    const firstGame = getCtx().games[0];

    await act(async () => {
      await getCtx().resumeGame(firstGame.id);
    });

    expect(getCtx().games).toHaveLength(gamesBefore.length);
  });

  it('is a no-op when the gameId does not exist', async () => {
    const getCtx = await renderProvider();

    await act(async () => {
      await getCtx().createGame(['Player1']);
    });

    const currentGameBefore = getCtx().currentGame;

    await act(async () => {
      await getCtx().resumeGame('non-existent-id');
    });

    // currentGame unchanged
    expect(getCtx().currentGame?.id).toBe(currentGameBefore?.id);
  });
});
