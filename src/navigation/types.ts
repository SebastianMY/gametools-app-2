import { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Type definitions for the root navigation stack.
 * Used with @react-navigation/native-stack for type-safe navigation.
 */
export type RootStackParamList = {
  Home: undefined;
  Dice: undefined;
  ScoreHome: undefined;
  ScoreGame: { gameId: string };
  Lottery: undefined;
};

/** Typed props helper for each screen */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
