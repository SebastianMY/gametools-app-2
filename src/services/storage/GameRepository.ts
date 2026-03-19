import { Game } from '../../types';
import { AsyncStorageService } from './AsyncStorageService';

const GAMES_KEY = '@games';
const LAST_ACTIVE_GAME_ID_KEY = '@lastActiveGameId';

/**
 * Repository for game-specific persistence operations.
 * Handles JSON serialization/deserialization and provides a typed API
 * over the raw key-value AsyncStorageService.
 */
export class GameRepository {
  /**
   * Serializes and persists the full games array to storage.
   * Atomically replaces the previous value.
   */
  static async saveGames(games: Game[]): Promise<void> {
    try {
      const serialized = JSON.stringify(games);
      await AsyncStorageService.setItem(GAMES_KEY, serialized);
    } catch (error) {
      console.error('[GameRepository] Failed to save games:', error);
      throw error;
    }
  }

  /**
   * Loads and deserializes the games array from storage.
   * Returns an empty array if no data is found or if parsing fails.
   */
  static async loadGames(): Promise<Game[]> {
    try {
      const raw = await AsyncStorageService.getItem(GAMES_KEY);
      if (raw === null) {
        return [];
      }
      return JSON.parse(raw) as Game[];
    } catch (error) {
      console.error('[GameRepository] Failed to load games:', error);
      return [];
    }
  }

  /**
   * Persists the ID of the most recently active game so it can be
   * restored on the next app launch.
   */
  static async saveLastGameId(gameId: string): Promise<void> {
    try {
      await AsyncStorageService.setItem(LAST_ACTIVE_GAME_ID_KEY, gameId);
    } catch (error) {
      console.error('[GameRepository] Failed to save last game ID:', error);
      throw error;
    }
  }

  /**
   * Retrieves the ID of the last active game.
   * Returns null if no session has been previously recorded.
   */
  static async loadLastGameId(): Promise<string | null> {
    try {
      return await AsyncStorageService.getItem(LAST_ACTIVE_GAME_ID_KEY);
    } catch (error) {
      console.error('[GameRepository] Failed to load last game ID:', error);
      return null;
    }
  }

  /**
   * Removes the last active game ID from storage.
   * Called when the referenced game is deleted (ADR-15).
   */
  static async deleteLastGameId(): Promise<void> {
    try {
      await AsyncStorageService.removeItem(LAST_ACTIVE_GAME_ID_KEY);
    } catch (error) {
      console.error('[GameRepository] Failed to delete last game ID:', error);
      throw error;
    }
  }
}
