/**
 * Reusable Animated configuration objects for the Game Companion app.
 *
 * Per ADR-4 the app uses the built-in React Native Animated API (not Reanimated 2)
 * for all animations:
 *   - Dice: spinning roll effect
 *   - Lottery: circle grow and fade-out effects
 *
 * Each exported object owns its own Animated.Value instance so that multiple
 * consumers can use them independently without shared state conflicts.
 * Call the helper functions to start / reset each animation.
 */

import { Animated, Easing } from 'react-native';

// ---------------------------------------------------------------------------
// Dice roll spinning animation
// ---------------------------------------------------------------------------

/**
 * Creates a fresh dice roll animation controller.
 *
 * Usage:
 *   const anim = createDiceRollAnimation();
 *   // Interpolate for rotation:
 *   const rotate = anim.spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
 *   anim.spin();    // start
 *   anim.reset();   // reset to initial state
 */
export interface DiceRollAnimation {
  /** Animated value ranging from 0 → 1 during a full spin cycle. */
  spinValue: Animated.Value;
  /** Starts the spin animation (loops 8 times then resolves). */
  spin: () => Animated.CompositeAnimation;
  /** Resets spinValue to 0. */
  reset: () => void;
}

export function createDiceRollAnimation(): DiceRollAnimation {
  const spinValue = new Animated.Value(0);

  const spin = (): Animated.CompositeAnimation => {
    spinValue.setValue(0);
    return Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: 8 },
    );
  };

  const reset = (): void => {
    spinValue.setValue(0);
  };

  return { spinValue, spin, reset };
}

/**
 * Module-level singleton for the dice roll animation.
 * Suitable for screens that only ever show one rolling die at a time.
 */
export const diceRollAnimation: DiceRollAnimation = createDiceRollAnimation();

// ---------------------------------------------------------------------------
// Lottery circle grow animation
// ---------------------------------------------------------------------------

/**
 * Creates a fresh circle-grow animation controller used by the Lottery feature.
 *
 * Usage:
 *   const anim = createCircleGrowAnimation();
 *   // Interpolate for scale:
 *   const scale = anim.scaleValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
 *   anim.grow();   // animate from 0 → 1
 *   anim.reset();  // reset to initial state
 */
export interface CircleGrowAnimation {
  /** Animated value ranging from 0 → 1 as the circle expands. */
  scaleValue: Animated.Value;
  /** Animates the circle growing from nothing to full size. */
  grow: () => Animated.CompositeAnimation;
  /** Resets scaleValue to 0. */
  reset: () => void;
}

export function createCircleGrowAnimation(): CircleGrowAnimation {
  const scaleValue = new Animated.Value(0);

  const grow = (): Animated.CompositeAnimation => {
    scaleValue.setValue(0);
    return Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    });
  };

  const reset = (): void => {
    scaleValue.setValue(0);
  };

  return { scaleValue, grow, reset };
}

/**
 * Module-level singleton for the circle grow animation.
 */
export const circleGrowAnimation: CircleGrowAnimation =
  createCircleGrowAnimation();

// ---------------------------------------------------------------------------
// Lottery fade-out animation
// ---------------------------------------------------------------------------

/**
 * Creates a fresh fade-out animation controller used by the Lottery feature.
 *
 * Usage:
 *   const anim = createFadeOutAnimation();
 *   // Apply directly as the `opacity` style prop.
 *   anim.fadeOut();  // animate opacity 1 → 0
 *   anim.reset();    // reset opacity to 1
 */
export interface FadeOutAnimation {
  /** Animated value for opacity, starting at 1 (fully visible). */
  opacityValue: Animated.Value;
  /** Animates opacity from 1 → 0. */
  fadeOut: () => Animated.CompositeAnimation;
  /** Resets opacityValue to 1. */
  reset: () => void;
}

export function createFadeOutAnimation(): FadeOutAnimation {
  const opacityValue = new Animated.Value(1);

  const fadeOut = (): Animated.CompositeAnimation => {
    opacityValue.setValue(1);
    return Animated.timing(opacityValue, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  };

  const reset = (): void => {
    opacityValue.setValue(1);
  };

  return { opacityValue, fadeOut, reset };
}

/**
 * Module-level singleton for the fade-out animation.
 */
export const fadeOutAnimation: FadeOutAnimation = createFadeOutAnimation();
