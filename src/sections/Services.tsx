import {
  AppWindow,
  Bot,
  Building2,
  Cpu,
  Globe,
  Layers,
  LayoutDashboard,
  Megaphone,
  Plug,
  Sparkles,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { useLocale } from '../context/LocaleContext';

const ICONS = [
  Globe,
  AppWindow,
  Layers,
  Building2,
  Megaphone,
  LayoutDashboard,
  Bot,
  Plug,
  Cpu,
  Sparkles,
];

/** What I Can Build — potential directions (no claims about past clients). */
export default function Services() {
  const { t } = useLocale();

  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="07"
          title={t.services.title}
          subtitle={t.services.subtitle}
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {t.services.items.map((item, i) => {
            const Icon = ICONS[i] ?? Globe;
            return (
              <Reveal as="li" key={item.name} delay={(i % 5) * 70}>
                <div className="group glass flex h-full flex-col gap-3 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-500 transition-transform duration-300 group-hover:scale-110 dark:text-indigo-400"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
