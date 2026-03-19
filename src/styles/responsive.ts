/**
 * Responsive utilities for the Game Companion app.
 *
 * Wraps React Native's `useWindowDimensions` to expose typed breakpoints
 * and responsive sizing helpers, per ADR-16 and ADR-18.
 *
 * Breakpoints:
 *   isSmallPhone  width < 360 dp  (compact phones — Moto E-class)
 *   isPhone       width < 600 dp  (standard phones)
 *   isTablet      width >= 600 dp (large phones and tablets)
 */

import { useWindowDimensions } from 'react-native';
import { spacing, typography } from './theme';

// ---------------------------------------------------------------------------
// Breakpoint constants
// ---------------------------------------------------------------------------

export const BREAKPOINTS = {
  /** Below this width the device is treated as a small phone */
  SMALL_PHONE_MAX: 360,
  /** Below this width the device is treated as a phone (not tablet) */
  PHONE_MAX: 600,
} as const;

// ---------------------------------------------------------------------------
// Breakpoint type
// ---------------------------------------------------------------------------

export type Breakpoint = 'smallPhone' | 'phone' | 'tablet';

// ---------------------------------------------------------------------------
// useBreakpoint hook
// ---------------------------------------------------------------------------

/**
 * Returns the current named breakpoint based on window width.
 */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width < BREAKPOINTS.SMALL_PHONE_MAX) return 'smallPhone';
  if (width < BREAKPOINTS.PHONE_MAX) return 'phone';
  return 'tablet';
}

// ---------------------------------------------------------------------------
// useWindowBreakpoints hook
// ---------------------------------------------------------------------------

/**
 * Returns dimension values alongside typed breakpoint booleans.
 * Useful when components need both the raw dimensions and breakpoint flags.
 */
export function useWindowBreakpoints(): {
  width: number;
  height: number;
  isSmallPhone: boolean;
  isPhone: boolean;
  isTablet: boolean;
  breakpoint: Breakpoint;
} {
  const { width, height } = useWindowDimensions();
  const isSmallPhone = width < BREAKPOINTS.SMALL_PHONE_MAX;
  const isPhone = width < BREAKPOINTS.PHONE_MAX;
  const isTablet = width >= BREAKPOINTS.PHONE_MAX;
  const breakpoint: Breakpoint = isSmallPhone ? 'smallPhone' : isPhone ? 'phone' : 'tablet';

  return { width, height, isSmallPhone, isPhone, isTablet, breakpoint };
}

// ---------------------------------------------------------------------------
// Responsive size maps
// ---------------------------------------------------------------------------

/**
 * Font size scale per breakpoint.
 * Tablet sizes are slightly larger to take advantage of screen real-estate.
 */
const RESPONSIVE_FONT_SIZES: Record<Breakpoint, number> = {
  smallPhone: typography.body.fontSize - 2, // 14 sp — minimum readable
  phone: typography.body.fontSize,          // 16 sp — standard
  tablet: typography.body.fontSize + 2,     // 18 sp — comfortable on large screens
};

/**
 * Base padding per breakpoint.
 * Larger devices get proportionally more padding.
 */
const RESPONSIVE_PADDING: Record<Breakpoint, number> = {
  smallPhone: spacing.sm, // 12 dp
  phone: spacing.md,      // 16 dp
  tablet: spacing.xl,     // 32 dp
};

// ---------------------------------------------------------------------------
// useResponsiveSizes hook
// ---------------------------------------------------------------------------

/**
 * Primary responsive hook consumed by screens and components.
 *
 * Returns:
 *   fontSize   — base body font size for the current breakpoint
 *   padding    — base container padding for the current breakpoint
 *   breakpoint — named breakpoint ('smallPhone' | 'phone' | 'tablet')
 */
export function useResponsiveSizes(): {
  fontSize: number;
  padding: number;
  breakpoint: Breakpoint;
} {
  const breakpoint = useBreakpoint();
  return {
    fontSize: RESPONSIVE_FONT_SIZES[breakpoint],
    padding: RESPONSIVE_PADDING[breakpoint],
    breakpoint,
  };
}

// ---------------------------------------------------------------------------
// Utility functions (non-hook, for static / outside-React usage)
// ---------------------------------------------------------------------------

/**
 * Returns a responsive font size given a screen width.
 * Use this when you cannot call hooks (e.g., inside StyleSheet.create).
 */
export function getFontSizeForWidth(width: number): number {
  if (width < BREAKPOINTS.SMALL_PHONE_MAX) return RESPONSIVE_FONT_SIZES.smallPhone;
  if (width < BREAKPOINTS.PHONE_MAX) return RESPONSIVE_FONT_SIZES.phone;
  return RESPONSIVE_FONT_SIZES.tablet;
}

/**
 * Returns a responsive padding given a screen width.
 * Use this when you cannot call hooks (e.g., inside StyleSheet.create).
 */
export function getPaddingForWidth(width: number): number {
  if (width < BREAKPOINTS.SMALL_PHONE_MAX) return RESPONSIVE_PADDING.smallPhone;
  if (width < BREAKPOINTS.PHONE_MAX) return RESPONSIVE_PADDING.phone;
  return RESPONSIVE_PADDING.tablet;
}
