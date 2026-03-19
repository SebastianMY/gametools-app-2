/**
 * AsyncStorage keys used throughout the application.
 */
export const STORAGE_KEYS = {
  GAMES: '@games',
  LAST_ACTIVE_GAME_ID: '@lastActiveGameId',
} as const;

/** Fixed score increment/decrement values (ADR-9) */
export const SCORE_INCREMENTS = [1, 5, 10] as const;
export const SCORE_DECREMENTS = [-1, -5, -10] as const;

/** Player count constraints */
export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;

/** Dice count constraints (d6 only per ADR-13) */
export const MAX_DICE = 6;
export const MIN_DICE = 1;

/** Lottery touch stability duration in milliseconds (FR-L4) */
export const LOTTERY_STABILITY_MS = 3_000;

/** Maximum simultaneous touches tracked in Lottery (ADR-12) */
export const MAX_LOTTERY_TOUCHES = 8;

/** Debounce delay for AsyncStorage writes (ADR-6) */
export const PERSISTENCE_DEBOUNCE_MS = 500;

/** Maximum length of a player name (FR-S2) */
export const PLAYER_NAME_MAX_LENGTH = 50;

/** Haptic feedback duration in milliseconds (ADR-14) */
export const HAPTIC_DURATION_MS = 100;

/** Minimum score boundary */
export const SCORE_MIN = -999_999;

/** Maximum score boundary */
export const SCORE_MAX = 999_999;
