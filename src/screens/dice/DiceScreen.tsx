/**
 * DiceScreen — full dice rolling interface.
 *
 * Features:
 *  - Dice count selector (1–6 dice, per ADR-13)
 *  - "Roll" button that triggers RollAnimation and generates d6 results
 *  - Animated dice display (spinning → settled values)
 *  - Total sum display
 *  - "Roll Again" button reuses the same dice count
 *  - "Clear" button resets results
 *
 * State management:
 *  - diceCount   : how many dice to roll (1–6)
 *  - results     : array of die values after animation completes
 *  - isAnimating : true while the spin animation is in progress
 *
 * Animations use React Native's built-in Animated API (ADR-4).
 * Orientation is supported via useWindowBreakpoints (ADR-16).
 */

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Button } from '../../components/common/Button';
import { DiceCountSelector, DiceDisplay } from '../../components/dice';
import { RootStackScreenProps } from '../../navigation/types';
import { DiceRoller } from '../../services/dice/DiceRoller';
import { colors, spacing, typography } from '../../styles/theme';
import { useWindowBreakpoints } from '../../styles/responsive';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = RootStackScreenProps<'Dice'>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_DICE = 1;
const MAX_DICE = 6;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiceScreen(_props: Props): React.JSX.Element {
  const [diceCount, setDiceCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const { isTablet } = useWindowBreakpoints();

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleDecrement = useCallback(() => {
    setDiceCount((prev: number) => Math.max(MIN_DICE, prev - 1));
  }, []);

  const handleIncrement = useCallback(() => {
    setDiceCount((prev: number) => Math.min(MAX_DICE, prev + 1));
  }, []);

  const handleRoll = useCallback(() => {
    if (isAnimating) return;
    // Clear previous results and start the animation.
    setResults([]);
    setIsAnimating(true);
  }, [isAnimating]);

  const handleAnimationComplete = useCallback(() => {
    // Generate results now that animation is done and display them.
    setResults(DiceRoller.rollDice(diceCount));
    setIsAnimating(false);
  }, [diceCount]);

  const handleClear = useCallback(() => {
    if (isAnimating) return;
    setResults([]);
  }, [isAnimating]);

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const total = results.reduce((sum: number, val: number) => sum + val, 0);
  const hasResults = results.length > 0;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.scrollContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Header ---- */}
        <Text style={styles.title} accessibilityRole="header">
          Roll Dice
        </Text>

        {/* ---- Dice count selector ---- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Number of Dice</Text>
          <DiceCountSelector
            count={diceCount}
            onDecrement={handleDecrement}
            onIncrement={handleIncrement}
            disabled={isAnimating}
          />
        </View>

        {/* ---- Animated dice display ---- */}
        <View style={styles.section}>
          <DiceDisplay
            results={results}
            diceCount={diceCount}
            isAnimating={isAnimating}
            onAnimationComplete={handleAnimationComplete}
          />
        </View>

        {/* ---- Total sum ---- */}
        {hasResults && (
          <View style={styles.totalContainer} accessibilityLiveRegion="polite">
            <Text style={styles.totalLabel}>Total</Text>
            <Text
              style={styles.totalValue}
              accessibilityLabel={`Total: ${total}`}
            >
              {total}
            </Text>
          </View>
        )}

        {/* ---- Action buttons ---- */}
        <View style={styles.actions}>
          <Button
            label={hasResults ? 'Roll Again' : 'Roll'}
            onPress={handleRoll}
            variant="primary"
            size="large"
            disabled={isAnimating}
          />

          {hasResults && !isAnimating && (
            <Button
              label="Clear"
              onPress={handleClear}
              variant="secondary"
              size="medium"
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  scrollContentTablet: {
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  section: {
    alignItems: 'center',
    width: '100%',
  },
  sectionLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  totalContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    minWidth: 120,
  },
  totalLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: {
    ...typography.score,
    color: colors.primary,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
});
