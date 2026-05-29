import type { LeaderboardEntry } from '../game/types';

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardPanel({ entries }: LeaderboardPanelProps) {
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
              <span className="leaderboard-list__score">{entry.score}</span>
              <span className="leaderboard-list__meta">{entry.rounds} rounds</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
