/**
 * Design tokens for the Game Companion app.
 *
 * Centralizes colors, typography, spacing, and elevation so that all
 * screens and components stay visually consistent. Import `theme` wherever
 * you need design values instead of hard-coding them.
 */

import { Colors } from '../utils/colors';

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const colors = {
  /** Primary brand color — deep game-table green */
  primary: Colors.primary,
  /** Primary light variant for hover / pressed states */
  primaryLight: Colors.primaryLight,
  /** Secondary brand color — warm dark brown */
  secondary: Colors.secondary,
  /** Secondary light variant */
  secondaryLight: Colors.secondaryLight,

  /** Default app background (warm off-white) */
  background: Colors.background,
  /** Plain white surfaces (cards, modals) */
  surface: Colors.surface,
  /** Subtle divider lines */
  divider: Colors.divider,

  /** High-contrast body text */
  text: Colors.textPrimary,
  /** Reduced-emphasis labels and captions */
  textSecondary: Colors.textSecondary,
  /** Disabled / placeholder text */
  textDisabled: Colors.textDisabled,
  /** White text for use on colored / dark backgrounds */
  textInverse: Colors.textInverse,

  /** Semantic: success / positive feedback */
  success: Colors.success,
  /** Semantic: error / destructive action */
  error: Colors.error,
  /** Semantic: warning / caution */
  warning: Colors.warning,
  /** Semantic: informational */
  info: Colors.info,

  /** Array of 8 WCAG-AA-compliant Lottery circle colors */
  lotteryColors: Colors.lotteryColors,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * Font size scale (in sp — scale-independent pixels, respects system text
 * size per NFR-A3 / NFR-A4).
 *
 * Minimum functional font size is 16 sp (NFR-A4).
 */
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  /** Large score display (dice, score tracker) */
  score: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
    letterSpacing: -1,
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

/**
 * Spacing scale in dp. Based on a 4 dp base unit.
 * Use these values for margin, padding, and gap rather than raw numbers.
 */
export const spacing = {
  /** 4 dp — tight padding inside small elements */
  xxs: 4,
  /** 8 dp — compact padding / gap between related items */
  xs: 8,
  /** 12 dp — inner card padding */
  sm: 12,
  /** 16 dp — standard padding (most common) */
  md: 16,
  /** 24 dp — section spacing */
  lg: 24,
  /** 32 dp — large section spacing / screen edges on tablets */
  xl: 32,
  /** 48 dp — hero area padding */
  xxl: 48,
  /** 64 dp — full-page vertical rhythm */
  xxxl: 64,
} as const;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

export const borderRadius = {
  /** Subtle rounding for inputs and chips */
  sm: 4,
  /** Standard card radius */
  md: 8,
  /** Large card / modal radius */
  lg: 16,
  /** Pill / fully-rounded buttons */
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Elevation / Shadow
// ---------------------------------------------------------------------------

export const elevation = {
  /** No shadow — flat elements */
  none: 0,
  /** Subtle lift for cards */
  low: 2,
  /** Medium lift for modals */
  medium: 4,
  /** High lift for dialogs */
  high: 8,
} as const;

// ---------------------------------------------------------------------------
// Touch targets
// ---------------------------------------------------------------------------

/**
 * Minimum interactive touch target size — 48 dp per WCAG NFR-A2.
 */
export const touchTarget = {
  minSize: 48,
} as const;

// ---------------------------------------------------------------------------
// Exported theme object
// ---------------------------------------------------------------------------

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  elevation,
  touchTarget,
} as const;

export type Theme = typeof theme;
