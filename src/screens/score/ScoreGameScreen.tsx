/**
 * ScoreGameScreen — Active game screen where players track scores.
 *
 * Responsibilities:
 *  • Loads the game identified by `route.params.gameId` from GameStateContext.
 *  • Displays the game name at the top (auto-generated if not set, ADR-10).
 *  • Lists all players with their current scores and +/− controls.
 *  • Calls `updateScore()` on every button tap; persistence is debounced inside
 *    GameStateContext (ADR-6).
 *  • "Finish Game" button calls `clearCurrentGame()` and navigates back to
 *    ScoreHome (ADR-8).
 *  • Supports landscape orientation via `useWindowBreakpoints()` (ADR-16).
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PlayerRow } from '../../components/score/PlayerRow';
import { Button } from '../../components/common/Button';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useGameState } from '../../context/hooks/useGameState';
import { RootStackScreenProps } from '../../navigation/types';
import { useWindowBreakpoints } from '../../styles/responsive';
import { colors, spacing, typography } from '../../styles/theme';
import { Game } from '../../types';
import GameDeleteModal from './GameDeleteModal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable game label.
 * Mirrors ADR-10: optional name with "Game from [Month Day, Year]" fallback.
 */
function gameDisplayName(game: Game): string {
  if (game.name) return game.name;

  const date = new Date(game.createdAt);
  return `Game from ${date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = RootStackScreenProps<'ScoreGame'>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScoreGameScreen({ route, navigation }: Props): React.JSX.Element {
  const { gameId } = route.params;

  const { games, currentGame, loading, updateScore, resumeGame, clearCurrentGame } =
    useGameState();

  const { isTablet } = useWindowBreakpoints();

  // Updating-in-flight state: used to disable buttons while awaiting the
  // async updateScore call (prevents double-tap races).
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Controls visibility of the delete confirmation modal.
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // -------------------------------------------------------------------------
  // Load game on mount (or if gameId changes)
  // -------------------------------------------------------------------------

  useEffect(() => {
    // If the current game is already correct, nothing to do.
    if (currentGame?.id === gameId) return;

    // Otherwise, resume from the games list.
    resumeGame(gameId).catch(() => {
      // resumeGame already dispatches an error; nothing extra needed here.
    });
  }, [gameId, currentGame, resumeGame]);

  // -------------------------------------------------------------------------
  // Derived game value — prefer live currentGame when it matches, otherwise
  // fall back to the games list to avoid stale reference during transitions.
  // -------------------------------------------------------------------------

  const game = useMemo<Game | null>(() => {
    if (currentGame?.id === gameId) return currentGame;
    return games.find((g) => g.id === gameId) ?? null;
  }, [currentGame, games, gameId]);

  // -------------------------------------------------------------------------
  // Manual refresh (pull-to-refresh) — re-runs resumeGame to sync state
  // -------------------------------------------------------------------------

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await resumeGame(gameId);
    } finally {
      setRefreshing(false);
    }
  }, [resumeGame, gameId]);

  // -------------------------------------------------------------------------
  // Score update
  // -------------------------------------------------------------------------

  const handleScoreChange = useCallback(
    async (playerId: string, delta: number) => {
      if (!game || updating) return;

      const player = game.players.find((p) => p.id === playerId);
      if (!player) return;

      const newScore = player.score + delta;

      setUpdating(true);
      try {
        await updateScore(gameId, playerId, newScore);
      } finally {
        setUpdating(false);
      }
    },
    [game, gameId, updateScore, updating],
  );

  // -------------------------------------------------------------------------
  // Finish / back
  // -------------------------------------------------------------------------

  const handleFinish = useCallback(() => {
    clearCurrentGame();
    // Navigate back to ScoreHome, resetting the stack so the game screen is
    // removed from history.
    navigation.navigate('ScoreHome');
  }, [clearCurrentGame, navigation]);

  const handleDeleteRequest = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteModalDismiss = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const handleGameDeleted = useCallback(() => {
    setShowDeleteModal(false);
    // clearCurrentGame is handled inside deleteGame (context), but we still
    // navigate back so the user is returned to ScoreHome.
    navigation.navigate('ScoreHome');
  }, [navigation]);

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading game…</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!game) {
    return (
      <ScreenContainer>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>Game not found.</Text>
          <View style={styles.errorAction}>
            <Button label="Back to Games" onPress={handleFinish} variant="secondary" />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const displayName = gameDisplayName(game);
  const columnLayout = isTablet && game.players.length >= 4;

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text
          style={styles.title}
          numberOfLines={2}
          accessibilityRole="header"
        >
          {displayName}
        </Text>
      </View>

      {/* Player list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          columnLayout && styles.scrollContentColumns,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        accessibilityRole="list"
        accessibilityLabel="Players"
      >
        {game.players.map((player) => (
          <View
            key={player.id}
            style={columnLayout ? styles.playerColumnItem : styles.playerFullWidth}
          >
            <PlayerRow
              playerId={player.id}
              playerName={player.name}
              score={player.score}
              onScoreChange={handleScoreChange}
              disabled={updating}
            />
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerFinish}>
          <Button
            label="Finish Game"
            onPress={handleFinish}
            variant="secondary"
            size="large"
          />
        </View>
        <Button
          label="Delete Game"
          onPress={handleDeleteRequest}
          variant="danger"
          size="medium"
        />
      </View>

      {/* Delete confirmation modal */}
      <GameDeleteModal
        visible={showDeleteModal}
        gameId={gameId}
        gameName={displayName}
        onDismiss={handleDeleteModalDismiss}
        onDeleted={handleGameDeleted}
      />
    </ScreenContainer>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: colors.error,
  },
  errorAction: {
    marginTop: spacing.md,
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.lineHeight,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  scrollContentColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  playerFullWidth: {
    width: '100%',
  },
  playerColumnItem: {
    // On tablet/landscape: 2-column layout with equal widths minus gap
    flexBasis: '47%',
    flexGrow: 1,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerFinish: {
    flex: 1,
  },
});
