import { HONOR_TILE_DEFINITIONS } from '../game/engine';
import type { LeaderboardEntry } from '../game/types';
import { useGameStore } from '../store/gameStore';
import { SectionHeading } from './ui/section-heading';
import { HonorPill } from './ui/honor-pill';

function renderCount(value: number | undefined) {
  return typeof value === 'number' ? value : '—';
}

function renderEndLabel(endedBy?: LeaderboardEntry['endedBy']) {
  if (!endedBy) {
    return 'Ended: unknown';
  }

  return endedBy === 'deckLimit' ? 'Ended: draw pile ran empty' : 'Ended: tile limit reached';
}

function HonorSummary({ honorValues }: { honorValues?: Record<string, number> }) {
  return (
    <div className="leaderboard-list__honors">
      {HONOR_TILE_DEFINITIONS.map((tile) => {
        const key = `${tile.kind}:${tile.label}`;
        const value = honorValues?.[key] ?? tile.faceValue;
        const delta = value - tile.faceValue;
        const deltaClass = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
        const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;

        return (
          <HonorPill
            key={key}
            className={`leaderboard-list__honor leaderboard-list__honor--${tile.kind}`}
            ariaLabel={`${tile.label} ${value} (${deltaLabel})`}
            title={`${tile.label} ${value} (${deltaLabel})`}
            symbol={tile.symbol}
            value={value}
            iconClassName="leaderboard-list__honor-icon"
            valueClassName="leaderboard-list__honor-value"
            deltaLabel={(
              <span className={`leaderboard-list__honor-delta leaderboard-list__honor-delta--${deltaClass}`}>
                {delta === 0 ? '—' : deltaLabel}
              </span>
            )}
          />
        );
      })}
    </div>
  );
}

export function LeaderboardPanel() {
  const entries = useGameStore((state) => state.leaderboard);

  return (
    <section className="panel leaderboard-panel">
      <SectionHeading eyebrow="Leaderboard" title="Top 5 high scores" />

      {entries.length === 0 ? (
        <p className="panel__empty">Play a round to seed the board.</p>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="leaderboard-list__item"
            >
              <span className="leaderboard-list__rank">
                {index + 1}
              </span>
              <div className="leaderboard-list__body">
                <div className="leaderboard-list__summary">
                  <span className="leaderboard-list__score">{entry.score}</span>
                  <span className="leaderboard-list__meta">{entry.rounds} rounds</span>
                </div>
                <div className="leaderboard-list__details">
                  <span className="leaderboard-list__detail">Tiles: {renderCount(entry.totalTiles)}</span>
                  <span className="leaderboard-list__detail">Hand: {renderCount(entry.handSize)}</span>
                  <span className="leaderboard-list__detail">Reshuffles: {renderCount(entry.reshuffles)}/3</span>
                </div>
                <span className="leaderboard-list__ending">{renderEndLabel(entry.endedBy)}</span>
                <HonorSummary honorValues={entry.honorValues} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
