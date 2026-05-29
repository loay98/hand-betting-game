import { LeaderboardPanel } from './LeaderboardPanel';
import { SettingsPanel } from './SettingsPanel';
import { useGameStore } from '../store/gameStore';
import { SectionHeading } from './ui/section-heading';
import { StatCard } from './ui/stat-card';

export function LandingPage() {
  const settings = useGameStore((state) => state.settings);
  const startGame = useGameStore((state) => state.startGame);

  const tiles = settings.copiesPerCategory.numbers * 27 + settings.copiesPerCategory.winds * 4 + settings.copiesPerCategory.dragons * 3;
  const shortDrawRemainder = tiles % settings.handSize;
  const recommendedHandSizes = Array.from({ length: 6 }, (_, index) => index + 4).filter((handSize) => tiles % handSize === 0);
  const shortDrawWarning = shortDrawRemainder !== 0
    ? `Some rounds will be skipped and reshuffled automatically because ${tiles} tiles do not divide evenly into hands of ${settings.handSize}. The draw pile will eventually run short by ${shortDrawRemainder} tile${shortDrawRemainder === 1 ? '' : 's'}.`
    : null;

  return (
    <main className="landing-shell">
      <section className="hero panel">
        <div className="hero__copy">
          <p className="eyebrow">Mahjong betting challenge</p>
          <h1>Read the hand, trust the ladder, and bet the next draw.</h1>
          <p className="hero__lede">
            A future-friendly tile game with dynamic tile values, deck reshuffles, local highscores, and a polished split between domain logic and presentation.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              startGame(settings);
            }}
            type="button"
          >
            New Game
          </button>
        </div>

        <div className="hero__stats">
          <StatCard label="Tiles" value={tiles} />
          <StatCard label="Hand size" value={settings.handSize} />
          <StatCard
            label="Game overs"
            value="2 paths"
            help={<span className="input-help" aria-hidden title="A match ends when any honor tile reaches 0 or 10, or when the draw pile runs empty three times.">i</span>}
          />
          {shortDrawWarning ? (
            <div className="stat-card stat-card--warning">
              <span>Draw warning</span>
              <strong>Auto-skip ahead</strong>
              <p>{shortDrawWarning}</p>
              {recommendedHandSizes.length > 0 ? (
                <div className="stat-card__recommendations">
                  <span>Recommended hand sizes for {tiles} tiles</span>
                  <div className="stat-card__recommendation-list">
                    {recommendedHandSizes.map((handSize) => (
                      <span key={handSize} className="stat-card__recommendation-pill">{handSize}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="stat-card__recommendations">
                  <span>No hand size between 4 and 9 fits this deck cleanly.</span>
                  <strong>Increase copies per category</strong>
                  <p>Adding more copies raises the total tile count and can create a clean hand-size match.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel settings-panel">
        <SectionHeading eyebrow="Settings" title="Deck configuration" />
        <SettingsPanel />
      </section>

      <LeaderboardPanel />
    </main>
  );
}
