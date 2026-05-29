      import { HandPreview } from './HandPreview';
      import { SPECIAL_TILE_DEFINITIONS } from '../game/engine';
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

  const activeSpecialValues = new Map(
    currentHand.tiles
      .filter((tile) => tile.kind !== 'number')
      .map((tile) => [`${tile.kind}:${tile.label}`, tile.value]),
  );

  return (
    <main className="game-shell">
      <header className="game-topbar panel">
        <div className="game-topbar__round">
          <p className="game-topbar__round-label">Round {state.round}</p>
        </div>
        <div className="game-topbar__meta">
          <div className="game-topbar__specials">
            <span className="game-topbar__specials-label">Special values</span>
            <div className="game-topbar__specials-list">
              {SPECIAL_TILE_DEFINITIONS.map((tile) => {
                const value = activeSpecialValues.get(`${tile.kind}:${tile.label}`) ?? tile.faceValue;

                return (
                  <span
                    key={`${tile.kind}:${tile.label}`}
                    className={`game-topbar__specials-item game-topbar__specials-item--${tile.kind}`}
                    aria-label={`${tile.label} ${value}`}
                    title={`${tile.label} ${value}`}
                  >
                    <span className="game-topbar__specials-icon" aria-hidden="true">
                      {tile.symbol}
                    </span>
                    <span className="game-topbar__specials-value">{value}</span>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="game-topbar__stats">
            <span>Score {state.score}</span>
            <span>Draw {state.drawPile.length}</span>
            <span>Discard {state.discardPile.length}</span>
            <span>Runs {state.exhaustionCount}/3</span>
          </div>
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
            <h2 className="rules-card__title">Tile rules</h2>
            <p>Number tiles keep face value.</p>
            <p className="eyebrow rules-card__section-label">Special titles</p>
            <div className="rules-card__powers">
              <div>
                <strong>Winds</strong>
                <span>East, South, West, and North all start at 5 and shift by 1 after each win or loss.</span>
              </div>
              <div>
                <strong>Dragons</strong>
                <span>Red, Green, and White all start at 5 and shift by 1 after each win or loss.</span>
              </div>
            </div>
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
