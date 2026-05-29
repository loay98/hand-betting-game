import { useEffect, useMemo, useReducer } from 'react';
import { applyHonorValuesToHand, calculateHonorValuesTotal, createFreshDeck, createHandRecord, createInitialHand, createInitialHonorValues, loadLeaderboard, resolveRound, saveLeaderboard, seedLeaderboard, shuffleTiles, updateHonorValuesForOutcome } from './engine';
import { BetChoice, GameState, RoundHistoryEntry, HandRecord } from './types';

interface Action {
  type: 'start' | 'bet' | 'exit' | 'restart' | 'return-home' | 'load-leaderboard' | 'clear-toasts' | 'announce-reshuffle';
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

function reshuffleDrawPile(
  copiesConfig: { numbers: number; winds: number; dragons: number } | number,
  drawPile: GameState['drawPile'],
  discardPile: GameState['discardPile'],
) {
  return shuffleTiles([...createFreshDeck(copiesConfig as any), ...drawPile, ...discardPile]);
}

function autoSkipShortRounds(state: GameState): GameState {
  if (state.status !== 'game' || !state.currentHand) {
    return state;
  }

  const handSize = state.settings?.handSize ?? state.currentHand.tiles.length;

  // If the draw pile is empty, normal reshuffle logic should handle it.
  // Auto-skip only when there are some tiles but fewer than a full hand.
  if (state.drawPile.length === 0 || state.drawPile.length >= handSize) {
    return state;
  }

  const copiesConfig = buildCopyConfig(state.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 });

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

  const reshuffled = reshuffleDrawPile(copiesConfig, state.drawPile, state.discardPile);
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
    currentHand: state.currentHand,
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
    case 'announce-reshuffle': {
      const copiesConfig = buildCopyConfig(state.settings?.copiesPerCategory ?? { numbers: 4, winds: 4, dragons: 4 });
      const reshuffled = shuffleTiles([...createFreshDeck(copiesConfig as any), ...state.discardPile]);
      return {
        ...state,
        drawPile: reshuffled,
        discardPile: [],
        exhaustionCount: state.exhaustionCount + 1,
        toasts: appendToasts(state.toasts, ['Reshuffling deck.']),
      };
    }
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
        ? reshuffleDrawPile(copiesConfig, state.drawPile, state.discardPile)
        : state.drawPile;

      const round = resolveRound({
        currentHand: state.currentHand,
        nextDrawPile: reshuffledDrawPile,
        discardPile: state.discardPile,
        choice: action.choice,
        // do not pre-increment exhaustionCount here; resolveRound will
        // increment based on whether the remaining pile after draw is empty
        exhaustionCount: state.exhaustionCount,
        round: state.round,
        currentScore: state.score,
      });

      const nextRoundPoints = round.outcome === 'win' ? calculateHonorValuesTotal(state.honorValues) : 0;
      const nextHonorValues = updateHonorValuesForOutcome(state.honorValues, state.currentHand.tiles, round.outcome);
      const shouldReshuffleNow = !round.isGameOver && round.updatedDrawPile.length === 0;
      const nextDrawPile = shouldReshuffleNow
        ? reshuffleDrawPile(copiesConfig, round.updatedDrawPile, round.updatedDiscardPile)
        : round.updatedDrawPile;
      const nextDiscardPile = shouldReshuffleNow ? [] : round.updatedDiscardPile;

      // If the round outcome was a push (equal hands), treat the round as skipped:
      // - record it in history with `skipped: true`
      // - don't award points
      // - clear the bet/outcome on the recorded hands
      const resolvedNextHand: HandRecord = {
        ...round.nextHand,
        roundPoints: nextRoundPoints,
      };

      let nextActiveHand = createHandRecord({
        hand: applyHonorValuesToHand(resolvedNextHand.tiles, nextHonorValues),
        roundNumber: resolvedNextHand.roundNumber,
        bet: resolvedNextHand.bet,
        outcome: resolvedNextHand.outcome,
        roundPoints: nextRoundPoints,
        comparedTo: resolvedNextHand.comparedTo,
      });

      let resolvedPrevHand: HandRecord = {
        ...state.currentHand,
        outcome: round.outcome,
        roundPoints: nextRoundPoints,
        comparedTo: resolvedNextHand.comparedTo,
      };

      let historyEntry = { prev: resolvedPrevHand, next: resolvedNextHand, honorValuesAfter: nextHonorValues } as any;

      if (round.outcome === 'push') {
        // mark both hands as having no bet/outcome and zero points
        const clearedPrev = { ...state.currentHand, outcome: null, roundPoints: 0, bet: null, comparedTo: resolvedNextHand.comparedTo };
        const clearedNext = { ...resolvedNextHand, outcome: null, roundPoints: 0, bet: null };

        resolvedPrevHand = clearedPrev;
        nextActiveHand = createHandRecord({
          hand: applyHonorValuesToHand(clearedNext.tiles, nextHonorValues),
          roundNumber: clearedNext.roundNumber,
          bet: null,
          outcome: null,
          roundPoints: 0,
          comparedTo: clearedNext.comparedTo,
        });

        historyEntry = { prev: clearedPrev, next: clearedNext, honorValuesAfter: nextHonorValues, skipped: true };
      }

      const history = [historyEntry, ...state.history];
      const nextScore = state.score + nextRoundPoints;
      const nextLeaderboard = round.isGameOver
        ? saveLeaderboard(
            state.leaderboard,
        nextScore,
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
        score: nextScore,
        round: round.nextRound,
        drawPile: nextDrawPile,
        discardPile: nextDiscardPile,
        currentHand: nextActiveHand,
        history,
        exhaustionCount: round.updatedExhaustionCount,
        lastOutcome: round.outcome,
        lastBet: action.choice ?? null,
        toasts: shouldReshuffleNow ? appendToasts(state.toasts, ['Reshuffling deck.']) : state.toasts,
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
