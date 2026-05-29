import {
  BetChoice,
  HandRecord,
  LeaderboardEntry,
  RoundOutcome,
  RoundResult,
  Tile,
  TileDefinition,
} from './types';

const LEADERBOARD_KEY = 'hand-betting-game.leaderboard';
const MAX_LEADERBOARD_ENTRIES = 5;

const NUMBER_SUITS: Array<{ suit: string; symbol: string }> = [
  { suit: 'dots', symbol: '●' },
  { suit: 'bamboo', symbol: '▤' },
  { suit: 'characters', symbol: '萬' },
];

const WIND_TILES: Array<{ label: string; symbol: string }> = [
  { label: 'East Wind', symbol: '東' },
  { label: 'South Wind', symbol: '南' },
  { label: 'West Wind', symbol: '西' },
  { label: 'North Wind', symbol: '北' },
];

const DRAGON_TILES: Array<{ label: string; symbol: string }> = [
  { label: 'Red Dragon', symbol: '中' },
  { label: 'Green Dragon', symbol: '發' },
  { label: 'White Dragon', symbol: '白' },
];

export const HONOR_TILE_DEFINITIONS: TileDefinition[] = [
  ...WIND_TILES.map((tile) => ({ kind: 'wind' as const, label: tile.label, faceValue: 5, symbol: tile.symbol })),
  ...DRAGON_TILES.map((tile) => ({ kind: 'dragon' as const, label: tile.label, faceValue: 5, symbol: tile.symbol })),
];

// defaults
const DEFAULT_HAND_SIZE = 4;
const DEFAULT_COPIES_PER_TILE = 4;

export type CopiesConfig =
  | number
  | {
      numbers: number;
      winds: number;
      dragons: number;
    };

export type HonorValueMap = Record<string, number>;

function copiesFor<T extends CopiesConfig>(config: CopiesConfig, kind: 'numbers' | 'winds' | 'dragons') {
  if (typeof config === 'number') return config;
  return config[kind];
}

export function createFreshDeck(copiesPerTile: CopiesConfig = DEFAULT_COPIES_PER_TILE): Tile[] {
  const deck: Tile[] = [];
  const numberCopies = copiesFor(copiesPerTile, 'numbers');
  const windCopies = copiesFor(copiesPerTile, 'winds');
  const dragonCopies = copiesFor(copiesPerTile, 'dragons');

  for (let faceValue = 1; faceValue <= 9; faceValue += 1) {
    for (const suit of NUMBER_SUITS) {
      for (let copy = 0; copy < numberCopies; copy += 1) {
        deck.push(createTile({ kind: 'number', label: suit.suit, faceValue, symbol: `${faceValue}${suit.symbol}` }));
      }
    }
  }

  for (const wind of WIND_TILES) {
    for (let copy = 0; copy < windCopies; copy += 1) {
      deck.push(createTile({ kind: 'wind', label: wind.label, faceValue: 5, symbol: wind.symbol }));
    }
  }

  for (const dragon of DRAGON_TILES) {
    for (let copy = 0; copy < dragonCopies; copy += 1) {
      deck.push(createTile({ kind: 'dragon', label: dragon.label, faceValue: 5, symbol: dragon.symbol }));
    }
  }

  return shuffleTiles(deck);
}

export function createInitialHonorValues(): HonorValueMap {
  return HONOR_TILE_DEFINITIONS.reduce<HonorValueMap>((values, tile) => {
    values[`${tile.kind}:${tile.label}`] = tile.faceValue;
    return values;
  }, {});
}

export function applyHonorValuesToHand(hand: Tile[], honorValues: HonorValueMap): Tile[] {
  return hand.map((tile) => {
    if (tile.kind === 'number') {
      return tile;
    }

    const key = `${tile.kind}:${tile.label}`;
    return {
      ...tile,
      value: honorValues[key] ?? tile.faceValue,
    };
  });
}

export function updateHonorValuesForOutcome(honorValues: HonorValueMap, hand: Tile[], outcome: RoundOutcome): HonorValueMap {
  const nextHonorValues = { ...honorValues };

  for (const tile of hand) {
    if (tile.kind === 'number') {
      continue;
    }

    const key = `${tile.kind}:${tile.label}`;
    const currentValue = nextHonorValues[key] ?? tile.faceValue;
    nextHonorValues[key] = outcome === 'win' ? currentValue + 1 : outcome === 'loss' ? currentValue - 1 : currentValue;
  }

  return nextHonorValues;
}

export function drawHand(drawPile: Tile[], handSize = DEFAULT_HAND_SIZE): { hand: Tile[]; remainingPile: Tile[] } {
  const hand = drawPile.slice(0, handSize).map((tile) => ({ ...tile }));
  const remainingPile = drawPile.slice(handSize);
  return { hand, remainingPile };
}

export function calculateHandTotal(tiles: Tile[]): number {
  return tiles.reduce((sum, tile) => sum + tile.value, 0);
}

export function compareHands(previousTotal: number, nextTotal: number): 'higher' | 'lower' | 'equal' {
  if (nextTotal > previousTotal) {
    return 'higher';
  }
  if (nextTotal < previousTotal) {
    return 'lower';
  }
  return 'equal';
}

export function evaluateBet(choice: BetChoice, previousTotal: number, nextTotal: number): boolean {
  const result = compareHands(previousTotal, nextTotal);
  return choice === result;
}

export function applyOutcomeToHand(hand: Tile[], outcome: RoundOutcome): Tile[] {
  return hand.map((tile) => {
    if (tile.kind === 'number') {
      return tile;
    }

    const nextValue = outcome === 'win' ? tile.value + 1 : outcome === 'loss' ? tile.value - 1 : tile.value;
    return {
      ...tile,
      value: nextValue,
    };
  });
}

export function hasTileLimitBeenReached(hand: Tile[]): boolean {
  return hand.some((tile) => tile.value <= 0 || tile.value >= 10);
}

export function createHandRecord(params: {
  hand: Tile[];
  roundNumber: number;
  bet: BetChoice | null;
  outcome: RoundOutcome | null;
  roundPoints: number;
  comparedTo?: number;
}): HandRecord {
  return {
    id: crypto.randomUUID(),
    roundNumber: params.roundNumber,
    tiles: params.hand.map((tile) => ({ ...tile })),
    total: calculateHandTotal(params.hand),
    bet: params.bet,
    outcome: params.outcome,
    roundPoints: params.roundPoints,
    comparedTo: params.comparedTo,
  };
}

export function resolveRound(params: {
  currentHand: HandRecord;
  nextDrawPile: Tile[];
  discardPile: Tile[];
  choice: BetChoice;
  exhaustionCount: number;
  round: number;
  currentScore: number;
}): RoundResult {
  const previousTotal = params.currentHand.total;
  const { hand: rawNextHand, remainingPile } = drawHand(params.nextDrawPile, params.currentHand.tiles.length);
  const nextTotalBeforeResolve = calculateHandTotal(rawNextHand);
  const isCorrect = evaluateBet(params.choice, previousTotal, nextTotalBeforeResolve);
  const outcome: RoundOutcome = isCorrect ? 'win' : 'loss';
  const adjustedCurrentHand = applyOutcomeToHand(params.currentHand.tiles, outcome);
  const nextHandTotal = nextTotalBeforeResolve;
  const roundPoints = isCorrect ? Math.max(10, 24 - Math.abs(nextHandTotal - previousTotal)) : 0;
  const updatedDiscardPile = [...params.discardPile, ...adjustedCurrentHand.map((tile) => ({ ...tile }))];
  const nextHand = createHandRecord({
    hand: rawNextHand,
    roundNumber: params.round + 1,
    bet: params.choice,
    outcome,
    roundPoints,
    comparedTo: previousTotal,
  });
  const tileLimitReached = hasTileLimitBeenReached(adjustedCurrentHand);
  const nextExhaustionCount = remainingPile.length === 0 ? params.exhaustionCount + 1 : params.exhaustionCount;
  const deckLimitReached = nextExhaustionCount >= 3;

  return {
    nextHand,
    updatedDrawPile: remainingPile,
    updatedDiscardPile,
    updatedScore: params.currentScore + (isCorrect ? roundPoints : 0),
    updatedExhaustionCount: nextExhaustionCount,
    nextRound: params.round + 1,
    outcome,
    isGameOver: tileLimitReached || deckLimitReached,
    reason: tileLimitReached ? 'tileLimit' : deckLimitReached ? 'deckLimit' : undefined,
  };
}

export function createInitialHand(drawPile: Tile[], handSize?: number): { hand: HandRecord; remainingPile: Tile[] } {
  const { hand, remainingPile } = drawHand(drawPile, handSize ?? DEFAULT_HAND_SIZE);
  return {
    hand: createHandRecord({ hand, roundNumber: 1, bet: null, outcome: null, roundPoints: 0 }),
    remainingPile,
  };
}

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(LEADERBOARD_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return parsed
      .filter((entry) => typeof entry.score === 'number')
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_LEADERBOARD_ENTRIES);
  } catch {
    return [];
  }
}

export function saveLeaderboard(existing: LeaderboardEntry[], score: number, rounds: number): LeaderboardEntry[] {
  const updated = [...existing, {
    id: crypto.randomUUID(),
    score,
    rounds,
    createdAt: new Date().toISOString(),
  }]
    .sort((left, right) => right.score - left.score || right.rounds - left.rounds)
    .slice(0, MAX_LEADERBOARD_ENTRIES);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  }

  return updated;
}

export function seedLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((left, right) => right.score - left.score || right.rounds - left.rounds).slice(0, MAX_LEADERBOARD_ENTRIES);
}

export function buildInitialDeck(): Tile[] {
  return createFreshDeck();
}

export function shuffleTiles<T>(items: T[]): T[] {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [output[index], output[randomIndex]] = [output[randomIndex], output[index]];
  }
  return output;
}

function createTile(definition: TileDefinition): Tile {
  return {
    ...definition,
    uid: crypto.randomUUID(),
    value: definition.faceValue,
  };
}

