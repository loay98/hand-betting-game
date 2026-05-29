import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'warm' | 'ghost';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-amber-400 text-slate-950 shadow-[0_12px_30px_rgba(255,191,71,0.22)] hover:-translate-y-0.5',
  warm: 'bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-[0_12px_30px_rgba(255,138,61,0.2)] hover:-translate-y-0.5',
  ghost: 'border border-white/10 bg-transparent text-slate-50 hover:-translate-y-0.5 hover:bg-white/5',
};

export function Button({ className, asChild = false, variant = 'default', ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
