import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-50 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30',
        className,
      )}
      {...props}
    />
  );
}
