import { Loader2 } from 'lucide-react';

/** Accessible loading spinner. */
export default function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col items-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-indigo-500" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
