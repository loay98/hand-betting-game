import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[28px] border border-white/10 bg-slate-950/70 shadow-soft backdrop-blur-xl', className)}
      {...props}
    />
  );
}
