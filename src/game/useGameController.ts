import { useEffect, useMemo, useReducer } from 'react';
import { applyHonorValuesToHand, createFreshDeck, createHandRecord, createInitialHand, createInitialHonorValues, loadLeaderboard, resolveRound, saveLeaderboard, seedLeaderboard, shuffleTiles, updateHonorValuesForOutcome } from './engine';
import { BetChoice, GameState, RoundHistoryEntry } from './types';

interface Action {
  type: 'start' | 'bet' | 'exit' | 'restart' | 'return-home' | 'load-leaderboard' | 'clear-toasts';
  choice?: BetChoice;
  settings?: { handSize: number; copiesPerCategory?: { numbers: number; winds: number; dragons: number } };
}

function buildCopyConfig(copiesConfig: { numbers: number; winds: number; dragons: number } | number) {
  return typeof copiesConfig === 'object'
    ? copiesConfig
    : { numbers: copiesConfig, winds: copiesConfig, dragons: copiesConfig };
}

function appendToasts(existing: string[], nextMessages: string[]) {
  return [...existing, ...nextMessages];
}

function autoSkipShortRounds(state: GameState): GameState {
  if (state.status !== 'game' || !state.currentHand) {
    return state;
  }

  if (state.drawPile.length >= state.currentHand.tiles.length) {
    return state;
  }

  const skippedHand = createHandRecord({
    hand: state.currentHand.tiles,
    roundNumber: state.currentHand.roundNumber,
    bet: null,
    outcome: null,
    roundPoints: 0,
    comparedTo: state.currentHand.comparedTo,
  });

  const returnedTilesHand = createHandRecord({
    hand: state.currentHand.tiles,
    roundNumber: state.round + 1,
    bet: null,
    outcome: null,
    roundPoints: 0,
    comparedTo: state.currentHand.comparedTo,
  });

  const reshuffled = shuffleTiles([...state.drawPile, ...state.discardPile, ...state.currentHand.tiles]);
  const skippedEntry: RoundHistoryEntry = {
    prev: skippedHand,
    next: returnedTilesHand,
    honorValuesAfter: state.honorValues,
    skipped: true,
    reason: 'shortDraw',
  };
  const history: RoundHistoryEntry[] = [skippedEntry, ...state.history];

  return {
    ...state,
    round: state.round + 1,
    drawPile: reshuffled,
    discardPile: [],
    currentHand: returnedTilesHand,
    history,
    exhaustionCount: state.exhaustionCount + 1,
    lastOutcome: null,
    lastBet: null,
    toasts: appendToasts(state.toasts, ['Round skipped automatically. Not enough tiles to draw a full hand.', 'Reshuffling deck.']),
  };
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
    toasts: [],
    lastOutcome: null,
    lastBet: null,
    leaderboard: seedLeaderboard(loadLeaderboard()),
    honorValues: createInitialHonorValues(),
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'load-leaderboard':
      return {
        ...state,
        leaderboard: seedLeaderboard(loadLeaderboard()),
      };
    case 'clear-toasts':
      return {
        ...state,
        toasts: [],
      };
    case 'start': {
      const handSize = action.settings?.handSize ?? 4;
      const copiesConfig = buildCopyConfig(action.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 });
      const fullDeck = createFreshDeck(copiesConfig as any);
      const { hand, remainingPile } = createInitialHand(fullDeck, handSize);
      const startedState: GameState = {
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
        lastBet: null,
        toasts: [],
        leaderboard: seedLeaderboard(loadLeaderboard()),
        honorValues: createInitialHonorValues(),
        settings: { handSize, copiesPerCategory: copiesConfig },
      };
      return autoSkipShortRounds(startedState);
    }
    case 'bet': {
      if (state.status !== 'game' || !state.currentHand || !action.choice) {
        return state;
      }

      const copiesConfig = buildCopyConfig(state.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 });
      const reshuffleOccurred = state.drawPile.length === 0;
      const reshuffledDrawPile = reshuffleOccurred
        ? shuffleTiles([...createFreshDeck(copiesConfig as any), ...state.discardPile])
        : state.drawPile;

      const round = resolveRound({
        currentHand: state.currentHand,
        nextDrawPile: reshuffledDrawPile,
        discardPile: state.discardPile,
        choice: action.choice,
        exhaustionCount: state.exhaustionCount + (reshuffleOccurred ? 1 : 0),
        round: state.round,
        currentScore: state.score,
      });

      const nextHonorValues = updateHonorValuesForOutcome(state.honorValues, state.currentHand.tiles, round.outcome);
      const nextActiveHand = createHandRecord({
        hand: applyHonorValuesToHand(round.nextHand.tiles, nextHonorValues),
        roundNumber: round.nextHand.roundNumber,
        bet: round.nextHand.bet,
        outcome: round.nextHand.outcome,
        roundPoints: round.nextHand.roundPoints,
        comparedTo: round.nextHand.comparedTo,
      });

      const resolvedPrevHand = {
        ...state.currentHand,
        outcome: round.outcome,
        roundPoints: round.nextHand.roundPoints,
        comparedTo: round.nextHand.comparedTo,
      };

      const history = [{ prev: resolvedPrevHand, next: round.nextHand, honorValuesAfter: nextHonorValues }, ...state.history];
      const nextLeaderboard = round.isGameOver
        ? saveLeaderboard(
            state.leaderboard,
            round.updatedScore,
            round.nextRound,
            createFreshDeck(buildCopyConfig(state.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 }) as any).length,
            state.settings?.handSize ?? state.currentHand.tiles.length,
            round.updatedExhaustionCount,
            nextHonorValues,
            round.reason,
          )
        : state.leaderboard;

      const playedState: GameState = {
        ...state,
        status: round.isGameOver ? 'gameOver' : 'game',
        score: round.updatedScore,
        round: round.nextRound,
        drawPile: round.updatedDrawPile,
        discardPile: round.updatedDiscardPile,
        currentHand: nextActiveHand,
        history,
        exhaustionCount: round.updatedExhaustionCount,
        lastOutcome: round.outcome,
        lastBet: action.choice ?? null,
        toasts: reshuffleOccurred ? ['Reshuffling deck.'] : [],
        leaderboard: nextLeaderboard,
        honorValues: nextHonorValues,
      };

      return autoSkipShortRounds(playedState);
    }
    case 'exit':
    case 'return-home':
      return {
        ...state,
        status: 'landing',
        toasts: [],
      };
    case 'restart': {
      const handSize = state.settings?.handSize ?? 4;
      const copiesConfig = buildCopyConfig(state.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 });
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
        lastBet: null,
        toasts: [],
        honorValues: createInitialHonorValues(),
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
    clearToasts: () => dispatch({ type: 'clear-toasts' }),
  }), []);

  return { state, actions };
}
