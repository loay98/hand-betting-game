import type { HTMLAttributes, ReactNode } from 'react';

type ChipVariant = 'default' | 'skip' | 'win' | 'loss' | 'push';

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: ChipVariant;
  children: ReactNode;
};

const variantClasses: Record<ChipVariant, string> = {
  default: 'history-pair__chip',
  skip: 'history-pair__chip history-pair__chip--skip',
  win: 'history-pair__chip history-pair__chip--win',
  loss: 'history-pair__chip history-pair__chip--loss',
  push: 'history-pair__chip history-pair__chip--push',
};

export function Chip({ variant = 'default', className, children, ...props }: ChipProps) {
  const classes = className ? `${variantClasses[variant]} ${className}` : variantClasses[variant];

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}