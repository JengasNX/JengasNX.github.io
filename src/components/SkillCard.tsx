import { Boxes } from 'lucide-react';
import Reveal from './Reveal';
import { cn } from '../utils/format';

export interface TechItem {
  name: string;
  /** How many repositories this technology appears in. */
  count: number;
}

interface SkillCardProps {
  title: string;
  items: TechItem[];
  icon?: React.ReactNode;
  accent?: 'indigo' | 'violet' | 'blue';
  note?: string;
}

const ACCENTS = {
  indigo: 'from-indigo-500/15 to-transparent text-indigo-500',
  violet: 'from-violet-500/15 to-transparent text-violet-500',
  blue: 'from-blue-500/15 to-transparent text-blue-500',
} as const;

/** Card with an interactive technology list. */
export default function SkillCard({
  title,
  items,
  icon,
  accent = 'indigo',
  note,
}: SkillCardProps) {
  return (
    <Reveal className="h-full">
      <div
        className={cn(
          'glass group relative h-full overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40',
          'before:absolute before:-inset-px before:bg-gradient-to-br before:opacity-0 before:transition-opacity before:duration-500 before:group-hover:opacity-100',
          `before:from-transparent before:to-transparent`,
        )}
      >
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br',
                ACCENTS[accent],
              )}
              aria-hidden
            >
              {icon ?? <Boxes className="h-5 w-5" />}
            </span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          </div>

          <ul className="flex flex-wrap gap-2">
            {items.map((item) => (
              <li key={item.name}>
                <span
                  className="chip !px-3 !py-1.5 text-[13px] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/50 hover:text-indigo-500 dark:hover:text-indigo-300"
                  title={note ? `${note}: ${item.count}` : undefined}
                >
                  {item.name}
                  {item.count > 1 && (
                    <sup className="ml-0.5 text-[10px] text-slate-400">×{item.count}</sup>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}
