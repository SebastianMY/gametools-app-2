/**
 * Shared StyleSheet definitions used across screens and components.
 *
 * Import individual style objects from here rather than recreating them in
 * every file. This ensures visual consistency and reduces bundle size by
 * leveraging StyleSheet.create() caching.
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, elevation, touchTarget, typography } from './theme';

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

export const flexCenter = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ---------------------------------------------------------------------------
// Screen / safe-area containers
// ---------------------------------------------------------------------------

export const safeAreaContainer = StyleSheet.create({
  /** Full-screen container respecting safe area insets */
  full: {
    flex: 1,
    backgroundColor: colors.background,
  },
  /** Padded content area inside a SafeAreaView */
  padded: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  /** Centered content area */
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export const cardStyle = StyleSheet.create({
  /** Standard elevated card */
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
  /** Card with extra padding for prominent content sections */
  cardLarge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: elevation.medium },
        shadowOpacity: 0.16,
        shadowRadius: 8,
      },
      android: {
        elevation: elevation.medium,
      },
    }),
  },
  /** Flat card — no shadow, subtle border */
  cardFlat: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
});

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

export const buttonStyle = StyleSheet.create({
  /** Primary filled button */
  primary: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Secondary outlined button */
  secondary: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Destructive action button */
  danger: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Text-only button (no background) */
  ghost: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Square icon button with equal sides */
  icon: {
    width: touchTarget.minSize,
    height: touchTarget.minSize,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Button labels
  labelPrimary: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
  labelSecondary: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  labelDanger: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
  labelGhost: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});

// ---------------------------------------------------------------------------
// Typography helpers
// ---------------------------------------------------------------------------

export const textStyles = StyleSheet.create({
  h1: {
    ...typography.h1,
    color: colors.text,
  },
  h2: {
    ...typography.h2,
    color: colors.text,
  },
  h3: {
    ...typography.h3,
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.text,
  },
  bodySecondary: {
    ...typography.body,
    color: colors.textSecondary,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  score: {
    ...typography.score,
    color: colors.text,
  },
});

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

export const dividerStyle = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  vertical: {
    width: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
});
