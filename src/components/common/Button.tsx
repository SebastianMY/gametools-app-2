/**
 * Button — Reusable accessible button component.
 *
 * Supports three variants (primary, secondary, danger) and three sizes
 * (small, medium, large). All buttons enforce a minimum 48×48 dp touch
 * target per WCAG NFR-A2. Active-state opacity feedback is applied via
 * Animated.View so it works on both iOS and Android.
 */

import React, { useRef, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography, touchTarget } from '../../styles/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /** Label text displayed inside the button */
  label: string;
  /** Callback invoked when the button is pressed */
  onPress: () => void;
  /** Visual variant controlling colors */
  variant?: ButtonVariant;
  /** Size controlling padding and font size */
  size?: ButtonSize;
  /** When true the button is non-interactive and visually dimmed */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Opacity constants
// ---------------------------------------------------------------------------

const ACTIVE_OPACITY = 0.65;
const DEFAULT_OPACITY = 1;

// ---------------------------------------------------------------------------
// Style maps (static lookups avoid dynamic property access warnings)
// ---------------------------------------------------------------------------

const variantContainerStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.error,
  },
};

const sizeContainerStyles: Record<ButtonSize, ViewStyle> = {
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
};

const variantLabelColors: Record<ButtonVariant, string> = {
  primary: colors.textInverse,
  secondary: colors.primary,
  danger: colors.textInverse,
};

const sizeLabelStyles: Record<ButtonSize, { fontSize: number; lineHeight: number }> = {
  small: {
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
  },
  medium: {
    fontSize: typography.bodyMedium.fontSize,
    lineHeight: typography.bodyMedium.lineHeight,
  },
  large: {
    fontSize: typography.h3.fontSize,
    lineHeight: typography.h3.lineHeight,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
}: ButtonProps): React.ReactElement {
  const animatedOpacity = useRef(new Animated.Value(DEFAULT_OPACITY)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(animatedOpacity, {
      toValue: ACTIVE_OPACITY,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, [animatedOpacity]);

  const handlePressOut = useCallback(() => {
    Animated.timing(animatedOpacity, {
      toValue: DEFAULT_OPACITY,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [animatedOpacity]);

  const containerStyle: ViewStyle[] = [
    styles.base,
    variantContainerStyles[variant],
    sizeContainerStyles[size],
    disabled ? styles.disabled : undefined,
  ].filter(Boolean) as ViewStyle[];

  const labelStyle = [
    styles.label,
    sizeLabelStyles[size],
    { color: variantLabelColors[variant] },
  ];

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Animated.View style={[containerStyle, { opacity: animatedOpacity }]}>
        <Text style={labelStyle} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  base: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0,
  },
});
