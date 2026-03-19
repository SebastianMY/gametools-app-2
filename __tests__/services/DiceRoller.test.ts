import { DiceRoller } from '../../src/services/dice/DiceRoller';

describe('DiceRoller.rollDice', () => {
  it('returns an array with the requested number of dice', () => {
    expect(DiceRoller.rollDice(1)).toHaveLength(1);
    expect(DiceRoller.rollDice(3)).toHaveLength(3);
    expect(DiceRoller.rollDice(6)).toHaveLength(6);
  });

  it('returns only values in the range [1, 6]', () => {
    // Roll many dice to maximise coverage of the RNG range
    const results = DiceRoller.rollDice(1000);
    for (const value of results) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    }
  });

  it('returns integers, not floats', () => {
    const results = DiceRoller.rollDice(100);
    for (const value of results) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('returns an empty array when count is 0', () => {
    expect(DiceRoller.rollDice(0)).toEqual([]);
  });

  it('returns an empty array when count is negative', () => {
    expect(DiceRoller.rollDice(-1)).toEqual([]);
  });

  it('produces statistically varied results (not a constant)', () => {
    // Roll 100 dice; the probability of all values being identical is (1/6)^99 ≈ 0
    const results = DiceRoller.rollDice(100);
    const unique = new Set(results);
    expect(unique.size).toBeGreaterThan(1);
  });
});
