import { HONOR_TILE_DEFINITIONS } from '../game/engine';
import { useGameStore } from '../store/gameStore';
import { HistoryMeta } from './HistoryMeta';
import { HandPreview } from './HandPreview';
import { SectionHeading } from './ui/section-heading';
import { HonorPill } from './ui/honor-pill';

function HonorValuesRow({ honorValues, previousTiles, history = false }: { honorValues: Record<string, number>; previousTiles?: { kind: string; label: string; value: number }[]; history?: boolean }) {
  const prevMap = new Map(
    (previousTiles ?? [])
      .filter((tile) => tile.kind !== 'number')
      .map((tile) => [`${tile.kind}:${tile.label}`, tile.value]),
  );

  return (
    <div className={`game-topbar__honors ${history ? 'history-pair__honors' : ''}`}>
      <span className="game-topbar__honors-label">Honor values</span>
      <div className="game-topbar__honors-list">
        {HONOR_TILE_DEFINITIONS.map((tile) => {
          const key = `${tile.kind}:${tile.label}`;
          const value = honorValues[key] ?? tile.faceValue;
          const prevValue = prevMap.get(key) ?? tile.faceValue;
          const delta = value - prevValue;
          const affected = prevMap.has(key) && delta !== 0;
          const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;
          const historyTitle = `${tile.label}: ${prevValue} → ${value}`;
          const topbarTitle = `${tile.label} ${value} (${deltaLabel})`;
          // In history view, show a neutral dash when the honor badge was not affected
          const historyDeltaChip = affected ? (
            <span className={`history-pair__honors-delta history-pair__honors-delta--${delta > 0 ? 'up' : 'down'}`}>
              {deltaLabel}
            </span>
          ) : (
            <span className="history-pair__honors-delta history-pair__honors-delta--neutral">—</span>
          );
          const historyBadgeTitle = affected ? historyTitle : `${tile.label}: ${value}`;

          return (
            <HonorPill
              key={key}
              className={`game-topbar__honors-item game-topbar__honors-item--${tile.kind}`}
              ariaLabel={`${tile.label} ${value} (${deltaLabel})`}
              title={history ? historyBadgeTitle : topbarTitle}
              symbol={tile.symbol}
              value={value}
              iconClassName="game-topbar__honors-icon"
              valueClassName="game-topbar__honors-value"
              deltaLabel={history ? historyDeltaChip : <span className={`history-pair__honors-delta history-pair__honors-delta--${affected ? (delta > 0 ? 'up' : 'down') : 'neutral'}`}>{delta === 0 ? '—' : deltaLabel}</span>}
            />
          );
        })}
      </div>
    </div>
  );
}

export function GameView() {
  const currentHand = useGameStore((state) => state.currentHand);
  const score = useGameStore((state) => state.score);
  const drawPile = useGameStore((state) => state.drawPile);
  const discardPile = useGameStore((state) => state.discardPile);
  const exhaustionCount = useGameStore((state) => state.exhaustionCount);
  const honorValues = useGameStore((state) => state.honorValues);
  const history = useGameStore((state) => state.history);
  const lastBet = useGameStore((state) => state.lastBet);
  const lastOutcome = useGameStore((state) => state.lastOutcome);
  const betHigher = useGameStore((state) => state.betHigher);
  const betLower = useGameStore((state) => state.betLower);
  const exitGame = useGameStore((state) => state.exitGame);

  if (!currentHand) {
    return null;
  }

  return (
    <main className="game-shell">
      <header className="game-topbar panel">
        <div className="game-topbar__round">
          <p className="game-topbar__round-label">Round {currentHand.roundNumber}</p>
        </div>
        <div className="game-topbar__meta">
          <HonorValuesRow honorValues={honorValues} />
          <div className="game-topbar__stats">
            <span>Score {score}</span>
            <span>Draw {drawPile.length}</span>
            <span>Discard {discardPile.length}</span>
            <span>Runs {exhaustionCount}/3</span>
          </div>
        </div>
        <button className="ghost-button" type="button" onClick={exitGame}>Exit to landing</button>
      </header>

      <section className="game-grid">
        <HandPreview hand={currentHand} title="Active hand" lastBet={lastBet ?? null} lastOutcome={lastOutcome ?? null} />

        <section className="panel action-panel">
          <SectionHeading eyebrow="Betting" title="Will the next hand go higher or lower?" />
          <div className="action-panel__buttons">
            <button className="primary-button primary-button--warm" type="button" onClick={betHigher}>
              Bet Higher
            </button>
            <button className="primary-button" type="button" onClick={betLower}>
              Bet Lower
            </button>
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
        <SectionHeading eyebrow="History" title="Previous hands" />
        {history.length === 0 ? (
          <p className="panel__empty">No prior hands yet.</p>
        ) : (
          <div className="history-panel__list">
            {history.map((entry) => (
              <div key={entry.prev.id} className="history-pair">
                  <div className="history-pair__card panel">
                    {entry.skipped ? (
                      <div className="history-pair__header">
                        <p className="eyebrow">Round {entry.prev.roundNumber}</p>
                        <HistoryMeta kind="skipped" roundNumber={entry.prev.roundNumber} reason={entry.reason} />
                      </div>
                    ) : (
                      <div className="history-pair__header">
                        <p className="eyebrow">Round {entry.prev.roundNumber}</p>
                        <HistoryMeta
                          kind="round"
                          roundNumber={entry.prev.roundNumber}
                          bet={entry.next.bet}
                          outcome={entry.prev.outcome}
                          points={entry.prev.roundPoints}
                        />
                      </div>
                    )}
                    <HonorValuesRow honorValues={entry.honorValuesAfter} previousTiles={entry.prev.tiles} history />
                    <div className={`history-pair__content ${entry.skipped && entry.reason !== 'tie' ? 'history-pair__content--single' : ''}`}>
                      <HandPreview hand={entry.prev} title={entry.prev.roundNumber === 1 ? 'Starting hand' : 'Current hand'} tone="history" />
                      {!entry.skipped || entry.reason === 'tie' ? <HandPreview hand={entry.next} title="Resulting hand" tone="history" /> : null}
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
