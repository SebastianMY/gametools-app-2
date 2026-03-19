import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'Home'>;

/**
 * Home screen — main menu entry point.
 * Provides navigation to Dice, Score, and Lottery features.
 * Full implementation completed by TASK-003.
 */
export default function HomeScreen(_props: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Companion</Text>
      <Text style={styles.subtitle}>Your digital game table companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
