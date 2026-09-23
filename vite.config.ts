/// <reference types="vite/client" />

/** Node globals used only in this config file (build-time). */
declare const process: { env: Record<string, string | undefined> };

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base path can be overridden for deployment in a sub-path repository:
//   VITE_BASE_PATH=/JengasAdmin.github.io/ npm run build
const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
