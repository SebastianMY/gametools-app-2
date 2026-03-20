/**
 * LotteryEngine — stateless service for the multi-touch player selection feature.
 *
 * Provides random winner selection from a list of active touch points.
 * All methods are pure and stateless — state is managed in the UI layer (LotteryScreen).
 *
 * Per the architecture (§7 API Boundaries):
 *   - trackTouches: handled by TouchSurface component
 *   - isStable:     handled by countdown timer in LotteryScreen
 *   - selectWinner: implemented here
 */

import { Touch } from '../../types/Touch';

export class LotteryEngine {
  /**
   * Randomly selects one touch as the lottery winner.
   *
   * Uses `Math.random()` for selection — no cryptographic guarantees,
   * which is acceptable for casual board game fairness (FR-L6).
   * Each touch has an equal probability of 1/N of being selected.
   *
   * @param touches - Active touches to select from. Must be non-empty.
   * @returns The selected winning `Touch`.
   * @throws Error if `touches` is empty.
   */
  static selectWinner(touches: Touch[]): Touch {
    if (touches.length === 0) {
      throw new Error('Cannot select a winner from an empty touches array.');
    }
    const index = Math.floor(Math.random() * touches.length);
    return touches[index];
  }
}
