export type TileCategory = 'number' | 'wind' | 'dragon';
export type BetChoice = 'higher' | 'lower';
export type RoundOutcome = 'win' | 'loss' | 'push';
export type Screen = 'landing' | 'game' | 'gameOver';

export interface TileDefinition {
  readonly kind: TileCategory;
  readonly label: string;
  readonly faceValue: number;
  readonly symbol: string;
}

export interface Tile extends TileDefinition {
  readonly uid: string;
  value: number;
}

export interface HandRecord {
  readonly id: string;
  readonly roundNumber: number;
  readonly tiles: Tile[];
  readonly total: number;
  readonly bet: BetChoice | null;
  readonly outcome: RoundOutcome | null;
  readonly roundPoints: number;
  readonly comparedTo?: number;
}

export interface LeaderboardEntry {
  readonly id: string;
  readonly score: number;
  readonly rounds: number;
  readonly createdAt: string;
}

export interface GameState {
  readonly status: Screen;
  readonly score: number;
  readonly round: number;
  readonly drawPile: Tile[];
  readonly discardPile: Tile[];
  readonly currentHand: HandRecord | null;
  readonly history: HandRecord[];
  readonly exhaustionCount: number;
  readonly lastOutcome: RoundOutcome | null;
  readonly leaderboard: LeaderboardEntry[];
}

export interface RoundResult {
  readonly nextHand: HandRecord;
  readonly updatedDrawPile: Tile[];
  readonly updatedDiscardPile: Tile[];
  readonly updatedScore: number;
  readonly updatedExhaustionCount: number;
  readonly nextRound: number;
  readonly outcome: RoundOutcome;
  readonly isGameOver: boolean;
  readonly reason?: 'tileLimit' | 'deckLimit';
}
