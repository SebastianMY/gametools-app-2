/**
 * NewGameDialog — Modal dialog for creating a new game.
 *
 * Responsibilities:
 *  • Overlay with semi-transparent backdrop that respects safe areas.
 *  • Player count selector: buttons to choose between 2 and 8 players.
 *  • Text input for each player name (1–50 chars, placeholder "Player N").
 *  • "Start Game" button — disabled until at least 2 non-empty names are entered.
 *  • "Cancel" button — dismisses without creating a game.
 *  • On "Start Game": calls createGame() then invokes onGameCreated() with the
 *    new game's ID so the parent can navigate to ScoreGame (ADR-8).
 *
 * Accessibility:
 *  • All interactive elements meet the 44×44 dp minimum touch target (NFR-A2).
 *  • Player count buttons carry accessibilityLabel and accessibilityState.
 *  • Text inputs carry accessibilityLabel linked to their player number.
 *  • Modal announces itself to screen readers via accessibilityViewIsModal.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { useGameState } from '../../context/hooks/useGameState';
import {
  borderRadius,
  colors,
  elevation,
  spacing,
  touchTarget,
  typography,
} from '../../styles/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const MAX_NAME_LENGTH = 50;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NewGameDialogProps {
  /** Controls whether the dialog is visible */
  visible: boolean;
  /** Called when the user cancels (no game created) */
  onDismiss: () => void;
  /**
   * Called after a new game is successfully created.
   * Receives the new game's ID so the parent can navigate to ScoreGame.
   */
  onGameCreated: (gameId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns an array of N empty strings. */
function buildNameArray(count: number): string[] {
  return Array.from({ length: count }, () => '');
}

/** Trims a name and checks it meets the 1–50 char requirement. */
function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= MAX_NAME_LENGTH;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewGameDialog({
  visible,
  onDismiss,
  onGameCreated,
}: NewGameDialogProps): React.ReactElement {
  const { createGame } = useGameState();

  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(buildNameArray(2));
  const [submitting, setSubmitting] = useState(false);

  // Ref array for TextInput forwarded refs (enables auto-focus chaining)
  const inputRefs = useRef<Array<React.ElementRef<typeof TextInput> | null>>(
    Array.from({ length: MAX_PLAYERS }, () => null),
  );

  // Reset form state whenever the dialog becomes visible
  useEffect(() => {
    if (visible) {
      setPlayerCount(2);
      setPlayerNames(buildNameArray(2));
      setSubmitting(false);
    }
  }, [visible]);

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  /** Number of filled-in (non-empty, trimmed) names */
  const filledCount = useMemo(
    () => playerNames.slice(0, playerCount).filter(isValidName).length,
    [playerNames, playerCount],
  );

  /** "Start Game" is only enabled when at least 2 valid names are entered */
  const canStart = filledCount >= MIN_PLAYERS && !submitting;

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handlePlayerCountChange = useCallback(
    (count: number) => {
      setPlayerCount(count);
      // Keep existing names; expand or shrink the array as needed
      setPlayerNames((prev: string[]) => {
        if (count > prev.length) {
          return [...prev, ...Array.from({ length: count - prev.length }, () => '')];
        }
        return prev.slice(0, count);
      });
    },
    [],
  );

  const handleNameChange = useCallback((index: number, text: string) => {
    setPlayerNames((prev: string[]) => {
      const next = [...prev];
      next[index] = text;
      return next;
    });
  }, []);

  const handleCancel = useCallback(() => {
    Keyboard.dismiss();
    onDismiss();
  }, [onDismiss]);

  const handleStartGame = useCallback(async () => {
    if (!canStart) return;

    Keyboard.dismiss();
    setSubmitting(true);

    try {
      const names = playerNames.slice(0, playerCount).map((n: string) => n.trim());
      const game = await createGame(names);
      onGameCreated(game.id);
    } finally {
      setSubmitting(false);
    }
  }, [canStart, playerNames, playerCount, createGame, onGameCreated]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      {/* Tap backdrop to dismiss */}
      <TouchableWithoutFeedback onPress={handleCancel} accessible={false}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Dialog card — wrapped in SafeAreaView so notches / Dynamic Island
          don't clip the content (acceptance criterion: modal respects safe area) */}
      <SafeAreaView
        style={styles.safeArea}
        pointerEvents="box-none"
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View
          style={styles.dialogWrapper}
          pointerEvents="box-none"
          accessibilityViewIsModal
        >
          <View style={styles.dialog}>
            {/* Title */}
            <Text style={styles.title} accessibilityRole="header">
              New Game
            </Text>

            {/* Player count selector */}
            <Text style={styles.sectionLabel}>Number of Players</Text>
            <View
              style={styles.playerCountRow}
              accessibilityRole="radiogroup"
              accessibilityLabel="Number of players"
            >
              {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => {
                const count = i + MIN_PLAYERS;
                const isSelected = count === playerCount;
                return (
                  <TouchableOpacity
                    key={count}
                    style={[styles.countButton, isSelected && styles.countButtonSelected]}
                    onPress={() => handlePlayerCountChange(count)}
                    accessibilityRole="radio"
                    accessibilityLabel={`${count} players`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[styles.countButtonLabel, isSelected && styles.countButtonLabelSelected]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Player name inputs */}
            <ScrollView
              style={styles.nameList}
              contentContainerStyle={styles.nameListContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {Array.from({ length: playerCount }, (_, index) => (
                <View key={index} style={styles.nameRow}>
                  <TextInput
                    ref={(el: React.ElementRef<typeof TextInput> | null) => {
                      inputRefs.current[index] = el;
                    }}
                    value={playerNames[index] ?? ''}
                    onChangeText={(text: string) => handleNameChange(index, text)}
                    placeholder={`Player ${index + 1}`}
                    maxLength={MAX_NAME_LENGTH}
                    autoCapitalize="words"
                    accessibilityLabel={`Player ${index + 1} name`}
                    returnKeyType={index < playerCount - 1 ? 'next' : 'done'}
                    onSubmitEditing={() => {
                      if (index < playerCount - 1) {
                        inputRefs.current[index + 1]?.focus();
                      } else {
                        Keyboard.dismiss();
                      }
                    }}
                  />
                </View>
              ))}
            </ScrollView>

            {/* Validation hint */}
            {filledCount < MIN_PLAYERS && (
              <Text style={styles.validationHint} accessibilityLiveRegion="polite">
                Enter at least {MIN_PLAYERS} player names to start.
              </Text>
            )}

            {/* Action buttons */}
            <View style={styles.actions}>
              <View style={styles.cancelButton}>
                <Button
                  label="Cancel"
                  onPress={handleCancel}
                  variant="secondary"
                  size="medium"
                />
              </View>
              <View style={styles.startButton}>
                <Button
                  label={submitting ? 'Creating…' : 'Start Game'}
                  onPress={handleStartGame}
                  variant="primary"
                  size="medium"
                  disabled={!canStart}
                />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // -------------------------------------------------------------------------
  // Backdrop
  // -------------------------------------------------------------------------
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  // -------------------------------------------------------------------------
  // Safe area + centring wrapper
  // -------------------------------------------------------------------------
  safeArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dialogWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  // -------------------------------------------------------------------------
  // Dialog card
  // -------------------------------------------------------------------------
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation.high },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: elevation.high,
      },
    }),
  },

  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  // -------------------------------------------------------------------------
  // Player count selector
  // -------------------------------------------------------------------------
  sectionLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  playerCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.xxs,
  },

  countButton: {
    flex: 1,
    minHeight: touchTarget.minSize,
    minWidth: touchTarget.minSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },

  countButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  countButtonLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  countButtonLabelSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },

  // -------------------------------------------------------------------------
  // Name inputs list
  // -------------------------------------------------------------------------
  nameList: {
    // Constrain height so long lists don't overflow the dialog
    maxHeight: 280,
  },

  nameListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },

  nameRow: {
    // Ensure the row itself is at least 44dp tall (TextInput already
    // enforces its own minHeight, but this keeps layout consistent)
    minHeight: 44,
  },

  // -------------------------------------------------------------------------
  // Validation hint
  // -------------------------------------------------------------------------
  validationHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // -------------------------------------------------------------------------
  // Action buttons
  // -------------------------------------------------------------------------
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },

  cancelButton: {
    flex: 1,
  },

  startButton: {
    flex: 1,
  },
});
