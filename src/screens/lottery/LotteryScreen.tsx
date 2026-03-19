import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'Lottery'>;

/**
 * Lottery screen — multi-touch player selection.
 * Full implementation completed by TASK-009.
 */
export default function LotteryScreen(_props: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lottery</Text>
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
