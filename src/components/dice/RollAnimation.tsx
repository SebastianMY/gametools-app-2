/**
 * RollAnimation — reusable spinning animation wrapper for a single die.
 *
 * Uses the built-in React Native Animated API (per ADR-4). When `isAnimating`
 * is true, the component spins its children using the `createDiceRollAnimation`
 * helper (8 iterations × 150 ms = 1 200 ms, well within the 0.5–1.5 s spec).
 *
 * Only one instance per dice set needs to receive `onAnimationComplete`; the
 * rest simply stop once `isAnimating` returns to false.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { createDiceRollAnimation } from '../../utils/animations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RollAnimationProps {
  /** When true the child spins; when false it is rendered statically. */
  isAnimating: boolean;
  /**
   * Called once when the animation sequence finishes naturally (i.e. after all
   * loop iterations complete). Ignored if `isAnimating` becomes false before
   * the animation ends.
   */
  onAnimationComplete?: () => void;
  /** Content to apply the spinning transform to. */
  children: React.ReactNode;
  /** Additional styles forwarded to the Animated.View wrapper. */
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RollAnimation({
  isAnimating,
  onAnimationComplete,
  children,
  style,
}: RollAnimationProps): React.ReactElement {
  // Create a stable animation controller for this instance.
  const controller = useMemo(() => createDiceRollAnimation(), []);
  // Keep a ref to the running composite animation so we can stop it on cleanup.
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!isAnimating) {
      // Stop any in-progress animation and reset to the neutral position.
      animRef.current?.stop();
      controller.reset();
      return;
    }

    const anim = controller.spin();
    animRef.current = anim;

    anim.start(({ finished }: { finished: boolean }) => {
      if (finished) {
        controller.reset();
        onAnimationComplete?.();
      }
    });

    return () => {
      anim.stop();
    };
    // onAnimationComplete is intentionally excluded from deps — callers may
    // pass inline arrows; we don't want to restart the animation if only the
    // callback reference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating]);

  const rotate = controller.spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[style, { transform: [{ rotate }] }]}>
      {children}
    </Animated.View>
  );
}
