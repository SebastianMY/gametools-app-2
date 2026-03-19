/**
 * Represents a player within a game session.
 * Players have no independent identity outside of a Game.
 */
export interface Player {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Player display name (1–50 characters) */
  name: string;
  /** Current score; can be negative (range: -999999 to 999999) */
  score: number;
}
