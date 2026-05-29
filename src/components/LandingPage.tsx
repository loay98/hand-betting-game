import type { LeaderboardEntry } from '../game/types';
import { LeaderboardPanel } from './LeaderboardPanel';

interface LandingPageProps {
  leaderboard: LeaderboardEntry[];
  onStart: () => void;
}

export function LandingPage({ leaderboard, onStart }: LandingPageProps) {
  return (
    <main className="landing-shell">
      <section className="hero panel">
        <div className="hero__copy">
          <p className="eyebrow">Mahjong betting challenge</p>
          <h1>Read the hand, trust the ladder, and bet the next draw.</h1>
          <p className="hero__lede">
            A future-friendly tile game with dynamic tile values, deck reshuffles, local highscores, and a polished split between domain logic and presentation.
          </p>
          <button className="primary-button" onClick={onStart} type="button">New Game</button>
        </div>
        <div className="hero__stats">
          <div className="stat-card">
            <span>Tiles</span>
            <strong>136</strong>
          </div>
          <div className="stat-card">
            <span>Hand size</span>
            <strong>4</strong>
          </div>
          <div className="stat-card">
            <span>Game overs</span>
            <strong>2 paths</strong>
          </div>
        </div>
      </section>
      <LeaderboardPanel entries={leaderboard} />
    </main>
  );
}
