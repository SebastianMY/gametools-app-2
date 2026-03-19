import { Player } from './Player';

/**
 * Represents a saved game session.
 * Games are stored as JSON in AsyncStorage under the key `@games`.
 */
export interface Game {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Optional user-provided name. Defaults to "Game from [Month Day, Year]" if not set. */
  name?: string;
  /** Unix timestamp (ms) when the game was created */
  createdAt: number;
  /** Unix timestamp (ms) when the game was last modified */
  lastModified: number;
  /** List of players in this game (2–8 players) */
  players: Player[];
}
