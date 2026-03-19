/**
 * ScreenContainer — Root wrapper for every screen in the app.
 *
 * Applies SafeAreaView to respect device notches / Dynamic Island / home
 * indicators on both iOS and Android, and wraps content in a ScrollView-
 * friendly padded View. The horizontal padding can be disabled via the
 * `noHorizontalPadding` prop for full-bleed layouts (e.g., the Lottery
 * touch surface).
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../styles/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScreenContainerProps {
  /** Screen content */
  children: React.ReactNode;
  /**
   * When true, horizontal padding is removed so content can bleed to the
   * screen edges. The safe area insets are still respected.
   */
  noHorizontalPadding?: boolean;
  /** Additional styles applied to the inner content container */
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScreenContainer({
  children,
  noHorizontalPadding = false,
  style,
}: ScreenContainerProps): React.ReactElement {
  const contentStyle: ViewStyle[] = [
    styles.content,
    noHorizontalPadding && styles.noHorizontalPadding,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={contentStyle}>{children}</View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  noHorizontalPadding: {
    paddingHorizontal: 0,
  },
});
