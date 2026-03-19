import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/types';
import { useResponsiveSizes, useWindowBreakpoints } from '../styles/responsive';
import { borderRadius, colors, elevation, spacing, typography } from '../styles/theme';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface FeatureButton {
  label: string;
  description: string;
  icon: string;
  route: keyof RootStackParamList;
  accessibilityLabel: string;
}

const FEATURE_BUTTONS: FeatureButton[] = [
  {
    label: 'Dice',
    description: 'Roll up to 6 dice',
    icon: '🎲',
    route: 'Dice',
    accessibilityLabel: 'Dice — Roll up to 6 dice',
  },
  {
    label: 'Score',
    description: 'Track scores for up to 8 players',
    icon: '🏆',
    route: 'ScoreHome',
    accessibilityLabel: 'Score — Track scores for up to 8 players',
  },
  {
    label: 'Lottery',
    description: 'Randomly select a player',
    icon: '✋',
    route: 'Lottery',
    accessibilityLabel: 'Lottery — Randomly select a player',
  },
];

/**
 * HomeScreen — main menu entry point.
 *
 * Displays three prominent feature buttons (Dice, Score, Lottery) on a
 * game-table green background. Tapping any button navigates to the
 * corresponding feature screen.
 *
 * Respects safe-area insets on phones with notches / Dynamic Island.
 */
export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNavigationProp>();
  const { isTablet } = useWindowBreakpoints();
  const { padding } = useResponsiveSizes();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingHorizontal: padding }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Game Companion</Text>
          <Text style={styles.subtitle}>Your digital game table</Text>
        </View>

        {/* Feature buttons */}
        <View style={[styles.buttonGrid, isTablet && styles.buttonGridTablet]}>
          {FEATURE_BUTTONS.map((feature) => (
            <Pressable
              key={feature.route}
              style={({ pressed }: { pressed: boolean }) => [
                styles.featureButton,
                isTablet && styles.featureButtonTablet,
                pressed && styles.featureButtonPressed,
              ]}
              onPress={() => navigation.navigate(feature.route as never)}
              accessibilityLabel={feature.accessibilityLabel}
              accessibilityRole="button"
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureLabel}>{feature.label}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
  },

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.textInverse,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textInverse,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // ---------------------------------------------------------------------------
  // Feature buttons — phone layout (column)
  // ---------------------------------------------------------------------------
  buttonGrid: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: spacing.md,
  },

  /** Tablet layout: row with equal-width cards */
  buttonGridTablet: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.lg,
  },

  featureButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    // Minimum 48 dp height per WCAG NFR-A2 — padding ensures this is
    // well above 48 dp in practice.
    minHeight: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation.medium },
        shadowOpacity: 0.18,
        shadowRadius: 6,
      },
      android: {
        elevation: elevation.medium,
      },
    }),
  },

  /** Tablet: each card takes equal flex share in the row */
  featureButtonTablet: {
    flex: 1,
    paddingVertical: spacing.xxl,
  },

  featureButtonPressed: {
    backgroundColor: colors.background,
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },

  featureIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },

  featureLabel: {
    ...typography.h2,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },

  featureDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
