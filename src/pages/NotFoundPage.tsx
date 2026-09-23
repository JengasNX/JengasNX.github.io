import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export default function NotFoundPage() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 pt-24 text-center">
      <p className="gradient-text text-7xl font-bold">404</p>
      <p className="text-slate-500 dark:text-slate-400">{t.projects.notFound}</p>
      <Link to="/" className="btn-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t.profile.back}
      </Link>
    </div>
  );
}
