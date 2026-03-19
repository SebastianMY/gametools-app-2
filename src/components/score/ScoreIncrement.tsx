/**
 * ScoreIncrement — Reusable row of increment/decrement buttons.
 *
 * Renders six buttons: −10, −5, −1, +1, +5, +10.
 * Each button meets the 48×48 dp minimum touch-target size (NFR-A2).
 * The `onPress` callback receives the signed delta so callers can apply
 * it directly to the current score.
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { borderRadius, colors, spacing, touchTarget, typography } from '../../styles/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScoreIncrementProps {
  /** Called with a signed delta (e.g. +1, −5, +10) when a button is tapped. */
  onPress: (delta: number) => void;
  /** When true all buttons are disabled (e.g. while an async update is in flight). */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Button configuration
// ---------------------------------------------------------------------------

const DELTAS = [-10, -5, -1, 1, 5, 10] as const;

type Delta = (typeof DELTAS)[number];

function labelFor(delta: Delta): string {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

// ---------------------------------------------------------------------------
// Single delta button (internal)
// ---------------------------------------------------------------------------

interface DeltaButtonProps {
  delta: Delta;
  onPress: (delta: Delta) => void;
  disabled: boolean;
}

const ACTIVE_OPACITY = 0.55;
const DEFAULT_OPACITY = 1;

function DeltaButton({ delta, onPress, disabled }: DeltaButtonProps): React.ReactElement {
  // Each button manages its own press animation for independent feedback.
  const animatedOpacity = useRef(new Animated.Value(DEFAULT_OPACITY)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(animatedOpacity, {
      toValue: ACTIVE_OPACITY,
      duration: 60,
      useNativeDriver: true,
    }).start();
  }, [animatedOpacity]);

  const handlePressOut = useCallback(() => {
    Animated.timing(animatedOpacity, {
      toValue: DEFAULT_OPACITY,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [animatedOpacity]);

  const handlePress = useCallback(() => {
    onPress(delta);
  }, [onPress, delta]);

  const isDecrement = delta < 0;
  const label = labelFor(delta);

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : handlePress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${isDecrement ? 'Subtract' : 'Add'} ${Math.abs(delta)} point${Math.abs(delta) !== 1 ? 's' : ''}`}
      accessibilityState={{ disabled }}
    >
      <Animated.View
        style={[
          styles.button,
          isDecrement ? styles.decrementButton : styles.incrementButton,
          disabled && styles.buttonDisabled,
          { opacity: animatedOpacity },
        ]}
      >
        <Text
          style={[
            styles.label,
            isDecrement ? styles.decrementLabel : styles.incrementLabel,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ---------------------------------------------------------------------------
// ScoreIncrement component
// ---------------------------------------------------------------------------

export function ScoreIncrement({ onPress, disabled = false }: ScoreIncrementProps): React.ReactElement {
  const handleDelta = useCallback(
    (delta: Delta) => {
      onPress(delta);
    },
    [onPress],
  );

  return (
    <View style={styles.row}>
      {DELTAS.map((delta) => (
        <DeltaButton
          key={delta}
          delta={delta}
          onPress={handleDelta}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  button: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  decrementButton: {
    backgroundColor: colors.error,
  },
  incrementButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    letterSpacing: 0,
  },
  decrementLabel: {
    color: colors.textInverse,
  },
  incrementLabel: {
    color: colors.textInverse,
  },
});
