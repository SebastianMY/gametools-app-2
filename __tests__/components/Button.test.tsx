/**
 * Minimal unit tests for the Button component.
 *
 * Uses react-test-renderer to render the component in a JS-only
 * environment (no native runtime required). Interaction is triggered
 * by directly calling event-handler props extracted from the rendered tree.
 */

import React from 'react';
import { act, create } from 'react-test-renderer';

import { Button } from '../../src/components/common/Button';

// ---------------------------------------------------------------------------
// onPress callback
// ---------------------------------------------------------------------------

describe('Button – onPress', () => {
  it('calls the onPress callback when pressed', () => {
    const handlePress = jest.fn();

    const renderer = create(
      React.createElement(Button, { label: 'Press me', onPress: handlePress }),
    );

    // Find the TouchableWithoutFeedback and invoke its onPress.
    const touchable = renderer.root.findByType(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react-native').TouchableWithoutFeedback,
    );

    act(() => {
      touchable.props.onPress?.();
    });

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when the button is disabled', () => {
    const handlePress = jest.fn();

    const renderer = create(
      React.createElement(Button, {
        label: 'Disabled',
        onPress: handlePress,
        disabled: true,
      }),
    );

    const touchable = renderer.root.findByType(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react-native').TouchableWithoutFeedback,
    );

    act(() => {
      // onPress is set to undefined when disabled; this call should be a no-op.
      touchable.props.onPress?.();
    });

    expect(handlePress).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Label rendering
// ---------------------------------------------------------------------------

describe('Button – label', () => {
  it('renders the label text', () => {
    const renderer = create(
      React.createElement(Button, { label: 'Roll Dice', onPress: jest.fn() }),
    );

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const text = renderer.root.findByType(require('react-native').Text);

    expect(text.props.children).toBe('Roll Dice');
  });

  it('renders different labels correctly', () => {
    const labels = ['Start Game', '+1', 'Delete', 'Confirm Selection'];

    for (const label of labels) {
      const renderer = create(
        React.createElement(Button, { label, onPress: jest.fn() }),
      );

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const text = renderer.root.findByType(require('react-native').Text);

      expect(text.props.children).toBe(label);
    }
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Button – accessibility', () => {
  it('sets accessibilityRole to "button"', () => {
    const renderer = create(
      React.createElement(Button, { label: 'Accessible', onPress: jest.fn() }),
    );

    const touchable = renderer.root.findByType(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react-native').TouchableWithoutFeedback,
    );

    expect(touchable.props.accessibilityRole).toBe('button');
  });

  it('sets accessibilityLabel to the button label', () => {
    const renderer = create(
      React.createElement(Button, { label: 'My Label', onPress: jest.fn() }),
    );

    const touchable = renderer.root.findByType(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react-native').TouchableWithoutFeedback,
    );

    expect(touchable.props.accessibilityLabel).toBe('My Label');
  });
});
