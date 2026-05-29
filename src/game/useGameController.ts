import { useGameStore } from '../store/gameStore';
import { useShallow } from 'zustand/react/shallow';

export function useGameController() {
  return {
    state: useGameStore(useShallow((state) => ({
      status: state.status,
      score: state.score,
      round: state.round,
      drawPile: state.drawPile,
      discardPile: state.discardPile,
      currentHand: state.currentHand,
      history: state.history,
      exhaustionCount: state.exhaustionCount,
      lastOutcome: state.lastOutcome,
      lastBet: state.lastBet,
      toasts: state.toasts,
      leaderboard: state.leaderboard,
      honorValues: state.honorValues,
      settings: state.settings,
    })) ),
    actions: useGameStore(useShallow((state) => ({
      startGame: state.startGame,
      betHigher: state.betHigher,
      betLower: state.betLower,
      exitGame: state.exitGame,
      restartGame: state.restartGame,
      returnHome: state.returnHome,
      clearToasts: state.clearToasts,
    })) ),
  };
}
