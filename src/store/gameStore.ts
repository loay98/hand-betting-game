import { create } from 'zustand';
import { applyHonorValuesToHand, calculateHonorValuesTotal, createFreshDeck, createHandRecord, createInitialHand, createInitialHonorValues, loadLeaderboard, resolveRound, saveLeaderboard, seedLeaderboard, shuffleTiles, updateHonorValuesForOutcome } from '../game/engine';
import type { BetChoice, GameSettings, GameState, HandRecord, RoundHistoryEntry } from '../game/types';
import { loadStoredSettings, saveStoredSettings } from '../game/persistence';

type GameAction =
  | { type: 'start'; settings?: GameSettings }
  | { type: 'bet'; choice: BetChoice }
  | { type: 'exit' }
  | { type: 'restart' }
  | { type: 'return-home' }
  | { type: 'load-leaderboard' }
  | { type: 'clear-toasts' }
  | { type: 'announce-reshuffle' }
  | { type: 'set-settings'; settings: GameSettings };

interface GameStoreState extends GameState {
  setSettings: (settings: GameSettings) => void;
  startGame: (settings?: GameSettings) => void;
  betHigher: () => void;
  betLower: () => void;
  exitGame: () => void;
  restartGame: () => void;
  returnHome: () => void;
  clearToasts: () => void;
  loadLeaderboard: () => void;
}

function buildCopyConfig(copiesConfig: GameSettings['copiesPerCategory'] | number) {
  return typeof copiesConfig === 'object'
    ? copiesConfig
    : { numbers: copiesConfig, winds: copiesConfig, dragons: copiesConfig };
}

function appendToasts(existing: string[], nextMessages: string[]) {
  return [...existing, ...nextMessages];
}

function reshuffleDrawPile(
  copiesConfig: GameSettings['copiesPerCategory'] | number,
  drawPile: GameState['drawPile'],
  discardPile: GameState['discardPile'],
) {
  return shuffleTiles([...createFreshDeck(copiesConfig as any), ...drawPile, ...discardPile]);
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
    settings: loadStoredSettings(),
  };
}

function autoSkipShortRounds(state: GameState): GameState {
  if (state.status !== 'game' || !state.currentHand) {
    return state;
  }

  const handSize = state.settings.handSize;
  if (state.drawPile.length === 0 || state.drawPile.length >= handSize) {
    return state;
  }

  const copiesConfig = buildCopyConfig(state.settings.copiesPerCategory);

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
    roundNumber: state.currentHand.roundNumber, // Keep the same round number for the returned tiles
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

  // Create a new hand for the next round with the incremented round number
  const nextRoundHand = createHandRecord({
    hand: state.currentHand.tiles,
    roundNumber: state.round + 1,
    bet: null,
    outcome: null,
    roundPoints: 0,
    comparedTo: state.currentHand.comparedTo,
  });

  return {
    ...state,
    round: state.round + 1,
    drawPile: reshuffled,
    discardPile: [],
    currentHand: nextRoundHand,
    history: [skippedEntry, ...state.history],
    exhaustionCount: state.exhaustionCount + 1,
    lastOutcome: null,
    lastBet: null,
    toasts: appendToasts(state.toasts, ['Not enough tiles to draw a full hand.', 'Reshuffling deck.']),
  };
}

function reduceGameState(state: GameState, action: GameAction): GameState {
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
    case 'set-settings':
      saveStoredSettings(action.settings);
      return {
        ...state,
        settings: action.settings,
      };
    case 'announce-reshuffle': {
      const copiesConfig = buildCopyConfig(state.settings.copiesPerCategory);
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
      const settings = action.settings ?? state.settings;
      const copiesConfig = buildCopyConfig(settings.copiesPerCategory);
      const fullDeck = createFreshDeck(copiesConfig as any);
      const { hand, remainingPile } = createInitialHand(fullDeck, settings.handSize);
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
        settings,
      };
      return autoSkipShortRounds(startedState);
    }
    case 'bet': {
      if (state.status !== 'game' || !state.currentHand) {
        return state;
      }

      const copiesConfig = buildCopyConfig(state.settings.copiesPerCategory);
      const reshuffleOccurred = state.drawPile.length === 0;
      const reshuffledDrawPile = reshuffleOccurred
        ? reshuffleDrawPile(copiesConfig, state.drawPile, state.discardPile)
        : state.drawPile;

      const round = resolveRound({
        currentHand: state.currentHand,
        nextDrawPile: reshuffledDrawPile,
        discardPile: state.discardPile,
        choice: action.choice,
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

      // For history, show the next hand with honor values as they were before the outcome was applied
      const historyNextHand = createHandRecord({
        hand: applyHonorValuesToHand(resolvedNextHand.tiles, state.honorValues), // Use honor values before outcome
        roundNumber: resolvedNextHand.roundNumber,
        bet: resolvedNextHand.bet,
        outcome: resolvedNextHand.outcome,
        roundPoints: nextRoundPoints,
        comparedTo: resolvedNextHand.comparedTo,
      });

      let historyEntry = { prev: resolvedPrevHand, next: historyNextHand, honorValuesAfter: nextHonorValues } as any;

      let nextRound = round.nextRound;
      let shouldAutoSkip = false;

      if (round.outcome === 'push') {
        const clearedPrev = { ...state.currentHand, outcome: null, roundPoints: 0, bet: null, comparedTo: resolvedNextHand.comparedTo };
        const clearedNext = { ...resolvedNextHand, outcome: null, roundPoints: 0, bet: null };

        resolvedPrevHand = clearedPrev;
        nextActiveHand = createHandRecord({
          hand: applyHonorValuesToHand(clearedNext.tiles, nextHonorValues),
          roundNumber: state.round, // Use current round number for the next hand (tie case)
          bet: null,
          outcome: null,
          roundPoints: 0,
          comparedTo: clearedNext.comparedTo,
        });

        historyEntry = { prev: clearedPrev, next: clearedNext, honorValuesAfter: nextHonorValues, skipped: true, reason: 'tie' };
        nextRound = state.round; // Don't increment round number for tie, except if it's the first round
        if (state.round === 1) {
          nextRound = state.round + 1; // Increment round number if first round was tie
        }
      }

      const history = [historyEntry, ...state.history];
      const nextScore = state.score + nextRoundPoints;
      const nextLeaderboard = round.isGameOver
        ? saveLeaderboard(
            state.leaderboard,
            nextScore,
            nextRound,
            createFreshDeck(buildCopyConfig(state.settings.copiesPerCategory) as any).length,
            state.settings.handSize,
            round.updatedExhaustionCount,
            nextHonorValues,
            round.reason,
          )
        : state.leaderboard;

      const playedState: GameState = {
        ...state,
        status: round.isGameOver ? 'gameOver' : 'game',
        score: nextScore,
        round: nextRound,
        drawPile: nextDrawPile,
        discardPile: nextDiscardPile,
        currentHand: nextActiveHand,
        history,
        exhaustionCount: round.updatedExhaustionCount,
        lastOutcome: round.outcome,
        lastBet: action.choice,
        toasts: shouldReshuffleNow 
          ? appendToasts(state.toasts, ['Reshuffling deck.'])
          : round.outcome === 'push' 
            ? appendToasts(state.toasts, ['Tie detected! Both hands had the same total. Round skipped with no points.'])
            : state.toasts,
        leaderboard: nextLeaderboard,
        honorValues: nextHonorValues,
      };

      // Only auto-skip if it wasn't a tie round
      if (round.outcome !== 'push') {
        shouldAutoSkip = true;
      }

      return shouldAutoSkip ? autoSkipShortRounds(playedState) : playedState;
    }
    case 'exit':
    case 'return-home':
      return {
        ...state,
        status: 'landing',
        toasts: [],
      };
    case 'restart': {
      const settings = state.settings;
      const copiesConfig = buildCopyConfig(settings.copiesPerCategory);
      const fullDeck = createFreshDeck(copiesConfig as any);
      const { hand, remainingPile } = createInitialHand(fullDeck, settings.handSize);
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

export const useGameStore = create<GameStoreState>((set, get) => {
  const runAction = (action: GameAction) => set((state) => reduceGameState(state, action));

  return {
    ...createInitialState(),
    setSettings: (settings) => runAction({ type: 'set-settings', settings }),
    startGame: (settings) => runAction({ type: 'start', settings }),
    betHigher: () => runAction({ type: 'bet', choice: 'higher' }),
    betLower: () => runAction({ type: 'bet', choice: 'lower' }),
    exitGame: () => runAction({ type: 'exit' }),
    restartGame: () => runAction({ type: 'restart' }),
    returnHome: () => runAction({ type: 'return-home' }),
    clearToasts: () => runAction({ type: 'clear-toasts' }),
    loadLeaderboard: () => runAction({ type: 'load-leaderboard' }),
  };
});
