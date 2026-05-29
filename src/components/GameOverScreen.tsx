import { LeaderboardPanel } from './LeaderboardPanel';
import type { GameState } from '../game/types';

interface GameOverScreenProps {
  state: GameState;
  onRestart: () => void;
  onReturnHome: () => void;
}

export function GameOverScreen({ state, onRestart, onReturnHome }: GameOverScreenProps) {
  const limitTiles = state.currentHand?.tiles.filter((tile) => tile.value <= 0 || tile.value >= 10) ?? [];
  const limitTileText = limitTiles.length > 0
    ? limitTiles.map((tile) => `${tile.label} reached ${tile.value}`).join(', ')
    : null;
  const endTip = state.exhaustionCount >= 3
    ? 'This run ended because the draw pile ran empty three times.'
    : 'This run ended because a tile value hit the limit.';

  return (
    <main className="game-over-shell">
      <section className="panel game-over-card">
        <p className="eyebrow">Game over</p>
        <h1>Final score {state.score}</h1>
        <p>
          You survived {state.round - 1} rounds. The match ended because {state.exhaustionCount >= 3 ? 'the draw pile ran out for the third time' : 'a tile value hit the limit'}.
        </p>
        {limitTileText && (
          <p>
            The tile{limitTiles.length > 1 ? 's that hit the limit were' : ' that hit the limit was'} {limitTileText}.
          </p>
        )}
        <div className="game-over-tip" role="note">
          <strong>How the game ends:</strong>
          <span>{endTip}</span>
        </div>
        <div className="action-panel__buttons">
          <button className="primary-button" type="button" onClick={onRestart}>Play again</button>
          <button className="ghost-button" type="button" onClick={onReturnHome}>Back to landing</button>
        </div>
      </section>
      <LeaderboardPanel entries={state.leaderboard} />
    </main>
  );
}
