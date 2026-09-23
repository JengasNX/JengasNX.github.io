import { AlertTriangle, RefreshCw } from 'lucide-react';

interface StateBlockProps {
  variant: 'error' | 'empty' | 'loading';
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Consistent loading / error / empty states for GitHub-powered blocks. */
export default function StateBlock({
  variant,
  message,
  onRetry,
  retryLabel = 'Retry',
}: StateBlockProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className="glass flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-12 text-center"
    >
      {variant !== 'loading' && (
        <AlertTriangle
          className={`h-6 w-6 ${variant === 'error' ? 'text-rose-500' : 'text-slate-400'}`}
          aria-hidden
        />
      )}
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost !py-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
