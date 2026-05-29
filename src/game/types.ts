export type TileCategory = 'number' | 'wind' | 'dragon';
export type BetChoice = 'higher' | 'lower';
export type RoundOutcome = 'win' | 'loss' | 'push';
export type Screen = 'landing' | 'game' | 'gameOver';

export interface GameSettings {
  readonly handSize: number;
  readonly copiesPerCategory: {
    readonly numbers: number;
    readonly winds: number;
    readonly dragons: number;
  };
}

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
  readonly totalTiles: number;
  readonly handSize: number;
  readonly reshuffles: number;
  readonly honorValues?: Record<string, number>;
  readonly endedBy?: 'tileLimit' | 'deckLimit';
}

export interface RoundHistoryEntry {
  readonly prev: HandRecord;
  readonly next: HandRecord;
  readonly honorValuesAfter: Record<string, number>;
  readonly skipped?: boolean;
  readonly reason?: 'shortDraw';
}

export interface GameState {
  readonly status: Screen;
  readonly score: number;
  readonly round: number;
  readonly drawPile: Tile[];
  readonly discardPile: Tile[];
  readonly currentHand: HandRecord | null;
  readonly history: RoundHistoryEntry[];
  readonly exhaustionCount: number;
  readonly lastOutcome: RoundOutcome | null;
  readonly lastBet?: BetChoice | null;
  readonly toasts: string[];
  readonly leaderboard: LeaderboardEntry[];
  readonly honorValues: Record<string, number>;
  readonly settings: GameSettings;
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
