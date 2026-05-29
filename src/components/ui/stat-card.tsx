import type { HTMLAttributes, ReactNode } from 'react';

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  value: ReactNode;
  help?: ReactNode;
  valueClassName?: string;
};

export function StatCard({ label, value, help, valueClassName, className, ...props }: StatCardProps) {
  return (
    <div className={className ? `stat-card ${className}` : 'stat-card'} {...props}>
      {help ? (
        <div className="stat-card__label">
          {label}
          {help}
        </div>
      ) : (
        <span>{label}</span>
      )}
      <strong className={valueClassName}>{value}</strong>
    </div>
  );
}