/**
 * GameDeleteModal — Confirmation dialog for deleting a saved game.
 *
 * Responsibilities:
 *  • Overlay with semi-transparent backdrop that respects safe areas.
 *  • Displays the game name in the confirmation message.
 *  • "Delete" button (danger / red) — calls deleteGame(), clears currentGame
 *    if it was the active game (handled by context), closes the modal, and
 *    invokes onDeleted() so the parent can navigate to ScoreHome.
 *  • "Cancel" button — dismisses without deleting.
 *
 * Triggered by:
 *  • Long-press on a GameListItem in ScoreHomeScreen.
 *  • Delete button in ScoreGameScreen (optional).
 *
 * Accessibility:
 *  • All interactive elements meet the 44×44 dp minimum touch target (NFR-A2).
 *  • Modal announces itself to screen readers via accessibilityViewIsModal.
 *  • "Delete" button carries accessibilityLabel describing the destructive action.
 */

import React, { useCallback, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/common/Button';
import { useGameState } from '../../context/hooks/useGameState';
import {
  borderRadius,
  colors,
  elevation,
  spacing,
  typography,
} from '../../styles/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GameDeleteModalProps {
  /** Controls whether the dialog is visible */
  visible: boolean;
  /** The ID of the game to delete */
  gameId: string;
  /** Human-readable name shown in the confirmation message */
  gameName: string;
  /** Called when the user cancels (no game deleted) */
  onDismiss: () => void;
  /**
   * Called after the game has been successfully deleted.
   * The parent should navigate back to ScoreHome on this callback.
   */
  onDeleted: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GameDeleteModal({
  visible,
  gameId,
  gameName,
  onDismiss,
  onDeleted,
}: GameDeleteModalProps): React.ReactElement {
  const { deleteGame } = useGameState();

  const [deleting, setDeleting] = useState(false);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleCancel = useCallback(() => {
    if (deleting) return;
    onDismiss();
  }, [deleting, onDismiss]);

  const handleDelete = useCallback(async () => {
    if (deleting) return;

    setDeleting(true);
    try {
      await deleteGame(gameId);
      onDeleted();
    } finally {
      // Reset deleting state in case the component is reused without unmounting.
      setDeleting(false);
    }
  }, [deleting, deleteGame, gameId, onDeleted]);

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
              Delete Game
            </Text>

            {/* Confirmation message */}
            <Text style={styles.message}>
              Delete game{' '}
              <Text style={styles.gameName}>"{gameName}"</Text>? This cannot be undone.
            </Text>

            {/* Action buttons */}
            <View style={styles.actions}>
              <View style={styles.cancelButton}>
                <Button
                  label="Cancel"
                  onPress={handleCancel}
                  variant="secondary"
                  size="medium"
                  disabled={deleting}
                />
              </View>
              <View style={styles.deleteButton}>
                <Button
                  label={deleting ? 'Deleting…' : 'Delete'}
                  onPress={handleDelete}
                  variant="danger"
                  size="medium"
                  disabled={deleting}
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  // -------------------------------------------------------------------------
  // Message
  // -------------------------------------------------------------------------
  message: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },

  gameName: {
    fontWeight: '700',
    color: colors.text,
  },

  // -------------------------------------------------------------------------
  // Action buttons
  // -------------------------------------------------------------------------
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  cancelButton: {
    flex: 1,
  },

  deleteButton: {
    flex: 1,
  },
});
