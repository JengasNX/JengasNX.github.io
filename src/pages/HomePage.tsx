import About from '../sections/About';
import Articles from '../sections/Articles';
import Contact from '../sections/Contact';
import GithubSection from '../sections/GithubSection';
import Hero from '../sections/Hero';
import Journey from '../sections/Journey';
import Projects from '../sections/Projects';
import Services from '../sections/Services';
import Skills from '../sections/Skills';
import { useGithub } from '../hooks/useGithub';
import { useLocale } from '../context/LocaleContext';

/** Single-page portfolio: all sections share one GitHub data fetch. */
export default function HomePage() {
  const { locale } = useLocale();
  const {
    profile,
    projects,
    stats,
    loading,
    error,
    rateLimited,
    refresh,
    retry,
    refreshing,
  } = useGithub();

  return (
    <>
      <Hero profile={profile} />
      <About profile={profile} stats={stats} />
      <Skills projects={projects} loading={loading} error={error} onRetry={retry} />
      <Projects
        projects={projects}
        loading={loading}
        error={error}
        rateLimited={rateLimited}
        refreshing={refreshing}
        onRefresh={refresh}
        onRetry={retry}
      />
      <GithubSection
        profile={profile}
        stats={stats}
        loading={loading}
        error={error}
        locale={locale}
        onRetry={retry}
      />
      <Journey profile={profile} projects={projects} locale={locale} />
      <Services />
      <Articles locale={locale} />
      <Contact />
    </>
  );
}
