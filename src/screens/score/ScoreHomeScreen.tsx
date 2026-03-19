import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'ScoreHome'>;

/**
 * Score home screen — list of saved games.
 * Full implementation completed by TASK-006.
 */
export default function ScoreHomeScreen(_props: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Score</Text>
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
