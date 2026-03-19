/**
 * Navigation type definitions for the root stack.
 * Defines all screen routes and their required parameters.
 */
export type RootStackParamList = {
  Home: undefined;
  Dice: undefined;
  ScoreHome: undefined;
  ScoreGame: { gameId: string };
  Lottery: undefined;
};
