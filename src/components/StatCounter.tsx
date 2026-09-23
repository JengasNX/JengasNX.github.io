import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useReducedMotion } from '../hooks/useMediaQuery';

interface StatCounterProps {
  value: number;
  suffix?: string;
  label: string;
}

/** Animated number that counts up once it becomes visible. */
export default function StatCounter({ value, suffix = '', label }: StatCounterProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.4);
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!visible) return;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const duration = 1100;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [visible, value, reducedMotion]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {display}
        {suffix}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}
