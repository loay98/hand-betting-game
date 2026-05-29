import type { BetChoice, HandRecord, RoundOutcome } from '../game/types';
import { SectionHeading } from './ui/section-heading';
import { TileCard } from './TileCard';

interface HandPreviewProps {
  hand: HandRecord;
  title: string;
  tone?: 'active' | 'history';
  lastBet?: BetChoice | null;
  lastOutcome?: RoundOutcome | null;
}

export function HandPreview({ hand, title, tone = 'active', lastBet, lastOutcome }: HandPreviewProps) {
  return (
    <section className={`panel hand-preview hand-preview--${tone}`}>
      <SectionHeading eyebrow={title} title={`${hand.total} points`} />
      <div className="hand-preview__tiles">
        {hand.tiles.map((tile) => (
          <TileCard key={tile.uid} tile={tile} compact={tone === 'history'} />
        ))}
      </div>
      {tone !== 'history' ? (
        <div className="hand-preview__footer">
          {tone === 'active' && hand.roundNumber > 1 ? (
            <>
              <span>{`Last bet: ${lastBet ?? '—'}`}</span>
              <span>{`Last outcome: ${lastOutcome === 'push' ? 'tie' : lastOutcome ?? '—'}`}</span>
            </>
          ) : (
            <>
              <span>{hand.bet ? `Bet: ${hand.bet}` : 'Opening hand'}</span>
              <span>{hand.outcome === 'push' ? 'Outcome: tie' : hand.outcome ? `Outcome: ${hand.outcome}` : 'Awaiting bet'}</span>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
