import type { LeaderboardEntry } from '../game/types';
import { LeaderboardPanel } from './LeaderboardPanel';
import SettingsPanel from './SettingsPanel';

interface LandingPageProps {
  leaderboard: LeaderboardEntry[];
  onStart: (settings: { handSize: number; copiesPerCategory: { numbers: number; winds: number; dragons: number } }) => void;
  settings: { handSize: number; copiesPerCategory: { numbers: number; winds: number; dragons: number } };
  onSettingsChange: (next: { handSize: number; copiesPerCategory: { numbers: number; winds: number; dragons: number } }) => void;
}

export function LandingPage({ leaderboard, onStart, settings, onSettingsChange }: LandingPageProps) {
  const tiles = settings.copiesPerCategory.numbers * 27 + settings.copiesPerCategory.winds * 4 + settings.copiesPerCategory.dragons * 3;

  return (
    <main className="landing-shell">
      <section className="hero panel">
        <div className="hero__copy">
          <p className="eyebrow">Mahjong betting challenge</p>
          <h1>Read the hand, trust the ladder, and bet the next draw.</h1>
          <p className="hero__lede">
            A future-friendly tile game with dynamic tile values, deck reshuffles, local highscores, and a polished split between domain logic and presentation.
          </p>
          <button className="primary-button" onClick={() => onStart(settings)} type="button">New Game</button>
        </div>
        <div className="hero__stats">
          <div className="stat-card">
            <span>Tiles</span>
            <strong>{tiles}</strong>
          </div>
          <div className="stat-card">
            <span>Hand size</span>
            <strong>{settings.handSize}</strong>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">
              Game overs
              <span
                className="input-help"
                aria-hidden
                title="A match ends when any special tile reaches 0 or 10, or when the draw pile runs empty three times."
              >
                i
              </span>
            </div>
            <strong>2 paths</strong>
          </div>
        </div>
      </section>
      <section className="panel settings-panel">
        <div className="panel__heading">
          <p className="eyebrow">Settings</p>
          <h2>Deck configuration</h2>
        </div>
        <SettingsPanel settings={settings} onChange={onSettingsChange} />
      </section>
      <LeaderboardPanel entries={leaderboard} />
    </main>
  );
}
