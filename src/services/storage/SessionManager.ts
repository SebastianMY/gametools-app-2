import { AsyncStorageService } from './AsyncStorageService';

const LAST_ACTIVE_GAME_ID_KEY = '@lastActiveGameId';

/**
 * Manages session persistence for the last active game.
 *
 * Stores and retrieves the ID of the most recently active game so the app
 * can restore the user's session on launch (ADR-15).
 *
 * Uses the same storage key as GameRepository to remain consistent with the
 * shared persisted state; this class is the dedicated interface for session
 * operations called from useSessionRestore and GameStateContext.
 */
export class SessionManager {
  /**
   * Persists the ID of the last active game to storage.
   */
  static async saveLastGameId(gameId: string): Promise<void> {
    try {
      await AsyncStorageService.setItem(LAST_ACTIVE_GAME_ID_KEY, gameId);
    } catch (error) {
      console.error('[SessionManager] Failed to save last game ID:', error);
      throw error;
    }
  }

  /**
   * Retrieves the ID of the last active game.
   * Returns null if no previous session was recorded.
   */
  static async getLastGameId(): Promise<string | null> {
    try {
      return await AsyncStorageService.getItem(LAST_ACTIVE_GAME_ID_KEY);
    } catch (error) {
      console.error('[SessionManager] Failed to get last game ID:', error);
      return null;
    }
  }

  /**
   * Removes the last active game ID from storage.
   * Called when the referenced game has been deleted (ADR-15).
   */
  static async clearLastGameId(): Promise<void> {
    try {
      await AsyncStorageService.removeItem(LAST_ACTIVE_GAME_ID_KEY);
    } catch (error) {
      console.error('[SessionManager] Failed to clear last game ID:', error);
      throw error;
    }
  }
}
