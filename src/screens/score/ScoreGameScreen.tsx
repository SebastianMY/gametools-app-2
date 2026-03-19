import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'ScoreGame'>;

/**
 * Score game screen — active game with player score tracking.
 * Receives `gameId` route param to load the correct game.
 * Full implementation completed by TASK-006.
 */
export default function ScoreGameScreen({ route }: Props): React.JSX.Element {
  const { gameId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game</Text>
      <Text style={styles.subtitle}>{gameId}</Text>
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
    fontSize: 14,
    color: '#666',
  },
});
