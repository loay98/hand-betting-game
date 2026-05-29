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

  const renderHonorValues = (honorValues: Record<string, number>, tone: 'topbar' | 'history' = 'topbar') => {
    return (
      <div className={`game-topbar__honors ${tone === 'history' ? 'history-pair__honors' : ''}`}>
        <span className="game-topbar__honors-label">Honor values</span>
        <div className="game-topbar__honors-list">
          {HONOR_TILE_DEFINITIONS.map((tile) => {
            const key = `${tile.kind}:${tile.label}`;
            const value = honorValues[key] ?? tile.faceValue;
            const delta = value - tile.faceValue;
            const deltaClass = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
            const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;

            return (
              <span
                key={`${tile.kind}:${tile.label}`}
                className={`game-topbar__honors-item game-topbar__honors-item--${tile.kind}`}
                aria-label={`${tile.label} ${value}${delta !== 0 ? ` (${deltaLabel})` : ''}`}
                title={`${tile.label} ${value}${delta !== 0 ? ` (${deltaLabel})` : ''}`}
              >
                <span className="game-topbar__honors-icon" aria-hidden="true">
                  {tile.symbol}
                </span>
                <span className="game-topbar__honors-value">{value}</span>
                <span className={`history-pair__honors-delta history-pair__honors-delta--${deltaClass}`}>{delta === 0 ? '—' : deltaLabel}</span>
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHistoryHonorValues = (
    tiles: typeof currentHand.tiles,
    honorValuesAfter: Record<string, number>,
    tone: 'history' | 'topbar' = 'history',
  ) => {
    const prevMap = new Map(
      tiles.filter((tile) => tile.kind !== 'number').map((tile) => [`${tile.kind}:${tile.label}`, tile.value]),
    );

    return (
      <div className={`game-topbar__honors ${tone === 'history' ? 'history-pair__honors' : ''}`}>
        <span className="game-topbar__honors-label">Honor values</span>
        <div className="game-topbar__honors-list">
          {HONOR_TILE_DEFINITIONS.map((tile) => {
            const key = `${tile.kind}:${tile.label}`;
            const prevValue = prevMap.get(key) ?? tile.faceValue;
            const nextValue = honorValuesAfter[key] ?? prevValue;
            const delta = nextValue - prevValue;
            const affected = prevMap.has(key) && delta !== 0;
            const deltaClass = affected ? (delta > 0 ? 'up' : 'down') : 'neutral';
            const deltaLabel = affected ? (delta > 0 ? `+${delta}` : `${delta}`) : '—';

            return (
              <span
                key={key}
                className={`game-topbar__honors-item game-topbar__honors-item--${tile.kind}`}
                aria-label={`${tile.label} ${nextValue} (${deltaLabel})`}
                title={`${tile.label} ${nextValue} (${deltaLabel})`}
              >
                <span className="game-topbar__honors-icon" aria-hidden="true">
                  {tile.symbol}
                </span>
                <span className="game-topbar__honors-value">{nextValue}</span>
                <span className={`history-pair__honors-delta history-pair__honors-delta--${deltaClass}`}>{deltaLabel}</span>
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
          {renderHonorValues(state.honorValues)}
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
                  {entry.skipped ? (
                    <div className="history-pair__header">
                      <p className="eyebrow">Skipped round {entry.prev.roundNumber}</p>
                      <div className="history-pair__meta">
                        <span className="history-pair__chip history-pair__chip--skip">Auto skip</span>
                        <span className="history-pair__chip">Not enough tiles</span>
                        <span className="history-pair__chip">Reshuffled</span>
                      </div>
                    </div>
                  ) : (
                    <div className="history-pair__header">
                      <p className="eyebrow">Round {entry.prev.roundNumber}</p>
                      <div className="history-pair__meta">
                        <span className="history-pair__chip">Bet: {entry.next.bet ?? '—'}</span>
                        <span className={`history-pair__chip ${entry.prev.outcome ? `history-pair__chip--${entry.prev.outcome}` : ''}`}>Outcome: {entry.prev.outcome ?? '—'}</span>
                        <span className="history-pair__chip">Pts: {entry.prev.roundPoints ?? 0}</span>
                      </div>
                    </div>
                  )}
                  {renderHistoryHonorValues(entry.prev.tiles, entry.honorValuesAfter, 'history')}
                  <div className={`history-pair__content ${entry.skipped ? 'history-pair__content--single' : ''}`}>
                    <HandPreview hand={entry.prev} title={entry.skipped ? 'Current hand' : 'Starting hand'} tone="history" />
                    {!entry.skipped ? <HandPreview hand={entry.next} title="Resulting hand" tone="history" /> : null}
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
