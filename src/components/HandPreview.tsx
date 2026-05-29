import type { HandRecord } from '../game/types';
import { TileCard } from './TileCard';

interface HandPreviewProps {
  hand: HandRecord;
  title: string;
  tone?: 'active' | 'history';
}

export function HandPreview({ hand, title, tone = 'active' }: HandPreviewProps) {
  return (
    <section className={`panel hand-preview hand-preview--${tone}`}>
      <div className="panel__heading">
        <p className="eyebrow">{title}</p>
        <h2>{hand.total} points</h2>
      </div>
      <div className="hand-preview__tiles">
        {hand.tiles.map((tile) => (
          <TileCard key={tile.uid} tile={tile} compact={tone === 'history'} />
        ))}
      </div>
      <div className="hand-preview__footer">
        <span>{hand.bet ? `Bet: ${hand.bet}` : 'Opening hand'}</span>
        <span>{hand.outcome ? `Outcome: ${hand.outcome}` : 'Awaiting bet'}</span>
      </div>
    </section>
  );
}
