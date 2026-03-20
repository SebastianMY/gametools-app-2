/**
 * TouchCircle — visual circle representing a single active touch point
 * in the Lottery feature.
 *
 * Each circle is positioned absolutely at (x, y) on the touch surface,
 * centered on the contact point. Animations use the built-in React Native
 * Animated API (ADR-4):
 *   - Initial appear: spring scale 0 → 1
 *   - Winner grow:    spring scale 1 → WINNER_SCALE (isWinner + growing)
 *   - Non-winner fade: timing opacity 1 → 0 (fading)
 *
 * Accessibility: each circle has an accessibilityRole and label.
 * The winner trophy icon meets WCAG AA contrast (#FFFFFF on colored background).
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Diameter of a normal touch circle in density-independent pixels. */
const CIRCLE_SIZE = 80;

/** Scale factor applied to the winner circle's grow animation. */
const WINNER_SCALE = 2.0;

/** Duration of the non-winner fade-out animation in milliseconds. */
const FADE_DURATION_MS = 600;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TouchCircleProps {
  /** X coordinate of the circle centre (relative to the touch surface). */
  x: number;
  /** Y coordinate of the circle centre (relative to the touch surface). */
  y: number;
  /** Background fill colour — must be a WCAG AA compliant lottery colour. */
  color: string;
  /** Whether this circle is the selected winner. */
  isWinner: boolean;
  /**
   * When true, plays the celebration / winner grow animation.
   * Meaningful only when `isWinner` is also true.
   */
  growing: boolean;
  /**
   * When true, animates opacity to 0 (non-winner fade-out).
   * Has no effect on the winner circle.
   */
  fading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Animated circle anchored at the touch contact point.
 * Appears with a spring animation on mount and responds to winner / fading states.
 */
export function TouchCircle({
  x,
  y,
  color,
  isWinner,
  growing,
  fading = false,
}: TouchCircleProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Initial appear: spring from invisible to full size.
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only.

  // Winner grow: scale up to WINNER_SCALE when this circle wins.
  useEffect(() => {
    if (isWinner && growing) {
      Animated.spring(scaleAnim, {
        toValue: WINNER_SCALE,
        friction: 3,
        tension: 25,
        useNativeDriver: true,
      }).start();
    }
  }, [isWinner, growing, scaleAnim]);

  // Non-winner fade-out: animate opacity to 0.
  useEffect(() => {
    if (fading) {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start();
    }
  }, [fading, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          backgroundColor: color,
          // Centre the circle on the contact point.
          left: x - CIRCLE_SIZE / 2,
          top: y - CIRCLE_SIZE / 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={isWinner ? 'Winner circle' : 'Player touch circle'}
    >
      {isWinner && (
        <Text style={styles.winnerIcon} accessibilityLabel="winner star">
          ★
        </Text>
      )}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    // Shadow (Android)
    elevation: 8,
  },
  winnerIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
