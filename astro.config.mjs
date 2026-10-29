import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project/user site: https://jengasnx.github.io/
export default defineConfig({
  site: 'https://jengasnx.github.io',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
