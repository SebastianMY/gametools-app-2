/**
 * LotteryScreen — multi-touch player selection (Lottery feature).
 *
 * Feature flow (FR-L1 – FR-L10):
 *   1. Players place fingers simultaneously — a coloured circle appears for each (FR-L2/L3).
 *   2. Once 2+ fingers are present and stable, a 3-second countdown begins (FR-L4).
 *   3. If any finger is added or removed the countdown resets (FR-L9).
 *   4. After 3 stable seconds, `LotteryEngine.selectWinner()` is called (FR-L6).
 *   5. The winner circle grows; all other circles fade out (FR-L7).
 *   6. A winner announcement is displayed (FR-L8).
 *   7. "Play Again" resets the surface for another round (FR-L10).
 *   8. A 9th simultaneous touch is rejected with a brief overlay message (ADR-12).
 *
 * State management:
 *   - activeTouches  : Touch[] — current tracked touches with assigned colours.
 *   - winner         : Touch | null — selected winner, null until countdown completes.
 *   - countdown      : number | null — visual countdown in seconds (null = not counting).
 *   - showMaxMessage : boolean — brief "max 8 players" overlay.
 *   - roundKey       : number — incremented on "Play Again" to remount TouchSurface.
 *
 * Animations use React Native's built-in Animated API (ADR-4).
 * Multi-touch tracking uses React Native Gesture Handler (ADR-3).
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { TouchCircle } from '../../components/lottery/TouchCircle';
import {
  RawTouchPoint,
  TouchSurface,
} from '../../components/lottery/TouchSurface';
import { RootStackScreenProps } from '../../navigation/types';
import { LotteryEngine } from '../../services/lottery/LotteryEngine';
import { colors, spacing, typography } from '../../styles/theme';
import { Touch } from '../../types/Touch';
import {
  LOTTERY_STABILITY_MS,
  MAX_LOTTERY_TOUCHES,
} from '../../utils/constants';
import {
  LOTTERY_BLUE,
  LOTTERY_BROWN,
  LOTTERY_COLORS,
  LOTTERY_GREEN,
  LOTTERY_ORANGE,
  LOTTERY_PINK,
  LOTTERY_PURPLE,
  LOTTERY_RED,
  LOTTERY_TEAL,
} from '../../utils/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = RootStackScreenProps<'Lottery'>;

/** Human-readable names for lottery circle colours (used in winner announcement). */
const COLOR_NAMES: Record<string, string> = {
  [LOTTERY_RED]: 'Red',
  [LOTTERY_BLUE]: 'Blue',
  [LOTTERY_GREEN]: 'Green',
  [LOTTERY_PURPLE]: 'Purple',
  [LOTTERY_ORANGE]: 'Orange',
  [LOTTERY_TEAL]: 'Teal',
  [LOTTERY_PINK]: 'Pink',
  [LOTTERY_BROWN]: 'Brown',
};

/** Minimum players required to start the countdown. */
const MIN_PLAYERS = 2;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LotteryScreen(_props: Props): React.JSX.Element {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [activeTouches, setActiveTouches] = useState<Touch[]>([]);
  const [winner, setWinner] = useState<Touch | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showMaxMessage, setShowMaxMessage] = useState(false);
  /** Incremented on Play Again to remount TouchSurface and reset its internal state. */
  const [roundKey, setRoundKey] = useState(0);

  // -------------------------------------------------------------------------
  // Refs
  // -------------------------------------------------------------------------
  /** Mirror of activeTouches for safe access inside setTimeout callbacks. */
  const activeTouchesRef = useRef<Touch[]>([]);
  const maxMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activeTouchesRef.current = activeTouches;
  }, [activeTouches]);

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  /**
   * A stable string key representing the *identity* of the active touch set
   * (sorted IDs joined). Changes only when touches are added or removed —
   * NOT when fingers move — so countdown timers reset on add/remove only.
   */
  const touchIdentityKey = useMemo(
    () => activeTouches.map((t) => t.id).sort().join(','),
    [activeTouches],
  );

  const touchCount = activeTouches.length;

  // -------------------------------------------------------------------------
  // TouchSurface callbacks
  // -------------------------------------------------------------------------

  /**
   * Merges incoming raw touches with the existing state to preserve colour
   * assignments for touches that are still active.
   */
  const handleTouchesChange = useCallback((rawTouches: RawTouchPoint[]) => {
    setActiveTouches((prevTouches) => {
      const prevMap = new Map<string, Touch>(prevTouches.map((t) => [t.id, t]));

      // Colours currently in use by continuing touches (not lifted ones).
      const continuingIds = new Set(rawTouches.map((r) => r.id));
      const usedColors = new Set(
        prevTouches.filter((t) => continuingIds.has(t.id)).map((t) => t.color),
      );

      return rawTouches.map((raw) => {
        const existing = prevMap.get(raw.id);
        if (existing) {
          // Finger still down — update position, keep colour.
          return { ...existing, x: raw.x, y: raw.y, timestamp: Date.now() };
        }
        // New finger — assign the first unused lottery colour.
        const color =
          (LOTTERY_COLORS as readonly string[]).find(
            (c) => !usedColors.has(c),
          ) ?? LOTTERY_COLORS[0];
        usedColors.add(color);
        return {
          id: raw.id,
          x: raw.x,
          y: raw.y,
          timestamp: Date.now(),
          color,
        };
      });
    });
  }, []);

  /** Shows the "max players" message for 2 seconds when a 9th touch is rejected. */
  const handleMaxTouchesExceeded = useCallback(() => {
    setShowMaxMessage(true);
    if (maxMessageTimerRef.current !== null) {
      clearTimeout(maxMessageTimerRef.current);
    }
    maxMessageTimerRef.current = setTimeout(() => {
      setShowMaxMessage(false);
      maxMessageTimerRef.current = null;
    }, 2000);
  }, []);

  // Cleanup max-message timer on unmount.
  useEffect(() => {
    return () => {
      if (maxMessageTimerRef.current !== null) {
        clearTimeout(maxMessageTimerRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // Countdown timer effects
  // -------------------------------------------------------------------------

  /**
   * Visual countdown: counts 3 → 2 → 1 while touches are stable (≥ MIN_PLAYERS).
   * Resets whenever the touch identity changes or a winner is already selected.
   */
  useEffect(() => {
    if (winner !== null || touchCount < MIN_PLAYERS) {
      setCountdown(null);
      return;
    }

    setCountdown(3);
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalId);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touchIdentityKey, winner, touchCount]);
  // Note: touchIdentityKey encodes touch identity; touchCount guards the < 2 check.

  /**
   * Winner selection: after `LOTTERY_STABILITY_MS` of stable touches (≥ MIN_PLAYERS),
   * select a random winner via `LotteryEngine.selectWinner()`.
   * Resets whenever the touch identity changes or a winner is already selected.
   */
  useEffect(() => {
    if (winner !== null || touchCount < MIN_PLAYERS) return;

    const timeoutId = setTimeout(() => {
      const touches = activeTouchesRef.current;
      if (touches.length >= MIN_PLAYERS) {
        setWinner(LotteryEngine.selectWinner(touches));
      }
    }, LOTTERY_STABILITY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touchIdentityKey, winner, touchCount]);
  // activeTouchesRef.current is accessed inside the timeout — no closure staleness.

  // -------------------------------------------------------------------------
  // Play Again
  // -------------------------------------------------------------------------

  /** Resets all state and remounts TouchSurface for a fresh round. */
  const handlePlayAgain = useCallback(() => {
    setWinner(null);
    setActiveTouches([]);
    setCountdown(null);
    setShowMaxMessage(false);
    setRoundKey((k) => k + 1);
  }, []);

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const winnerColorName = winner ? (COLOR_NAMES[winner.color] ?? 'Unknown') : null;

  /** Status message shown at the top of the surface during non-winner phases. */
  const statusMessage: string | null = (() => {
    if (winner !== null) return null; // Winner overlay takes over.
    if (touchCount === 0) return 'Place your fingers on the screen';
    if (touchCount === 1) return 'Add more fingers to play';
    if (countdown !== null) return `Selecting in ${countdown}…`;
    return null;
  })();

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Full-screen touch surface — disabled once a winner is selected. */}
      <TouchSurface
        key={roundKey}
        onTouchesChange={handleTouchesChange}
        onMaxTouchesExceeded={handleMaxTouchesExceeded}
        maxTouches={MAX_LOTTERY_TOUCHES}
        disabled={winner !== null}
      >
        {/* Touch circles — one per active touch. */}
        {activeTouches.map((touch) => (
          <TouchCircle
            key={touch.id}
            x={touch.x}
            y={touch.y}
            color={touch.color}
            isWinner={winner?.id === touch.id}
            growing={winner?.id === touch.id}
            fading={winner !== null && winner.id !== touch.id}
          />
        ))}

        {/* Status message overlay (non-interactive — passes through to surface). */}
        {statusMessage !== null && (
          <View
            style={styles.statusOverlay}
            pointerEvents="none"
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.statusText} accessibilityRole="text">
              {statusMessage}
            </Text>
          </View>
        )}

        {/* "Max players" transient message. */}
        {showMaxMessage && (
          <View
            style={styles.maxMessageOverlay}
            pointerEvents="none"
            accessibilityLiveRegion="assertive"
          >
            <Text style={styles.maxMessageText}>
              Maximum {MAX_LOTTERY_TOUCHES} players reached
            </Text>
          </View>
        )}

        {/* Winner announcement — shown inside surface for visual alignment. */}
        {winner !== null && (
          <View
            style={styles.winnerOverlay}
            pointerEvents="none"
            accessibilityLiveRegion="assertive"
          >
            <Text
              style={styles.winnerTitle}
              accessibilityRole="header"
            >
              We have a winner!
            </Text>
            <Text
              style={[styles.winnerColorLabel, { color: winner.color }]}
              accessibilityLabel={`${winnerColorName} circle wins`}
            >
              {winnerColorName}
            </Text>
          </View>
        )}
      </TouchSurface>

      {/* Play Again button — rendered outside TouchSurface so it receives taps. */}
      {winner !== null && (
        <View style={styles.playAgainContainer}>
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={handlePlayAgain}
            accessibilityRole="button"
            accessibilityLabel="Play Again"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.playAgainLabel}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

/** Dark game-table background colour — provides contrast for coloured circles. */
const SURFACE_BACKGROUND = '#1A1A2E';
/** Semi-transparent overlay background for status messages. */
const OVERLAY_BG = 'rgba(0, 0, 0, 0.55)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SURFACE_BACKGROUND,
  },

  // ---- Touch circle overlay (status messages) ----

  statusOverlay: {
    position: 'absolute',
    top: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusText: {
    ...typography.h3,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: OVERLAY_BG,
    borderRadius: 24,
    overflow: 'hidden',
  },

  // ---- Max players message ----

  maxMessageOverlay: {
    position: 'absolute',
    bottom: spacing.xxxl + spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  maxMessageText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(191, 54, 12, 0.85)', // Semantic warning with opacity
    borderRadius: 24,
    overflow: 'hidden',
  },

  // ---- Winner announcement ----

  winnerOverlay: {
    position: 'absolute',
    top: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  winnerTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: OVERLAY_BG,
    borderRadius: 24,
    overflow: 'hidden',
  },
  winnerColorLabel: {
    fontSize: 40,
    fontWeight: '800' as const,
    textAlign: 'center',
    // Drop shadow for legibility on any background.
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // ---- Play Again button ----

  playAgainContainer: {
    position: 'absolute',
    bottom: spacing.xxxl,
    left: 0,
    right: 0,
    alignItems: 'center',
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
    // Shadow
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
