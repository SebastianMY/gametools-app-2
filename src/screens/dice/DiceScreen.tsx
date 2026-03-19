import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'Dice'>;

/**
 * Dice screen — dice rolling interface.
 * Full implementation completed by TASK-005.
 */
export default function DiceScreen(_props: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dice</Text>
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
  },
});
