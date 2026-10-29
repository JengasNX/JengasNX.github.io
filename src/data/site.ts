/**
 * Editable site content. Only real values live here.
 */

export const SITE = {
  name: 'JengasNX',
  firstName: 'Вячеслав',
  role: 'Full Stack Developer',
  /** GitHub username whose repositories are shown (override: GITHUB_USERNAME). */
  username: 'JengasNX',
  githubUrl: 'https://github.com/JengasNX',
  /** Built site URL (used for canonical / OG / hreflang). */
  siteUrl: 'https://jengasnx.github.io/',
  /** Stable avatar URL — `github.com/<user>.png` redirects to the avatar. */
  ogImage: 'https://github.com/JengasNX.png',
} as const;

/** Contact channels — real links (see README «Editing Content»). */
export const CONTACTS = {
  github: 'https://github.com/JengasNX',
  telegram: 'https://t.me/nudnx',
  discord: '1226424162307014688',
  discordUrl: 'https://discord.com/users/1226424162307014688',
  email: 'helxij9282@gmail.com',
} as const;

/** Repository of this site (footer / contact links). */
export const SOURCE_URL = 'https://github.com/JengasNX/JengasNX.github.io';
