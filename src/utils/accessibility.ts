/**
 * Accessibility utilities for WCAG AA compliance.
 * Implements contrast ratio calculations per WCAG 2.1 spec:
 * https://www.w3.org/TR/WCAG21/#contrast-minimum
 */

/**
 * Parses a hex color string (#RRGGBB or #RGB) into [r, g, b] components (0–255).
 */
function parseHex(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  let r: number;
  let g: number;
  let b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
  } else {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return [r, g, b];
}

/**
 * Converts a single 8-bit channel value to its linear light contribution
 * per WCAG relative luminance formula.
 */
function linearize(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the relative luminance of a hex color per WCAG 2.1.
 * @returns Luminance in range [0, 1]
 */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  const R = linearize(r);
  const G = linearize(g);
  const B = linearize(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculates the contrast ratio between two hex colors per WCAG 2.1.
 * @returns Contrast ratio in range [1, 21]
 */
export function getContrastRatio(foreground: string, background: string): number {
  const L1 = getRelativeLuminance(foreground);
  const L2 = getRelativeLuminance(background);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks whether two colors meet WCAG AA contrast requirements.
 * - Normal text: 4.5:1
 * - Large text (18pt+ or 14pt+ bold): 3:1
 */
export function meetsWcagAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const required = isLargeText ? 3.0 : 4.5;
  return ratio >= required;
}

/**
 * Checks whether two colors meet WCAG AAA contrast requirements.
 * - Normal text: 7:1
 * - Large text: 4.5:1
 */
export function meetsWcagAAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const required = isLargeText ? 4.5 : 7.0;
  return ratio >= required;
}

/**
 * Returns the accessible text color (#FFFFFF or #000000) that provides
 * the highest contrast against the given background.
 */
export function getAccessibleTextColor(background: string): string {
  const onWhite = getContrastRatio('#FFFFFF', background);
  const onBlack = getContrastRatio('#000000', background);
  return onWhite >= onBlack ? '#FFFFFF' : '#000000';
}
