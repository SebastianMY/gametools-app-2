/**
 * Card — Simple container with themed background, border radius, and shadow.
 *
 * When `onPress` is provided the card becomes tappable and renders with
 * active-state opacity feedback. Omit `onPress` for a static display card.
 */

import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, elevation } from '../../styles/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardProps {
  /** Content to render inside the card */
  children: React.ReactNode;
  /**
   * When provided, the card becomes tappable with active-state feedback.
   * The card is not interactive when this prop is omitted.
   */
  onPress?: () => void;
  /** Accessibility label for tappable cards */
  accessibilityLabel?: string;
  /** Additional styles applied to the outer card container */
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTIVE_OPACITY = 0.75;
const DEFAULT_OPACITY = 1;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Card({ children, onPress, accessibilityLabel, style }: CardProps): React.ReactElement {
  const animatedOpacity = useRef(new Animated.Value(DEFAULT_OPACITY)).current;

  const handlePressIn = useCallback(() => {
    if (!onPress) return;
    Animated.timing(animatedOpacity, {
      toValue: ACTIVE_OPACITY,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, [animatedOpacity, onPress]);

  const handlePressOut = useCallback(() => {
    if (!onPress) return;
    Animated.timing(animatedOpacity, {
      toValue: DEFAULT_OPACITY,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [animatedOpacity, onPress]);

  const cardContent = (
    <Animated.View style={[styles.card, style, { opacity: animatedOpacity }]}>
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {cardContent}
      </TouchableWithoutFeedback>
    );
  }

  // Static card — no interactive wrapper
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: elevation.low },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: elevation.low,
      },
    }),
  },
});
