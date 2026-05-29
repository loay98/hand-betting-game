import { HONOR_TILE_DEFINITIONS } from '../game/engine';
import type { LeaderboardEntry } from '../game/types';

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardPanel({ entries }: LeaderboardPanelProps) {
  const renderCount = (value: number | undefined) => (typeof value === 'number' ? value : '—');

  const renderEndLabel = (endedBy?: LeaderboardEntry['endedBy']) => {
    if (!endedBy) {
      return 'Ended: unknown';
    }

    return endedBy === 'deckLimit' ? 'Ended: draw pile ran empty' : 'Ended: tile limit reached';
  };

  const renderHonorSummary = (honorValues?: Record<string, number>) => (
    <div className="leaderboard-list__honors">
      {HONOR_TILE_DEFINITIONS.map((tile) => {
        const key = `${tile.kind}:${tile.label}`;
        const value = honorValues?.[key] ?? tile.faceValue;
        const delta = value - tile.faceValue;
        const deltaClass = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
        const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;

        return (
          <span
            key={key}
            className={`leaderboard-list__honor leaderboard-list__honor--${tile.kind}`}
            aria-label={`${tile.label} ${value} (${deltaLabel})`}
            title={`${tile.label} ${value} (${deltaLabel})`}
          >
            <span className="leaderboard-list__honor-icon" aria-hidden="true">{tile.symbol}</span>
            <span className="leaderboard-list__honor-value">{value}</span>
            <span className={`leaderboard-list__honor-delta leaderboard-list__honor-delta--${deltaClass}`}>
              {delta === 0 ? '—' : deltaLabel}
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <section className="panel leaderboard-panel">
      <div className="panel__heading">
        <p className="eyebrow">Leaderboard</p>
        <h2>Top 5 high scores</h2>
      </div>
      {entries.length === 0 ? (
        <p className="panel__empty">Play a round to seed the board.</p>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((entry, index) => (
            <li key={entry.id} className="leaderboard-list__item">
              <span className="leaderboard-list__rank">{index + 1}</span>
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
                {renderHonorSummary(entry.honorValues)}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
