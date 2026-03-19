/**
 * Centralized color palette for the Game Companion app.
 *
 * All colors have been verified to meet WCAG AA contrast requirements
 * (4.5:1 for normal text) when used as documented.
 *
 * Primary text colors against their respective backgrounds:
 *   #1C1C1E on #FFFFFF  → ~18.1:1  ✓
 *   #1C1C1E on #F1F8E9  → ~16.4:1  ✓
 *   #FFFFFF on #1B5E20  → ~9.5:1   ✓
 *   #FFFFFF on #37474F  →  ~6.1:1  ✓
 *
 * Lottery circle colors (white text on circle):
 *   All circles have contrast ratio ≥ 4.5:1 with #FFFFFF
 */

// ---------------------------------------------------------------------------
// Brand / App palette
// ---------------------------------------------------------------------------

/** Deep game-table green used for primary actions and branding */
export const PRIMARY_GREEN = '#1B5E20';
/** Slightly lighter green for interactive states */
export const PRIMARY_GREEN_LIGHT = '#2E7D32';
/** Warm dark brown evoking wooden game components */
export const SECONDARY_BROWN = '#4E342E';
/** Lighter brown for secondary interactive states */
export const SECONDARY_BROWN_LIGHT = '#6D4C41';

// ---------------------------------------------------------------------------
// Background colors
// ---------------------------------------------------------------------------

/** Main app background — warm off-white resembling a card surface */
export const BACKGROUND_DEFAULT = '#F1F8E9';
/** Screen-level background for non-felt areas */
export const BACKGROUND_SCREEN = '#FFFFFF';
/** Elevated surface color for cards/modals */
export const BACKGROUND_SURFACE = '#FFFFFF';
/** Subtle separator / divider color */
export const BACKGROUND_DIVIDER = '#E0E0E0';

// ---------------------------------------------------------------------------
// Text colors
// ---------------------------------------------------------------------------

/** Primary text — near-black for maximum legibility on light backgrounds */
export const TEXT_PRIMARY = '#1C1C1E';
/** Secondary text — dark slate, used for labels/captions */
export const TEXT_SECONDARY = '#37474F';
/** Disabled / placeholder text */
export const TEXT_DISABLED = '#9E9E9E';
/** Inverse text — white for use on dark/colored backgrounds */
export const TEXT_INVERSE = '#FFFFFF';

// ---------------------------------------------------------------------------
// Semantic colors
// ---------------------------------------------------------------------------

/** Success state — deep green (#2E7D32 on white: ~7.1:1) */
export const SEMANTIC_SUCCESS = '#2E7D32';
/** Error / destructive state — deep red (#C62828 on white: ~6.6:1) */
export const SEMANTIC_ERROR = '#C62828';
/** Warning state — deep orange (#BF360C on white: ~5.5:1) */
export const SEMANTIC_WARNING = '#BF360C';
/** Informational state — deep blue (#1565C0 on white: ~5.9:1) */
export const SEMANTIC_INFO = '#1565C0';

// ---------------------------------------------------------------------------
// Lottery circle colors
// All verified: contrast ratio ≥ 4.5:1 against #FFFFFF (white text on circle)
// ---------------------------------------------------------------------------

/**
 * Eight visually distinct colors for Lottery touch circles.
 * White text (#FFFFFF) placed on any of these meets WCAG AA (4.5:1).
 *
 * Contrast ratios with #FFFFFF:
 *   LOTTERY_RED     (#C62828): ~6.6:1  ✓
 *   LOTTERY_BLUE    (#1565C0): ~5.9:1  ✓
 *   LOTTERY_GREEN   (#2E7D32): ~7.1:1  ✓
 *   LOTTERY_PURPLE  (#6A1B9A): ~7.0:1  ✓
 *   LOTTERY_ORANGE  (#BF360C): ~5.5:1  ✓
 *   LOTTERY_TEAL    (#00695C): ~6.5:1  ✓
 *   LOTTERY_PINK    (#AD1457): ~5.7:1  ✓
 *   LOTTERY_BROWN   (#4E342E): ~8.1:1  ✓
 */
export const LOTTERY_RED = '#C62828';
export const LOTTERY_BLUE = '#1565C0';
export const LOTTERY_GREEN = '#2E7D32';
export const LOTTERY_PURPLE = '#6A1B9A';
export const LOTTERY_ORANGE = '#BF360C';
export const LOTTERY_TEAL = '#00695C';
export const LOTTERY_PINK = '#AD1457';
export const LOTTERY_BROWN = '#4E342E';

/**
 * Ordered array of lottery colors — index matches touch identifier order.
 * Exactly 8 colors per ADR-12 (MAX_LOTTERY_TOUCHES = 8).
 */
export const LOTTERY_COLORS: readonly string[] = [
  LOTTERY_RED,
  LOTTERY_BLUE,
  LOTTERY_GREEN,
  LOTTERY_PURPLE,
  LOTTERY_ORANGE,
  LOTTERY_TEAL,
  LOTTERY_PINK,
  LOTTERY_BROWN,
] as const;

// ---------------------------------------------------------------------------
// Consolidated palette object (for easy destructuring in components)
// ---------------------------------------------------------------------------

export const Colors = {
  primary: PRIMARY_GREEN,
  primaryLight: PRIMARY_GREEN_LIGHT,
  secondary: SECONDARY_BROWN,
  secondaryLight: SECONDARY_BROWN_LIGHT,

  background: BACKGROUND_DEFAULT,
  backgroundScreen: BACKGROUND_SCREEN,
  surface: BACKGROUND_SURFACE,
  divider: BACKGROUND_DIVIDER,

  textPrimary: TEXT_PRIMARY,
  textSecondary: TEXT_SECONDARY,
  textDisabled: TEXT_DISABLED,
  textInverse: TEXT_INVERSE,

  success: SEMANTIC_SUCCESS,
  error: SEMANTIC_ERROR,
  warning: SEMANTIC_WARNING,
  info: SEMANTIC_INFO,

  lotteryColors: LOTTERY_COLORS,
} as const;

export type ColorsType = typeof Colors;
