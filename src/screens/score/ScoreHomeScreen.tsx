/**
 * ScoreHomeScreen — lists all saved games and provides access to create a new one.
 *
 * - Loads games from GameStateContext via useGameState()
 * - Renders a GameListItem for each saved game
 * - Tapping a game: calls resumeGame() then navigates to ScoreGame
 * - "New Game" button navigates to NewGameDialog (implemented in TASK-013)
 * - Long-pressing a game item shows a delete confirmation (Alert, with
 *   full modal provided by TASK-015 / GameDeleteModal once merged)
 * - Empty state when no games exist
 * - Responsive layout via useWindowBreakpoints / useResponsiveSizes (ADR-18)
 */

import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GameListItem } from '../../components/score/GameListItem';
import { Button } from '../../components/common/Button';
import { useGameState } from '../../context/hooks/useGameState';
import { RootStackScreenProps } from '../../navigation/types';
import { useWindowBreakpoints } from '../../styles/responsive';
import { colors, elevation, spacing, typography } from '../../styles/theme';
import { Game } from '../../types';
import NewGameDialog from './NewGameDialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = RootStackScreenProps<'ScoreHome'>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScoreHomeScreen({ navigation }: Props): React.JSX.Element {
  const { games, resumeGame, deleteGame } = useGameState();
  const { isTablet } = useWindowBreakpoints();

  // Track which game is pending deletion (used to prevent double-taps)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Controls visibility of the New Game dialog
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleGamePress = useCallback(
    async (gameId: string) => {
      await resumeGame(gameId);
      navigation.navigate('ScoreGame', { gameId });
    },
    [resumeGame, navigation],
  );

  const handleNewGame = useCallback(() => {
    setShowNewGameDialog(true);
  }, []);

  const handleNewGameDismiss = useCallback(() => {
    setShowNewGameDialog(false);
  }, []);

  const handleGameCreated = useCallback(
    (gameId: string) => {
      setShowNewGameDialog(false);
      navigation.navigate('ScoreGame', { gameId });
    },
    [navigation],
  );

  const handleDeleteRequest = useCallback(
    (game: Game) => {
      if (deletingId === game.id) return; // Prevent concurrent deletes

      const label = game.name && game.name.trim().length > 0
        ? game.name.trim()
        : `Game from ${new Date(game.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`;

      Alert.alert(
        'Delete Game',
        `Are you sure you want to delete "${label}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setDeletingId(game.id);
              await deleteGame(game.id);
              setDeletingId(null);
            },
          },
        ],
      );
    },
    [deleteGame, deletingId],
  );

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const renderItem = useCallback(
    ({ item }: { item: Game }) => (
      <GameListItem
        game={item}
        onPress={() => handleGamePress(item.id)}
        onDelete={() => handleDeleteRequest(item)}
      />
    ),
    [handleGamePress, handleDeleteRequest],
  );

  const keyExtractor = useCallback((item: Game) => item.id, []);

  const ListEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏆</Text>
      <Text style={styles.emptyTitle}>No games yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap <Text style={styles.emptySubtitleBold}>New Game</Text> to start tracking scores.
      </Text>
    </View>
  );

  const ListHeaderComponent = (
    <View style={[styles.listHeader, isTablet && styles.listHeaderTablet]}>
      <Text style={styles.listTitle}>Saved Games</Text>
    </View>
  );

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={games}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={[
            styles.listContent,
            isTablet && styles.listContentTablet,
            games.length === 0 && styles.listContentEmpty,
          ]}
          // Pull-to-refresh is not needed per spec; no-op prevents RN warning
          showsVerticalScrollIndicator={false}
        />

        {/* New Game button — pinned at the bottom */}
        <View
          style={[
            styles.footer,
            isTablet ? styles.footerTablet : styles.footerPhone,
          ]}
        >
          <Button
            label="New Game"
            onPress={handleNewGame}
            variant="primary"
            size="large"
          />
        </View>
      </View>
      {/* New Game dialog — rendered at the root of this screen so it covers
          the full viewport; controlled via local state (ADR-8) */}
      <NewGameDialog
        visible={showNewGameDialog}
        onDismiss={handleNewGameDismiss}
        onGameCreated={handleGameCreated}
      />
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

  container: {
    flex: 1,
  },

  // ---------------------------------------------------------------------------
  // List
  // ---------------------------------------------------------------------------

  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  listContentTablet: {
    paddingHorizontal: spacing.xl,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  listHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },

  listHeaderTablet: {
    paddingHorizontal: 0,
  },

  listTitle: {
    ...typography.h3,
    color: colors.text,
  },

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },

  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },

  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  emptySubtitleBold: {
    fontWeight: '700',
    color: colors.primary,
  },

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------

  footer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: -elevation.low },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: elevation.low,
      },
    }),
  },

  footerPhone: {
    paddingHorizontal: spacing.md,
  },

  footerTablet: {
    paddingHorizontal: spacing.xxl,
  },
});
