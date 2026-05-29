import { useEffect, useMemo, useReducer } from 'react';
import { createInitialHand, loadLeaderboard, resolveRound, saveLeaderboard, seedLeaderboard, shuffleTiles, createFreshDeck } from './engine';
import { BetChoice, GameState } from './types';

interface Action {
  type: 'start' | 'bet' | 'exit' | 'restart' | 'return-home' | 'load-leaderboard';
  choice?: BetChoice;
  settings?: { handSize: number; copiesPerCategory?: { numbers: number; winds: number; dragons: number } };
}

function createInitialState(): GameState {
  return {
    status: 'landing',
    score: 0,
    round: 1,
    drawPile: [],
    discardPile: [],
    currentHand: null,
    history: [],
    exhaustionCount: 0,
    lastOutcome: null,
    leaderboard: seedLeaderboard(loadLeaderboard()),
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'load-leaderboard':
      return {
        ...state,
        leaderboard: seedLeaderboard(loadLeaderboard()),
      };
    case 'start': {
      const handSize = action.settings?.handSize ?? 4;
      const copiesConfig = action.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 };
      const fullDeck = createFreshDeck(copiesConfig as any);
      const { hand, remainingPile } = createInitialHand(fullDeck, handSize);
      return {
        ...state,
        status: 'game',
        score: 0,
        round: 1,
        drawPile: remainingPile,
        discardPile: [],
        currentHand: hand,
        history: [],
        exhaustionCount: 0,
        lastOutcome: null,
        leaderboard: seedLeaderboard(loadLeaderboard()),
        settings: { handSize, copiesPerCategory: typeof copiesConfig === 'object' ? copiesConfig as { numbers: number; winds: number; dragons: number } : { numbers: copiesConfig as number, winds: copiesConfig as number, dragons: copiesConfig as number } },
      };
    }
    case 'bet': {
      if (state.status !== 'game' || !state.currentHand || !action.choice) {
        return state;
      }

      const copiesConfig = state.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 };
      const reshuffledDrawPile = state.drawPile.length > 0
        ? state.drawPile
        : shuffleTiles([...createFreshDeck(copiesConfig as any), ...state.discardPile]);

      const round = resolveRound({
        currentHand: state.currentHand,
        nextDrawPile: reshuffledDrawPile,
        discardPile: state.discardPile,
        choice: action.choice,
        exhaustionCount: state.exhaustionCount,
        round: state.round,
        currentScore: state.score,
      });

      const history = [state.currentHand, ...state.history].slice(0, 6);
      const nextLeaderboard = round.isGameOver
        ? saveLeaderboard(state.leaderboard, round.updatedScore, round.nextRound)
        : state.leaderboard;

      return {
        ...state,
        status: round.isGameOver ? 'gameOver' : 'game',
        score: round.updatedScore,
        round: round.nextRound,
        drawPile: round.updatedDrawPile,
        discardPile: round.updatedDiscardPile,
        currentHand: round.nextHand,
        history,
        exhaustionCount: round.updatedExhaustionCount,
        lastOutcome: round.outcome,
        leaderboard: nextLeaderboard,
      };
    }
    case 'exit':
    case 'return-home':
      return {
        ...state,
        status: 'landing',
      };
    case 'restart': {
      const handSize = state.settings?.handSize ?? 4;
      const copiesConfig = state.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 };
      const fullDeck = createFreshDeck(copiesConfig as any);
      const { hand, remainingPile } = createInitialHand(fullDeck, handSize);
      return {
        ...state,
        status: 'game',
        score: 0,
        round: 1,
        drawPile: remainingPile,
        discardPile: [],
        currentHand: hand,
        history: [],
        exhaustionCount: 0,
        lastOutcome: null,
      };
    }
    default:
      return state;
  }
}

export function useGameController() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    dispatch({ type: 'load-leaderboard' });
  }, []);

  const actions = useMemo(() => ({
    startGame: (settings?: { handSize: number; copiesPerCategory?: { numbers: number; winds: number; dragons: number } }) => dispatch({ type: 'start', settings }),
    betHigher: () => dispatch({ type: 'bet', choice: 'higher' }),
    betLower: () => dispatch({ type: 'bet', choice: 'lower' }),
    exitGame: () => dispatch({ type: 'exit' }),
    restartGame: () => dispatch({ type: 'restart' }),
    returnHome: () => dispatch({ type: 'return-home' }),
  }), []);

  return { state, actions };
}
