import { useEffect, useRef } from 'react';
import { useIsMobile, useReducedMotion } from '../hooks/useMediaQuery';

/**
 * Decorative hero background: subtle grid + two animated gradient orbs +
 * a soft cursor glow (desktop only). Everything is GPU-friendly
 * (transform/opacity) and disabled for mobile / reduced-motion users.
 */
export default function Background() {
  const glowRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const el = glowRef.current;
    if (!el) return;

    let frame = 0;
    let x = window.innerWidth / 2;
    let y = 300;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          el.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`;
          frame = 0;
        });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isMobile, reducedMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* grid */}
      <div className="bg-grid absolute inset-0" />

      {/* gradient orbs */}
      <div
        className={`absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] ${
          reducedMotion ? '' : 'animate-float'
        }`}
      />
      <div
        className={`absolute right-1/5 top-40 h-80 w-80 rounded-full bg-violet-600/15 blur-[110px] ${
          reducedMotion ? '' : 'animate-float'
        }`}
        style={{ animationDelay: '2.5s' }}
      />
      <div className="absolute bottom-0 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

      {/* cursor glow (desktop only) */}
      {!isMobile && !reducedMotion && (
        <div
          ref={glowRef}
          className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/5 blur-[80px] transition-transform duration-300 ease-out"
          style={{ willChange: 'transform' }}
        />
      )}
    </div>
  );
}
