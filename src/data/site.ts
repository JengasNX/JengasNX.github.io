/**
 * Editable site content. Only real values live here.
 */

export const SITE = {
  name: 'JengasAdmin',
  firstName: 'Вячеслав',
  role: 'Full Stack Developer',
  /** GitHub username whose repositories are shown (override: GITHUB_USERNAME). */
  username: 'JengasAdmin',
  githubUrl: 'https://github.com/JengasAdmin',
  /** Built site URL (used for canonical / OG / hreflang). */
  siteUrl: 'https://jengasadmin.github.io/',
  /** Stable avatar URL — `github.com/<user>.png` redirects to the avatar. */
  ogImage: 'https://github.com/JengasAdmin.png',
} as const;

/** Contact channels — real links (see README «Editing Content»). */
export const CONTACTS = {
  github: 'https://github.com/JengasAdmin',
  telegram: 'https://t.me/nudnx',
  discord: '1226424162307014688',
  discordUrl: 'https://discord.com/users/1226424162307014688',
  email: 'helxij9282@gmail.com',
} as const;

/** Repository of this site (footer / contact links). */
export const SOURCE_URL = 'https://github.com/JengasAdmin/JengasAdmin.github.io';
