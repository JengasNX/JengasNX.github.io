import { cn } from '../utils/format';
import { useReveal } from '../hooks/useReveal';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'article' | 'section';
}

/**
 * Reveals content when it enters the viewport.
 * Uses IntersectionObserver + CSS transitions (no per-frame JS work).
 */
export default function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = as as 'div';

  return (
    <Tag
      ref={ref}
      className={cn('reveal', visible && 'reveal-visible', className)}
      style={{ transitionDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
