/**
 * TouchSurface — full-screen multi-touch tracking surface for the Lottery feature.
 *
 * Uses React Native Gesture Handler's Gesture API (ADR-3) to reliably track
 * up to `maxTouches` simultaneous touch points on both iOS and Android.
 *
 * Implementation notes:
 *  - Uses `Gesture.Manual()` for fine-grained access to individual touch events.
 *  - `stateManager.activate()` is called on first touch so subsequent events
 *    (moves, lifts) continue to fire.
 *  - A `GestureHandlerRootView` wraps the surface because the app root (App.tsx)
 *    does not yet include one; nesting is supported by RNGH.
 *  - Callback references and flags are held in refs so the gesture object never
 *    needs to be recreated (stable `useMemo` with empty dep array).
 *  - The 9th (and beyond) touch triggers `onMaxTouchesExceeded` and is silently
 *    dropped, per ADR-12.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  type GestureTouchEvent,
  type GestureStateManager,
} from 'react-native-gesture-handler';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single raw touch point as reported by the native gesture system. */
export interface RawTouchPoint {
  /** Stringified native touch identifier — unique per active finger. */
  id: string;
  /** X coordinate relative to the top-left corner of this surface. */
  x: number;
  /** Y coordinate relative to the top-left corner of this surface. */
  y: number;
}

export interface TouchSurfaceProps {
  /**
   * Called whenever the set of active touches changes (finger down, move, or up).
   * Receives the **complete** current list of tracked touches.
   */
  onTouchesChange: (touches: RawTouchPoint[]) => void;
  /**
   * Called when an additional touch is rejected because `maxTouches` are
   * already active (i.e. the 9th finger per ADR-12).
   */
  onMaxTouchesExceeded?: () => void;
  /**
   * Maximum simultaneous touches to track.
   * Defaults to 8 per ADR-12 (`MAX_LOTTERY_TOUCHES`).
   */
  maxTouches?: number;
  /**
   * When `true` the surface ignores all touch events and does not invoke
   * callbacks. Use this to freeze touch state after a winner is selected.
   */
  disabled?: boolean;
  /** Content rendered on top of the touch surface (e.g. TouchCircles). */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Full-screen touch tracking surface.
 *
 * Wrap children with this component to receive multi-touch coordinate updates
 * via `onTouchesChange`. Enforces a hard cap of `maxTouches` simultaneous
 * touches — excess touches are silently dropped.
 */
export function TouchSurface({
  onTouchesChange,
  onMaxTouchesExceeded,
  maxTouches = 8,
  disabled = false,
  children,
}: TouchSurfaceProps): React.JSX.Element {
  // Internal map: touchId → RawTouchPoint.  Mutated synchronously in gesture
  // callbacks to avoid stale closures without needing reactive state.
  const activeTouchesRef = useRef<Map<string, RawTouchPoint>>(new Map());

  // -------------------------------------------------------------------------
  // Callback refs — updated every render so the gesture (created once) always
  // calls the latest versions without being recreated.
  // -------------------------------------------------------------------------
  const disabledRef = useRef(disabled);
  const maxTouchesRef = useRef(maxTouches);
  const onTouchesChangeRef = useRef(onTouchesChange);
  const onMaxTouchesExceededRef = useRef(onMaxTouchesExceeded);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    maxTouchesRef.current = maxTouches;
  }, [maxTouches]);

  useEffect(() => {
    onTouchesChangeRef.current = onTouchesChange;
  }, [onTouchesChange]);

  useEffect(() => {
    onMaxTouchesExceededRef.current = onMaxTouchesExceeded;
  }, [onMaxTouchesExceeded]);

  // -------------------------------------------------------------------------
  // Gesture — created once (empty dep array) and reads all mutable state
  // through refs to stay up to date without recreating.
  // -------------------------------------------------------------------------
  const gesture = useMemo(
    () =>
      Gesture.Manual()
        .onTouchesDown((event: GestureTouchEvent, stateManager: GestureStateManager) => {
          // Transition to ACTIVE so move / up events continue to fire.
          stateManager.activate();

          if (disabledRef.current) return;

          let exceeded = false;
          for (const touch of event.changedTouches) {
            const id = String(touch.id);
            if (activeTouchesRef.current.size >= maxTouchesRef.current) {
              exceeded = true;
              continue; // Ignore touches beyond the limit (ADR-12).
            }
            activeTouchesRef.current.set(id, { id, x: touch.x, y: touch.y });
          }

          if (exceeded) {
            onMaxTouchesExceededRef.current?.();
          }

          onTouchesChangeRef.current(
            Array.from(activeTouchesRef.current.values()),
          );
        })
        .onTouchesMove((event: GestureTouchEvent) => {
          if (disabledRef.current) return;

          for (const touch of event.changedTouches) {
            const id = String(touch.id);
            // Only update touches that are already tracked (ignore overflow ones).
            if (activeTouchesRef.current.has(id)) {
              activeTouchesRef.current.set(id, { id, x: touch.x, y: touch.y });
            }
          }

          onTouchesChangeRef.current(
            Array.from(activeTouchesRef.current.values()),
          );
        })
        .onTouchesUp((event: GestureTouchEvent) => {
          if (disabledRef.current) return;

          for (const touch of event.changedTouches) {
            activeTouchesRef.current.delete(String(touch.id));
          }

          onTouchesChangeRef.current(
            Array.from(activeTouchesRef.current.values()),
          );
        })
        .onTouchesCancelled(() => {
          // All pointers lost — clear everything.
          activeTouchesRef.current.clear();
          onTouchesChangeRef.current([]);
        }),
    [], // Intentionally empty: state is accessed through refs above.
  );

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <GestureDetector gesture={gesture}>
        {/*
         * collapsable={false} prevents the native view from being merged
         * with its parent, which could displace touch coordinate origins.
         */}
        <View style={styles.surface} collapsable={false}>
          {children}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
  surface: {
    flex: 1,
  },
});
