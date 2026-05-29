import { LeaderboardPanel } from './LeaderboardPanel';
import type { GameState } from '../game/types';

interface GameOverScreenProps {
  state: GameState;
  onRestart: () => void;
  onReturnHome: () => void;
}

export function GameOverScreen({ state, onRestart, onReturnHome }: GameOverScreenProps) {
  return (
    <main className="game-over-shell">
      <section className="panel game-over-card">
        <p className="eyebrow">Game over</p>
        <h1>Final score {state.score}</h1>
        <p>
          You survived {state.round - 1} rounds. The match ended because {state.exhaustionCount >= 3 ? 'the draw pile ran out for the third time' : 'a tile value hit the limit'}.
        </p>
        <div className="action-panel__buttons">
          <button className="primary-button" type="button" onClick={onRestart}>Play again</button>
          <button className="ghost-button" type="button" onClick={onReturnHome}>Back to landing</button>
        </div>
      </section>
      <LeaderboardPanel entries={state.leaderboard} />
    </main>
  );
}
