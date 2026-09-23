import Reveal from './Reveal';

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
}

/** Consistent heading block for every section. */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  align = 'left',
  action,
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <Reveal className={centered ? 'text-center' : ''}>
      <div
        className={
          centered
            ? 'flex flex-col items-center gap-3'
            : 'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'
        }
      >
        <div className={centered ? 'flex flex-col items-center gap-3' : 'max-w-2xl'}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2
            id={id}
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-base leading-7 text-slate-500 sm:text-lg dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {action && !centered && <div className="shrink-0">{action}</div>}
      </div>
    </Reveal>
  );
}
