/**
 * DiceRoller service — encapsulates d6 dice rolling logic.
 *
 * Per ADR-13 the app supports d6 (six-sided) dice only in v1.
 * The Dice feature is ephemeral: results are not persisted.
 */

export class DiceRoller {
  /**
   * Roll a specified number of six-sided dice.
   *
   * @param count - Number of dice to roll. Must be a positive integer.
   * @returns Array of `count` random integers in the range [1, 6].
   */
  static rollDice(count: number): number[] {
    if (count < 1) {
      return [];
    }

    return Array.from({ length: count }, () =>
      Math.floor(Math.random() * 6) + 1,
    );
  }
}
