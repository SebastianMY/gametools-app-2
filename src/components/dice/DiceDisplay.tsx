/**
 * DiceDisplay — renders the dice faces either in animated spinning state
 * or settled with their final values.
 *
 * Layout adapts to the number of dice:
 *   1–3 dice : single horizontal row
 *   4–6 dice : wrapping flex row (naturally forms a 2-row grid)
 *
 * During animation each face shows a "?" placeholder spinning via
 * RollAnimation. After the animation completes the actual result numbers
 * are shown statically.
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius, elevation } from '../../styles/theme';
import { RollAnimation } from './RollAnimation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiceDisplayProps {
  /**
   * Array of result values (1–6). When empty and `isAnimating` is true
   * the component renders `diceCount` spinning placeholder dice.
   */
  results: number[];
  /** Number of dice currently selected — used to render placeholders. */
  diceCount: number;
  /** When true every die is wrapped in a RollAnimation. */
  isAnimating: boolean;
  /**
   * Called once when the first die's roll animation finishes. Parent can
   * use this to trigger result generation and state transitions.
   */
  onAnimationComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Sub-component: single die face
// ---------------------------------------------------------------------------

interface DieFaceProps {
  /** Value to display; undefined renders a "?" placeholder. */
  value?: number;
  style?: ViewStyle;
}

function DieFace({ value, style }: DieFaceProps): React.ReactElement {
  const displayText = value !== undefined ? String(value) : '?';
  return (
    <View
      style={[styles.dieFace, style]}
      accessibilityRole="text"
      accessibilityLabel={value !== undefined ? `Die showing ${value}` : 'Die rolling'}
    >
      <Text style={styles.dieValue}>{displayText}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiceDisplay({
  results,
  diceCount,
  isAnimating,
  onAnimationComplete,
}: DiceDisplayProps): React.ReactElement {
  // Determine how many dice to display.
  const count = isAnimating ? diceCount : results.length;

  if (count === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Select dice count and tap Roll</Text>
      </View>
    );
  }

  return (
    <View style={[styles.diceRow, count > 3 && styles.diceWrap]}>
      {Array.from({ length: count }, (_, index) => {
        const value = results[index];

        if (isAnimating) {
          return (
            <RollAnimation
              key={index}
              isAnimating={isAnimating}
              // Only the first die triggers the completion callback.
              onAnimationComplete={index === 0 ? onAnimationComplete : undefined}
            >
              <DieFace />
            </RollAnimation>
          );
        }

        return <DieFace key={index} value={value} />;
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  diceWrap: {
    flexWrap: 'wrap',
  },
  dieFace: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Elevation / shadow for a card-like "physical die" feel.
    elevation: elevation.low,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    margin: spacing.xxs,
  },
  dieValue: {
    ...typography.score,
    fontSize: 32,
    lineHeight: 40,
    color: colors.primary,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
