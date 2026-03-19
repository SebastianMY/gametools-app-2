/**
 * DiceCountSelector — increment / decrement control for choosing how many
 * dice to roll (1–6 per ADR-13).
 *
 * Touch targets are enforced at 48×48 dp (WCAG NFR-A2). Decrement is
 * disabled at `min` and increment is disabled at `max`.
 */

import React, { useCallback } from 'react';
import { Insets, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography, borderRadius, touchTarget } from '../../styles/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 6;

/** Extra tap area around small icon buttons to keep NFR-A2 (48×48 dp). */
const BUTTON_HIT_SLOP: Insets = { top: 8, bottom: 8, left: 8, right: 8 };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiceCountSelectorProps {
  /** Current dice count to display */
  count: number;
  /** Called when the user taps "−" and count is above `min` */
  onDecrement: () => void;
  /** Called when the user taps "+" and count is below `max` */
  onIncrement: () => void;
  /** Minimum allowed value (default: 1) */
  min?: number;
  /** Maximum allowed value (default: 6) */
  max?: number;
  /** Disable both buttons (e.g. while animation is running) */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiceCountSelector({
  count,
  onDecrement,
  onIncrement,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  disabled = false,
}: DiceCountSelectorProps): React.ReactElement {
  const canDecrement = !disabled && count > min;
  const canIncrement = !disabled && count < max;

  const handleDecrement = useCallback(() => {
    if (canDecrement) onDecrement();
  }, [canDecrement, onDecrement]);

  const handleIncrement = useCallback(() => {
    if (canIncrement) onIncrement();
  }, [canIncrement, onIncrement]);

  return (
    <View style={styles.container} accessibilityRole="adjustable" accessibilityLabel={`Number of dice: ${count}`}>
      <TouchableOpacity
        style={[styles.button, !canDecrement && styles.buttonDisabled]}
        onPress={handleDecrement}
        disabled={!canDecrement}
        accessibilityRole="button"
        accessibilityLabel="Decrease dice count"
        accessibilityState={{ disabled: !canDecrement }}
        hitSlop={BUTTON_HIT_SLOP}
      >
        <Text style={[styles.buttonLabel, !canDecrement && styles.buttonLabelDisabled]}>
          −
        </Text>
      </TouchableOpacity>

      <View style={styles.countContainer}>
        <Text style={styles.countText} accessibilityLabel={`${count} dice selected`}>
          {count}
        </Text>
        <Text style={styles.countCaption}>
          {count === 1 ? 'die' : 'dice'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !canIncrement && styles.buttonDisabled]}
        onPress={handleIncrement}
        disabled={!canIncrement}
        accessibilityRole="button"
        accessibilityLabel="Increase dice count"
        accessibilityState={{ disabled: !canIncrement }}
        hitSlop={BUTTON_HIT_SLOP}
      >
        <Text style={[styles.buttonLabel, !canIncrement && styles.buttonLabelDisabled]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  button: {
    width: touchTarget.minSize,
    height: touchTarget.minSize,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonLabel: {
    color: colors.textInverse,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
  },
  buttonLabelDisabled: {
    color: colors.textInverse,
  },
  countContainer: {
    alignItems: 'center',
    minWidth: 56,
  },
  countText: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  countCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
});
