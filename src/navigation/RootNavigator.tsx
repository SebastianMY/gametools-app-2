import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import DiceScreen from '../screens/dice/DiceScreen';
import HomeScreen from '../screens/HomeScreen';
import LotteryScreen from '../screens/lottery/LotteryScreen';
import ScoreGameScreen from '../screens/score/ScoreGameScreen';
import ScoreHomeScreen from '../screens/score/ScoreHomeScreen';
import { theme } from '../styles/theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator — defines the native stack for all five top-level routes.
 *
 * Route map (matches architecture doc §7):
 *   Home        /           Main menu
 *   Dice        /dice        Dice rolling interface
 *   ScoreHome   /score       List of saved games
 *   ScoreGame   /score/:gameId  Active game with score tracking
 *   Lottery     /lottery     Multi-touch player selection
 */
export default function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textInverse,
        headerTitleStyle: {
          ...theme.typography.h3,
          color: theme.colors.textInverse,
        },
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Game Companion', headerShown: false }}
      />
      <Stack.Screen
        name="Dice"
        component={DiceScreen}
        options={{ title: 'Dice' }}
      />
      <Stack.Screen
        name="ScoreHome"
        component={ScoreHomeScreen}
        options={{ title: 'Score' }}
      />
      <Stack.Screen
        name="ScoreGame"
        component={ScoreGameScreen}
        options={{ title: 'Game' }}
      />
      <Stack.Screen
        name="Lottery"
        component={LotteryScreen}
        options={{ title: 'Lottery' }}
      />
    </Stack.Navigator>
  );
}
