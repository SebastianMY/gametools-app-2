/**
 * GameListItem — displays a single saved game entry in the Score Home list.
 *
 * Shows the game name (or auto-generated label per ADR-10), the creation date,
 * and the player count. Tapping navigates to the game; long-pressing triggers
 * the delete callback (handled by TASK-015 / GameDeleteModal).
 *
 * Responsive: adapts padding and font sizing for phones and tablets.
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useResponsiveSizes } from '../../styles/responsive';
import { borderRadius, colors, elevation, spacing, typography } from '../../styles/theme';
import { Game } from '../../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GameListItemProps {
  /** The saved game to display */
  game: Game;
  /** Called when the user taps the item */
  onPress: () => void;
  /** Called when the user long-presses the item (triggers delete confirmation) */
  onDelete: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a Unix timestamp as "Month Day, Year" (e.g. "March 19, 2026").
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Returns the display name for a game (ADR-10).
 * If the game has a user-provided name, that is used.
 * Otherwise falls back to "Game from [Month Day, Year]".
 */
export function getGameLabel(game: Game): string {
  if (game.name && game.name.trim().length > 0) {
    return game.name.trim();
  }
  return `Game from ${formatDate(game.createdAt)}`;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTIVE_OPACITY = 0.7;
const DEFAULT_OPACITY = 1;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GameListItem({ game, onPress, onDelete }: GameListItemProps): React.ReactElement {
  const { padding } = useResponsiveSizes();
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

  const label = getGameLabel(game);
  const createdDateLabel = formatDate(game.createdAt);
  const playerCount = game.players.length;
  const playerCountLabel = `${playerCount} ${playerCount === 1 ? 'player' : 'players'}`;

  const accessibilityLabel = `${label}, created ${createdDateLabel}, ${playerCountLabel}. Long press to delete.`;

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onLongPress={onDelete}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Tap to open game. Long press to delete."
    >
      <Animated.View
        style={[
          styles.container,
          { paddingHorizontal: padding, paddingVertical: padding },
          { opacity: animatedOpacity },
        ]}
      >
        {/* Main row: game name + player badge */}
        <View style={styles.row}>
          <Text style={styles.gameName} numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{playerCountLabel}</Text>
          </View>
        </View>

        {/* Secondary row: created date */}
        <Text style={styles.dateText}>{createdDateLabel}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    // Minimum touch target height (WCAG NFR-A2) — padding ensures this.
    minHeight: 72,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: elevation.low },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: elevation.low,
      },
    }),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },

  gameName: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },

  badge: {
    // background (#F1F8E9) with primary text (#1B5E20) — contrast ~16.4:1 (WCAG AA ✓)
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    flexShrink: 0,
  },

  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },

  dateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
