import { LeaderboardPanel } from './LeaderboardPanel';
import { useGameStore } from '../store/gameStore';
import { SectionHeading } from './ui/section-heading';
import { Chip } from './ui/chip';

export function GameOverScreen() {
  const score = useGameStore((store) => store.score);
  const round = useGameStore((store) => store.round);
  const currentHand = useGameStore((store) => store.currentHand);
  const exhaustionCount = useGameStore((store) => store.exhaustionCount);
  const restartGame = useGameStore((store) => store.restartGame);
  const returnHome = useGameStore((store) => store.returnHome);

  const limitTiles = currentHand?.tiles.filter((tile) => tile.value <= 0 || tile.value >= 10) ?? [];
  const limitTileText = limitTiles.length > 0
    ? limitTiles.map((tile) => `${tile.label} reached ${tile.value}`).join(', ')
    : null;
  const endTip = exhaustionCount >= 3
    ? 'This run ended because the draw pile ran empty three times.'
    : limitTileText
      ? `This run ended because a tile value hit the limit. The tile${limitTiles.length > 1 ? 's that hit the limit were' : ' that hit the limit was'} ${limitTileText}.`
      : 'This run ended because a tile value hit the limit.';

  return (
    <main className="game-over-shell">
      <section className="panel game-over-card">
        <SectionHeading eyebrow="Game over" title={`Final score ${score}`} as="h1" />
        <p>
          You survived {round - 1} rounds.
        </p>
        <div className="game-over-tip" role="note">
          <strong>How the game ends:</strong>
          <span>{endTip}</span>
        </div>

        {limitTiles.length > 0 ? (
          <div className="history-pair__meta">
            {limitTiles.map((tile) => (
              <Chip key={tile.uid} variant="skip">
                {tile.label} reached {tile.value}
              </Chip>
            ))}
          </div>
        ) : null}

        <div className="action-panel__buttons">
          <button className="primary-button" type="button" onClick={restartGame}>Play again</button>
          <button className="ghost-button" type="button" onClick={returnHome}>Back to landing</button>
        </div>
      </section>

      <LeaderboardPanel />
    </main>
  );
}
