import { LotteryEngine } from '../../src/services/lottery/LotteryEngine';
import { Touch } from '../../src/types/Touch';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTouches(count: number): Touch[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `touch-${i}`,
    x: i * 10,
    y: i * 10,
    timestamp: Date.now(),
    color: '#FF0000',
  }));
}

// ---------------------------------------------------------------------------
// LotteryEngine.selectWinner
// ---------------------------------------------------------------------------

describe('LotteryEngine.selectWinner', () => {
  it('returns one of the input touches', () => {
    const touches = makeTouches(4);
    const winner = LotteryEngine.selectWinner(touches);

    expect(touches).toContain(winner);
  });

  it('returns the only touch when there is exactly one', () => {
    const touches = makeTouches(1);
    const winner = LotteryEngine.selectWinner(touches);

    expect(winner).toBe(touches[0]);
  });

  it('throws when touches array is empty', () => {
    expect(() => LotteryEngine.selectWinner([])).toThrow(
      'Cannot select a winner from an empty touches array.',
    );
  });

  it('does not always return the same touch (randomness test)', () => {
    const touches = makeTouches(8);

    // Run 200 selections; the probability all return the same index is (1/8)^199 ≈ 0.
    const winnerIds = new Set<string>();
    for (let i = 0; i < 200; i++) {
      winnerIds.add(LotteryEngine.selectWinner(touches).id);
    }

    expect(winnerIds.size).toBeGreaterThan(1);
  });

  it('gives each touch a roughly equal chance over many trials', () => {
    const touches = makeTouches(3);
    const counts: Record<string, number> = {};
    touches.forEach((t) => (counts[t.id] = 0));

    const trials = 3000;
    for (let i = 0; i < trials; i++) {
      const winner = LotteryEngine.selectWinner(touches);
      counts[winner.id]++;
    }

    // Each touch should be selected roughly trials/N times (±30% tolerance).
    const expected = trials / touches.length;
    for (const id of Object.keys(counts)) {
      expect(counts[id]).toBeGreaterThan(expected * 0.7);
      expect(counts[id]).toBeLessThan(expected * 1.3);
    }
  });
});
