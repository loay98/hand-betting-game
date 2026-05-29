import type { HTMLAttributes, ReactNode } from 'react';

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow: ReactNode;
  title: ReactNode;
  as?: 'h1' | 'h2';
};

export function SectionHeading({ eyebrow, title, as = 'h2', className, ...props }: SectionHeadingProps) {
  const TitleTag = as;

  return (
    <div className={className ? `panel__heading ${className}` : 'panel__heading'} {...props}>
      <p className="eyebrow">{eyebrow}</p>
      <TitleTag>{title}</TitleTag>
    </div>
  );
}