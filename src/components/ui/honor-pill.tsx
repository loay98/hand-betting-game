import type { ReactNode } from 'react';

type HonorPillProps = {
  className: string;
  title: string;
  ariaLabel: string;
  symbol: ReactNode;
  value: ReactNode;
  deltaLabel?: ReactNode;
  iconClassName: string;
  valueClassName: string;
};

export function HonorPill({ className, title, ariaLabel, symbol, value, deltaLabel, iconClassName, valueClassName }: HonorPillProps) {
  return (
    <span className={className} aria-label={ariaLabel} title={title}>
      <span aria-hidden="true" className={iconClassName}>{symbol}</span>
      <span className={valueClassName}>{value}</span>
      {deltaLabel ? deltaLabel : null}
    </span>
  );
}