/**
 * PlayerRow — Displays a single player's name, current score, and
 * increment/decrement controls within the ScoreGameScreen.
 *
 * Accessibility:
 *   • The player name and score are grouped into an accessible region.
 *   • ScoreIncrement buttons each carry individual accessibilityLabels.
 *   • Score value announces as "{name}'s score: {score}" for screen readers.
 *
 * Touch targets: All interactive controls meet the 48×48 dp minimum
 * per WCAG NFR-A2 (enforced inside ScoreIncrement).
 */

import React, { useCallback } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, elevation, spacing, typography } from '../../styles/theme';
import { ScoreIncrement } from './ScoreIncrement';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlayerRowProps {
  /** Player unique identifier */
  playerId: string;
  /** Player display name */
  playerName: string;
  /** Current score value */
  score: number;
  /**
   * Called when the user taps an increment/decrement button.
   * Receives the player id and the signed delta to apply.
   */
  onScoreChange: (playerId: string, delta: number) => void;
  /** When true all score buttons are disabled */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlayerRow({
  playerId,
  playerName,
  score,
  onScoreChange,
  disabled = false,
}: PlayerRowProps): React.ReactElement {
  const handleDelta = useCallback(
    (delta: number) => {
      onScoreChange(playerId, delta);
    },
    [onScoreChange, playerId],
  );

  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessible={false}
    >
      {/* Player name and score */}
      <View
        style={styles.header}
        accessible
        accessibilityLabel={`${playerName}'s score: ${score}`}
      >
        <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
          {playerName}
        </Text>
        <Text style={styles.scoreText} accessibilityElementsHidden>
          {score}
        </Text>
      </View>

      {/* Increment / decrement buttons */}
      <View style={styles.controls}>
        <ScoreIncrement onPress={handleDelta} disabled={disabled} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: elevation.low },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: elevation.low,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  playerName: {
    flex: 1,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    color: colors.text,
    marginRight: spacing.sm,
  },
  scoreText: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.lineHeight,
    color: colors.primary,
    minWidth: 60,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
