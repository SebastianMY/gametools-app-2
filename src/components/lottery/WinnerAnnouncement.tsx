/**
 * WinnerAnnouncement — full-screen overlay announcing the Lottery winner.
 *
 * Displayed after the 3-second countdown completes and a winner is selected
 * (FR-L7, FR-L8, FR-L10). Responsibilities:
 *   - Fade-in overlay to emphasise the winner without abruptly hiding circles.
 *   - "Player in [Color] circle wins!" message with the winner's color.
 *   - A "Play Again" button that triggers a full round reset (FR-L10).
 *
 * Animations use the built-in React Native Animated API (ADR-4).
 * All text elements meet WCAG AA contrast on the dark overlay (NFR-A1).
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, spacing, typography } from '../../styles/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Duration of the overlay fade-in animation in milliseconds. */
const FADE_IN_DURATION_MS = 400;

/** Semi-transparent overlay — dark enough for legibility, light enough to show circles beneath. */
const OVERLAY_BG = 'rgba(0, 0, 0, 0.65)';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WinnerAnnouncementProps {
  /**
   * Hex color string of the winning touch circle.
   * Must be a WCAG AA compliant lottery color.
   */
  winnerColor: string;
  /**
   * Human-readable name for the winning color (e.g., "Red", "Blue").
   * Included in the winner message and accessibility label.
   */
  winnerColorName: string;
  /** Callback invoked when the user taps "Play Again". */
  onPlayAgain: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Animated full-screen overlay that announces the Lottery winner.
 * Fades in on mount and renders above all other content.
 */
export function WinnerAnnouncement({
  winnerColor,
  winnerColorName,
  onPlayAgain,
}: WinnerAnnouncementProps): React.JSX.Element {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in the overlay when the component mounts.
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: FADE_IN_DURATION_MS,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only.

  const winnerMessage = `Player in ${winnerColorName} circle wins!`;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      // Overlay is informational — accessible announcement via liveRegion.
      accessibilityLiveRegion="assertive"
    >
      {/* Inner container — vertically centred announcement card. */}
      <View
        style={styles.card}
        accessibilityRole="alert"
        accessible
        accessibilityLabel={winnerMessage}
      >
        <Text style={styles.title} accessibilityRole="header">
          We have a winner!
        </Text>

        {/* Color swatch + name — primary visual indicator of the winner. */}
        <View style={styles.colorRow}>
          <View
            style={[styles.colorSwatch, { backgroundColor: winnerColor }]}
            accessibilityElementsHidden
          />
          <Text
            style={[styles.colorName, { color: winnerColor }]}
            accessibilityElementsHidden
          >
            {winnerColorName}
          </Text>
        </View>

        {/* Subtitle with full readable announcement for screen readers. */}
        <Text
          style={styles.subtitle}
          accessibilityLabel={winnerMessage}
        >
          {winnerMessage}
        </Text>
      </View>

      {/* Play Again button — outside the card so it stands out as an action. */}
      <TouchableOpacity
        style={styles.playAgainButton}
        onPress={onPlayAgain}
        accessibilityRole="button"
        accessibilityLabel="Play Again"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.playAgainLabel}>Play Again</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    // Ensure overlay is above touch circles rendered behind it.
    zIndex: 10,
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    // Subtle border for definition against overlay.
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Shadow for depth.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },

  title: {
    ...typography.h2,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // Shadow so the swatch reads against any background.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  colorName: {
    fontSize: 40,
    fontWeight: '800' as const,
    textAlign: 'center',
    // Drop shadow for legibility on any background.
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  subtitle: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  playAgainButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: 32,
    minWidth: 160,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for prominence.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },

  playAgainLabel: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
});
