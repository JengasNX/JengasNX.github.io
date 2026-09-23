import { useState, type FormEvent } from 'react';
import { AtSign, Github, Info, Send } from 'lucide-react';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { useLocale } from '../context/LocaleContext';
import { CONTACTS } from '../data/content';
import { cn } from '../utils/format';

type Status = 'idle' | 'sending' | 'success' | 'error' | 'not-connected';

/** Backend endpoint for the contact form (see .env.example). Empty → not connected. */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

export default function Contact() {
  const { t, locale } = useLocale();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(t.contact.form.required);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t.contact.form.invalidEmail);
      return;
    }

    // Backend not connected → tell the user honestly instead of faking success.
    if (!ENDPOINT) {
      setStatus('not-connected');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale, page: location.href }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
      setError(t.contact.form.error);
    }
  };

  const channels = [
    {
      key: 'github' as const,
      label: t.contact.links.github,
      value: CONTACTS.github,
      icon: <Github className="h-4 w-4" />,
      external: true,
    },
    {
      key: 'telegram' as const,
      label: t.contact.links.telegram,
      value: CONTACTS.telegram,
      icon: <Send className="h-4 w-4" />,
      external: true,
    },
    {
      key: 'discord' as const,
      label: t.contact.links.discord,
      value: CONTACTS.discord,
      icon: <AtSign className="h-4 w-4" />,
      external: false,
    },
    {
      key: 'email' as const,
      label: t.contact.links.email,
      value: CONTACTS.email,
      icon: <AtSign className="h-4 w-4" />,
      external: false,
    },
  ];

  const notice =
    status === 'success'
      ? { text: t.contact.form.success, tone: 'ok' as const }
      : status === 'not-connected'
        ? { text: t.contact.form.notConnected, tone: 'warn' as const }
        : error
          ? { text: error, tone: 'bad' as const }
          : null;

  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="09"
          title={t.contact.title}
          subtitle={t.contact.subtitle}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Channels */}
          <Reveal>
            <ul className="space-y-3">
              {channels.map((ch) => {
                const placeholder = CONTACTS.isPlaceholder(ch.value);
                const href =
                  placeholder || !ch.external
                    ? undefined
                    : ch.key === 'email'
                      ? `mailto:${ch.value}`
                      : ch.value;

                const content = (
                  <>
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-500 dark:text-indigo-400"
                      aria-hidden
                    >
                      {ch.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        {ch.label}
                      </span>
                      <span
                        className={cn(
                          'block truncate text-sm font-medium',
                          placeholder
                            ? 'text-amber-500/80'
                            : 'text-slate-700 dark:text-slate-200',
                        )}
                      >
                        {ch.value}
                      </span>
                    </span>
                  </>
                );

                return (
                  <li key={ch.key}>
                    {href ? (
                      <a
                        href={href}
                        target={ch.key === 'github' || ch.key === 'telegram' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="glass group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/40"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="glass flex items-center gap-4 rounded-2xl p-4 opacity-90">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400 dark:text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {t.contact.placeholderNote}
            </p>
          </Reveal>

          {/* Form */}
          <Reveal delay={100}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="glass rounded-2xl p-6 sm:p-8"
              aria-label={t.contact.title}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t.contact.form.name}
                  </span>
                  <input
                    className="input"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder={t.contact.form.name}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t.contact.form.email}
                  </span>
                  <input
                    className="input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder={t.contact.form.email}
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t.contact.form.message}
                </span>
                <textarea
                  className="input min-h-[140px] resize-y"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={onChange}
                  placeholder={t.contact.form.message}
                />
              </label>

              {notice && (
                <p
                  role="status"
                  className={cn(
                    'mt-4 rounded-xl px-4 py-3 text-sm leading-6',
                    notice.tone === 'ok' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    notice.tone === 'warn' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                    notice.tone === 'bad' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                  )}
                >
                  {notice.text}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-primary mt-6 w-full disabled:opacity-60 sm:w-auto"
              >
                {status === 'sending' ? t.contact.form.sending : t.contact.form.send}
                <Send className="h-4 w-4" aria-hidden />
              </button>

              {!ENDPOINT && (
                <p className="mt-4 text-xs leading-5 text-slate-400 dark:text-slate-500">
                  VITE_CONTACT_ENDPOINT не задан ({t.contact.placeholderNote})
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
