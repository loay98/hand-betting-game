import { HandPreview } from './HandPreview';
import type { GameState } from '../game/types';

interface GameViewProps {
  state: GameState;
  onBetHigher: () => void;
  onBetLower: () => void;
  onExit: () => void;
}

export function GameView({ state, onBetHigher, onBetLower, onExit }: GameViewProps) {
  const currentHand = state.currentHand;

  if (!currentHand) {
    return null;
  }

  return (
    <main className="game-shell">
      <header className="game-topbar panel">
        <div>
          <p className="eyebrow">Round {state.round}</p>
          <h1>Current hand: {currentHand.total}</h1>
        </div>
        <div className="game-topbar__stats">
          <span>Score {state.score}</span>
          <span>Draw {state.drawPile.length}</span>
          <span>Discard {state.discardPile.length}</span>
          <span>Runs {state.exhaustionCount}/3</span>
        </div>
        <button className="ghost-button" type="button" onClick={onExit}>Exit to landing</button>
      </header>

      <section className="game-grid">
        <HandPreview hand={currentHand} title="Active hand" />
        <section className="panel action-panel">
          <div className="panel__heading">
            <p className="eyebrow">Betting</p>
            <h2>Will the next hand go higher or lower?</h2>
          </div>
          <div className="action-panel__buttons">
            <button className="primary-button primary-button--warm" type="button" onClick={onBetHigher}>Bet Higher</button>
            <button className="primary-button" type="button" onClick={onBetLower}>Bet Lower</button>
          </div>
          <div className="rules-card">
            <strong>Tile rules</strong>
            <p>Number tiles keep face value. Winds and dragons start at 5 and drift by 1 after each win or loss.</p>
          </div>
        </section>
      </section>

      <section className="panel history-panel">
        <div className="panel__heading">
          <p className="eyebrow">History</p>
          <h2>Previous hands</h2>
        </div>
        {state.history.length === 0 ? (
          <p className="panel__empty">No prior hands yet.</p>
        ) : (
          <div className="history-panel__list">
            {state.history.map((hand) => (
              <HandPreview key={hand.id} hand={hand} title={`Round ${hand.roundNumber}`} tone="history" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
