      import { HandPreview } from './HandPreview';
      import { HONOR_TILE_DEFINITIONS } from '../game/engine';
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

  const renderHonorValues = (tiles: typeof currentHand.tiles, tone: 'topbar' | 'history' = 'topbar') => {
    const honorValues = new Map(
      tiles
        .filter((tile) => tile.kind !== 'number')
        .map((tile) => [`${tile.kind}:${tile.label}`, tile.value]),
    );

    return (
      <div className={`game-topbar__honors ${tone === 'history' ? 'history-pair__honors' : ''}`}>
        <span className="game-topbar__honors-label">Honor values</span>
        <div className="game-topbar__honors-list">
          {HONOR_TILE_DEFINITIONS.map((tile) => {
            const value = honorValues.get(`${tile.kind}:${tile.label}`) ?? tile.faceValue;

            return (
              <span
                key={`${tile.kind}:${tile.label}`}
                className={`game-topbar__honors-item game-topbar__honors-item--${tile.kind}`}
                aria-label={`${tile.label} ${value}`}
                title={`${tile.label} ${value}`}
              >
                <span className="game-topbar__honors-icon" aria-hidden="true">
                  {tile.symbol}
                </span>
                <span className="game-topbar__honors-value">{value}</span>
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="game-shell">
      <header className="game-topbar panel">
        <div className="game-topbar__round">
          <p className="game-topbar__round-label">Round {currentHand.roundNumber}</p>
        </div>
        <div className="game-topbar__meta">
          {renderHonorValues(currentHand.tiles)}
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
        <HandPreview hand={currentHand} title="Active hand" lastBet={state.lastBet ?? null} lastOutcome={state.lastOutcome ?? null} />
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
            <p className="eyebrow rules-card__section-label">Honor titles</p>
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
            {state.history.map((entry) => (
              <div key={entry.prev.id} className="history-pair">
                <div className="history-pair__card panel">
                  {(() => {
                    const bet = entry.next.bet ?? null;
                    const outcome = entry.prev.outcome ?? null;
                    const pts = entry.prev.roundPoints ?? 0;

                    return (
                      <div className="history-pair__header">
                        <p className="eyebrow">Round {entry.prev.roundNumber}</p>
                        <div className="history-pair__meta">
                          <span className="history-pair__chip">Bet: {bet ?? '—'}</span>
                          <span className={`history-pair__chip ${outcome ? `history-pair__chip--${outcome}` : ''}`}>Outcome: {outcome ?? '—'}</span>
                          <span className="history-pair__chip">Pts: {pts}</span>
                        </div>
                      </div>
                    );
                  })()}
                  {renderHonorValues(entry.prev.tiles, 'history')}
                  <div className="history-pair__content">
                    <HandPreview hand={entry.prev} title="Starting hand" tone="history" />
                    <HandPreview hand={entry.next} title="Resulting hand" tone="history" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
