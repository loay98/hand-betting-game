import { Chip } from './ui/chip';

type HistoryMetaProps =
  | {
      kind: 'skipped';
      roundNumber: number;
      reason?: 'shortDraw' | 'tie' | undefined;
    }
  | {
      kind: 'round';
      roundNumber: number;
      bet?: string | null;
      outcome?: 'win' | 'loss' | 'push' | null;
      points?: number | null;
    };

export function HistoryMeta(props: HistoryMetaProps) {
  if (props.kind === 'skipped') {
    return (
      <div className="history-pair__meta">
        <Chip variant="skip">Auto skip</Chip>
        {props.reason === 'tie' ? (
          <>
            <Chip variant="push">Tie</Chip>
            <Chip>0 pts</Chip>
          </>
        ) : (
          <>
            <Chip>Not enough tiles</Chip>
            <Chip>Reshuffled</Chip>
          </>
        )}
      </div>
    );
  }

  const outcomeVariant = props.outcome ?? 'push';

  return (
    <div className="history-pair__meta">
      <Chip>Bet: {props.bet ?? '—'}</Chip>
      <Chip variant={outcomeVariant === 'push' ? 'push' : outcomeVariant}>Outcome: {props.outcome ?? '—'}</Chip>
      <Chip>Pts: {props.points ?? 0}</Chip>
    </div>
  );
}