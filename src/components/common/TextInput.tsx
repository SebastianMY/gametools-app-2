/**
 * TextInput — Accessible text input with visible focus state.
 *
 * Enforces a minimum 44×44 dp touch area per WCAG NFR-A2. The border color
 * transitions to the primary brand color when the field is focused so that
 * keyboard-driven and low-vision users can always identify the active field.
 */

import React, { useState, useCallback, forwardRef } from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextInputProps {
  /** Current value of the input */
  value: string;
  /** Callback invoked whenever the text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text shown when the input is empty */
  placeholder?: string;
  /** Maximum number of characters allowed */
  maxLength?: number;
  /** Keyboard type (forwarded to the underlying TextInput) */
  keyboardType?: RNTextInputProps['keyboardType'];
  /**
   * Accessibility role — use 'search' for search fields,
   * omit (defaults to 'none') for regular text fields.
   */
  accessibilityRole?: 'search' | 'none';
  /** Human-readable label surfaced to screen readers */
  accessibilityLabel?: string;
  /** Additional container styles */
  style?: ViewStyle;
  /** Whether the field is editable */
  editable?: boolean;
  /** Auto-capitalize behaviour forwarded to the underlying TextInput */
  autoCapitalize?: RNTextInputProps['autoCapitalize'];
  /** Whether to secure the text entry (e.g., passwords) */
  secureTextEntry?: boolean;
  /** Return key type */
  returnKeyType?: RNTextInputProps['returnKeyType'];
  /** Called when the return key is pressed */
  onSubmitEditing?: RNTextInputProps['onSubmitEditing'];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  {
    value,
    onChangeText,
    placeholder,
    maxLength,
    keyboardType = 'default',
    accessibilityRole = 'none',
    accessibilityLabel,
    style,
    editable = true,
    autoCapitalize = 'sentences',
    secureTextEntry = false,
    returnKeyType,
    onSubmitEditing,
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const containerStyle: ViewStyle[] = [
    styles.container,
    isFocused && styles.containerFocused,
    !editable && styles.containerDisabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={containerStyle}>
      <RNTextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        maxLength={maxLength}
        keyboardType={keyboardType}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        // Accessibility
        accessibilityRole={accessibilityRole === 'search' ? 'search' : 'none'}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !editable }}
      />
    </View>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
  },
  containerFocused: {
    borderColor: colors.primary,
    // Slightly elevated border width for extra visibility
    borderWidth: 2,
  },
  containerDisabled: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  input: {
    ...typography.body,
    color: colors.text,
    // Remove default padding on Android that shifts text up
    paddingVertical: 0,
    // Ensure input fills the container so the touch area is full width
    flex: 1,
  },
});
