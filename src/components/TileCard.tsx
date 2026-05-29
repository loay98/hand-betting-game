import type { Tile } from '../game/types';

interface TileCardProps {
  tile: Tile;
  compact?: boolean;
}

export function TileCard({ tile, compact = false }: TileCardProps) {
  return (
    <article className={`tile-card tile-card--${tile.kind} ${compact ? 'tile-card--compact' : ''}`} aria-label={tile.label}>
      <div className="tile-card__symbol">{tile.symbol}</div>
      <div className="tile-card__meta">
        <span>{tile.label}</span>
        <strong>{tile.value}</strong>
      </div>
    </article>
  );
}
