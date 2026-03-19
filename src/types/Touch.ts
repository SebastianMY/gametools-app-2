/**
 * Represents a single tracked touch point in the Lottery feature.
 */
export interface Touch {
  /** Unique identifier for this touch point */
  id: string;
  /** X coordinate on screen */
  x: number;
  /** Y coordinate on screen */
  y: number;
  /** Unix timestamp (ms) of the last position update */
  timestamp: number;
  /** Assigned display color (WCAG AA compliant) */
  color: string;
}

/**
 * Encapsulates the current state of the Lottery touch tracking surface.
 */
export interface TouchState {
  /** All currently active touch points */
  touches: Touch[];
  /** Whether all touches have been stable for the required duration */
  isStable: boolean;
  /** Remaining countdown time in milliseconds */
  countdownMs: number;
}
