import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Root application component.
 * Will be extended by navigation and context providers in subsequent tasks.
 */
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Companion</Text>
      <Text style={styles.subtitle}>Your digital game table companion</Text>
      <StatusBar style="auto" />
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
