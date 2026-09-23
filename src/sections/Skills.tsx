import { Braces, Hammer, Wrench } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import SkillCard, { type TechItem } from '../components/SkillCard';
import StateBlock from '../components/StateBlock';
import { useLocale } from '../context/LocaleContext';
import type { Project } from '../types';

interface SkillsProps {
  projects: Project[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Skills built exclusively from real repository data:
 *  - languages   → GitHub /languages byte counts per repo
 *  - libraries   → dependencies found in package.json files
 *  - tools       → observable repo features (e.g. .github/workflows)
 */
export default function Skills({ projects, loading, error, onRetry }: SkillsProps) {
  const { t } = useLocale();

  if (loading && !projects) {
    return (
      <section id="skills" className="py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="02" title={t.skills.title} subtitle={t.skills.subtitle} />
          <div className="mt-10">
            <StateBlock variant="loading" message={t.skills.empty} />
          </div>
        </div>
      </section>
    );
  }

  if (error && !projects) {
    return (
      <section id="skills" className="py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="02" title={t.skills.title} subtitle={t.skills.subtitle} />
          <div className="mt-10">
            <StateBlock variant="error" message={error} onRetry={onRetry} retryLabel={t.projects.retry} />
          </div>
        </div>
      </section>
    );
  }

  const list = projects ?? [];

  /* Languages: repository count per language, ordered by total bytes. */
  const langBytes: Record<string, number> = {};
  const langRepos = new Map<string, number>();
  for (const p of list) {
    for (const [lang, bytes] of Object.entries(p.tech.languages)) {
      langBytes[lang] = (langBytes[lang] ?? 0) + bytes;
      langRepos.set(lang, (langRepos.get(lang) ?? 0) + 1);
    }
  }
  const languages: TechItem[] = Object.keys(langBytes)
    .sort((a, b) => langBytes[b] - langBytes[a])
    .map((name) => ({ name, count: langRepos.get(name) ?? 1 }));

  /* Libraries: how many repositories depend on each. */
  const libCount = new Map<string, number>();
  for (const p of list) {
    for (const lib of p.tech.libraries) {
      libCount.set(lib, (libCount.get(lib) ?? 0) + 1);
    }
  }
  const libraries: TechItem[] = [...libCount.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));

  /* Tools: Git/GitHub are inherent + anything observable in repos. */
  const toolCount = new Map<string, number>();
  toolCount.set('Git', 1);
  toolCount.set('GitHub', 1);
  for (const p of list) {
    for (const tool of p.tech.tools) {
      toolCount.set(tool, (toolCount.get(tool) ?? 0) + 1);
    }
  }
  const tools: TechItem[] = [...toolCount.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));

  return (
    <section id="skills" className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="02"
          title={t.skills.title}
          subtitle={t.skills.subtitle}
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SkillCard
            title={t.skills.languages}
            items={languages}
            accent="indigo"
            icon={<Braces className="h-5 w-5" />}
            note={t.skills.detectedIn}
          />
          <SkillCard
            title={t.skills.frameworks}
            items={libraries}
            accent="violet"
            icon={<Hammer className="h-5 w-5" />}
            note={t.skills.detectedIn}
          />
          <SkillCard
            title={t.skills.tools}
            items={tools}
            accent="blue"
            icon={<Wrench className="h-5 w-5" />}
            note={t.skills.detectedIn}
          />
        </div>
      </div>
    </section>
  );
}
