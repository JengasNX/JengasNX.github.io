/** Language → brand color (visual accent only, purely presentational). */
const COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Shell: '#89e051',
  Dockerfile: '#384d54',
};

export function languageColor(name: string | null | undefined): string {
  if (!name) return '#64748b';
  return COLORS[name] ?? '#64748b';
}

/** Category → display label (kept language-neutral here). */
export const CATEGORY_LABEL: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Full Stack',
  python: 'Python',
  other: 'Other',
};
